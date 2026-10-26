import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Copy, 
  Check, 
  Smartphone, 
  Sparkles, 
  Printer, 
  CreditCard,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { generateUpiQrDataUrl, generateUpiUri } from '../utils/upiQr';
import confetti from 'canvas-confetti';
import { db } from '../services/db';

interface DynamicUpiQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestName: string;
  amount: number;
  eventName: string;
  upiId: string;
  payeeName: string;
  onPaymentReceived: (utrRef?: string) => void;
  onSuccessToast?: (msg: string) => void;
}

export const DynamicUpiQrModal: React.FC<DynamicUpiQrModalProps> = ({
  isOpen,
  onClose,
  guestName,
  amount,
  eventName,
  upiId,
  payeeName,
  onPaymentReceived,
  onSuccessToast
}) => {
  const [currentUpiId, setCurrentUpiId] = useState<string>(upiId || 'sultan.family@okaxis');
  const [isEditingUpi, setIsEditingUpi] = useState<boolean>(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [utrInput, setUtrInput] = useState<string>('');
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  const cleanAmount = amount > 0 ? amount : 0;
  const transactionNote = 'Nevta Shagun';

  useEffect(() => {
    setCurrentUpiId(upiId || 'sultan.family@okaxis');
  }, [upiId]);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    generateUpiQrDataUrl({
      upiId: currentUpiId,
      payeeName: payeeName || 'Sultan Family',
      amount: cleanAmount,
      transactionNote
    }).then(url => {
      if (isMounted) setQrDataUrl(url);
    }).catch(err => {
      console.error(err);
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, cleanAmount, currentUpiId, payeeName]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(currentUpiId);
    setIsCopied(true);
    if (onSuccessToast) onSuccessToast('📋 UPI ID copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveUpiId = (newId: string) => {
    const trimmed = newId.trim();
    if (trimmed) {
      setCurrentUpiId(trimmed);
      setIsEditingUpi(false);
      db.updateSettings({ upi_id: trimmed });
      if (onSuccessToast) onSuccessToast(`✅ UPI ID updated & synced across all devices: ${trimmed}`);
    }
  };

  const handleConfirmPayment = () => {
    setIsConfirming(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
    
    if (onSuccessToast) {
      onSuccessToast(`🎉 ₹${cleanAmount.toLocaleString('en-IN')} UPI Payment recorded successfully!`);
    }

    setTimeout(() => {
      onPaymentReceived(utrInput.trim() || undefined);
      setIsConfirming(false);
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="royal-glass w-full max-w-lg rounded-3xl border-2 border-amber-500/50 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-amber-600/15 via-emerald-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xl shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-cinzel text-neutral-900 dark:text-neutral-100">
                  Live Dynamic UPI QR
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  Instant
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-semibold">
                Guest: <strong className="text-neutral-800 dark:text-neutral-200">{guestName || 'Guest'}</strong> • {eventName}
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
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-center">

          {/* Amount Badge */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-amber-500/15 border border-amber-500/40 flex items-center justify-between px-5">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Scan & Pay Exact Amount</span>
              <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                To: {payeeName}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-cinzel">
              ₹{cleanAmount.toLocaleString('en-IN')}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="relative inline-block p-4 rounded-3xl bg-white border-4 border-amber-500/40 shadow-2xl mx-auto">
            {qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt="Dynamic UPI QR Code" 
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl"
              />
            ) : (
              <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center text-neutral-400">
                Generating QR...
              </div>
            )}

            <div className="mt-2 text-[11px] font-bold text-neutral-600 flex items-center justify-center gap-1">
              <span>BHIM UPI • GPay • PhonePe • Paytm</span>
            </div>
          </div>

          {/* UPI ID & Copy / Edit */}
          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-2 text-left">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">Receiver Host UPI ID:</span>
                {!isEditingUpi ? (
                  <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 truncate block">
                    {currentUpiId}
                  </span>
                ) : (
                  <input
                    type="text"
                    defaultValue={currentUpiId}
                    id="edit-upi-input"
                    placeholder="e.g. 9876543210@paytm or sultan@okaxis"
                    className="royal-input py-1 text-xs font-mono mt-1"
                    autoFocus
                  />
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isEditingUpi ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingUpi(true)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                    >
                      ✏️ Change
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 hover:border-amber-500/50 flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('edit-upi-input') as HTMLInputElement;
                      if (input) handleSaveUpiId(input.value);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 text-white shadow-md cursor-pointer"
                  >
                    ✓ Save UPI
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Optional UTR / Reference Input */}
          <div className="text-left space-y-1">
            <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
              <span>UPI Ref / UTR No. (Optional / संदर्भ नंबर):</span>
            </label>
            <input
              type="text"
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value)}
              placeholder="e.g. 423987102938 (Last 4 or full digits)"
              className="royal-input py-2 text-xs font-mono"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-transparent hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isConfirming}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white transition-all shadow-lg hover:shadow-emerald-500/20 hover:scale-102 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isConfirming ? 'Recording...' : '✓ Payment Received (भुगतान प्राप्त)'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
