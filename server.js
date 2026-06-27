require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security & Middleware ──
app.use(helmet({ contentSecurityPolicy: false })); // CSP off so fonts/canvas work
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve Portfolio HTML ──
app.use(express.static(path.join(__dirname, 'public')));

// ── Rate Limiter: 5 contact submissions per 15 min per IP ──
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many messages sent. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Nodemailer Transporter ──
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (not login password)
  },
});

// Verify transporter on startup
transporter.verify((err) => {
  if (err) console.warn('⚠️  Mailer not connected (check .env):', err.message);
  else console.log('✅ Mailer ready');
});

// ── Helper: build notification email to Sinduja ──
function buildNotificationEmail(data) {
  return {
    from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
    to: process.env.NOTIFY_EMAIL || process.env.GMAIL_USER,
    subject: `🔔 New Enquiry from ${data.name} — ${data.service}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0D0D0D;color:#F7F5F0;border-radius:12px;overflow:hidden;">
        <div style="background:#0FA88E;padding:28px 32px;">
          <h1 style="margin:0;font-size:1.4rem;color:#0D0D0D;">New Portfolio Enquiry</h1>
          <p style="margin:4px 0 0;font-size:0.85rem;color:#0D0D0D;opacity:0.7;">Received at ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
        </div>
        <div style="padding:32px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#0FA88E;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;width:120px;">Name</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);font-size:0.95rem;">${data.name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#0FA88E;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;">Email</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);"><a href="mailto:${data.email}" style="color:#0FA88E;">${data.email}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#0FA88E;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;">Service</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);">${data.service}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);color:#0FA88E;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;">Budget</td><td style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);">${data.budget || 'Not specified'}</td></tr>
            <tr><td style="padding:10px 0;color:#0FA88E;font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;vertical-align:top;">Message</td><td style="padding:10px 0;line-height:1.6;">${data.message.replace(/\n/g, '<br>')}</td></tr>
          </table>
          <div style="margin-top:28px;padding:16px;background:rgba(15,168,142,0.1);border:1px solid rgba(15,168,142,0.2);border-radius:8px;">
            <p style="margin:0;font-size:0.82rem;color:#0FA88E;">Quick reply via <a href="mailto:${data.email}?subject=Re: Your Enquiry — Sinduja Ranganathamani" style="color:#0FA88E;font-weight:600;">email</a></p>
          </div>
        </div>
      </div>
    `,
  };
}

// ── Helper: build auto-reply to visitor ──
function buildAutoReply(data) {
  return {
    from: `"Sinduja Ranganathamani" <${process.env.GMAIL_USER}>`,
    to: data.email,
    subject: `Got your message, ${data.name.split(' ')[0]}! 👋`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0D0D0D;color:#F7F5F0;border-radius:12px;overflow:hidden;">
        <div style="background:#0FA88E;padding:28px 32px;">
          <h1 style="margin:0;font-size:1.4rem;color:#0D0D0D;">Thanks for reaching out!</h1>
        </div>
        <div style="padding:32px;">
          <p style="font-size:1rem;line-height:1.7;margin-top:0;">Hi <strong>${data.name.split(' ')[0]}</strong>,</p>
          <p style="font-size:0.95rem;line-height:1.7;color:#aaa;">I've received your enquiry about <strong style="color:#F7F5F0;">${data.service}</strong> and I'll get back to you within <strong style="color:#0FA88E;">24 hours</strong>.</p>
          <p style="font-size:0.95rem;line-height:1.7;color:#aaa;">In the meantime, feel free to reach me directly:</p>
          <div style="margin:20px 0;">
            <a href="tel:+919976471782" style="display:block;padding:12px 16px;background:rgba(15,168,142,0.1);border:1px solid rgba(15,168,142,0.2);border-radius:8px;color:#0FA88E;text-decoration:none;margin-bottom:8px;font-size:0.9rem;">📞 India: +91 99764 71782</a>
            <a href="tel:+96898596919" style="display:block;padding:12px 16px;background:rgba(15,168,142,0.1);border:1px solid rgba(15,168,142,0.2);border-radius:8px;color:#0FA88E;text-decoration:none;font-size:0.9rem;">📱 Oman / GCC: +968 98596919</a>
          </div>
          <p style="font-size:0.85rem;color:#666;margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
            — Sinduja Ranganathamani<br>
            Web Designer & Digital Services · Coimbatore, India
          </p>
        </div>
      </div>
    `,
  };
}

// ── POST /api/contact ──
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, service, budget, message } = req.body;

  // Validate
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email is required.');
  if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters.');
  if (errors.length) return res.status(400).json({ success: false, errors });

  const data = { name: name.trim(), email: email.trim(), service: service || 'Not specified', budget: budget || '', message: message.trim() };

  try {
    await Promise.all([
      transporter.sendMail(buildNotificationEmail(data)),
      transporter.sendMail(buildAutoReply(data)),
    ]);

    console.log(`✉️  Contact form: ${data.name} <${data.email}> — ${data.service}`);
    res.json({ success: true, message: 'Message sent! I\'ll reply within 24 hours.' });
  } catch (err) {
    console.error('Mailer error:', err.message);
    res.status(500).json({ success: false, error: 'Could not send email. Please try calling directly.' });
  }
});

// ── GET /api/health ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), server: 'Sinduja Portfolio Backend' });
});

// ── Catch-all → serve portfolio HTML ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Portfolio backend running on http://localhost:${PORT}`);
  console.log(`   Contact API : POST http://localhost:${PORT}/api/contact`);
  console.log(`   Health      : GET  http://localhost:${PORT}/api/health\n`);
});
