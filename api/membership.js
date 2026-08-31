import crypto from 'crypto';

// ===== VALID PLAN CONFIG (server-side pricing) =====
const PLANS = {
  basic: { price: 1999, label: 'Basic' },
  pro: { price: 3999, label: 'Pro' },
  elite: { price: 6999, label: 'Elite' },
};
const TRAINER_MONTHLY = 2000;
const ALLOWED_DURATIONS = [1, 2, 3, 6, 12];

// ===== UNIQUE MEMBER ID GENERATOR =====
function generateMemberId() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const datePart = `${yy}${mm}${dd}`;
  const randomBytes = crypto.randomBytes(2);
  const suffix = String(randomBytes.readUInt16BE(0) % 1000).padStart(3, '0');
  return `IF-${datePart}-${suffix}`;
}

// ===== SANITIZE INPUT =====
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>\"'`;]/g, '').trim().slice(0, 200);
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed.' });
  }

  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  if (!GOOGLE_SCRIPT_URL) {
    return res.status(500).json({ success: false, error: 'Server configuration error.' });
  }

  try {
    const { name, phone, email, plan, months, hasTrainer, trainerMonths } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !plan || !months) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    // Validate phone
    const cleanPhone = String(phone).replace(/\D/g, '');
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number. Must be 10 digits.' });
    }

    // Validate email
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }

    // Validate plan
    const planKey = String(plan).toLowerCase();
    if (!PLANS[planKey]) {
      return res.status(400).json({ success: false, error: 'Invalid membership plan.' });
    }

    // Validate duration
    const duration = parseInt(months, 10);
    if (!ALLOWED_DURATIONS.includes(duration)) {
      return res.status(400).json({ success: false, error: 'Invalid membership duration.' });
    }

    // Validate trainer
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

    // Recalculate prices server-side
    const planPrice = PLANS[planKey].price;
    const planLabel = PLANS[planKey].label;
    const planTotal = planPrice * duration;
    const trainerTotal = trainer ? TRAINER_MONTHLY * trainerDur : 0;
    const total = planTotal + trainerTotal;

    // Generate unique Member ID
    const memberId = generateMemberId();

    // Prepare payload for Google Apps Script
    const payload = {
      memberId,
      name: sanitize(name),
      phone: cleanPhone,
      email: sanitize(email),
      plan: planLabel,
      months: `${duration} Month${duration > 1 ? 's' : ''}`,
      trainer: trainer ? 'Yes' : 'No',
      trainerMonths: trainer ? `${trainerDur} Month${trainerDur > 1 ? 's' : ''}` : 'N/A',
      planCost: `₹${planTotal.toLocaleString('en-IN')}`,
      trainerCost: trainer ? `₹${trainerTotal.toLocaleString('en-IN')}` : '₹0',
      total: `₹${total.toLocaleString('en-IN')}`,
      paymentStatus: 'Pending',
      membershipStatus: 'Pending',
    };

    // Send to Google Apps Script Web App
    const scriptResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!scriptResponse.ok) {
      console.error('Google Apps Script error:', scriptResponse.status);
      return res.status(502).json({
        success: false,
        error: 'Failed to submit to Google Sheets. Please try again.',
      });
    }

    // Return safe response
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
    });

  } catch (err) {
    console.error('Membership API error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Your membership request was not submitted. Please try again.',
    });
  }
};
