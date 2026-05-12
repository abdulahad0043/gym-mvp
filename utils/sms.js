const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Client setup with Pairing Code support
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Browser background mein chalay ga
        args: [
            '--no-sandbox',
            '--disable-setups-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote'
        ]
    }
});

// Jab WhatsApp link ho jaye
client.on('ready', () => {
    console.log('✅ WhatsApp Client is Ready and Linked!');
});

// QR Code fallback (agar pairing na karni ho)
client.on('qr', (qr) => {
    console.log('--- QR CODE RECEIVED ---');
    qrcode.generate(qr, { small: true });
});

// Main Pairing Logic
client.on('pairing_code', (code) => {
    console.log('----------------------------');
    console.log('🚀 YOUR PAIRING CODE:', code);
    console.log('----------------------------');
});

// Initialization
client.initialize().then(async () => {
    console.log('⏳ Initializing WhatsApp...');
    
    // YAHAN APNA NUMBER LIKHEIN (Format: 923xxxxxxxxx)
    // '+' sign mat lagaiye ga
    const myNumber = "923001234567"; // <-- Apna number yahan dalein
    
    try {
        // Thora wait taake client ready ho jaye request ke liye
        setTimeout(async () => {
            const code = await client.requestPairingCode(myNumber);
            console.log('👉 Phone par ye code enter karein:', code);
        }, 5000); 
    } catch (err) {
        console.error('❌ Pairing code request failed:', err);
    }
});

module.exports = client;