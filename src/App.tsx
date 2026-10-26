import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { cloudSync } from './services/supabaseSync';
import { Event, Ceremony, User, ThemeMode, GuestHistorySummary, EventType, CeremonyType } from './types';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { QuickEntry } from './components/QuickEntry';
import { GuestsView } from './components/GuestsView';
import { FamiliesView } from './components/FamiliesView';
import { GiftsView } from './components/GiftsView';
import { EventsView } from './components/EventsView';
import { ReportsView } from './components/ReportsView';
import { AuditLogView } from './components/AuditLogView';
import { BackupSettingsView } from './components/BackupSettingsView';
import { EventDashboardView } from './components/EventDashboardView';
import { GuestHistoryModal } from './components/GuestHistoryModal';
import { TransliteratedInput } from './components/TransliteratedInput';
import { TvDisplayModal } from './components/TvDisplayModal';
import { BulkThankYouModal } from './components/BulkThankYouModal';
import { CheckCircle2, ShieldAlert, Crown, PartyPopper } from 'lucide-react';

const CEREMONY_TYPES: CeremonyType[] = [
  'Haldi', 'Mehendi', 'Nikah', 'Barat', 'Walima', 'Reception', 'Nahuchua', 'Tilak', 'Sangeet', 'Dawat', 'Other'
];

