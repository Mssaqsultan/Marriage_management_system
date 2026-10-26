import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import makeWASocket, { 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion 
} from '@whiskeysockets/baileys';
import pino from 'pino';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const AUTH_DIR = path.join(__dirname, '..', 'whatsapp_auth');

app.use(cors());
app.use(express.json());

// In-Memory state of the Gateway
let sock = null;
let latestQrDataUrl = null;
let isConnected = false;
let connectedUser = null;
let isConnecting = false;

const logger = pino({ level: 'silent' });

async function initWhatsApp() {
  if (isConnecting) return;
  isConnecting = true;

  try {
    if (!fs.existsSync(AUTH_DIR)) {
      fs.mkdirSync(AUTH_DIR, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: state,
      browser: ['Sultan Nevta Ledger', 'Chrome', '1.0.0'],
      syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          latestQrDataUrl = await QRCode.toDataURL(qr);
          isConnected = false;
          connectedUser = null;
          console.log('⚡ [WhatsApp Gateway] Fresh QR Code generated. Ready for scanning.');
        } catch (err) {
          console.error('Error generating QR data URL:', err);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        isConnected = false;
        connectedUser = null;
        isConnecting = false;
        console.log(`⚠️ [WhatsApp Gateway] Connection closed (${statusCode}). Reconnect: ${shouldReconnect}`);

        if (shouldReconnect) {
          setTimeout(initWhatsApp, 3000);
        } else {
          // If logged out, clear auth dir and recreate QR
          try {
            if (fs.existsSync(AUTH_DIR)) {
              fs.rmSync(AUTH_DIR, { recursive: true, force: true });
            }
          } catch (e) {}
          setTimeout(initWhatsApp, 2000);
        }
      } else if (connection === 'open') {
        isConnected = true;
        latestQrDataUrl = null;
        isConnecting = false;
        const userJid = sock.user?.id || '';
        const cleanPhone = userJid.split(':')[0] || userJid.split('@')[0];
        connectedUser = {
          id: userJid,
          phone: cleanPhone ? `+${cleanPhone}` : 'Connected',
          name: sock.user?.name || 'Sultan Ledger Admin'
        };
        console.log(`✅ [WhatsApp Gateway] Connected successfully as ${connectedUser.phone} (${connectedUser.name})`);
      }
    });

  } catch (error) {
    console.error('❌ [WhatsApp Gateway] Error initializing:', error);
    isConnecting = false;
    isConnected = false;
    setTimeout(initWhatsApp, 5000);
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

// 1. Get Live Status (Connected status, current phone, or active QR code)
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    connected: isConnected,
    user: connectedUser,
    qrCode: latestQrDataUrl,
    authDirExists: fs.existsSync(AUTH_DIR)
  });
});

// 2. Send WhatsApp Message Directly in Background (Bina WhatsApp Khole)
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number and message are required.' 
      });
    }

    if (!isConnected || !sock) {
      return res.status(503).json({ 
        success: false, 
        error: 'WhatsApp Gateway is not connected. Please scan QR code first.' 
      });
    }

    // Clean phone number: remove +, -, spaces
    let cleanNumber = phone.replace(/[^0-9]/g, '');
    if (cleanNumber.length === 10) {
      cleanNumber = `91${cleanNumber}`;
    }

    const jid = `${cleanNumber}@s.whatsapp.net`;

    // Check if WhatsApp ID exists
    const result = await sock.sendMessage(jid, { text: message });

    console.log(`📤 [WhatsApp Gateway] Message sent successfully to ${cleanNumber}`);

    return res.json({
      success: true,
      messageId: result?.key?.id || `WA-${Date.now()}`,
      phone: cleanNumber,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [WhatsApp Gateway] Send failed:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send WhatsApp message.' 
    });
  }
});

// 3. Logout / Change WhatsApp Account
app.post('/api/whatsapp/logout', async (req, res) => {
  try {
    console.log('🔄 [WhatsApp Gateway] Disconnecting and resetting account session...');
    
    if (sock) {
      try {
        await sock.logout();
      } catch (e) {}
      sock = null;
    }

    isConnected = false;
    connectedUser = null;
    latestQrDataUrl = null;

    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
    }

    // Trigger fresh QR code generation
    setTimeout(initWhatsApp, 1500);

    return res.json({
      success: true,
      message: 'Logged out successfully. Generating new QR code for fresh scan.'
    });

  } catch (error) {
    console.error('❌ [WhatsApp Gateway] Logout error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Force Regenerate QR Code / Re-initialize Gateway
app.post('/api/whatsapp/refresh', async (req, res) => {
  try {
    console.log('🔄 [WhatsApp Gateway] Manual QR refresh requested...');
    isConnecting = false;
    latestQrDataUrl = null;
    if (sock && !isConnected) {
      try { sock.end(); } catch (e) {}
      sock = null;
    }
    setTimeout(initWhatsApp, 500);
    return res.json({ success: true, message: 'QR regeneration initiated.' });
  } catch (error) {
    console.error('❌ [WhatsApp Gateway] Refresh error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Start Server & Gateway
app.listen(PORT, () => {
  console.log(`🚀 [WhatsApp Gateway] Local Background Server running on http://localhost:${PORT}`);
  initWhatsApp();
});
