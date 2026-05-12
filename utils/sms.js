const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Production-ready Puppeteer settings
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // The --no-sandbox flag is CRITICAL for Railway/Linux deployments
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
    }
});

// Logs the QR code to the Railway terminal logs
client.on('qr', (qr) => {
    console.log('--- SCAN THE QR CODE BELOW IN RAILWAY LOGS ---');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('GymOS WhatsApp Service is LIVE on Production!');
});

// Basic error handling for the client
client.on('auth_failure', msg => console.error('WhatsApp Auth Failure:', msg));
client.on('disconnected', (reason) => console.log('WhatsApp was logged out:', reason));

client.initialize();

// Helper to format Pakistani numbers correctly
function normaliseWhatsApp(phone) {
    const digits = phone.replace(/\D/g, '');
    let formatted;
    if (digits.startsWith('92')) formatted = digits;
    else if (digits.startsWith('0')) formatted = '92' + digits.slice(1);
    else formatted = '92' + digits;
    return `${formatted}@c.us`;
}

async function sendWhatsApp(to, message) {
    try {
        const chatId = normaliseWhatsApp(to);
        const response = await client.sendMessage(chatId, message);
        console.log(`[SUCCESS] Message sent to ${to}`);
        return response;
    } catch (error) {
        console.error(`[ERROR] Send failed for ${to}:`, error);
        throw error;
    }
}

// Message Templates
const welcomeMsg = (name, id) => `🏋️ *GymOS* — Welcome ${name}!\n\nID: *${id}*\nApproved. 💪`;
const overdueMsg = (name, id, amount, days) => `🏋️ *GymOS* — Fee Overdue\n\nHi ${name},\nPKR ${amount} is late by ${days} days. Please pay at reception.`;
const reminderMsg = (name, id, amount, daysLeft) => `🏋️ *GymOS* — Fee Due\n\nHi ${name},\nPKR ${amount} is due in ${daysLeft} days.`;

module.exports = { sendWhatsApp, welcomeMsg, overdueMsg, reminderMsg, ENABLED: true };