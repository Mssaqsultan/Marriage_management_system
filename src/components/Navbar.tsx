import React from 'react';
import { 
  Crown, 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  UsersRound, 
  Gift, 
  CalendarDays, 
  FileSpreadsheet, 
  ShieldAlert, 
  Database, 
  Sun, 
  Moon, 
  LogOut, 
  UserCheck, 
  Lock,
  ChevronDown,
  Sparkles,
  PartyPopper,
  Plus,
  Tv
} from 'lucide-react';
import { Event, Ceremony, User, ThemeMode } from '../types';
import { t, getLanguageFontClass } from '../utils/i18n';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  events: Event[];
  activeEvent: Event;
  onSelectEvent: (eventId: string) => void;
  onOpenAddEventModal: () => void;
  ceremonies: Ceremony[];
  activeCeremony?: Ceremony;
  onSelectCeremony: (ceremonyId: string) => void;
  onOpenAddCeremonyModal: () => void;
  currentUser: User | null;
  onLogout: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onOpenQuickEntry: () => void;
  onOpenTvDisplay?: () => void;
  currentLanguage: 'en' | 'hi' | 'ur';
  onChangeLanguage: (lang: 'en' | 'hi' | 'ur') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  events,
  activeEvent,
  onSelectEvent,
  onOpenAddEventModal,
  ceremonies,
  activeCeremony,
  onSelectCeremony,
  onOpenAddCeremonyModal,
  currentUser,
  onLogout,
  theme,
  onToggleTheme,
  onOpenQuickEntry,
  onOpenTvDisplay,
  currentLanguage,
  onChangeLanguage
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const langFont = getLanguageFontClass(currentLanguage);

  const NAV_ITEMS = [
    { id: 'dashboard', label: '🏠 Action Hub (होम)', icon: LayoutDashboard, adminOnly: false },
    { id: 'event-dashboard', label: t('nav.dashboard', currentLanguage), icon: Crown, adminOnly: false },
    { id: 'quick-entry', label: t('nav.quick_entry', currentLanguage), icon: PlusCircle, highlight: true, adminOnly: false },
    { id: 'guests', label: t('nav.guests', currentLanguage), icon: Users, adminOnly: false },
    { id: 'families', label: t('nav.families', currentLanguage), icon: UsersRound, adminOnly: false },
    { id: 'gifts', label: t('nav.gifts', currentLanguage), icon: Gift, adminOnly: false },
    { id: 'events', label: t('nav.events', currentLanguage), icon: CalendarDays, adminOnly: false },
    { id: 'reports', label: t('nav.reports', currentLanguage), icon: FileSpreadsheet, adminOnly: false },
    { id: 'audit', label: t('nav.audit', currentLanguage), icon: ShieldAlert, adminOnly: true },
    { id: 'settings', label: t('nav.settings', currentLanguage), icon: Database, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-300 dark:border-amber-500/20 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-xl no-print transition-colors duration-300 shadow-sm">
      
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-16 py-2 gap-2 sm:gap-4 flex-wrap md:flex-nowrap">
          
          {/* Left: Logo & Branding */}
          <div className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[1.5px] shadow-md shadow-amber-500/15 flex-shrink-0">
              <div className="w-full h-full bg-neutral-950 rounded-[9px] sm:rounded-[10px] flex items-center justify-center">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              </div>
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-black tracking-wide font-cinzel text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                  NEVTA <span className="gold-gradient-text">{t('app.ledger', currentLanguage)}</span>
                </h1>
                <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-900 dark:text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-md font-outfit whitespace-nowrap">
                  {t('app.edition', currentLanguage)}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-600 dark:text-neutral-400 truncate max-w-[140px] sm:max-w-[220px] font-semibold">
                {activeEvent?.name}
              </p>
            </div>
          </div>

          {/* Center: Wedding Selector & Quick New Shaadi Button */}
          <div className="flex items-center gap-1.5 flex-shrink-0 order-3 md:order-2">
            <select
              value={activeEvent?.id || ''}
              onChange={(e) => {
                if (e.target.value === '__ADD_NEW_EVENT__') {
                  onOpenAddEventModal();
                } else {
                  onSelectEvent(e.target.value);
                }
              }}
              className="text-xs bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900/90 text-neutral-900 dark:text-amber-300 font-bold border border-neutral-300 dark:border-amber-500/40 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-amber-500 cursor-pointer max-w-[140px] sm:max-w-[200px] truncate font-cinzel shadow-sm"
              title="Select Active Wedding Celebration"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-bold">
                  👑 {evt.name}
                </option>
              ))}
              <option value="__ADD_NEW_EVENT__" className="bg-white dark:bg-neutral-900 text-emerald-700 dark:text-emerald-400 font-extrabold">
                {t('app.add_new_event', currentLanguage)}
              </option>
            </select>

            <button
              onClick={onOpenAddEventModal}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-1 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              title="Create New Marriage / Celebration"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className={`hidden lg:inline text-[11px] font-bold ${langFont}`}>{t('app.new_shaadi', currentLanguage)}</span>
            </button>
          </div>

          {/* Right Action Tools: Quick Counter, TV, Lang, Theme, User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 order-2 md:order-3 ml-auto md:ml-0">
            
            {/* Quick Counter Action Button */}
            <button
              onClick={onOpenQuickEntry}
              className="gold-gradient-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className={`text-[11px] sm:text-xs ${langFont}`}>{t('app.quick_counter', currentLanguage)}</span>
            </button>

            {/* 📺 TV Screen Mode */}
            {onOpenTvDisplay && (
              <button
                onClick={onOpenTvDisplay}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-500/40 transition-all cursor-pointer shadow-sm whitespace-nowrap"
                title="Open Big Screen TV / Stage Mode"
              >
                <Tv className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[11px]">TV</span>
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-0.5 text-[10px] sm:text-[11px] font-bold">
              <button
                onClick={() => onChangeLanguage('en')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-all cursor-pointer ${
                  currentLanguage === 'en' ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-black' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => onChangeLanguage('hi')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg font-devanagari transition-all cursor-pointer ${
                  currentLanguage === 'hi' ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-black' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
                title="हिंदी"
              >
                हिं
              </button>
              <button
                onClick={() => onChangeLanguage('ur')}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg font-urdu transition-all cursor-pointer ${
                  currentLanguage === 'ur' ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-black' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
                title="اردو"
              >
                اردو
              </button>
            </div>

            {/* Theme Toggle Button (☀️ / 🌙) */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 sm:p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-800 dark:text-neutral-300 hover:border-amber-500/50 hover:text-amber-700 dark:hover:text-amber-300 transition-all shadow-sm cursor-pointer"
              title={theme === 'royal-dark' ? 'Switch to Royal Light Mode' : 'Switch to Royal Dark Mode'}
            >
              {theme === 'royal-dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-amber-700" />
              )}
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-neutral-300 dark:border-neutral-800">
              <div className="hidden xl:flex flex-col text-right leading-tight">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-200 truncate max-w-[100px]">
                  {currentUser?.name || 'Sultan'}
                </span>
                <span className={`text-[8.5px] uppercase font-extrabold tracking-wider ${
                  isAdmin ? 'text-amber-800 dark:text-amber-400' : 'text-emerald-800 dark:text-emerald-400'
                }`}>
                  {isAdmin ? t('app.super_admin', currentLanguage) : t('app.staff', currentLanguage)}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-all cursor-pointer"
                title={t('common.logout', currentLanguage)}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Ceremonies / Rasam Switcher Ribbon (When ceremonies are available) */}
      {ceremonies && ceremonies.length > 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 bg-amber-500/5 dark:bg-neutral-900/40 border-t border-neutral-200 dark:border-neutral-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className={`text-[10px] sm:text-[11px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1 font-outfit whitespace-nowrap flex-shrink-0 ${langFont}`}>
            <PartyPopper className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {t('app.ceremonies_ribbon', currentLanguage)}
          </span>
          
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {ceremonies.map(crm => {
              const isSelected = activeCeremony?.id === crm.id;
              return (
                <button
                  key={crm.id}
                  onClick={() => onSelectCeremony(crm.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black shadow-md scale-105'
                      : 'bg-white hover:bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-amber-500/40'
                  }`}
                >
                  <span>
                    {crm.ceremony_type === 'Haldi' ? '🌼' :
                     crm.ceremony_type === 'Mehendi' ? '🌿' :
                     crm.ceremony_type === 'Nikah' ? '💍' :
                     crm.ceremony_type === 'Walima' ? '🍽️' :
                     crm.ceremony_type === 'Tilak' ? '✨' : '🎉'}
                  </span>
                  <span>{crm.name}</span>
                  {crm.status === 'Live / Active' && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-neutral-950' : 'bg-emerald-600 dark:bg-emerald-400'} animate-ping`} />
                  )}
                </button>
              );
            })}

            {/* Direct Add Ceremony Button */}
            <button
              onClick={onOpenAddCeremonyModal}
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-900 dark:text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition-all whitespace-nowrap shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
              title={`Add New Function / Ceremony to ${activeEvent.name}`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className={langFont}>{t('app.add_ceremony', currentLanguage)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Tabs Row - ALWAYS VISIBLE for Seamless Tab Switching */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 border-t border-neutral-200 dark:border-neutral-800/80">
        <nav className="flex items-center gap-1 overflow-x-auto py-1.5 no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked = item.adminOnly && !isAdmin;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 shadow-sm font-black'
                    : isLocked
                    ? 'text-neutral-400 dark:text-neutral-600 cursor-not-allowed opacity-60'
                    : item.highlight
                    ? 'bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25'
                    : 'text-neutral-700 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-800 dark:text-amber-300' : item.highlight ? 'text-emerald-700 dark:text-emerald-400' : ''}`} />
                <span className={langFont}>{item.label}</span>
                {isLocked && <Lock className="w-3 h-3 text-neutral-400 dark:text-neutral-500 ml-0.5" />}
              </button>
            );
          })}
        </nav>
      </div>

    </header>
  );
};
