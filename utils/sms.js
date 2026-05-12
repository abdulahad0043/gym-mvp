const { Client, LocalAuth } = require('whatsapp-web.js');

// Client setup with Pairing Code logic
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, // Railway aur background execution ke liye zaroori hai
        args: [
            '--no-sandbox',
            '--disable-setups-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote'
        ]
    }
});

// QR Code event ko disable kar diya hai taake sirf code nazar aaye
client.on('qr', (qr) => {
    // console.log('QR received but ignoring for Pairing Code...');
});

// Jab pairing code generate ho jaye
client.on('pairing_code', (code) => {
    console.log('*********************************');
    console.log('🚀 YOUR WHATSAPP PAIRING CODE:', code);
    console.log('*********************************');
});

// Jab login successful ho jaye
client.on('ready', () => {
    console.log('✅ WhatsApp is Ready and Authenticated!');
});

// Initializing the client
client.initialize().then(async () => {
    console.log('⏳ Client initialize ho raha hai...');
    
    // Yahan apna phone number likhein (Format: 923xxxxxxxxx)
    // Yaad rahe: Baghair '+' sign ke aur baghair brackets ke.
    const myNumber = "923164029147"; // <-- ISAY CHANGE KAREIN

    // Thora delay taake internal puppeteer load ho jaye
    setTimeout(async () => {
        try {
            console.log(`📡 Requesting pairing code for: ${myNumber}`);
            const code = await client.requestPairingCode(myNumber);
            if(code) {
                console.log('🔥 CODE RECEIVED:', code);
            }
        } catch (err) {
            console.error('❌ Pairing Code Error:', err.message);
            console.log('Tip: Check karein ke MongoDB connect hai ya nahi.');
        }
    }, 10000); // 10 seconds ka wait taake crash na ho
});

module.exports = client;