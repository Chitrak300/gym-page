// ===== SANITIZE INPUT =====
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[<>\"'`;\\]/g, '').trim().slice(0, 200);
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

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(500).json({ success: false, error: 'Server configuration error.' });
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

    // Format date nicely
    const formattedDate = visitDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format time slot
    const formatSlot = (slot) => {
      const [start, end] = slot.split('-');
      const fmt = (t) => {
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
        return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
      };
      return `${fmt(start)} – ${fmt(end)}`;
    };

    // Build Telegram message
    const message = [
      '🏋️ *New Visit Booking*',
      '',
      `👤 *Name:* ${sanitize(name)}`,
      `📱 *Phone:* ${cleanPhone}`,
      `✉️ *Email:* ${sanitize(email)}`,
      `📅 *Date:* ${formattedDate}`,
      `⏰ *Time:* ${formatSlot(time)}`,
      '',
      '_Booked via IronForge Gym website_',
    ].join('\n');

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const tgResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!tgResponse.ok) {
      const tgError = await tgResponse.text();
      console.error('Telegram API error:', tgResponse.status, tgError);
      return res.status(502).json({
        success: false,
        error: 'Failed to send booking. Please try again or contact us directly.',
      });
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
