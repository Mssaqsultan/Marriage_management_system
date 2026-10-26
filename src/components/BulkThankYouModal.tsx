import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Users, 
  Sparkles, 
  Languages, 
  Check, 
  ExternalLink,
  Zap
} from 'lucide-react';
import { Event, Guest, Transaction } from '../types';
import { db } from '../services/db';
import { whatsappClient } from '../services/whatsappClient';

interface BulkThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvent: Event;
  onSuccessToast?: (msg: string) => void;
}

export const BulkThankYouModal: React.FC<BulkThankYouModalProps> = ({
  isOpen,
  onClose,
  activeEvent,
  onSuccessToast
}) => {
  const [lang, setLang] = useState<'en' | 'hi' | 'ur'>('hi');
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [isSendingBulk, setIsSendingBulk] = useState<boolean>(false);
  const [sentCount, setSentCount] = useState<number>(0);
  const [statusMap, setStatusMap] = useState<Record<string, 'sent' | 'failed' | 'pending'>>({});

  const allGuests = db.getGuests();
  const txns = db.getTransactions(activeEvent.id);
  const attendedGuestIds = new Set(txns.map(t => t.guest_id));

  // Filter guests who attended and have a mobile number
  const eligibleGuests = allGuests.filter(g => attendedGuestIds.has(g.id) && g.mobile && g.mobile.length >= 10);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedGuestIds(eligibleGuests.map(g => g.id));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getTemplateMessage = (guestName: string) => {
    if (lang === 'hi') {
      return `🙏 *सादर प्रणाम ${guestName} जी* 🙏\n\nहमारे *${activeEvent.name}* के शुभ अवसर पर पधारकर वर-वधु को अपना अमूल्य स्नेह, उपस्थिति एवं शुभाशीर्वाद प्रदान करने हेतु आपका एवं आपके परिवार का कोटि-कोटि धन्यवाद एवं हार्दिक आभार!\n\nआपकी उपस्थिति ने हमारे पारिवारिक उत्सव की शोभा बढ़ाई।\n\n— *${activeEvent.host_name}* एवं समस्त परिवार\n📍 *${activeEvent.venue}*`;
    } else if (lang === 'ur') {
      return `🌹 *محترم ${guestName} صاحب* 🌹\n\nہماری *${activeEvent.name}* کی پروقار تقریب میں تشریف آوری اور دل سے دعاؤں اور محبتوں سے نوازنے کے لیے آپ کا اور آپ کے اہل خانہ کا تہہ دل سے بہت بہت شکریہ!\n\nآپ کی شرکت ہمارے لیے باعث فخر و مسرت رہی۔\n\n— *${activeEvent.host_name}* اور تمام اہل خانہ\n📍 *${activeEvent.venue}*`;
    } else {
      return `🌸 *Dear ${guestName}* 🌸\n\nWe sincerely thank you and your family for gracing our wedding celebrations (*${activeEvent.name}*) with your warm presence and heartfelt blessings!\n\nYour auspicious presence made our special day truly memorable.\n\n— *${activeEvent.host_name} & Family*\n📍 *${activeEvent.venue}*`;
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedGuestIds.length === eligibleGuests.length) {
      setSelectedGuestIds([]);
    } else {
      setSelectedGuestIds(eligibleGuests.map(g => g.id));
    }
  };

  const handleToggleGuest = (id: string) => {
    setSelectedGuestIds(prev => 
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const handleDirectBulkSend = async () => {
    if (selectedGuestIds.length === 0) return;
    setIsSendingBulk(true);
    let success = 0;

    const targetList = eligibleGuests.filter(g => selectedGuestIds.includes(g.id));

    for (const guest of targetList) {
      if (!guest.mobile) continue;
      const msg = getTemplateMessage(guest.name);
      try {
        const res = await whatsappClient.sendDirectMessage(guest.mobile, msg);
        if (res.success) {
          success++;
          setStatusMap(prev => ({ ...prev, [guest.id]: 'sent' }));
        } else {
          setStatusMap(prev => ({ ...prev, [guest.id]: 'failed' }));
        }
      } catch {
        setStatusMap(prev => ({ ...prev, [guest.id]: 'failed' }));
      }
      setSentCount(success);
      // Small pause between messages to prevent spam throttling
      await new Promise(r => setTimeout(r, 1000));
    }

    setIsSendingBulk(false);
    if (onSuccessToast) {
      onSuccessToast(`🎉 Bulk Thank-You sent to ${success} guests via WhatsApp!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="royal-glass w-full max-w-3xl rounded-3xl border-2 border-amber-500/50 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-emerald-600/15 via-amber-600/15 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-black text-xl shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-cinzel">
                  Bulk Thank-You WhatsApp Broadcast
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                  Post-Wedding
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-semibold">
                Send personalized wedding Thank You & Aabhar messages to attended guests
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
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Language Selector Bar */}
          <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 p-2.5 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-amber-500" />
              <span>Message Language:</span>
            </span>

            <div className="flex rounded-xl bg-white dark:bg-neutral-800 p-1 border border-neutral-300 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'hi' ? 'bg-amber-500 text-neutral-950 shadow-sm font-black' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                🇮🇳 Hindi (हिन्दी)
              </button>
              <button
                type="button"
                onClick={() => setLang('ur')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'ur' ? 'bg-amber-500 text-neutral-950 shadow-sm font-black' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                🌙 Urdu (اردو)
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  lang === 'en' ? 'bg-amber-500 text-neutral-950 shadow-sm font-black' : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* Sample Message Preview */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              Sample Message Preview (नमूना):
            </span>
            <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl text-xs font-mono whitespace-pre-line border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200">
              {getTemplateMessage('Mohammad Aslam')}
            </div>
          </div>

          {/* Eligible Guests List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-500" />
                <h4 className="text-xs font-black uppercase text-neutral-700 dark:text-neutral-300">
                  Select Attended Guests ({selectedGuestIds.length} / {eligibleGuests.length})
                </h4>
              </div>

              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                {selectedGuestIds.length === eligibleGuests.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden max-h-56 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800">
              {eligibleGuests.map(g => {
                const isSelected = selectedGuestIds.includes(g.id);
                const status = statusMap[g.id];

                return (
                  <div 
                    key={g.id}
                    onClick={() => handleToggleGuest(g.id)}
                    className="p-3 flex items-center justify-between text-xs hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => {}} 
                        className="rounded border-neutral-300 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-neutral-100">{g.name}</p>
                        <p className="text-[11px] text-neutral-500 font-mono">{g.mobile} • {g.village || 'No Village'}</p>
                      </div>
                    </div>

                    <div>
                      {status === 'sent' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          ✓ Sent
                        </span>
                      ) : status === 'failed' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                          ⚠️ Failed
                        </span>
                      ) : (
                        <span className="text-[11px] text-neutral-400">Ready</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleDirectBulkSend}
            disabled={selectedGuestIds.length === 0 || isSendingBulk}
            className="gold-gradient-btn px-7 py-2.5 rounded-xl text-xs font-black shadow-lg hover:scale-102 active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>
              {isSendingBulk 
                ? `Sending (${sentCount}/${selectedGuestIds.length})...` 
                : `⚡ Send Broadcast (${selectedGuestIds.length} Guests)`}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
