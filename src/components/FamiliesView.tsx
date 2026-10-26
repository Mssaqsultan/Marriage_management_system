import React, { useState } from 'react';
import { 
  Home, 
  Users, 
  Plus, 
  MapPin, 
  Phone, 
  IndianRupee, 
  Edit3, 
  Sparkles, 
  ChevronRight,
  Trash2,
  Building
} from 'lucide-react';
import { Family, Guest, Event, User } from '../types';
import { db } from '../services/db';
import { TransliteratedInput } from './TransliteratedInput';
import { t, getLanguageFontClass } from '../utils/i18n';

interface FamiliesViewProps {
  activeEvent: Event;
  currentUser?: User;
  onSelectGuest: (guestId: string) => void;
  onSuccessToast: (msg: string) => void;
  currentLanguage?: 'en' | 'hi' | 'ur';
}

export const FamiliesView: React.FC<FamiliesViewProps> = ({
  activeEvent,
  currentUser,
  onSelectGuest,
  onSuccessToast,
  currentLanguage = 'en'
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const langFont = getLanguageFontClass(currentLanguage);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [familyHeadId, setFamilyHeadId] = useState('');
  const [familyVillage, setFamilyVillage] = useState('');
  const [familyDistrict, setFamilyDistrict] = useState('Lucknow');
  const [familyState, setFamilyState] = useState('Uttar Pradesh');
  const [familyMobile, setFamilyMobile] = useState('');
  const [familyNotes, setFamilyNotes] = useState('');

  const families = db.getFamilies();
  const allGuests = db.getGuests();
  const allTxns = db.getTransactions(activeEvent.id);

  const handleOpenAdd = () => {
    setEditingFamilyId(null);
    setFamilyName('');
    setFamilyHeadId('');
    setFamilyVillage('');
    setFamilyDistrict('Lucknow');
    setFamilyState('Uttar Pradesh');
    setFamilyMobile('');
    setFamilyNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f: Family) => {
    if (!isAdmin) {
      alert('🔒 Authority Restricted: Only Admin (Sultan) is authorized to edit or modify Family details.');
      return;
    }
    setEditingFamilyId(f.id);
    setFamilyName(f.name);
    setFamilyHeadId(f.head_guest_id || '');
    setFamilyVillage(f.village || '');
    setFamilyDistrict(f.district || 'Lucknow');
    setFamilyState(f.state || 'Uttar Pradesh');
    setFamilyMobile(f.mobile || '');
    setFamilyNotes(f.notes || '');
    setIsModalOpen(true);
  };

  const handleDeleteFamily = (id: string, name: string) => {
    if (!isAdmin) {
      alert('🔒 Authority Restricted: Only Admin (Sultan) is authorized to delete Family groups.');
      return;
    }
    if (confirm(`Delete family group "${name}"? Guests in this family will remain preserved as individuals.`)) {
      db.deleteFamily(id);
      onSuccessToast(`Deleted family group "${name}"`);
    }
  };

  const handleSaveFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyName.trim()) {
      alert('Family Name is required');
      return;
    }

    if (editingFamilyId) {
      db.updateFamily(editingFamilyId, {
        name: familyName.trim(),
        head_guest_id: familyHeadId || undefined,
        village: familyVillage.trim() || undefined,
        district: familyDistrict.trim() || undefined,
        state: familyState.trim() || undefined,
        mobile: familyMobile.trim() || undefined,
        notes: familyNotes.trim() || undefined
      });
      onSuccessToast(`Updated family "${familyName}"`);
    } else {
      db.addFamily({
        name: familyName.trim(),
        head_guest_id: familyHeadId || undefined,
        village: familyVillage.trim() || undefined,
        district: familyDistrict.trim() || undefined,
        state: familyState.trim() || undefined,
        mobile: familyMobile.trim() || undefined,
        notes: familyNotes.trim() || undefined
      });
      onSuccessToast(`Created new family "${familyName}"`);
    }

    setIsModalOpen(false);
  };

  return (
    <div className={`space-y-6 animate-fadeIn pb-16 ${langFont}`}>
      
      {/* Header Bar */}
      <div className="royal-glass rounded-3xl p-6 border-2 border-amber-500/40 bg-white dark:bg-neutral-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-purple-500/20 text-[#581C87] dark:text-purple-300 border border-purple-500/40 font-outfit">
              {t('families.title', currentLanguage)}
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold">Total: <strong className="text-neutral-900 dark:text-neutral-100 font-outfit">{families.length} Families</strong></span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 font-cinzel">
            {t('families.title', currentLanguage)}
          </h2>
        </div>

        <button
          onClick={handleOpenAdd}
          className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t('families.add_btn', currentLanguage)}</span>
        </button>
      </div>

      {/* Families Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {families.map((fam) => {
          const members = allGuests.filter(g => g.family_id === fam.id);
          const memberIds = new Set(members.map(m => m.id));
          const familyTxns = allTxns.filter(t => memberIds.has(t.guest_id));
          const totalFamilyNevta = familyTxns.filter(t => t.type === 'nevta').reduce((s, t) => s + t.amount, 0);
          const headGuest = fam.head_guest_id ? allGuests.find(g => g.id === fam.head_guest_id) : null;

          return (
            <div 
              key={fam.id}
              className="royal-glass rounded-3xl p-5 royal-glass-hover border border-neutral-300 dark:border-purple-500/20 bg-white dark:bg-neutral-950 flex flex-col justify-between space-y-4 shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center font-black text-sm text-[#581C87] dark:text-purple-300">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 font-cinzel">{fam.name}</h3>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-semibold">
                        {fam.village ? `📍 ${fam.village}` : 'Village not specified'}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(fam)}
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer"
                      title="Edit Family (Admin Only)"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-3 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  {headGuest && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Head of House:</span>
                      <strong className="text-neutral-900 dark:text-neutral-100">{headGuest.name}</strong>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Registered Members:</span>
                    <span className="font-bold text-[#581C87] dark:text-purple-300">{members.length} Members</span>
                  </div>
                  {fam.mobile && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">Contact:</span>
                      <span>{fam.mobile}</span>
                    </div>
                  )}
                </div>

                {/* Member avatars */}
                {members.length > 0 && (
                  <div className="mt-3">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">Household Members:</span>
                    <div className="flex flex-wrap gap-1">
                      {members.map(m => (
                        <button
                          key={m.id}
                          onClick={() => onSelectGuest(m.id)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer"
                        >
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold">Event Contribution:</span>
                  <p className="text-sm font-black text-[#78350F] dark:text-amber-300 font-outfit">
                    ₹{totalFamilyNevta.toLocaleString('en-IN')}
                  </p>
                </div>

                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                  {familyTxns.length} records
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Family Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="royal-glass w-full max-w-lg rounded-3xl border-2 border-amber-500/50 shadow-2xl p-6 sm:p-7 space-y-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
            <h3 className="text-xl font-black font-cinzel text-[#78350F] dark:text-amber-300">
              {editingFamilyId ? 'Edit Family Group' : 'Register New Family Household'}
            </h3>

            <form onSubmit={handleSaveFamily} className="space-y-4">
              <TransliteratedInput
                label="Family Group Name"
                value={familyName}
                onChange={setFamilyName}
                placeholder="e.g. Sultan Family, Siddiqui Family"
                required
                autoTransliterate
              />

              <div>
                <label className="form-label">
                  Designate Head of Family
                </label>
                <select
                  value={familyHeadId}
                  onChange={(e) => setFamilyHeadId(e.target.value)}
                  className="royal-input"
                >
                  <option value="">Select from existing guests...</option>
                  {allGuests.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.village || 'No Village'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <TransliteratedInput
                  label="Village / Town"
                  value={familyVillage}
                  onChange={setFamilyVillage}
                  placeholder="Chauriya khas"
                  autoTransliterate
                />
                <div>
                  <label className="form-label">
                    Family Contact
                  </label>
                  <input
                    type="tel"
                    value={familyMobile}
                    onChange={(e) => setFamilyMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="royal-input"
                  />
                </div>
              </div>

              <TransliteratedInput
                label="Notes / Background"
                value={familyNotes}
                onChange={setFamilyNotes}
                placeholder="e.g. Primary host branch, maternal family"
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
                  Save Family
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
