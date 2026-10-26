import React, { useState } from 'react';
import { 
  Gift as GiftIcon, 
  Search, 
  Plus, 
  Tag, 
  IndianRupee, 
  Sparkles, 
  Layers, 
  Trash2,
  Filter
} from 'lucide-react';
import { Gift, GiftCategory, Event, User } from '../types';
import { db } from '../services/db';
import { TransliteratedInput } from './TransliteratedInput';
import { t, getLanguageFontClass } from '../utils/i18n';

interface GiftsViewProps {
  activeEvent: Event;
  currentUser?: User;
  onSelectGuest: (guestId: string) => void;
  onSuccessToast: (msg: string) => void;
  currentLanguage?: 'en' | 'hi' | 'ur';
}

const GIFT_CATEGORIES: GiftCategory[] = [
  'Clothing', 'Jewellery', 'Electronics', 'Utensils', 'Dry Fruits', 'Food', 'Home Decor', 'Cash Envelope', 'Other'
];

export const GiftsView: React.FC<GiftsViewProps> = ({
  activeEvent,
  currentUser,
  onSelectGuest,
  onSuccessToast,
  currentLanguage = 'en'
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const langFont = getLanguageFontClass(currentLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [formGuestId, setFormGuestId] = useState('');
  const [formItemName, setFormItemName] = useState('');
  const [formCategory, setFormCategory] = useState<GiftCategory>('Clothing');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formEstimatedValue, setFormEstimatedValue] = useState('');
  const [formCondition, setFormCondition] = useState('New Box');
  const [formNotes, setFormNotes] = useState('');

  const allGifts = db.getGifts(activeEvent.id);
  const allGuests = db.getGuests();

  const filteredGifts = allGifts.filter(g => {
    if (selectedCategory !== 'ALL' && g.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const guest = allGuests.find(gst => gst.id === g.guest_id);
    return g.item_name.toLowerCase().includes(q) || (guest && guest.name.toLowerCase().includes(q));
  });

  const totalItemsCount = allGifts.reduce((s, g) => s + g.quantity, 0);
  const totalValuation = allGifts.reduce((s, g) => s + (g.estimated_value * g.quantity), 0);

  const handleSaveGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formGuestId || !formItemName.trim()) {
      alert('Please select Guest and enter Item Name');
      return;
    }

    db.addGift({
      event_id: activeEvent.id,
      guest_id: formGuestId,
      item_name: formItemName.trim(),
      category: formCategory,
      quantity: formQuantity || 1,
      estimated_value: Math.round(parseFloat(formEstimatedValue) || 0),
      condition: formCondition,
      notes: formNotes.trim() || undefined
    });

    onSuccessToast(`Recorded gift "${formItemName}"`);
    setIsModalOpen(false);
    setFormItemName('');
    setFormEstimatedValue('');
  };

  const handleDeleteGift = (id: string, name: string) => {
    if (confirm(`Delete gift record for "${name}"?`)) {
      db.deleteGift(id);
      onSuccessToast(`Deleted gift record "${name}"`);
    }
  };

  return (
    <div className={`space-y-6 animate-fadeIn pb-16 ${langFont}`}>
      
      {/* Header Bar */}
      <div className="royal-glass rounded-3xl p-6 border-2 border-amber-500/40 bg-white dark:bg-neutral-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-purple-500/20 text-[#581C87] dark:text-purple-300 border border-purple-500/40 font-outfit">
              {t('gifts.title', currentLanguage)}
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold">Total: <strong className="text-neutral-900 dark:text-neutral-100 font-outfit">{totalItemsCount}</strong></span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 font-cinzel">
            {t('gifts.title', currentLanguage)}
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('gifts.add_btn', currentLanguage)}</span>
        </button>
      </div>

      {/* Summary KPI Cards for Gifts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="royal-glass rounded-2xl p-5 border border-neutral-300 dark:border-purple-500/20 bg-white dark:bg-neutral-950 shadow-md">
          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold uppercase font-outfit">Total Gifts Count</span>
          <p className="text-3xl font-black text-[#581C87] dark:text-purple-300 font-outfit mt-2">{totalItemsCount} Items</p>
          <p className="text-[11px] text-neutral-500 font-medium mt-1">Clothing, Jewellery, Electronics</p>
        </div>
        <div className="royal-glass rounded-2xl p-5 border-2 border-amber-500/40 bg-white dark:bg-neutral-950 shadow-md">
          <span className="text-xs text-[#78350F] dark:text-amber-300 font-black uppercase font-outfit">Estimated Market Value</span>
          <p className="text-3xl font-black text-[#78350F] dark:text-amber-300 font-outfit mt-2">₹{totalValuation.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-neutral-600 dark:text-amber-400/80 mt-1 font-semibold">Approximate asset estimation</p>
        </div>
        <div className="royal-glass rounded-2xl p-5 border border-neutral-300 dark:border-emerald-500/20 bg-white dark:bg-neutral-950 shadow-md">
          <span className="text-xs text-neutral-600 dark:text-emerald-300 font-bold uppercase font-outfit">Unique Givers</span>
          <p className="text-3xl font-black text-[#064E3B] dark:text-emerald-300 font-outfit mt-2">{new Set(allGifts.map(g => g.guest_id)).size} Guests</p>
          <p className="text-[11px] text-neutral-500 font-medium mt-1">Recorded in ledger</p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="royal-glass rounded-3xl p-4 border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 flex flex-col sm:flex-row gap-3 shadow-md">
        <div className="relative flex-1 flex items-center">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none select-none">
            <Search className="w-4 h-4 text-neutral-500 dark:text-purple-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gifts or givers..."
            className="royal-input text-xs"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="royal-input text-xs sm:w-56"
        >
          <option value="ALL">All Categories</option>
          {GIFT_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Gifts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGifts.map((gift) => {
          const guest = allGuests.find(g => g.id === gift.guest_id);

          return (
            <div key={gift.id} className="royal-glass rounded-3xl p-5 border border-neutral-300 dark:border-purple-500/20 bg-white dark:bg-neutral-950 royal-glass-hover flex flex-col justify-between space-y-3 shadow-md">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[#581C87] dark:text-purple-300">
                      <GiftIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-100 font-cinzel">{gift.item_name}</h4>
                      <span className="text-[10px] font-black text-[#581C87] dark:text-purple-300 bg-purple-100 dark:bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-500/20">
                        {gift.category}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteGift(gift.id, gift.item_name)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Presented By:</span>
                    <button
                      onClick={() => guest && onSelectGuest(guest.id)}
                      className="font-bold text-[#78350F] dark:text-amber-300 hover:underline cursor-pointer"
                    >
                      {guest?.name || 'Guest'}
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Village:</span>
                    <span className="text-neutral-900 dark:text-neutral-200 font-semibold">{guest?.village || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Condition/Tag:</span>
                    <span className="text-neutral-800 dark:text-neutral-300">{gift.condition || 'New Box'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold">Quantity:</span>
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-200">{gift.quantity} {gift.quantity > 1 ? 'Units' : 'Unit'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 font-bold">Est. Value:</span>
                  <p className="text-sm font-black text-[#581C87] dark:text-purple-300 font-outfit">
                    ₹{(gift.estimated_value * gift.quantity).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGifts.length === 0 && (
        <div className="p-12 text-center royal-glass rounded-3xl border-2 border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <GiftIcon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-base font-bold text-neutral-900 dark:text-neutral-300 font-outfit">No Gift Records Found</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-500 mt-1">Record physical items presented by guests.</p>
        </div>
      )}

      {/* Add Gift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="royal-glass w-full max-w-lg rounded-3xl border-2 border-amber-500/50 shadow-2xl p-6 sm:p-7 space-y-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
            <h3 className="text-xl font-black font-cinzel text-[#78350F] dark:text-amber-300">
              Record Physical Gift Item
            </h3>

            <form onSubmit={handleSaveGift} className="space-y-4">
              <div>
                <label className="form-label">
                  Select Guest (Giver) *
                </label>
                <select
                  value={formGuestId}
                  onChange={(e) => setFormGuestId(e.target.value)}
                  className="royal-input"
                  required
                >
                  <option value="">Choose Guest...</option>
                  {allGuests.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.village || 'No Village'})</option>
                  ))}
                </select>
              </div>

              <TransliteratedInput
                label="Gift Item Description"
                value={formItemName}
                onChange={setFormItemName}
                placeholder="e.g. Pure Silk Suit, Sherwani, Gold Ring"
                required
                autoTransliterate
              />

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="form-label">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as GiftCategory)}
                    className="royal-input"
                  >
                    {GIFT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(parseInt(e.target.value) || 1)}
                    className="royal-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="form-label">
                    Estimated Value (₹)
                  </label>
                  <input
                    type="number"
                    value={formEstimatedValue}
                    onChange={(e) => setFormEstimatedValue(e.target.value)}
                    placeholder="e.g. 2500"
                    className="royal-input"
                  />
                </div>

                <div>
                  <label className="form-label">
                    Condition / Box
                  </label>
                  <select
                    value={formCondition}
                    onChange={(e) => setFormCondition(e.target.value)}
                    className="royal-input"
                  >
                    <option value="New Box">New Box Pack</option>
                    <option value="Unpacked">Unpacked / Open</option>
                    <option value="Custom Gift Wrap">Custom Gift Wrap</option>
                    <option value="Handmade">Handmade</option>
                  </select>
                </div>
              </div>

              <TransliteratedInput
                label="Special Remarks"
                value={formNotes}
                onChange={setFormNotes}
                placeholder="e.g. Presented during Barat ceremony"
                autoTransliterate
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-300 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg cursor-pointer"
                >
                  Save Gift Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
