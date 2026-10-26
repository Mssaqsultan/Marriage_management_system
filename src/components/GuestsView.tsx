import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MapPin, 
  Phone, 
  HeartHandshake, 
  Eye, 
  Edit3, 
  Trash2, 
  Sparkles,
  Layers,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';
import { Guest, Event, RelationType, SideType, User } from '../types';
import { db } from '../services/db';
import { matchesSearch } from '../utils/transliteration';
import { TransliteratedInput } from './TransliteratedInput';
import { GuestHistoryModal } from './GuestHistoryModal';
import { ExcelImportModal } from './ExcelImportModal';
import { t, getLanguageFontClass } from '../utils/i18n';

interface GuestsViewProps {
  activeEvent: Event;
  currentUser?: User;
  onOpenQuickEntry: () => void;
  onSuccessToast: (msg: string) => void;
  currentLanguage?: 'en' | 'hi' | 'ur';
}

const RELATIONS: RelationType[] = [
  'Mama', 'Mami', 'Chacha', 'Chachi', 'Tau', 'Tai', 'Fufa', 'Bua', 
  'Brother', 'Sister', 'Father', 'Mother', 'Cousin', 'Mausera', 
  'Friend', 'Neighbor', 'Business Partner', 'Relative', 'Other'
];

const SIDES: SideType[] = ['Groom Side', 'Bride Side', 'Host Side', 'Other'];

