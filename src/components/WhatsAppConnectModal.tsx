import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  RefreshCw, 
  LogOut, 
  Smartphone, 
  Zap, 
  ShieldCheck,
  AlertCircle,
  Globe,
  Settings,
  ExternalLink,
  Terminal,
  Send
} from 'lucide-react';
import { whatsappClient, WhatsAppGatewayStatus } from '../services/whatsappClient';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast
}) => {
  const [status, setStatus] = useState<WhatsAppGatewayStatus>({
    connected: false,
    serverOnline: false
  });
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshingQr, setRefreshingQr] = useState(false);
  
  // Custom Gateway URL state
  const [customUrl, setCustomUrl] = useState<string>(() => whatsappClient.getGatewayUrl());
  const [showUrlSettings, setShowUrlSettings] = useState(false);
  const [testingUrl, setTestingUrl] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await whatsappClient.getStatus();
      setStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchStatus();
    // Poll every 3.5 seconds while modal is open to auto-detect QR scan
    const interval = setInterval(fetchStatus, 3500);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await whatsappClient.logout();
      if (res.success) {
        if (onSuccessToast) onSuccessToast('🔄 WhatsApp session cleared. Please scan new QR code.');
        await fetchStatus();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleRefreshQr = async () => {
    setRefreshingQr(true);
    try {
      await whatsappClient.refreshQrCode();
      if (onSuccessToast) onSuccessToast('🔄 Generating fresh QR code...');
      setTimeout(fetchStatus, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshingQr(false);
    }
  };

  const handleSaveGatewayUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingUrl(true);
    whatsappClient.setGatewayUrl(customUrl);
    await fetchStatus();
    setTestingUrl(false);
    if (onSuccessToast) onSuccessToast('💾 Gateway URL updated & tested.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="royal-glass w-full max-w-lg rounded-3xl border-2 border-emerald-500/50 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-emerald-600/15 via-amber-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl shadow-md">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-cinzel text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>WhatsApp Auto-Send Gateway</span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-semibold">
                Direct background receipts & Live WhatsApp setup
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowUrlSettings(!showUrlSettings)}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
              title="Gateway Server URL Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Gateway URL Configuration Drawer */}
        {showUrlSettings && (
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/30 text-xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between font-bold text-neutral-900 dark:text-neutral-100">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-600" />
                <span>WhatsApp Gateway Server URL (Local / Ngrok / Cloud):</span>
              </span>
              <button 
                onClick={() => {
                  setCustomUrl('http://localhost:5001/api/whatsapp');
                  whatsappClient.setGatewayUrl('http://localhost:5001/api/whatsapp');
                  fetchStatus();
                }}
                className="text-[10px] text-amber-700 dark:text-amber-400 underline cursor-pointer"
              >
                Reset to Localhost
              </button>
            </div>
            
            <form onSubmit={handleSaveGatewayUrl} className="flex gap-2">
              <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="e.g. https://xxxx.ngrok-free.app or http://localhost:5001"
                className="royal-input py-1.5 text-xs flex-1"
              />
              <button
                type="submit"
                disabled={testingUrl}
                className="px-4 py-1.5 rounded-xl gold-gradient-btn text-xs font-bold shrink-0 cursor-pointer shadow-sm"
              >
                {testingUrl ? 'Testing...' : 'Save & Test'}
              </button>
            </form>
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
              💡 For <strong>Live Vercel</strong>, run <code className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">ngrok http 5001</code> on your PC and paste the HTTPS ngrok URL above.
            </p>
          </div>
        )}

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Status 1: Connected */}
          {status.connected ? (
            <div className="text-center space-y-4 py-4 animate-fadeIn">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xl">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 font-outfit">
                  🟢 Connected & Ready
                </span>
                <h4 className="text-xl font-black text-neutral-900 dark:text-neutral-100 font-cinzel mt-2">
                  {status.user?.phone || 'WhatsApp Linked'}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium max-w-sm mx-auto">
                  Direct 1-Click WhatsApp background sending is active. All receipts will be delivered immediately to guests!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-neutral-900/80 border border-emerald-500/30 text-left space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Permanent Session Active</span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
                  ✓ You do NOT need to scan again on restart.<br />
                  ✓ To use a different WhatsApp number, click the change button below.
                </p>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full py-3 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-red-600 dark:text-red-400 border border-neutral-300 dark:border-neutral-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>{loggingOut ? 'Disconnecting...' : 'Change / Disconnect WhatsApp Account'}</span>
              </button>
            </div>
          ) : status.qrCode ? (
            /* Status 2: QR Code Ready for Scanning */
            <div className="text-center space-y-4 animate-fadeIn">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-outfit">
                  Scan QR Code Once (1-Time Setup)
                </span>
                <h4 className="text-base font-black text-neutral-900 dark:text-neutral-100 font-cinzel mt-2">
                  Link your WhatsApp Account
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
                  Scan this QR code with WhatsApp on your phone to enable automatic direct background sending.
                </p>
              </div>

              {/* QR Box */}
              <div className="inline-block p-3 rounded-3xl bg-white border-4 border-amber-500/40 shadow-2xl relative group">
                <img 
                  src={status.qrCode} 
                  alt="WhatsApp QR Code" 
                  className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl"
                />
              </div>

              {/* Regenerate Button */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleRefreshQr}
                  disabled={refreshingQr}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-900 dark:text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${refreshingQr ? 'animate-spin' : ''}`} />
                  <span>{refreshingQr ? 'Refreshing QR...' : '🔄 Regenerate QR Code'}</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-left space-y-2 text-xs">
                <p className="font-black text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>How to scan from your mobile phone:</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-neutral-600 dark:text-neutral-400 text-[11px] font-medium pl-1">
                  <li>Open <strong>WhatsApp</strong> on your mobile phone</li>
                  <li>Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong> → <strong>Linked Devices</strong></li>
                  <li>Tap <strong>Link a Device</strong> and point your phone at this QR code</li>
                </ol>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Listening for connection... (auto-connects instantly)</span>
              </div>
            </div>
          ) : (
            /* Status 3: Gateway Server Offline / Needs Start */
            <div className="text-center space-y-4 py-4 animate-fadeIn">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  WhatsApp Background Gateway is Offline
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-md mx-auto">
                  {status.isMixedContentWarning ? (
                    <span className="text-amber-700 dark:text-amber-400 font-semibold">
                      ⚠️ You are running on Live HTTPS (Vercel). Web browsers block direct HTTP localhost connections.
                    </span>
                  ) : (
                    <span>The local background Node.js WhatsApp server is not running on <code className="font-mono bg-neutral-100 dark:bg-neutral-900 px-1 py-0.5 rounded">{whatsappClient.getGatewayUrl()}</code>.</span>
                  )}
                </p>
              </div>

              {/* Step-by-step Setup Guide */}
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-left space-y-3 text-xs">
                <div className="flex items-center gap-2 font-black text-neutral-800 dark:text-neutral-200">
                  <Terminal className="w-4 h-4 text-emerald-600" />
                  <span>How to activate background QR scan & auto-send:</span>
                </div>

                <div className="space-y-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                  <div className="p-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-950 font-mono text-emerald-700 dark:text-emerald-400 border border-neutral-300 dark:border-neutral-800 flex items-center justify-between">
                    <span>npm run whatsapp-server</span>
                    <span className="text-[10px] text-neutral-500">(Terminal command)</span>
                  </div>
                  
                  {status.isMixedContentWarning && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-neutral-950 border border-amber-400/40 space-y-1">
                      <p className="font-bold text-amber-900 dark:text-amber-300">For Live Vercel / Cloud access:</p>
                      <p>1. Run: <code className="font-mono bg-neutral-200 dark:bg-neutral-900 px-1 rounded">ngrok http 5001</code></p>
                      <p>2. Click <strong>Settings (⚙️)</strong> above and paste your https ngrok URL.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Fallback reassurance: 1-Click WhatsApp sending always works */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-left flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
                <Send className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-black">Universal 1-Click WhatsApp Sending is Active:</strong>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Even without running the local gateway server, our 1-Tap WhatsApp receipt sending works 100% on any mobile phone, tablet, and PC!
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={fetchStatus}
                  className="px-4 py-2 rounded-xl text-xs font-bold gold-gradient-btn transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Server Again</span>
                </button>
                <button
                  onClick={() => setShowUrlSettings(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                >
                  Configure Gateway URL
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/80">
          <span className="text-[11px] text-neutral-500 font-medium truncate max-w-[240px]">
            URL: {whatsappClient.getGatewayUrl()}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
          >
            Done / Close
          </button>
        </div>

      </div>
    </div>
  );
};
