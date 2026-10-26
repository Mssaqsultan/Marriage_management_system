import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Smartphone, 
  MessageSquare, 
  Globe, 
  Zap, 
  ExternalLink, 
  QrCode,
  CheckCircle2,
  Printer
} from 'lucide-react';
import { 
  WhatsAppReceiptData, 
  ReceiptLanguage,
  generateWhatsAppReceiptMessage 
} from '../utils/whatsappReceipt';
import { whatsappClient, WhatsAppGatewayStatus } from '../services/whatsappClient';
import { WhatsAppConnectModal } from './WhatsAppConnectModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';

interface WhatsAppReceiptModalProps {
  data: WhatsAppReceiptData;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const WhatsAppReceiptModal: React.FC<WhatsAppReceiptModalProps> = ({
  data,
  onClose,
  onSuccessToast
}) => {
  const [targetMobile, setTargetMobile] = useState<string>(data.mobile || '');
  const [selectedLanguage, setSelectedLanguage] = useState<ReceiptLanguage>('en');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSendingDirect, setIsSendingDirect] = useState<boolean>(false);
  const [isSentSuccess, setIsSentSuccess] = useState<boolean>(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [isThermalModalOpen, setIsThermalModalOpen] = useState<boolean>(false);
  const [gatewayStatus, setGatewayStatus] = useState<WhatsAppGatewayStatus>({
    connected: false,
    serverOnline: false
  });

  const formattedMessage = generateWhatsAppReceiptMessage(data, selectedLanguage);

  const checkGateway = async () => {
    try {
      const res = await whatsappClient.getStatus();
      setGatewayStatus(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    checkGateway();
    // Poll gateway status every 3s
    const interval = setInterval(checkGateway, 3000);
    return () => clearInterval(interval);
  }, [isConnectModalOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage);
    setIsCopied(true);
    if (onSuccessToast) onSuccessToast('📋 WhatsApp receipt copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSendWhatsApp = async () => {
    if (!targetMobile.trim()) {
      if (onSuccessToast) onSuccessToast('⚠️ Please enter mobile number first!');
      return;
    }

    // 1. If Local Gateway is online & connected -> background send
    if (gatewayStatus.connected) {
      setIsSendingDirect(true);
      try {
        const res = await whatsappClient.sendDirectMessage(targetMobile, formattedMessage);
        if (res.success) {
          setIsSentSuccess(true);
          if (onSuccessToast) {
            onSuccessToast(`✅ WhatsApp receipt sent to ${targetMobile}!`);
          }
          setTimeout(() => {
            onClose();
          }, 1500);
          return;
        }
      } catch (e: any) {
        console.warn('Gateway background send fallback to universal wa.me:', e);
      } finally {
        setIsSendingDirect(false);
      }
    }

    // 2. 🚀 Universal 1-Tap WhatsApp Sending (Works 100% on Vercel Live, Mobile Android/iOS, & Desktop)
    navigator.clipboard.writeText(formattedMessage).catch(() => {});
    const cleanMobile = targetMobile.replace(/[^0-9]/g, '');
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const waUrl = cleanMobile 
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(formattedMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;
    
    window.open(waUrl, '_blank');
    setIsSentSuccess(true);
    if (onSuccessToast) {
      onSuccessToast(`📲 Opening WhatsApp with formatted receipt for ${data.guestName}...`);
    }
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const openWebLink = () => {
    const cleanMobile = targetMobile.replace(/[^0-9]/g, '');
    const phoneParam = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile;
    const waUrl = cleanMobile 
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(formattedMessage)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedMessage)}`;
    
    window.open(waUrl, '_blank');
    if (onSuccessToast) onSuccessToast(`📲 Opening WhatsApp Web for ${data.guestName}...`);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
        <div className="royal-glass w-full max-w-2xl rounded-3xl border-2 border-emerald-500/50 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-emerald-600/15 via-amber-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl shadow-md">
                💬
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-cinzel text-neutral-900 dark:text-neutral-100">
                    {data.eventName || 'Wedding'} Digital Receipt
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    WhatsApp
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-semibold">
                  Recipient: <strong className="text-neutral-800 dark:text-neutral-200">{data.guestName}</strong> • {data.village || 'N/A'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">

            {/* WhatsApp Sender Mode Status Banner */}
            <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              gatewayStatus.connected 
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-200' 
                : 'bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  gatewayStatus.connected ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md'
                }`}>
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black">
                      {gatewayStatus.connected ? '⚡ Auto-Send Background Mode (Active)' : '🚀 Universal 1-Click WhatsApp Mode'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${gatewayStatus.connected ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`} />
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5 font-medium">
                    {gatewayStatus.connected 
                      ? `🟢 Linked to ${gatewayStatus.user?.phone || 'WhatsApp'}. Message sends in background without opening app!`
                      : '✓ 1-Click Send button will open WhatsApp with the pre-filled receipt on any phone or laptop.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsConnectModalOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm cursor-pointer whitespace-nowrap ${
                  gatewayStatus.connected 
                    ? 'bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:scale-105'
                    : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700 hover:border-amber-500'
                }`}
              >
                {gatewayStatus.connected ? '🔄 Change PC Link' : '📲 Link PC Gateway'}
              </button>
            </div>

            {/* 🌐 Language Selector Tabs (English, Hindi, Urdu, Combo) */}
            <div className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300 font-outfit flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  Select Receipt Language (रसीद की भाषा / رسید کی زبان):
                </span>
                <span className="text-[10px] text-neutral-500 font-bold">1-Click Format</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                
                {/* English Tab (Default) */}
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedLanguage === 'en'
                      ? 'bg-blue-600 text-white shadow-md scale-102 font-outfit'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-blue-500/40'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English (EN)</span>
                </button>

                {/* Hindi Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('hi')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedLanguage === 'hi'
                      ? 'bg-amber-500 text-neutral-950 shadow-md scale-102 font-noto'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-amber-500/40'
                  }`}
                >
                  <span>🇮🇳</span>
                  <span>हिंदी (Hindi)</span>
                </button>

                {/* Urdu Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('ur')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedLanguage === 'ur'
                      ? 'bg-emerald-600 text-white shadow-md scale-102 font-nastaliq'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-emerald-500/40'
                  }`}
                >
                  <span>🌙</span>
                  <span>اردو (Urdu)</span>
                </button>

                {/* Trilingual Combined Tab */}
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('combo')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    selectedLanguage === 'combo'
                      ? 'bg-gradient-to-r from-amber-500 via-emerald-600 to-blue-600 text-white shadow-md scale-102'
                      : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-amber-500/40'
                  }`}
                >
                  <span>👑</span>
                  <span>Trilingual (All 3)</span>
                </button>

              </div>
            </div>

            {/* Mobile Number Input */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="flex-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-500">WhatsApp Mobile Number:</span>
                  <input
                    type="tel"
                    value={targetMobile}
                    onChange={(e) => setTargetMobile(e.target.value)}
                    placeholder="e.g. 9876543210 (10 digits)"
                    className="royal-input py-1 text-xs mt-0.5"
                  />
                </div>
              </div>

              {targetMobile ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  ✓ Ready to send
                </span>
              ) : (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                  ⚠️ Enter mobile number
                </span>
              )}
            </div>

            {/* Live Preview WhatsApp Message Bubble */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> 
                  <span>Message Preview ({selectedLanguage.toUpperCase()}):</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-400">WhatsApp Formatted</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-neutral-900 border border-emerald-500/30 font-sans text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap select-all text-neutral-800 dark:text-neutral-200 shadow-inner max-h-[280px] overflow-y-auto">
                {formattedMessage}
              </div>
            </div>

          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-50/80 dark:bg-neutral-900/80">
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              {/* Thermal Slip Print Button */}
              <button
                type="button"
                onClick={() => setIsThermalModalOpen(true)}
                title="Print 58mm / 80mm POS Slip"
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Thermal Slip</span>
              </button>

              {/* Optional Manual Web Link Button if needed */}
              <button
                type="button"
                onClick={openWebLink}
                title="Open in WhatsApp Web manually"
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Web Tab</span>
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-bold bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer"
              >
                Close
              </button>

              {/* ⚡ DIRECT / UNIVERSAL WHATSAPP BUTTON */}
              <button
                onClick={handleSendWhatsApp}
                disabled={isSendingDirect || isSentSuccess}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-lg hover:scale-102 active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                  isSentSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-500/20'
                }`}
              >
                {isSentSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>✓ Sent / Opened!</span>
                  </>
                ) : isSendingDirect ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white" />
                    <span>{gatewayStatus.connected ? '⚡ Auto-Send WhatsApp' : '🚀 Send via WhatsApp (1-Click)'}</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* 📲 WhatsApp QR Connect / Switch Modal */}
      <WhatsAppConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => {
          setIsConnectModalOpen(false);
          checkGateway();
        }}
        onSuccessToast={onSuccessToast}
      />

      {/* 🖨️ Thermal POS Slip Modal */}
      {isThermalModalOpen && (
        <ThermalReceiptModal
          isOpen={isThermalModalOpen}
          onClose={() => setIsThermalModalOpen(false)}
          data={data}
        />
      )}
    </>
  );
};