export const GuestsView: React.FC<GuestsViewProps> = ({
  activeEvent,
  currentUser,
  onOpenQuickEntry,
  onSuccessToast,
  currentLanguage = 'en'
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const langFont = getLanguageFontClass(currentLanguage);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('ALL');
  const [selectedRelation, setSelectedRelation] = useState('ALL');
  const [selectedSide, setSelectedSide] = useState('ALL');
  const [selectedGuestForHistory, setSelectedGuestForHistory] = useState<string | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formFatherName, setFormFatherName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formDistrict, setFormDistrict] = useState('Lucknow');
  const [formState, setFormState] = useState('Uttar Pradesh');
  const [formRelation, setFormRelation] = useState<RelationType>('Relative');
  const [formSide, setFormSide] = useState<SideType>('Groom Side');
  const [formFamilyId, setFormFamilyId] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const allGuests = db.getGuests();
  const families = db.getFamilies();

  // Unique villages for filter
  const uniqueVillages = Array.from(new Set(allGuests.map(g => g.village).filter(Boolean))) as string[];

  // Filter logic with trilingual matching
  const filteredGuests = allGuests.filter(g => {
    if (selectedVillage !== 'ALL' && g.village !== selectedVillage) return false;
    if (selectedRelation !== 'ALL' && g.relation !== selectedRelation) return false;
    if (selectedSide !== 'ALL' && g.side !== selectedSide) return false;

    if (!searchQuery) return true;
    const combinedText = `${g.name} ${g.father_husband_name || ''} ${g.village || ''} ${g.mobile || ''} ${g.relation}`;
    return matchesSearch(combinedText, searchQuery);
  });

  const handleOpenAddModal = () => {
    setEditingGuestId(null);
    setFormName('');
    setFormFatherName('');
    setFormMobile('');
    setFormVillage('');
    setFormDistrict('Lucknow');
    setFormState('Uttar Pradesh');
    setFormRelation('Relative');
    setFormSide('Groom Side');
    setFormFamilyId('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guest: Guest) => {
    if (!isAdmin) {
      alert('🔒 Authority Restricted: Only Admin (Sultan) is authorized to edit or correct Guest details.');
      return;
    }
    setEditingGuestId(guest.id);
    setFormName(guest.name);
    setFormFatherName(guest.father_husband_name || '');
    setFormMobile(guest.mobile || '');
    setFormVillage(guest.village || '');
    setFormDistrict(guest.district || 'Lucknow');
    setFormState(guest.state || 'Uttar Pradesh');
    setFormRelation(guest.relation);
    setFormSide(guest.side);
    setFormFamilyId(guest.family_id || '');
    setFormNotes(guest.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Guest Name is required');
      return;
    }

    if (editingGuestId) {
      db.updateGuest(editingGuestId, {
        name: formName.trim(),
        father_husband_name: formFatherName.trim() || undefined,
        mobile: formMobile.trim() || undefined,
        village: formVillage.trim() || 'Chauriya khas',
        district: formDistrict.trim() || undefined,
        state: formState.trim() || undefined,
        relation: formRelation,
        side: formSide,
        family_id: formFamilyId || undefined,
        notes: formNotes.trim() || undefined
      });
      onSuccessToast(`Updated details for "${formName}"`);
    } else {
      db.addGuest({
        name: formName.trim(),
        father_husband_name: formFatherName.trim() || undefined,
        mobile: formMobile.trim() || undefined,
        village: formVillage.trim() || 'Chauriya khas',
        district: formDistrict.trim() || undefined,
        state: formState.trim() || undefined,
        relation: formRelation,
        side: formSide,
        family_id: formFamilyId || undefined,
        notes: formNotes.trim() || undefined
      });
      onSuccessToast(`Added new Guest "${formName}"`);
    }

    setIsModalOpen(false);
  };

  const handleDeleteGuest = (id: string, name: string) => {
    if (!isAdmin) {
      alert('🔒 Authority Restricted: Only Admin (Sultan) is authorized to delete Guest records.');
      return;
    }
    if (confirm(`Move "${name}" to Recycle Bin? You can restore it anytime from Audit / Trash.`)) {
      db.softDeleteGuest(id);
      onSuccessToast(`Moved "${name}" to Recycle Bin`);
    }
  };

  const guestHistory = selectedGuestForHistory ? db.getGuestLifetimeHistory(selectedGuestForHistory) : null;

  return (
    <div className={`space-y-6 animate-fadeIn pb-16 ${langFont}`}>
      
      {/* Header Bar */}
      <div className="royal-glass rounded-3xl p-6 border-2 border-amber-500/40 bg-white dark:bg-neutral-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-outfit">
              {t('guests.title', currentLanguage)}
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold">Total: <strong className="text-neutral-900 dark:text-neutral-100 font-outfit">{allGuests.length}</strong></span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 font-cinzel">
            {t('guests.title', currentLanguage)}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t('guests.add_btn', currentLanguage)}</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Card */}
      <div className="royal-glass rounded-3xl p-5 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 space-y-4 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Trilingual Search Box */}
          <div className="relative sm:col-span-2 lg:col-span-1 flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none select-none">
              <Search className="w-4 h-4 text-neutral-500 dark:text-amber-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('guests.search_placeholder', currentLanguage)}
              className="royal-input text-xs"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Village Filter */}
          <div>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value)}
              className="royal-input text-xs"
            >
              <option value="ALL">All Villages / Cities</option>
              {uniqueVillages.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* Relation Filter */}
          <div>
            <select
              value={selectedRelation}
              onChange={(e) => setSelectedRelation(e.target.value)}
              className="royal-input text-xs"
            >
              <option value="ALL">All Relations (Mama, Chacha...)</option>
              {RELATIONS.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Side Filter */}
          <div>
            <select
              value={selectedSide}
              onChange={(e) => setSelectedSide(e.target.value)}
              className="royal-input text-xs"
            >
              <option value="ALL">All Sides (Groom/Bride/Host)</option>
              {SIDES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Guest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map((guest) => {
          const family = guest.family_id ? families.find(f => f.id === guest.family_id) : null;
          const history = db.getGuestLifetimeHistory(guest.id);

          return (
            <div 
              key={guest.id}
              className="royal-glass rounded-3xl p-5 royal-glass-hover border-2 border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 flex flex-col justify-between space-y-4 shadow-md"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center font-black text-sm text-amber-950 dark:text-amber-300 shadow-sm">
                      {guest.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-neutral-950 dark:text-neutral-100 font-cinzel">{guest.name}</h3>
                      <p className="text-[11px] text-neutral-700 dark:text-neutral-400 font-bold">
                        {guest.father_husband_name ? `S/o ${guest.father_husband_name}` : 'Family Elder'}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border-2 ${
                    guest.side === 'Groom Side' ? 'bg-blue-100 text-blue-950 border-blue-500 dark:bg-blue-900/40 dark:text-blue-200' :
                    guest.side === 'Bride Side' ? 'bg-pink-100 text-pink-950 border-pink-500 dark:bg-pink-900/40 dark:text-pink-200' :
                    'bg-amber-100 text-amber-950 border-amber-500 dark:bg-amber-900/40 dark:text-amber-200'
                  }`}>
                    {guest.side}
                  </span>
                </div>

                <div className="mt-3.5 space-y-2 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <span className="truncate font-extrabold text-emerald-900 dark:text-emerald-300">{guest.village || 'No Village'}, {guest.district || ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-400">Relation: <strong className="text-amber-900 dark:text-amber-300 font-black">{guest.relation}</strong></span>
                  </div>
                  {guest.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-700 dark:text-cyan-400 shrink-0" />
                      <span className="font-extrabold text-blue-900 dark:text-cyan-300">{guest.mobile}</span>
                    </div>
                  )}
                  {family && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0" />
                      <span className="text-purple-900 dark:text-purple-300 truncate font-black">Family: {family.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Financial Summary & Actions */}
              <div className="pt-3 border-t-2 border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-extrabold uppercase">Lifetime Nevta:</span>
                  <p className="text-base font-black text-[#78350F] dark:text-amber-300 font-outfit">
                    ₹{history?.lifetimeNevta.toLocaleString('en-IN') || 0}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedGuestForHistory(guest.id)}
                    className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200 border-2 border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer shadow-sm hover:scale-105"
                    title="View Lifetime History"
                  >
                    <Eye className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => handleOpenEditModal(guest)}
                        className="p-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200 border-2 border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer shadow-sm hover:scale-105"
                        title="Edit Guest (Admin Only)"
                      >
                        <Edit3 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                      <button
                        onClick={() => handleDeleteGuest(guest.id, guest.name)}
                        className="p-2.5 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-500/20 text-red-900 dark:text-red-400 border-2 border-red-300 dark:border-red-500/40 transition-all cursor-pointer shadow-sm hover:scale-105"
                        title="Move to Recycle Bin (Admin Only)"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredGuests.length === 0 && (
        <div className="p-12 text-center royal-glass rounded-3xl border-2 border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <Users className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <p className="text-base font-bold text-neutral-900 dark:text-neutral-300 font-outfit">{t('guests.no_guests', currentLanguage)}</p>
          <p className="text-xs text-neutral-600 dark:text-neutral-500 mt-1">Try adjusting your filters or search keywords.</p>
        </div>
      )}

      {/* Add / Edit Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="royal-glass w-full max-w-xl rounded-3xl border-2 border-amber-500/50 shadow-2xl p-6 sm:p-7 space-y-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
            <h3 className="text-xl font-black font-cinzel text-[#78350F] dark:text-amber-300">
              {editingGuestId ? 'Edit Guest Profile' : 'Add New Guest to Registry'}
            </h3>

            <form onSubmit={handleSaveGuest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Name */}
                <TransliteratedInput
                  label={t('counter.mehmaan_name', currentLanguage)}
                  value={formName}
                  onChange={setFormName}
                  placeholder="e.g. Sultan Salahuddin, Rashid Khan"
                  required
                  autoTransliterate
                />

                {/* Father Name */}
                <TransliteratedInput
                  label={t('counter.father_name', currentLanguage)}
                  value={formFatherName}
                  onChange={setFormFatherName}
                  placeholder="e.g. Janab Afzal Khan"
                  autoTransliterate
                />

                {/* Mobile */}
                <div>
                  <label className="form-label">
                    {t('counter.mobile', currentLanguage)}
                  </label>
                  <input
                    type="tel"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="royal-input"
                  />
                </div>

                {/* Village with Transliteration */}
                <TransliteratedInput
                  label={t('counter.village', currentLanguage)}
                  value={formVillage}
                  onChange={setFormVillage}
                  placeholder="e.g. Chauriya khas, Rampur"
                  autoTransliterate
                />

                {/* Relation */}
                <div>
                  <label className="form-label">
                    {t('counter.relation', currentLanguage)}
                  </label>
                  <select
                    value={formRelation}
                    onChange={(e) => setFormRelation(e.target.value as RelationType)}
                    className="royal-input"
                  >
                    {RELATIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Side */}
                <div>
                  <label className="form-label">
                    {t('counter.side', currentLanguage)}
                  </label>
                  <select
                    value={formSide}
                    onChange={(e) => setFormSide(e.target.value as SideType)}
                    className="royal-input"
                  >
                    {SIDES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Family */}
                <div className="sm:col-span-2">
                  <label className="form-label">
                    Household Family
                  </label>
                  <select
                    value={formFamilyId}
                    onChange={(e) => setFormFamilyId(e.target.value)}
                    className="royal-input"
                  >
                    <option value="">None / Independent</option>
                    {families.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <TransliteratedInput
                    label="Personal Notes"
                    value={formNotes}
                    onChange={setFormNotes}
                    placeholder="e.g. VIP elder, Mama family"
                    autoTransliterate
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-300 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-bold transition-all cursor-pointer"
                >
                  {t('common.cancel', currentLanguage)}
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg cursor-pointer"
                >
                  {t('common.save', currentLanguage)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lifetime History Modal Drawer */}
      {guestHistory && (
        <GuestHistoryModal
          history={guestHistory}
          onClose={() => setSelectedGuestForHistory(null)}
        />
      )}

      {/* Excel / CSV Import Modal */}
      {isExcelModalOpen && (
        <ExcelImportModal
          isOpen={isExcelModalOpen}
          onClose={() => setIsExcelModalOpen(false)}
          onSuccess={() => {
            // Trigger state refresh
            setSelectedVillage('ALL');
          }}
          onSuccessToast={onSuccessToast}
        />
      )}

    </div>
  );
};
