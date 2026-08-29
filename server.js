require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { google } = require('googleapis');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARE =====
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Rate limiting: 5 submissions per minute per IP
const membershipLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ===== VALID PLAN CONFIG (server-side pricing) =====
const PLANS = {
  basic: { price: 1999, label: 'Basic' },
  pro: { price: 3999, label: 'Pro' },
  elite: { price: 6999, label: 'Elite' },
};
const TRAINER_MONTHLY = 2000;
const ALLOWED_DURATIONS = [1, 2, 3, 6, 12];

// ===== GOOGLE SHEETS SETUP =====
let sheetsClient = null;

async function getSheetsClient() {
  if (sheetsClient) return sheetsClient;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
  } catch (err) {
    console.error('Google Sheets auth failed:', err.message);
    throw new Error('Failed to initialize Google Sheets client');
  }
}

// ===== UNIQUE MEMBER ID GENERATOR =====
function generateMemberId() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const datePart = `${yy}${mm}${dd}`;

  // Use crypto for collision-resistant suffix
  const randomBytes = crypto.randomBytes(2);
  const suffix = String(randomBytes.readUInt16BE(0) % 1000).padStart(3, '0');

  return `IF-${datePart}-${suffix}`;
}

// ===== SANITIZE INPUT =====
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>\"'`;]/g, '').trim().slice(0, 200);
}

// ===== MAIN API ENDPOINT =====
app.post('/api/membership', membershipLimiter, async (req, res) => {
  try {
    const {
      name, phone, email, plan, months,
      hasTrainer, trainerMonths
    } = req.body;

    // --- Validate required fields ---
    if (!name || !phone || !email || !plan || !months) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    // --- Validate phone ---
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number. Must be 10 digits.' });
    }

    // --- Validate email ---
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }

    // --- Validate plan ---
    const planKey = String(plan).toLowerCase();
    if (!PLANS[planKey]) {
      return res.status(400).json({ success: false, error: 'Invalid membership plan.' });
    }

    // --- Validate duration ---
    const duration = parseInt(months, 10);
    if (!ALLOWED_DURATIONS.includes(duration)) {
      return res.status(400).json({ success: false, error: 'Invalid membership duration.' });
    }

    // --- Validate trainer ---
    const trainer = hasTrainer === true || hasTrainer === 'true';
    let trainerDur = 0;
    if (trainer) {
      trainerDur = parseInt(trainerMonths, 10);
      if (!ALLOWED_DURATIONS.includes(trainerDur)) {
        return res.status(400).json({ success: false, error: 'Invalid trainer duration.' });
      }
      if (trainerDur > duration) {
        return res.status(400).json({ success: false, error: 'Trainer duration cannot exceed membership duration.' });
      }
    }

    // --- Recalculate prices server-side ---
    const planPrice = PLANS[planKey].price;
    const planLabel = PLANS[planKey].label;
    const planTotal = planPrice * duration;
    const trainerTotal = trainer ? TRAINER_MONTHLY * trainerDur : 0;
    const total = planTotal + trainerTotal;

    // --- Generate unique Member ID ---
    const memberId = generateMemberId();

    // --- Prepare row data ---
    const now = new Date();
    const joinDate = now.toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const joinTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const row = [
      memberId,
      sanitize(name),
      cleanPhone,
      sanitize(email),
      planLabel,
      `${duration} Month${duration > 1 ? 's' : ''}`,
      trainer ? 'Yes' : 'No',
      trainer ? `${trainerDur} Month${trainerDur > 1 ? 's' : ''}` : 'N/A',
      `₹${planTotal.toLocaleString('en-IN')}`,
      trainer ? `₹${trainerTotal.toLocaleString('en-IN')}` : '₹0',
      `₹${total.toLocaleString('en-IN')}`,
      'Pending',
      'Pending',
      joinDate,
      joinTime,
    ];

    // --- Write to Google Sheets ---
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    const range = process.env.GOOGLE_SHEET_RANGE || 'Memberships!A:O';

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] },
    });

    // --- Return safe response ---
    return res.status(200).json({
      success: true,
      memberId,
      name: sanitize(name),
      plan: planLabel,
      duration: `${duration} Month${duration > 1 ? 's' : ''}`,
      hasTrainer: trainer,
      trainerDuration: trainer ? `${trainerDur} Month${trainerDur > 1 ? 's' : ''}` : null,
      planAmount: `₹${planTotal.toLocaleString('en-IN')}`,
      trainerAmount: trainer ? `₹${trainerTotal.toLocaleString('en-IN')}` : '₹0',
      totalAmount: `₹${total.toLocaleString('en-IN')}`,
      paymentStatus: 'Pending',
      membershipStatus: 'Pending',
      joinDate,
      joinTime,
    });

  } catch (err) {
    console.error('Membership API error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Your membership request was not submitted. Please try again.',
    });
  }
});

// ===== SERVE FRONTEND =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`IronForge Gym server running on http://localhost:${PORT}`);
  console.log(`API endpoint: POST http://localhost:${PORT}/api/membership`);
});
