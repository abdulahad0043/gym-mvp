// WhatsApp messaging via Twilio WhatsApp API
// To enable: add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM to Railway env vars
// Free sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

const ENABLED = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM);

function getClient() {
  const twilio = require('twilio');
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

function normaliseWhatsApp(phone) {
  const digits = phone.replace(/\D/g, '');
  let e164;
  if (digits.startsWith('92')) e164 = '+' + digits;
  else if (digits.startsWith('0')) e164 = '+92' + digits.slice(1);
  else e164 = '+92' + digits;
  return 'whatsapp:' + e164;
}

async function sendWhatsApp(to, message) {
  if (!ENABLED) {
    console.log(`[WHATSAPP DISABLED] To: ${to} | ${message}`);
    return { status: 'disabled' };
  }
  const client = getClient();
  return client.messages.create({
    body: message,
    from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_FROM,
    to:   normaliseWhatsApp(to),
  });
}

// ── Message templates ─────────────────────────────────────────
const welcomeMsg = (name, id) =>
  `🏋️ *GymOS* — Welcome ${name}!\n\nYour membership has been approved.\nMember ID: *${id}*\n\nSee you at the gym! 💪`;

const overdueMsg = (name, id, amount, days) =>
  `🏋️ *GymOS* — Fee Reminder\n\nHi ${name} (${id}),\nYour fee of *PKR ${amount}* is overdue by *${days} day(s)*.\nPlease pay at reception to avoid suspension.`;

const reminderMsg = (name, id, amount, daysLeft) =>
  `🏋️ *GymOS* — Upcoming Fee\n\nHi ${name} (${id}),\nYour fee of *PKR ${amount}* is due in *${daysLeft} day(s)*.\nPlease renew on time!`;

const expiringMsg = (name, id, daysLeft) =>
  `🏋️ *GymOS* — Membership Expiring\n\nHi ${name} (${id}),\nYour membership expires in *${daysLeft} day(s)*.\nRenew now to keep your streak going! 🔥`;

const checkinMsg = (name, id) =>
  `🏋️ *GymOS* — Check-in Confirmed\n\nHi ${name} (${id}),\nYou've been checked in successfully!\nTime: ${new Date().toLocaleTimeString()}\n\nGreat work today! 💪`;

const rejectedMsg = (name) =>
  `🏋️ *GymOS* — Registration Update\n\nHi ${name},\nWe could not process your registration at this time.\nPlease visit the gym reception for assistance.`;

module.exports = { sendWhatsApp, welcomeMsg, overdueMsg, reminderMsg, expiringMsg, checkinMsg, rejectedMsg, ENABLED };
