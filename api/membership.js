const crypto = require('crypto');

const PLANS = {
  basic: { price: 1999, label: 'Basic' },
  pro: { price: 3999, label: 'Pro' },
  elite: { price: 6999, label: 'Elite' },
};
const TRAINER_MONTHLY = 2000;
const ALLOWED_DURATIONS = [1, 2, 3, 6, 12];

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

function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'`;]/g, '').trim().slice(0, 200);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed.' });

  const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
  if (!GOOGLE_SCRIPT_URL) {
    return res.status(500).json({ success: false, error: 'Server not configured.' });
  }

  try {
    const { name, phone, email, plan, months, hasTrainer, trainerMonths } = req.body;

    if (!name || !phone || !email || !plan || !months) {
      return res.status(400).json({ success: false, error: 'All fields are required.' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '');
    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number.' });
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email.' });
    }

    const planKey = String(plan).toLowerCase();
    if (!PLANS[planKey]) return res.status(400).json({ success: false, error: 'Invalid plan.' });

    const duration = parseInt(months, 10);
    if (!ALLOWED_DURATIONS.includes(duration)) return res.status(400).json({ success: false, error: 'Invalid duration.' });

    const trainer = hasTrainer === true || hasTrainer === 'true';
    let trainerDur = 0;
    if (trainer) {
      trainerDur = parseInt(trainerMonths, 10);
      if (!ALLOWED_DURATIONS.includes(trainerDur)) return res.status(400).json({ success: false, error: 'Invalid trainer duration.' });
      if (trainerDur > duration) return res.status(400).json({ success: false, error: 'Trainer duration cannot exceed membership duration.' });
    }

    const planPrice = PLANS[planKey].price;
    const planLabel = PLANS[planKey].label;
    const planTotal = planPrice * duration;
    const trainerTotal = trainer ? TRAINER_MONTHLY * trainerDur : 0;
    const total = planTotal + trainerTotal;
    const memberId = generateMemberId();

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

    const scriptResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!scriptResponse.ok) {
      console.error('Google Apps Script error:', scriptResponse.status);
      return res.status(502).json({ success: false, error: 'Failed to submit to Google Sheets.' });
    }

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
    return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
};
