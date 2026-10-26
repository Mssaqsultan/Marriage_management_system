import React, { useState } from 'react';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  CheckCircle2, 
  IndianRupee, 
  Gift, 
  Sparkles, 
  Lock, 
  Layers, 
  Printer, 
  ChevronRight,
  Award,
  PartyPopper,
  Crown,
  Trash2,
  Clock,
  UserCheck
} from 'lucide-react';
import { Event, EventType, Ceremony, CeremonyType, User } from '../types';
import { db } from '../services/db';
import { TransliteratedInput } from './TransliteratedInput';
import { t, getLanguageFontClass } from '../utils/i18n';

interface EventsViewProps {
  activeEvent: Event;
  currentUser?: User;
  onSelectEvent: (eventId: string) => void;
  onSuccessToast: (msg: string) => void;
  onRefreshAll?: () => void;
  currentLanguage?: 'en' | 'hi' | 'ur';
}

const CEREMONY_TYPES: CeremonyType[] = [
  'Haldi', 'Mehendi', 'Nikah', 'Barat', 'Walima', 'Reception', 'Nahuchua', 'Tilak', 'Sangeet', 'Dawat', 'Other'
];

export const EventsView: React.FC<EventsViewProps> = ({
  activeEvent,
  currentUser,
  onSelectEvent,
  onSuccessToast,
  onRefreshAll,
  currentLanguage = 'en'
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const langFont = getLanguageFontClass(currentLanguage);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCeremonyModalOpen, setIsCeremonyModalOpen] = useState(false);
  const [targetEventForCeremony, setTargetEventForCeremony] = useState<string>(activeEvent.id);

  // Dynamic Event Types State
  const [eventTypes, setEventTypes] = useState<string[]>(() => db.getEventTypes());
  const [newCustomTypeInput, setNewCustomTypeInput] = useState('');
  const [isAddingNewType, setIsAddingNewType] = useState(false);

  // New Celebration Form State
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState<EventType>(() => db.getEventTypes()[0] || 'Marriage');
  const [eventDate, setEventDate] = useState('2027-02-15');
  const [eventVenue, setEventVenue] = useState('Royal Palace, Chauriya khas');
  const [eventHost, setEventHost] = useState('Sultan Family');
  const [eventDesc, setEventDesc] = useState('');

  // New Ceremony Form State
  const [ceremonyName, setCeremonyName] = useState('');
  const [ceremonyType, setCeremonyType] = useState<CeremonyType>('Nikah');
  const [ceremonyDate, setCeremonyDate] = useState('2027-02-15');
  const [ceremonyTime, setCeremonyTime] = useState('01:00 PM');
  const [ceremonyVenue, setCeremonyVenue] = useState('Royal Emerald Palace');
  const [ceremonyDesc, setCeremonyDesc] = useState('');

  const events = db.getEvents(true);

  const handleAddCustomEventType = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newCustomTypeInput.trim();
    if (!clean) return;
    const updated = db.addEventType(clean);
    setEventTypes(updated);
    setEventType(clean);
    onSuccessToast(`➕ Added event type "${clean}"`);
    setNewCustomTypeInput('');
    setIsAddingNewType(false);
  };

  const handleDeleteEventType = (typeToDelete: string) => {
    if (eventTypes.length <= 1) {
      alert('At least 1 Event Type must remain in the system.');
      return;
    }
    if (confirm(`Are you sure you want to delete event type "${typeToDelete}"?`)) {
      const updated = db.deleteEventType(typeToDelete);
      setEventTypes(updated);
      if (eventType === typeToDelete) {
        setEventType(updated[0] || 'Marriage');
      }
      onSuccessToast(`Deleted event type "${typeToDelete}"`);
    }
  };

  const handleDeleteEvent = (id: string, name: string) => {
    if (!isAdmin) {
      alert('🔒 Authority Restricted: Only Admin (Sultan) is authorized to delete events.');
      return;
    }
    const confirmMsg = events.length <= 1
      ? `Are you sure you want to delete celebration "${name}"? Since this is the only celebration in the system, it will be deleted and reset to a clean new celebration.`
      : `Are you sure you want to delete celebration "${name}"? All associated ceremonies, transactions and gifts will also be permanently removed.`;

    if (confirm(confirmMsg)) {
      db.deleteEvent(id);
      if (onRefreshAll) onRefreshAll();
      onSuccessToast(`Deleted celebration "${name}"`);
    }
  };

  const handleDeleteCeremony = (id: string, name: string) => {
    if (!isAdmin) {
      alert('🔒 Authority Restricted: Only Admin (Sultan) is authorized to delete ceremonies.');
      return;
    }
    if (confirm(`Are you sure you want to delete ceremony "${name}"?`)) {
      db.deleteCeremony(id);
      if (onRefreshAll) onRefreshAll();
      onSuccessToast(`Deleted ceremony "${name}"`);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) {
      alert('Please enter Celebration Name (e.g. Sultan Ki Shaadi)');
      return;
    }

    const created = db.addEvent({
      event_code: `EVT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: eventName.trim(),
      type: eventType,
      date: eventDate,
      venue: eventVenue.trim() || 'Main Wedding Venue',
      host_name: eventHost.trim() || 'Host Family',
      description: eventDesc.trim() || undefined,
      status: 'Active'
    });

    onSelectEvent(created.id);
    onSuccessToast(`👑 Celebration "${created.name}" created with default Nikah & Walima ceremonies!`);
    setIsEventModalOpen(false);
    setEventName('');
    if (onRefreshAll) onRefreshAll();
  };

  const handleCreateCeremony = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ceremonyName.trim()) {
      alert('Please enter Ceremony / Rasam Name');
      return;
    }

    db.addCeremony({
      event_id: targetEventForCeremony,
      name: ceremonyName.trim(),
      ceremony_type: ceremonyType,
      date: ceremonyDate,
      time: ceremonyTime,
      venue: ceremonyVenue,
      description: ceremonyDesc.trim() || undefined,
      status: 'Upcoming'
    });

    onSuccessToast(`🎉 Ceremony "${ceremonyName}" added!`);
    setIsCeremonyModalOpen(false);
    setCeremonyName('');
    if (onRefreshAll) onRefreshAll();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="royal-glass rounded-2xl p-6 border-amber-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-[#78350F] dark:text-amber-300 border border-amber-500/40 font-outfit">
            Multi-Wedding & Ceremony Hub
          </span>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 font-cinzel mt-1">
            Celebrations & Nested Ceremonies
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Manage separate marriages (e.g. Sultan Ki Shaadi, Rizwan Ki Shaadi) and their specific functions (Haldi, Mehendi, Nikah, Walima)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="gold-gradient-btn px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Shaadi / Event</span>
          </button>
        </div>
      </div>

      {/* Event Types Strip */}
      <div className="royal-glass rounded-2xl p-4 border border-amber-500/20 bg-white/60 dark:bg-neutral-900/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-neutral-700 dark:text-neutral-300 font-outfit flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Configured Event Types ({eventTypes.length}):
          </span>
          {eventTypes.map(t => (
            <span 
              key={t}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/30 font-bold"
            >
              👑 {t}
              {eventTypes.length > 1 && isAdmin && (
                <button
                  onClick={() => handleDeleteEventType(t)}
                  className="hover:text-red-500 transition-colors ml-1"
                  title="Delete event type"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isAddingNewType ? (
            <form onSubmit={handleAddCustomEventType} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newCustomTypeInput}
                onChange={(e) => setNewCustomTypeInput(e.target.value)}
                placeholder="e.g. Engagement, Reception..."
                autoFocus
                className="royal-input py-1 px-2.5 text-xs w-44"
              />
              <button
                type="submit"
                className="gold-gradient-btn px-3 py-1 rounded-lg text-xs font-bold"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewType(false);
                  setNewCustomTypeInput('');
                }}
                className="px-2 py-1 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-bold"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingNewType(true)}
              className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Event Type</span>
            </button>
          )}
        </div>
      </div>

      {/* Celebrations List */}
      <div className="space-y-6">
        {events.map((evt) => {
          const isActive = evt.id === activeEvent.id;
          const ceremonies = db.getCeremonies(evt.id);
          const analytics = db.getEventAnalytics(evt.id);

          return (
            <div 
              key={evt.id} 
              className={`royal-glass rounded-3xl p-6 transition-all border-2 ${
                isActive 
                  ? 'border-amber-500/70 shadow-2xl bg-white dark:bg-neutral-950' 
                  : 'border-neutral-300 dark:border-neutral-800 hover:border-amber-500/40'
              }`}
            >
              {/* Event Top Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800/80 pb-5">
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ${
                    isActive ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-neutral-950' : 'bg-neutral-200 dark:bg-neutral-800 text-amber-700 dark:text-amber-300'
                  }`}>
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-cinzel">
                        {evt.name}
                      </h3>
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-[#064E3B] dark:text-emerald-300 border border-emerald-500/40">
                          Active Celebration
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 flex flex-wrap items-center gap-3 font-semibold">
                      <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-amber-600" /> Host: <strong className="text-neutral-800 dark:text-neutral-200">{evt.host_name}</strong></span>
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-emerald-600" /> Date: {evt.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-cyan-600" /> {evt.venue}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      setTargetEventForCeremony(evt.id);
                      setIsCeremonyModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-[#78350F] dark:text-amber-300 text-xs font-extrabold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ceremony</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          onSelectEvent(evt.id);
                          onSuccessToast(`Switched to "${evt.name}"`);
                        }}
                        className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Switch to this Shaadi
                      </button>
                    ) : (
                      <span className="px-3.5 py-2 rounded-xl bg-amber-500/20 text-[#78350F] dark:text-amber-300 border border-amber-500/40 text-xs font-extrabold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Currently Selected
                      </span>
                    )}

                    {/* Delete Event Button - Always available for Admin */}
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteEvent(evt.id, evt.name)}
                        className="p-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/15 border border-red-500/20 hover:border-red-500/40 transition-all cursor-pointer shadow-sm flex items-center gap-1"
                        title={`Delete celebration "${evt.name}" (Admin Only)`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-[11px] font-bold hidden sm:inline">Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Financial Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-neutral-200 dark:border-neutral-800/80 text-xs">
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold">Total Collection</span>
                  <p className="text-base font-extrabold text-[#78350F] dark:text-amber-300 font-outfit mt-0.5">
                    ₹{analytics.totalCollection.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold">Guests Count</span>
                  <p className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 font-outfit mt-0.5">
                    {analytics.totalGuests} Guests
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold">Physical Gifts</span>
                  <p className="text-base font-extrabold text-[#581C87] dark:text-purple-300 font-outfit mt-0.5">
                    {analytics.totalGiftItems} Items
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                  <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold">Functions Count</span>
                  <p className="text-base font-extrabold text-[#064E3B] dark:text-emerald-300 font-outfit mt-0.5">
                    {ceremonies.length} Ceremonies
                  </p>
                </div>
              </div>

              {/* Nested Ceremonies List */}
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#78350F] dark:text-amber-300 font-outfit flex items-center gap-1.5">
                  <PartyPopper className="w-3.5 h-3.5" /> Ceremonies & Functions under {evt.name}:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ceremonies.map((crm) => {
                    const cTxns = db.getTransactions(evt.id, crm.id);
                    const cTotal = cTxns.reduce((sum, t) => sum + t.amount, 0);

                    return (
                      <div 
                        key={crm.id} 
                        className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-300 dark:border-neutral-800 hover:border-amber-500/50 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-lg">
                              {crm.ceremony_type === 'Haldi' ? '🌼' :
                               crm.ceremony_type === 'Mehendi' ? '🌿' :
                               crm.ceremony_type === 'Nikah' ? '💍' :
                               crm.ceremony_type === 'Walima' ? '🍽️' :
                               crm.ceremony_type === 'Tilak' ? '✨' : '🎉'}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteCeremony(crm.id, crm.name)}
                                className="text-neutral-400 hover:text-red-600 p-1 transition-colors"
                                title="Delete Ceremony (Admin Only)"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{crm.name}</p>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-0.5 flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3 text-neutral-500" /> {crm.date} {crm.time ? `• ${crm.time}` : ''}
                          </p>
                          {crm.venue && (
                            <p className="text-[10px] text-neutral-500 truncate mt-0.5">
                              📍 {crm.venue}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-neutral-300 dark:border-neutral-800/80 flex items-center justify-between text-xs font-bold">
                          <span className="text-[10px] text-neutral-500">{cTxns.length} entries</span>
                          <span className="text-[#78350F] dark:text-amber-300 font-outfit text-sm">
                            ₹{cTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal 1: Add New Celebration / Shaadi */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="royal-glass rounded-3xl p-6 sm:p-7 max-w-lg w-full border-2 border-amber-500/50 shadow-2xl animate-fadeIn space-y-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
            <h3 className="text-lg sm:text-xl font-bold font-cinzel flex items-center gap-2 text-[#78350F] dark:text-amber-300">
              <Crown className="w-5 h-5 text-amber-500" />
              Add New Marriage / Celebration Profile
            </h3>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <TransliteratedInput
                label="Shaadi / Celebration Title"
                value={eventName}
                onChange={setEventName}
                placeholder="e.g. Sultan Ki Grand Shaadi, Rizwan Ki Shaadi"
                required
                autoTransliterate
              />

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="royal-input"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="form-label">Event Type *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewType(!isAddingNewType)}
                      className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      {isAddingNewType ? 'Close' : '+ Add Type'}
                    </button>
                  </div>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="royal-input"
                  >
                    {eventTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isAddingNewType && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                  <input
                    type="text"
                    value={newCustomTypeInput}
                    onChange={(e) => setNewCustomTypeInput(e.target.value)}
                    placeholder="New Event Type (e.g. Mangni)"
                    className="royal-input text-xs py-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomEventType()}
                    className="gold-gradient-btn px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap"
                  >
                    Save Type
                  </button>
                </div>
              )}

              <TransliteratedInput
                label="Host Family / Name"
                value={eventHost}
                onChange={setEventHost}
                placeholder="e.g. Sultan Family, Siddiqui Family"
                required
                autoTransliterate
              />

              <TransliteratedInput
                label="Venue / Palace"
                value={eventVenue}
                onChange={setEventVenue}
                placeholder="e.g. Royal Emerald Palace, Chauriya khas"
                autoTransliterate
              />

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-300 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg"
                >
                  Create Celebration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Ceremony / Function */}
      {isCeremonyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="royal-glass rounded-3xl p-6 sm:p-7 max-w-lg w-full border-2 border-amber-500/50 shadow-2xl animate-fadeIn space-y-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
            <h3 className="text-lg sm:text-xl font-bold font-cinzel flex items-center gap-2 text-[#78350F] dark:text-amber-300">
              <PartyPopper className="w-5 h-5 text-amber-500" />
              Add Function / Ceremony (Rasam)
            </h3>

            <form onSubmit={handleCreateCeremony} className="space-y-4">
              <TransliteratedInput
                label="Ceremony Name"
                value={ceremonyName}
                onChange={setCeremonyName}
                placeholder="e.g. Haldi & Manjha, Mehendi Night, Dawat-e-Walima"
                required
                autoTransliterate
              />

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="form-label">Rasm Type *</label>
                  <select
                    value={ceremonyType}
                    onChange={(e) => setCeremonyType(e.target.value as any)}
                    className="royal-input"
                  >
                    {CEREMONY_TYPES.map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    value={ceremonyDate}
                    onChange={(e) => setCeremonyDate(e.target.value)}
                    required
                    className="royal-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="form-label">Time</label>
                  <input
                    type="text"
                    value={ceremonyTime}
                    onChange={(e) => setCeremonyTime(e.target.value)}
                    placeholder="e.g. 01:00 PM / 07:30 PM"
                    className="royal-input"
                  />
                </div>
                <div>
                  <label className="form-label">Venue</label>
                  <input
                    type="text"
                    value={ceremonyVenue}
                    onChange={(e) => setCeremonyVenue(e.target.value)}
                    placeholder="e.g. Grand Hall"
                    className="royal-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-300 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCeremonyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg"
                >
                  Add Ceremony
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
