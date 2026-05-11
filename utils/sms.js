// SMS is disabled for now — Twilio not configured yet.
// To enable: add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to your .env / Railway vars.

async function sendSMS(to, message) {
  console.log(`[SMS DISABLED] To: ${to} | Msg: ${message}`);
  return { status: 'disabled' };
}

const overdueMsg  = (name, id, amount, days) =>
  `Hi ${name} (${id}), your GymOS fee of PKR ${amount} is overdue by ${days} day(s). Please pay at reception.`;

const reminderMsg = (name, id, amount, daysLeft) =>
  `Hi ${name} (${id}), your GymOS fee of PKR ${amount} is due in ${daysLeft} day(s). Please renew on time!`;

const expiringMsg = (name, id, daysLeft) =>
  `Hi ${name} (${id}), your GymOS membership expires in ${daysLeft} day(s). Renew now!`;

const expiredMsg  = (name, id) =>
  `Hi ${name} (${id}), your GymOS membership has expired. Visit the gym to renew!`;

module.exports = { sendSMS, overdueMsg, reminderMsg, expiringMsg, expiredMsg };
