export interface WhatsAppGatewayStatus {
  connected: boolean;
  user?: {
    id: string;
    phone: string;
    name: string;
  } | null;
  qrCode?: string | null;
  serverOnline: boolean;
  error?: string;
  isMixedContentWarning?: boolean;
}

const STORAGE_KEY_GATEWAY_URL = 'mms_wa_gateway_url';
const DEFAULT_LOCAL_GATEWAY = 'http://localhost:5001/api/whatsapp';

export const whatsappClient = {
  getGatewayUrl(): string {
    const custom = localStorage.getItem(STORAGE_KEY_GATEWAY_URL);
    if (custom && custom.trim()) {
      let clean = custom.trim().replace(/\/+$/, '');
      if (!clean.endsWith('/api/whatsapp')) {
        clean = `${clean}/api/whatsapp`;
      }
      return clean;
    }
    const envUrl = (import.meta as any).env?.VITE_WHATSAPP_GATEWAY_URL;
    if (envUrl && envUrl.trim()) {
      let clean = envUrl.trim().replace(/\/+$/, '');
      if (!clean.endsWith('/api/whatsapp')) {
        clean = `${clean}/api/whatsapp`;
      }
      return clean;
    }
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return '/api/whatsapp';
    }
    return DEFAULT_LOCAL_GATEWAY;
  },

  setGatewayUrl(url: string) {
    if (!url || !url.trim() || url.trim() === DEFAULT_LOCAL_GATEWAY) {
      localStorage.removeItem(STORAGE_KEY_GATEWAY_URL);
    } else {
      let clean = url.trim().replace(/\/+$/, '');
      localStorage.setItem(STORAGE_KEY_GATEWAY_URL, clean);
    }
  },

  // Check if current page is on HTTPS while Gateway URL is on HTTP (browser will block unless tunnel/https)
  isMixedContent(): boolean {
    const currentIsHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const gatewayUrl = this.getGatewayUrl();
    return currentIsHttps && gatewayUrl.startsWith('http://');
  },

  // Check if WhatsApp Gateway is online and whether a number is linked
  async getStatus(): Promise<WhatsAppGatewayStatus> {
    const isMixed = this.isMixedContent();
    const url = this.getGatewayUrl();

    try {
      const response = await fetch(`${url}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        return { 
          connected: false, 
          serverOnline: false, 
          error: `Gateway server error (${response.status})` 
        };
      }

      const data = await response.json();
      return {
        connected: data.connected,
        user: data.user,
        qrCode: data.qrCode,
        serverOnline: true,
        isMixedContentWarning: false
      };
    } catch (err: any) {
      return {
        connected: false,
        serverOnline: false,
        isMixedContentWarning: isMixed,
        error: isMixed 
          ? 'Browsers block HTTP localhost calls from Live HTTPS (Vercel). Please run ngrok or configure secure gateway URL.' 
          : `WhatsApp Gateway server is unreachable on ${url}. Please make sure "npm run whatsapp-server" is running.`
      };
    }
  },

  // Send WhatsApp message directly in the background (No browser window opened!)
  async sendDirectMessage(phone: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const url = this.getGatewayUrl();
    try {
      const response = await fetch(`${url}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to send message via gateway.' };
      }

      return {
        success: true,
        messageId: data.messageId
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Network error connecting to WhatsApp Gateway.'
      };
    }
  },

  // Request fresh QR code regeneration
  async refreshQrCode(): Promise<{ success: boolean; message?: string; error?: string }> {
    const url = this.getGatewayUrl();
    try {
      const response = await fetch(`${url}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  // Logout current WhatsApp account and request fresh QR code for changing number
  async logout(): Promise<{ success: boolean; message?: string; error?: string }> {
    const url = this.getGatewayUrl();
    try {
      const response = await fetch(`${url}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
