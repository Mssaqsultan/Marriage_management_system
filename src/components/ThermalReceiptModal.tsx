import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  Smartphone, 
  FileText,
  Sparkles
} from 'lucide-react';
import { WhatsAppReceiptData } from '../utils/whatsappReceipt';
import QRCode from 'qrcode';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WhatsAppReceiptData;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  data
}) => {
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const {
    guestName,
    fatherName,
    village,
    relation,
    side,
    nevtaAmount,
    nahuchuaAmount,
    giftItemName,
    totalCash,
    paymentMethod,
    paymentRef,
    receiptId,
    eventName,
    hostName,
    venue,
    date
  } = data;

  useEffect(() => {
    if (!isOpen) return;

    // Generate mini QR for slip
    const qrContent = `NEVTA-SLIP:${receiptId}|GUEST:${guestName}|AMT:₹${totalCash}|EVENT:${eventName}`;
    QRCode.toDataURL(qrContent, {
      margin: 1,
      width: 140,
      color: { dark: '#000000', light: '#ffffff' }
    }).then(url => setQrDataUrl(url)).catch(() => {});
  }, [isOpen, receiptId, guestName, totalCash, eventName]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="royal-glass w-full max-w-lg rounded-3xl border-2 border-amber-500/50 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60 no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black font-cinzel">Thermal POS Slip (पर्ची प्रिंट)</h3>
              <p className="text-[11px] text-neutral-500 font-semibold">58mm & 80mm Bluetooth / USB Printers</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-neutral-200 dark:bg-neutral-800 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  paperWidth === '58mm' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                58mm (2")
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  paperWidth === '80mm' ? 'bg-amber-500 text-neutral-950 shadow-sm' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                80mm (3")
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Slip Preview Box */}
        <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-neutral-200/60 dark:bg-neutral-900/90">
          
          <div 
            id="thermal-slip-content"
            className="bg-white text-black p-4 font-mono shadow-2xl rounded-sm text-center border border-neutral-300"
            style={{ 
              width: paperWidth === '58mm' ? '280px' : '360px',
              fontSize: '11px',
              lineHeight: '1.3'
            }}
          >
            {/* Slip Header */}
            <div className="border-b-2 border-dashed border-black pb-2 mb-2">
              <p className="text-xs font-black uppercase tracking-wider">{hostName || 'SULTAN FAMILY'}</p>
              <p className="text-[10px] font-bold mt-0.5">NEVTA & SHAGUN RECEIPT (रसीद)</p>
              <p className="text-[9px] text-neutral-700">{eventName}</p>
              <p className="text-[9px] text-neutral-600 mt-0.5">{venue}</p>
            </div>

            {/* Receipt Meta */}
            <div className="text-left text-[10px] border-b border-dashed border-black pb-2 mb-2 space-y-0.5">
              <div className="flex justify-between">
                <span>Receipt No:</span>
                <strong className="font-bold">{receiptId}</strong>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{date} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex justify-between">
                <span>Side / Paksh:</span>
                <span>{side}</span>
              </div>
            </div>

            {/* Guest Details */}
            <div className="text-left border-b-2 border-black pb-2 mb-2">
              <span className="text-[9px] uppercase font-bold block text-neutral-600">Mehmaan / Guest Details:</span>
              <p className="text-xs font-black uppercase">{guestName}</p>
              {fatherName && <p className="text-[10px]">S/o: {fatherName}</p>}
              {village && <p className="text-[10px]">Niwasi / Village: {village}</p>}
              <p className="text-[9px] text-neutral-700">Relation: {relation}</p>
            </div>

            {/* Financial Amount Breakdown */}
            <div className="text-left border-b border-dashed border-black pb-2 mb-2 space-y-1">
              <div className="flex justify-between text-[11px]">
                <span>Nevta / Shagun:</span>
                <strong>₹{nevtaAmount.toLocaleString('en-IN')}</strong>
              </div>
              {nahuchuaAmount > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span>Nahuchua:</span>
                  <strong>₹{nahuchuaAmount.toLocaleString('en-IN')}</strong>
                </div>
              )}
              {giftItemName && (
                <div className="flex justify-between text-[10px]">
                  <span>Gift Item:</span>
                  <span>{giftItemName}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px] text-neutral-700">
                <span>Payment Mode:</span>
                <span>{paymentMethod} {paymentRef && `(${paymentRef})`}</span>
              </div>
            </div>

            {/* Total Highlight */}
            <div className="border-b-2 border-black py-1.5 mb-2 flex justify-between items-center text-sm font-black">
              <span>TOTAL SHAGUN:</span>
              <span className="text-base">₹{totalCash.toLocaleString('en-IN')}</span>
            </div>

            {/* Thank You Note & QR */}
            <div className="pt-1 text-center space-y-2">
              <p className="text-[9px] font-bold uppercase">
                Shubh Aagman Hetu Hardik Aabhar & Shukriya!
              </p>
              <p className="text-[8px] text-neutral-600">
                * Aapka Ashirwad & उपस्थिति humare liye anmol hai *
              </p>
              {qrDataUrl && (
                <img 
                  src={qrDataUrl} 
                  alt="QR" 
                  className="w-20 h-20 mx-auto object-contain mt-1" 
                />
              )}
              <p className="text-[8px] text-neutral-500">
                Generated by Sultan Nevta Ledger System
              </p>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/80 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-black shadow-lg hover:scale-102 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Slip (पर्ची प्रिंट करें)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