export const App: React.FC = () => {
  // Session & Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getCurrentUser());

  // Theme state (Default: Light Mode as requested)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('nevta_app_theme') as ThemeMode;
    return savedTheme || 'royal-light';
  });

  // App Navigation & Event state
  const [activeTab, setActiveTab] = useState<string>(() => {
    return sessionStorage.getItem('nevta_active_tab') || 'dashboard';
  });

  const handleTabChange = (tab: string) => {
    sessionStorage.setItem('nevta_active_tab', tab);
    setActiveTab(tab);
  };
  const [events, setEvents] = useState<Event[]>(() => db.getEvents(true));
  const [activeEvent, setActiveEvent] = useState<Event>(() => db.getActiveEvent());
  const [eventTypes, setEventTypes] = useState<string[]>(() => db.getEventTypes());
  
  // Ceremony state
  const [ceremonies, setCeremonies] = useState<Ceremony[]>(() => db.getCeremonies(db.getActiveEvent().id));
  const [activeCeremonyId, setActiveCeremonyId] = useState<string>(() => db.getActiveCeremonyId());

  // Global Direct Modals for Add Shaadi & Add Ceremony
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [isAddCeremonyModalOpen, setIsAddCeremonyModalOpen] = useState(false);

  // New Shaadi Form State
  const [newEventName, setNewEventName] = useState('');
  const [newEventType, setNewEventType] = useState<EventType>(() => db.getEventTypes()[0] || 'Marriage');
  const [newEventDate, setNewEventDate] = useState('2027-02-15');
  const [newEventVenue, setNewEventVenue] = useState('Royal Emerald Palace, Chauriya khas');
  const [newEventHost, setNewEventHost] = useState('Sultan Family');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [isAddingNewTypeInApp, setIsAddingNewTypeInApp] = useState(false);
  const [newCustomTypeInputInApp, setNewCustomTypeInputInApp] = useState('');

  // New Ceremony Form State
  const [newCeremonyName, setNewCeremonyName] = useState('');
  const [newCeremonyType, setNewCeremonyType] = useState<CeremonyType>('Nikah');
  const [newCeremonyDate, setNewCeremonyDate] = useState('2027-02-15');
  const [newCeremonyTime, setNewCeremonyTime] = useState('01:00 PM');
  const [newCeremonyVenue, setNewCeremonyVenue] = useState('Royal Emerald Palace');
  const [newCeremonyDesc, setNewCeremonyDesc] = useState('');

  const [settings, setSettings] = useState(() => db.getSettings());
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi' | 'ur'>(() => db.getSettings().language || 'en');

  // Lifetime History Modal
  const [selectedHistory, setSelectedHistory] = useState<GuestHistorySummary | null>(null);
  const [isTvDisplayOpen, setIsTvDisplayOpen] = useState(false);
  const [isBulkThankYouOpen, setIsBulkThankYouOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply Theme CSS class to document root
  useEffect(() => {
    localStorage.setItem('nevta_app_theme', theme);
    if (theme === 'royal-light') {
      document.documentElement.classList.add('theme-light');
      document.documentElement.classList.remove('dark');
      document.body.classList.add('theme-light');
      document.body.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.documentElement.classList.add('dark');
      document.body.classList.remove('theme-light');
      document.body.classList.add('dark');
    }
  }, [theme]);

  // Supabase Cloud Sync & Realtime Live Subscription
  useEffect(() => {
    cloudSync.pullFromCloud().then((success) => {
      if (success) {
        refreshAppData();
      }
    });

    cloudSync.subscribeToRealtime(() => {
      refreshAppData();
    });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'royal-dark' ? 'royal-light' : 'royal-dark');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    db.setCurrentUser(user);
    showToast(`👑 Welcome back, ${user.name}!`);
    handleTabChange('dashboard');
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    showToast('Signed out successfully.');
  };

  const refreshAppData = () => {
    setEvents(db.getEvents(true));
    const currEvt = db.getActiveEvent();
    setActiveEvent(currEvt);
    const eventCeremonies = db.getCeremonies(currEvt.id);
    setCeremonies(eventCeremonies);
    setActiveCeremonyId(db.getActiveCeremonyId());
    setSettings(db.getSettings());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSelectEvent = (eventId: string) => {
    db.setActiveEventId(eventId);
    const newActive = db.getActiveEvent();
    setActiveEvent(newActive);
    const eventCeremonies = db.getCeremonies(newActive.id);
    setCeremonies(eventCeremonies);
    if (eventCeremonies.length > 0) {
      db.setActiveCeremonyId(eventCeremonies[0].id);
      setActiveCeremonyId(eventCeremonies[0].id);
    }
    showToast(`Switched to "${newActive.name}"`);
  };

  const handleSelectCeremony = (ceremonyId: string) => {
    db.setActiveCeremonyId(ceremonyId);
    setActiveCeremonyId(ceremonyId);
    const crm = db.getCeremonyById(ceremonyId);
    if (crm) {
      showToast(`Selected Function: "${crm.name}"`);
    }
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'ur') => {
    setCurrentLanguage(lang);
    db.updateSettings({ language: lang });
    const toastLabel = lang === 'hi' 
      ? '🌐 भाषा बदलकर हिंदी (Devanagari) कर दी गई है'
      : lang === 'ur'
      ? '🌐 زبان تبدیل کر کے اردو (Nastaliq) کر دی گئی ہے'
      : '🌐 Language switched to English';
    showToast(toastLabel);
  };

  const handleOpenGuestHistory = (guestId: string) => {
    const history = db.getGuestLifetimeHistory(guestId);
    if (history) {
      setSelectedHistory(history);
    }
  };

  const handleAddCustomEventTypeInApp = () => {
    const clean = newCustomTypeInputInApp.trim();
    if (!clean) return;
    const updated = db.addEventType(clean);
    setEventTypes(updated);
    setNewEventType(clean);
    setNewCustomTypeInputInApp('');
    setIsAddingNewTypeInApp(false);
    showToast(`➕ Added event type "${clean}"!`);
  };

  const handleCreateGlobalEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) {
      alert('Please enter Shaadi / Celebration title');
      return;
    }

    const created = db.addEvent({
      event_code: `EVT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: newEventName.trim(),
      type: newEventType,
      date: newEventDate,
      venue: newEventVenue.trim() || 'Main Wedding Venue',
      host_name: newEventHost.trim() || 'Host Family',
      description: newEventDesc.trim() || undefined,
      status: 'Active'
    });

    handleSelectEvent(created.id);
    setIsAddEventModalOpen(false);
    setNewEventName('');
    showToast(`👑 Created & selected "${created.name}"!`);
  };

  const handleCreateGlobalCeremony = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCeremonyName.trim()) {
      alert('Please enter Ceremony / Rasam name');
      return;
    }

    const created = db.addCeremony({
      event_id: activeEvent.id,
      name: newCeremonyName.trim(),
      ceremony_type: newCeremonyType,
      date: newCeremonyDate,
      time: newCeremonyTime,
      venue: newCeremonyVenue,
      description: newCeremonyDesc.trim() || undefined,
      status: 'Upcoming'
    });

    const updatedCeremonies = db.getCeremonies(activeEvent.id);
    setCeremonies(updatedCeremonies);
    handleSelectCeremony(created.id);
    setIsAddCeremonyModalOpen(false);
    setNewCeremonyName('');
    showToast(`🎉 Added "${created.name}" to ${activeEvent.name}!`);
  };

  // Keyboard shortcut (Ctrl+N to open Quick Entry counter)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setActiveTab('quick-entry');
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // If user is not authenticated, render Login Page
  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentLanguage={currentLanguage}
        onChangeLanguage={handleLanguageChange}
      />
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const activeCeremony = ceremonies.find(c => c.id === activeCeremonyId) || ceremonies[0];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      theme === 'royal-light' ? 'bg-[#fbf9f4] text-[#18181b]' : 'bg-[#0a0e0d] text-[#f5f5f5]'
    }`}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-neutral-900/95 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-2xl animate-fadeIn backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Royal Header Navigation with Direct Add Shaadi & Add Ceremony Actions */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if ((tab === 'audit' || tab === 'settings') && !isAdmin) {
            showToast('⚠️ Administrator authority required to access this module.');
            return;
          }
          handleTabChange(tab);
        }}
        events={events}
        activeEvent={activeEvent}
        onSelectEvent={handleSelectEvent}
        onOpenAddEventModal={() => setIsAddEventModalOpen(true)}
        ceremonies={ceremonies}
        activeCeremony={activeCeremony}
        onSelectCeremony={handleSelectCeremony}
        onOpenAddCeremonyModal={() => setIsAddCeremonyModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
        onOpenQuickEntry={() => handleTabChange('quick-entry')}
        onOpenTvDisplay={() => setIsTvDisplayOpen(true)}
        currentLanguage={currentLanguage}
        onChangeLanguage={handleLanguageChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Tab 1: Executive Dashboard (Action Hub) */}
        {activeTab === 'dashboard' && (
          <Dashboard
            activeEvent={activeEvent}
            events={events}
            onSelectEvent={handleSelectEvent}
            onOpenAddEventModal={() => setIsAddEventModalOpen(true)}
            currentUser={currentUser}
            onNavigate={handleTabChange}
            onSelectGuest={handleOpenGuestHistory}
            onOpenQuickEntry={() => handleTabChange('quick-entry')}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Tab 1.5: Celebration Detailed Dashboard & Metrics */}
        {activeTab === 'event-dashboard' && (
          <EventDashboardView
            activeEvent={activeEvent}
            currentUser={currentUser}
            onNavigate={handleTabChange}
            onSelectGuest={handleOpenGuestHistory}
            onOpenQuickEntry={() => handleTabChange('quick-entry')}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Tab 2: Shaadi Counter Mode (Quick Entry) */}
        {activeTab === 'quick-entry' && (
          <QuickEntry
            activeEvent={activeEvent}
            ceremonies={ceremonies}
            activeCeremony={activeCeremony}
            onSelectCeremony={handleSelectCeremony}
            currentUser={currentUser}
            onSuccessToast={showToast}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Tab 3: Master Mehmaan (Guest) Directory */}
        {activeTab === 'guests' && (
          <GuestsView
            activeEvent={activeEvent}
            currentUser={currentUser}
            onOpenQuickEntry={() => setActiveTab('quick-entry')}
            onSuccessToast={showToast}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Tab 4: Family Lineage & Household Groups */}
        {activeTab === 'families' && (
          <FamiliesView
            activeEvent={activeEvent}
            currentUser={currentUser}
            onSelectGuest={handleOpenGuestHistory}
            onSuccessToast={showToast}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Tab 5: Physical Gifts & Valuables Registry */}
        {activeTab === 'gifts' && (
          <GiftsView
            activeEvent={activeEvent}
            currentUser={currentUser}
            onSelectGuest={handleOpenGuestHistory}
            onSuccessToast={showToast}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Tab 6: Events, Shaadi & Nested Ceremonies Manager */}
        {activeTab === 'events' && (
          <EventsView
            activeEvent={activeEvent}
            currentUser={currentUser}
            onSelectEvent={handleSelectEvent}
            onSuccessToast={showToast}
            onRefreshAll={refreshAppData}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Tab 7: Reports & Multi-Format Export */}
        {activeTab === 'reports' && (
          <ReportsView
            activeEvent={activeEvent}
            onSelectGuest={handleOpenGuestHistory}
            onSuccessToast={showToast}
            onOpenBulkThankYou={() => setIsBulkThankYouOpen(true)}
            currentLanguage={currentLanguage}
          />
        )}

        {/* Tab 8: Audit Trail & Recycle Bin (Admin Only) */}
        {activeTab === 'audit' && (
          isAdmin ? (
            <AuditLogView
              onSuccessToast={showToast}
              currentLanguage={currentLanguage}
            />
          ) : (
            <div className="text-center py-16 royal-glass rounded-3xl p-8 border border-red-500/30">
              <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h2 className="text-lg font-bold text-neutral-100 font-cinzel">Administrator Access Required</h2>
              <p className="text-xs text-neutral-400 mt-1">Audit log and soft-delete restore are restricted to Super Admins.</p>
            </div>
          )
        )}

        {/* Tab 9: Backup, Users & Configuration (Admin Only) */}
        {activeTab === 'settings' && (
          <BackupSettingsView
            currentUser={currentUser}
            onSuccessToast={showToast}
            onRefreshAll={refreshAppData}
            currentLanguage={currentLanguage}
            onChangeLanguage={handleLanguageChange}
          />
        )}

      </main>

      {/* Global Modal 1: Add New Wedding / Event */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="royal-glass rounded-3xl p-6 sm:p-7 max-w-lg w-full border-2 border-amber-500/50 shadow-2xl animate-fadeIn space-y-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
            <h3 className="text-lg sm:text-xl font-bold font-cinzel flex items-center gap-2 text-[#78350F] dark:text-amber-300">
              <Crown className="w-5 h-5 text-amber-500" />
              Add New Wedding / Celebration Profile
            </h3>

            <form onSubmit={handleCreateGlobalEvent} className="space-y-4">
              <TransliteratedInput
                label="Wedding / Celebration Title"
                value={newEventName}
                onChange={setNewEventName}
                placeholder="e.g. Sultan Grand Wedding, Rizwan Wedding, Farhan Wedding"
                required
                autoTransliterate
              />

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    required
                    className="royal-input"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="form-label">Event Type *</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewTypeInApp(!isAddingNewTypeInApp)}
                      className="text-[10px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      {isAddingNewTypeInApp ? 'Close' : '+ Add Type'}
                    </button>
                  </div>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="royal-input"
                  >
                    {eventTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {isAddingNewTypeInApp && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2">
                  <input
                    type="text"
                    value={newCustomTypeInputInApp}
                    onChange={(e) => setNewCustomTypeInputInApp(e.target.value)}
                    placeholder="New Event Type (e.g. Mangni)"
                    className="royal-input text-xs py-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomEventTypeInApp}
                    className="gold-gradient-btn px-3 py-1 text-xs font-bold rounded-lg whitespace-nowrap"
                  >
                    Save Type
                  </button>
                </div>
              )}

              <TransliteratedInput
                label="Host Family / Name"
                value={newEventHost}
                onChange={setNewEventHost}
                placeholder="e.g. Sultan Family, Siddiqui Family"
                required
                autoTransliterate
              />

              <TransliteratedInput
                label="Venue / Palace"
                value={newEventVenue}
                onChange={setNewEventVenue}
                placeholder="e.g. Royal Emerald Palace, Lucknow"
                autoTransliterate
              />

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-300 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg hover:scale-105 transition-all"
                >
                  Create & Open Wedding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Modal 2: Add New Ceremony */}
      {isAddCeremonyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="royal-glass rounded-3xl p-6 sm:p-7 max-w-lg w-full border-2 border-amber-500/50 shadow-2xl animate-fadeIn space-y-4 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
            <div>
              <span className="text-[11px] uppercase font-extrabold text-[#78350F] dark:text-amber-400 font-outfit tracking-wider">
                Target Celebration: {activeEvent.name}
              </span>
              <h3 className="text-lg sm:text-xl font-bold font-cinzel flex items-center gap-2 mt-0.5 text-[#78350F] dark:text-amber-300">
                <PartyPopper className="w-5 h-5 text-amber-500" />
                Add Function / Ceremony
              </h3>
            </div>

            <form onSubmit={handleCreateGlobalCeremony} className="space-y-4">
              <TransliteratedInput
                label="Ceremony / Function Name"
                value={newCeremonyName}
                onChange={setNewCeremonyName}
                placeholder="e.g. Haldi Ceremony, Mehendi Night, Walima Reception, Tilak"
                required
                autoTransliterate
              />

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="form-label">Function Type *</label>
                  <select
                    value={newCeremonyType}
                    onChange={(e) => setNewCeremonyType(e.target.value as any)}
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
                    value={newCeremonyDate}
                    onChange={(e) => setNewCeremonyDate(e.target.value)}
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
                    value={newCeremonyTime}
                    onChange={(e) => setNewCeremonyTime(e.target.value)}
                    placeholder="e.g. 01:00 PM / 07:30 PM"
                    className="royal-input"
                  />
                </div>
                <div>
                  <label className="form-label">Venue</label>
                  <input
                    type="text"
                    value={newCeremonyVenue}
                    onChange={(e) => setNewCeremonyVenue(e.target.value)}
                    placeholder="e.g. Grand Hall"
                    className="royal-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-neutral-300 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddCeremonyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg hover:scale-105 transition-all"
                >
                  Add Ceremony / Function
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lifetime Multi-Event Guest History Modal */}
      {selectedHistory && (
        <GuestHistoryModal
          history={selectedHistory}
          onClose={() => setSelectedHistory(null)}
        />
      )}

      {/* Royal TV / Stage Display Mode */}
      {isTvDisplayOpen && (
        <TvDisplayModal
          isOpen={isTvDisplayOpen}
          onClose={() => setIsTvDisplayOpen(false)}
          activeEvent={activeEvent}
          activeCeremony={activeCeremony}
        />
      )}

      {/* Bulk WhatsApp Thank-You Broadcast Modal */}
      {isBulkThankYouOpen && (
        <BulkThankYouModal
          isOpen={isBulkThankYouOpen}
          onClose={() => setIsBulkThankYouOpen(false)}
          activeEvent={activeEvent}
          onSuccessToast={showToast}
        />
      )}

      {/* Footer */}
      <footer className="app-footer no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-outfit app-footer-brand">
            <span>👑 Sultan Marriage Management & Nevta Ledger System</span>
            <span className="app-footer-badge">
              {isAdmin ? 'Admin' : 'Operator'}
            </span>
          </p>
          <p className="text-xs font-semibold">
            Active: <strong className="app-footer-event">{activeEvent.name}</strong> (Function: <span className="app-footer-ceremony">{activeCeremony?.name}</span>)
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;
