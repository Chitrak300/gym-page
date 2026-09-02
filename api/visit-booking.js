// ===== SANITIZE INPUT =====
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>"'`;\\]/g, '').trim().slice(0, 200);
}

module.exports = async function handler(req, res) {
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

  try {
    const { name, phone, email, date, time } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !date || !time) {
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

    // Validate date is not in the past
    const visitDate = new Date(date + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (visitDate < today) {
      return res.status(400).json({ success: false, error: 'Visit date cannot be in the past.' });
    }

    // Validate Sunday
    if (visitDate.getDay() === 0) {
      return res.status(400).json({ success: false, error: 'Gym is closed on Sundays.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Booking submitted successfully! We will contact you shortly.',
    });

  } catch (err) {
    console.error('Visit booking API error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Your booking was not submitted. Please try again.',
    });
  }
};
