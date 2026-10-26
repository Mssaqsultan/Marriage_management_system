import React, { useState, useEffect } from 'react';
import { 
  X, 
  Scale, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Trash2, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { db } from '../services/db';
import { Guest, VyavharSummary, ReturnGiftRecord } from '../types';

interface VyavharModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest: Guest;
  onSuccessToast?: (msg: string) => void;
}

export const VyavharModal: React.FC<VyavharModalProps> = ({
  isOpen,
  onClose,
  guest,
  onSuccessToast
}) => {
  const [summary, setSummary] = useState<VyavharSummary | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState<boolean>(false);

  // Form State
  const [direction, setDirection] = useState<'given_by_us' | 'received_by_us'>('given_by_us');
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const loadSummary = () => {
    const data = db.getVyavharSummary(guest.id);
    setSummary(data);
  };

  useEffect(() => {
    if (isOpen && guest) {
      loadSummary();
    }
  }, [isOpen, guest]);

  if (!isOpen || !guest) return null;

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (!eventName.trim()) {
      alert('Please enter event name (e.g. Ramesh Ji Son Wedding)');
      return;
    }

    db.addReturnGift({
      guest_id: guest.id,
      family_id: guest.family_id,
      direction,
      event_name: eventName.trim(),
      date: eventDate,
      amount: numAmount,
      notes: notes.trim()
    });

    if (onSuccessToast) {
      onSuccessToast(`✅ Recorded ₹${numAmount.toLocaleString('en-IN')} ${direction === 'given_by_us' ? 'Humne Diya' : 'Unhone Diya'} for "${eventName}"`);
    }

    // Reset Form
    setEventName('');
    setAmount('');
    setNotes('');
    setIsAddingRecord(false);
    loadSummary();
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Are you sure you want to delete this Vyavhar record?')) {
      db.deleteReturnGift(id);
      loadSummary();
      if (onSuccessToast) onSuccessToast('Vyavhar record deleted.');
    }
  };

  const totalReceived = summary?.totalReceived || 0;
  const totalGiven = summary?.totalGiven || 0;
  const balance = summary?.balance || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="royal-glass w-full max-w-2xl rounded-3xl border-2 border-amber-500/50 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        
        {/* Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-gradient-to-r from-amber-600/20 via-yellow-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xl shadow-md">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-cinzel text-neutral-900 dark:text-neutral-100">
                  लेन-देन (Vyavhar & Return Nevta Tracker)
                </h3>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-semibold">
                Mehmaan: <strong className="text-neutral-900 dark:text-neutral-100">{guest.name}</strong> • {guest.village || 'No Village'} ({guest.relation})
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
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Received by us */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                <ArrowDownLeft className="w-4 h-4" />
                <span>Unhone Diya (लिया)</span>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-cinzel">
                ₹{totalReceived.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5">Total Received</p>
            </div>

            {/* Given by us */}
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-center">
              <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                <ArrowUpRight className="w-4 h-4" />
                <span>Humne Diya (दिया)</span>
              </div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-cinzel">
                ₹{totalGiven.toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-neutral-500 mt-0.5">Total Returned / Given</p>
            </div>

            {/* Vyavhar Balance */}
            <div className={`p-4 rounded-2xl border text-center ${
              balance > 0 
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-200' 
                : balance < 0 
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-200'
                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block">Vyavhar Status</span>
              <div className="text-lg font-black mt-1">
                {balance > 0 ? (
                  <span className="text-blue-600 dark:text-blue-400 font-cinzel">+₹{Math.abs(balance).toLocaleString('en-IN')} Surplus</span>
                ) : balance < 0 ? (
                  <span className="text-rose-600 dark:text-rose-400 font-cinzel">-₹{Math.abs(balance).toLocaleString('en-IN')} Due</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">✓ Settled (बराबर)</span>
                )}
              </div>
              <p className="text-[10px] opacity-80 mt-0.5">
                {balance > 0 ? 'Humne zyada diya hua hai' : balance < 0 ? 'Agle function mein dena hai' : 'Hisaab barabar hai'}
              </p>
            </div>
          </div>

          {/* Add New Record Action */}
          {!isAddingRecord ? (
            <button
              type="button"
              onClick={() => setIsAddingRecord(true)}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-amber-500/50 hover:border-amber-500 hover:bg-amber-500/10 font-bold text-xs text-neutral-800 dark:text-neutral-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-500" />
              <span>+ Record Return Gift / Vyavhar (नया दिया/लिया व्यवहार दर्ज करें)</span>
            </button>
          ) : (
            <form onSubmit={handleAddRecord} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-amber-500/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <h4 className="text-xs font-black uppercase text-amber-700 dark:text-amber-400">
                  Add Vyavhar Record (व्यवहार एंट्री)
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingRecord(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-600"
                >
                  Cancel
                </button>
              </div>

              {/* Direction Radio */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDirection('given_by_us')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    direction === 'given_by_us'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Humne Unhe Diya (दिया)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('received_by_us')}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    direction === 'received_by_us'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Unhone Hume Diya (लिया)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase block mb-1">
                    Event / Function Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. Ramesh Ji Beta Nikah 2028"
                    className="royal-input py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase block mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="royal-input py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase block mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 2100"
                    className="royal-input py-2 text-xs font-bold font-cinzel"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase block mb-1">
                    Notes / Remarks (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Envelop with dry fruit box"
                    className="royal-input py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingRecord(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn px-6 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  Save Vyavhar Entry
                </button>
              </div>
            </form>
          )}

          {/* History Timeline of Exchanges */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-neutral-500 tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Len-Den History Records ({summary?.records.length || 0})</span>
            </h4>

            {summary?.records && summary.records.length > 0 ? (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/40">
                {summary.records.map(r => (
                  <div key={r.id} className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                        r.direction === 'given_by_us'
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {r.direction === 'given_by_us' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-neutral-100">{r.event_name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            r.direction === 'given_by_us'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}>
                            {r.direction === 'given_by_us' ? 'Humne Diya (दिया)' : 'Unhone Diya (लिया)'}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {r.date} {r.notes && `• ${r.notes}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-base font-black font-cinzel ${
                        r.direction === 'given_by_us' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        ₹{r.amount.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(r.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center text-xs text-neutral-500">
                <BookOpen className="w-8 h-8 mx-auto text-neutral-400 mb-2 opacity-50" />
                <span>No future/past return gifts recorded yet for this guest. Use the button above to record exchanges.</span>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end bg-neutral-50 dark:bg-neutral-900/80">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-extrabold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
