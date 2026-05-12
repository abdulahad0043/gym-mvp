const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Initialize the WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Linux/Railway deployment
    }
});

// Generate QR Code in terminal for the gym owner to scan
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('健身房 (Gym) Manager: Scan this QR code with your WhatsApp!');
});

client.on('ready', () => {
    console.log('WhatsApp Client is READY!');
});

client.initialize();

// Helper to format Pakistani numbers to WhatsApp format
function normaliseWhatsApp(phone) {
    const digits = phone.replace(/\D/g, '');
    let formatted;
    if (digits.startsWith('92')) formatted = digits;
    else if (digits.startsWith('0')) formatted = '92' + digits.slice(1);
    else formatted = '92' + digits;
    return `${formatted}@c.us`;
}

// The core function used by your fee.js
async function sendWhatsApp(to, message) {
    try {
        const chatId = normaliseWhatsApp(to);
        const response = await client.sendMessage(chatId, message);
        console.log(`[SUCCESS] Message sent to ${to}`);
        return response;
    } catch (error) {
        console.error(`[ERROR] Failed to send to ${to}:`, error);
        throw error;
    }
}

// ── Keep your existing Message templates ──────────────────────
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

// Exporting ENABLED as true since this doesn't rely on Twilio Env Vars anymore
module.exports = { 
    sendWhatsApp, 
    welcomeMsg, 
    overdueMsg, 
    reminderMsg, 
    expiringMsg, 
    checkinMsg, 
    rejectedMsg, 
    ENABLED: true 
};