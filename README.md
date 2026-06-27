# Sinduja Ranganathamani — Portfolio Backend

Full-stack portfolio with Node.js/Express backend, Nodemailer contact form, auto-reply emails, and rate limiting.

---

## 📁 Project Structure

```
portfolio-backend/
├── server.js          ← Express server (API + static file serving)
├── public/
│   └── index.html     ← Portfolio website (motion graphics frontend)
├── .env.example       ← Environment variable template
├── .env               ← Your secrets (create this, never commit!)
├── package.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Gmail App Password
1. Go to your Google Account → **Security** → **2-Step Verification** → **App passwords**
2. Generate a new app password (select "Mail" + "Other")
3. Copy the 16-character password shown

### 3. Create `.env` file
```bash
cp .env.example .env
```
Edit `.env`:
```env
PORT=3000
GMAIL_USER=your.gmail@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
NOTIFY_EMAIL=sinduja@gmail.com
```

### 4. Run the server
```bash
# Production
npm start

# Development (auto-restarts on file changes — Node 18+)
npm run dev
```

### 5. Open in browser
```
http://localhost:3000
```

---

## 🔌 API Endpoints

### `POST /api/contact`
Submit the contact form.

**Request body (JSON):**
```json
{
  "name": "John Smith",
  "email": "john@company.com",
  "service": "Website Design & Development",
  "budget": "₹15,000 – ₹50,000",
  "message": "I need a website for my restaurant..."
}
```

**Success response:**
```json
{ "success": true, "message": "Message sent! I'll reply within 24 hours." }
```

**Error response:**
```json
{ "success": false, "errors": ["A valid email is required."] }
```

**Rate limit:** 5 requests per IP per 15 minutes.

---

### `GET /api/health`
Check server status.
```json
{ "status": "ok", "timestamp": "2025-01-01T00:00:00.000Z", "server": "Sinduja Portfolio Backend" }
```

---

## 📧 Email Flow

When someone submits the form, two emails are sent simultaneously:

1. **Notification to Sinduja** — Full enquiry details, name, email, service, budget, message
2. **Auto-reply to visitor** — Confirmation with both phone numbers and expected response time

---

## 🚀 Deploy to Railway / Render / VPS

### Railway (recommended — free tier)
1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variables in the Railway dashboard
4. Done — Railway gives you a public URL

### Render
1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

### VPS (DigitalOcean / Hostinger)
```bash
# On your server
git clone <your-repo>
cd portfolio-backend
npm install
cp .env.example .env
# Edit .env with your values
# Use PM2 to keep it running
npm install -g pm2
pm2 start server.js --name "sinduja-portfolio"
pm2 save
pm2 startup
```

---

## 🔒 Security Features

- **Helmet.js** — Secure HTTP headers
- **Rate limiting** — 5 contact form submissions per IP per 15 minutes
- **Input validation** — Server-side validation on all fields
- **CORS** — Configurable allowed origins
- **No credentials in code** — All secrets in `.env`

---

## 📞 Contact

**Sinduja Ranganathamani**  
Coimbatore, India  
+91 99764 71782 (India)  
+968 98596919 (Oman / GCC)
