import React, { useState } from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Users, 
  Calendar, 
  IndianRupee, 
  Gift, 
  Sparkles, 
  Clock, 
  Award, 
  CreditCard, 
  Printer,
  Send
} from 'lucide-react';
import { GuestHistorySummary } from '../types';
import { WhatsAppReceiptModal } from './WhatsAppReceiptModal';
import { WhatsAppReceiptData } from '../utils/whatsappReceipt';
import { VyavharModal } from './VyavharModal';

interface GuestHistoryModalProps {
  history: GuestHistorySummary;
  onClose: () => void;
}

export const GuestHistoryModal: React.FC<GuestHistoryModalProps> = ({
  history,
  onClose
}) => {
  const { guest, family, eventsParticipation, lifetimeNevta, lifetimeNahuchua, lifetimeGiftsCount, lifetimeGiftValue, lifetimeTotalValue } = history;
  const [waModalData, setWaModalData] = useState<WhatsAppReceiptData | null>(null);
  const [isVyavharOpen, setIsVyavharOpen] = useState<boolean>(false);

  const formatRupees = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="royal-glass w-full max-w-3xl rounded-3xl border-2 border-amber-500/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-start justify-between bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-900 dark:text-amber-300 font-black text-xl shadow-md">
              {guest.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-100 font-cinzel">{guest.name}</h2>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  guest.side === 'Groom Side' ? 'bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900/40 dark:text-blue-200' :
                  guest.side === 'Bride Side' ? 'bg-pink-100 text-pink-900 border-pink-400 dark:bg-pink-900/40 dark:text-pink-200' :
                  'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-900/40 dark:text-amber-200'
                }`}>
                  {guest.side}
                </span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5 font-semibold">
                {guest.father_husband_name && <span>S/o {guest.father_husband_name} • </span>}
                <span className="text-[#78350F] dark:text-amber-300 font-bold">{guest.relation}</span>
                {family && <span> • Family: <strong className="text-[#581C87] dark:text-purple-300">{family.name}</strong></span>}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/60 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Quick Contact & Village Meta Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-neutral-500 font-bold">Village / Address:</span>
                <p className="font-extrabold text-neutral-900 dark:text-neutral-200">{guest.village || 'N/A'}, {guest.district || ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" />
              <div>
                <span className="text-neutral-500 font-bold">Mobile Contact:</span>
                <p className="font-extrabold text-neutral-900 dark:text-neutral-200">{guest.mobile || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <div>
                <span className="text-neutral-500 font-bold">Household:</span>
                <p className="font-extrabold text-neutral-900 dark:text-neutral-200">{family ? family.name : 'Independent'}</p>
              </div>
            </div>
          </div>

          {/* Lifetime Aggregate Contribution Stats */}
          <div>
            <h3 className="text-xs font-black text-neutral-700 dark:text-neutral-400 uppercase tracking-wider font-outfit mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Lifetime Contribution Summary (Across All Celebrations)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30">
                <span className="text-[11px] text-[#78350F] dark:text-amber-300 font-black uppercase">Lifetime Nevta</span>
                <p className="text-xl font-black text-[#78350F] dark:text-amber-300 font-outfit mt-1">{formatRupees(lifetimeNevta)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30">
                <span className="text-[11px] text-[#064E3B] dark:text-emerald-300 font-black uppercase">Lifetime Nahuchua</span>
                <p className="text-xl font-black text-[#064E3B] dark:text-emerald-300 font-outfit mt-1">{formatRupees(lifetimeNahuchua)}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30">
                <span className="text-[11px] text-[#581C87] dark:text-purple-300 font-black uppercase">Gifts Count / Value</span>
                <p className="text-xl font-black text-[#581C87] dark:text-purple-300 font-outfit mt-1">{lifetimeGiftsCount} <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">({formatRupees(lifetimeGiftValue)})</span></p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50">
                <span className="text-[11px] text-neutral-900 dark:text-cyan-300 font-black uppercase">Grand Total Value</span>
                <p className="text-xl font-black text-[#78350F] dark:text-cyan-200 font-outfit mt-1">{formatRupees(lifetimeTotalValue)}</p>
              </div>
            </div>
          </div>

          {/* Event-by-Event Ledger Timeline */}
          <div>
            <h3 className="text-xs font-black text-neutral-700 dark:text-neutral-400 uppercase tracking-wider font-outfit mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Event-by-Event Participation Ledger
            </h3>

            {eventsParticipation.length === 0 ? (
              <div className="p-8 text-center text-neutral-500 text-xs rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 font-medium">
                No recorded transactions yet for this guest in the system.
              </div>
            ) : (
              <div className="space-y-4">
                {eventsParticipation.map(({ event, nevtaAmount, nahuchuaAmount, gifts, totalAmount, transactions }) => (
                  <div key={event.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 dark:border-neutral-800/60 pb-2.5">
                      <div>
                        <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-100 font-cinzel">👑 {event.name}</h4>
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-semibold">
                          Date: {event.date} • Venue: {event.venue}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-500 font-bold uppercase">Total Cash Given:</span>
                        <p className="text-base font-black text-[#78350F] dark:text-amber-300 font-outfit">
                          {formatRupees(totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-[10px] text-neutral-500">Nevta:</span>
                        <p className="font-bold text-[#78350F] dark:text-amber-300">{formatRupees(nevtaAmount)}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-[10px] text-neutral-500">Nahuchua:</span>
                        <p className="font-bold text-[#064E3B] dark:text-emerald-300">{formatRupees(nahuchuaAmount)}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 col-span-2 sm:col-span-1">
                        <span className="text-[10px] text-neutral-500">Physical Gifts:</span>
                        <p className="font-bold text-[#581C87] dark:text-purple-300">{gifts.length} Items</p>
                      </div>
                    </div>

                    {/* Physical gifts details */}
                    {gifts.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] text-neutral-500 font-bold block mb-1">Gifts in this event:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {gifts.map(g => (
                            <span key={g.id} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 dark:bg-purple-900/30 text-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                              🎁 {g.item_name} ({g.category}) - ₹{g.estimated_value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* WhatsApp Receipt Button */}
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/60 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const primaryTxn = transactions[0];
                          const rData: WhatsAppReceiptData = {
                            guestName: guest.name,
                            fatherName: guest.father_husband_name,
                            mobile: guest.mobile || '',
                            village: guest.village || 'Chauriya khas',
                            nevtaAmount,
                            nahuchuaAmount,
                            giftItemName: gifts.length > 0 ? gifts.map(g => g.item_name).join(', ') : undefined,
                            totalCash: totalAmount,
                            paymentMethod: primaryTxn ? primaryTxn.payment_method : 'Cash',
                            paymentRef: primaryTxn?.payment_reference,
                            receiptId: `NVT-${event.event_code || 'HIST'}-${Math.floor(1000 + Math.random() * 9000)}`,
                            eventName: event.name,
                            hostName: event.host_name,
                            venue: event.venue,
                            date: event.date,
                            relation: guest.relation,
                            side: guest.side
                          };
                          setWaModalData(rData);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Share WhatsApp Receipt</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/60">
          <button
            onClick={() => setIsVyavharOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/50 text-amber-900 dark:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <span>⚖️ लेन-देन (Vyavhar & Return Nevta)</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-200 font-bold text-xs transition-all cursor-pointer"
          >
            Close History
          </button>
        </div>

      </div>

      {/* WhatsApp Receipt Modal */}
      {waModalData && (
        <WhatsAppReceiptModal
          data={waModalData}
          onClose={() => setWaModalData(null)}
        />
      )}

      {/* Vyavhar Len-Den Modal */}
      {isVyavharOpen && (
        <VyavharModal
          isOpen={isVyavharOpen}
          onClose={() => setIsVyavharOpen(false)}
          guest={guest}
        />
      )}
    </div>
  );
};
