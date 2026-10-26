import React from 'react';
import { 
  Users, 
  IndianRupee, 
  Sparkles, 
  PlusCircle, 
  Calendar, 
  Crown, 
  Edit3, 
  PartyPopper, 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  TrendingUp
} from 'lucide-react';
import { Event, User } from '../types';
import { db } from '../services/db';
import { t, getLanguageFontClass } from '../utils/i18n';

interface DashboardProps {
  activeEvent: Event;
  events?: Event[];
  onSelectEvent?: (eventId: string) => void;
  onOpenAddEventModal?: () => void;
  currentUser?: User | null;
  onNavigate: (tab: any) => void;
  onSelectGuest: (guestId: string) => void;
  onOpenQuickEntry: () => void;
  currentLanguage: 'en' | 'hi' | 'ur';
}

export const Dashboard: React.FC<DashboardProps> = ({
  activeEvent,
  events = [],
  onSelectEvent,
  onOpenAddEventModal,
  currentUser,
  onNavigate,
  onOpenQuickEntry,
  currentLanguage
}) => {
  const langFont = getLanguageFontClass(currentLanguage);
  const analytics = db.getEventAnalytics(activeEvent.id);
  const isRTL = currentLanguage === 'ur';

  const formatRupees = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const getLocalDateString = () => {
    const locale = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'ur' ? 'ur-PK' : 'en-IN';
    return new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className={`space-y-7 animate-fadeIn pb-12 ${langFont} max-w-7xl mx-auto`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* ========================================================================= */}
      {/* 👑 WELCOME ACTION HUB BANNER (DEDICATED TO CURRENT SELECTED LANGUAGE) */}
      {/* ========================================================================= */}
      <div className="royal-glass rounded-3xl p-6 sm:p-8 relative overflow-hidden border-2 border-amber-500/50 bg-gradient-to-br from-amber-500/15 via-yellow-500/5 to-transparent bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          
          <div>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-neutral-950 shadow-md font-outfit flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>{t('hub.badge', currentLanguage)}</span>
              </span>
              <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                {getLocalDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#78350F] dark:text-amber-300 font-cinzel tracking-tight">
              {t('hub.welcome_prefix', currentLanguage)} {currentUser?.name || 'Sultan'}!
            </h1>
            
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-2 font-semibold max-w-2xl">
              {t('hub.subtitle', currentLanguage)}
            </p>

            {/* Active Celebration Indicator with Quick Switcher */}
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-amber-500/15 dark:bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 px-2">
                {t('hub.active_label', currentLanguage)}
              </span>
              {events.length > 1 && onSelectEvent ? (
                <select
                  value={activeEvent.id}
                  onChange={(e) => onSelectEvent(e.target.value)}
                  className="royal-input py-1 px-3 text-xs font-black bg-white dark:bg-neutral-900 border-amber-500/40 text-amber-900 dark:text-amber-300 rounded-xl"
                >
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      👑 {ev.name} ({ev.date})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-white dark:bg-neutral-900 text-xs font-black text-[#78350F] dark:text-amber-300 border border-amber-500/40 font-outfit shadow-sm">
                  👑 {activeEvent.name}
                </span>
              )}
              {onOpenAddEventModal && (
                <button
                  type="button"
                  onClick={onOpenAddEventModal}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-[11px] font-bold text-amber-800 dark:text-amber-300 transition-all cursor-pointer"
                >
                  {t('hub.switch_btn', currentLanguage)}
                </button>
              )}
            </div>
          </div>

          {/* Quick Collection Badge */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border-2 border-amber-500/30 backdrop-blur-md shadow-lg flex flex-col items-center justify-center text-center min-w-[210px]">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
              {t('hub.active_total', currentLanguage)}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#78350F] dark:text-amber-300 font-outfit mt-0.5">
              {formatRupees(analytics.totalCollection)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
              ✓ {analytics.totalGuests} {t('hub.guests_recorded', currentLanguage)}
            </span>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 6 ACTION CARDS (100% IN CHOSEN LANGUAGE) */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-neutral-800 dark:text-neutral-200 font-outfit flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t('hub.select_action', currentLanguage)}</span>
          </h2>
          <span className="text-xs font-bold text-neutral-500 font-mono">
            {t('hub.options_available', currentLanguage)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Add New Nevta Entry (Counter) */}
          <div 
            onClick={onOpenQuickEntry}
            className="royal-glass rounded-3xl p-6 border-2 border-amber-500/60 hover:border-amber-500 bg-gradient-to-br from-amber-500/15 via-yellow-500/5 to-transparent bg-white dark:bg-neutral-950 transition-all duration-300 hover:scale-103 hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-neutral-950 font-black shadow-lg group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                  {t('hub.card1_step', currentLanguage)}
                </span>
              </div>
              
              <h3 className="text-base sm:text-lg font-black text-[#78350F] dark:text-amber-300">
                {t('hub.card1_title', currentLanguage)}
              </h3>
              
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 leading-relaxed">
                {t('hub.card1_desc', currentLanguage)}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-black text-amber-700 dark:text-amber-400 group-hover:underline flex items-center gap-1">
                {t('hub.card1_btn', currentLanguage)} {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">Ctrl+S</span>
            </div>
          </div>

          {/* Card 2: View / Edit Records (Reports / Ledger) */}
          <div 
            onClick={() => onNavigate('reports')}
            className="royal-glass rounded-3xl p-6 border border-neutral-300 dark:border-cyan-500/30 hover:border-cyan-500 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-transparent bg-white dark:bg-neutral-950 transition-all duration-300 hover:scale-103 hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                  <Edit3 className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40">
                  {t('hub.card2_step', currentLanguage)}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
                {t('hub.card2_title', currentLanguage)}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 leading-relaxed">
                {t('hub.card2_desc', currentLanguage)}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-black text-cyan-700 dark:text-cyan-400 group-hover:underline flex items-center gap-1">
                {t('hub.card2_btn', currentLanguage)} {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">Edit</span>
            </div>
          </div>

          {/* Card 3: Enter & Manage Celebration Functions */}
          <div 
            onClick={() => onNavigate('event-dashboard')}
            className="royal-glass rounded-3xl p-6 border-2 border-emerald-500/50 hover:border-emerald-500 bg-gradient-to-br from-emerald-500/15 via-green-500/5 to-transparent bg-white dark:bg-neutral-950 transition-all duration-300 hover:scale-103 hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                  <PartyPopper className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
                  {t('hub.card3_step', currentLanguage)}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
                {t('hub.card3_title', currentLanguage)}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 leading-relaxed">
                {t('hub.card3_desc', currentLanguage)}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                {t('hub.card3_btn', currentLanguage)} {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">Workspace</span>
            </div>
          </div>

          {/* Card 4: Add New Wedding / Celebration */}
          <div 
            onClick={() => {
              if (onOpenAddEventModal) {
                onOpenAddEventModal();
              } else {
                onNavigate('events');
              }
            }}
            className="royal-glass rounded-3xl p-6 border border-neutral-300 dark:border-purple-500/30 hover:border-purple-500 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent bg-white dark:bg-neutral-950 transition-all duration-300 hover:scale-103 hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-500/40">
                  {t('hub.card4_step', currentLanguage)}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
                {t('hub.card4_title', currentLanguage)}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 leading-relaxed">
                {t('hub.card4_desc', currentLanguage)}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-black text-purple-700 dark:text-purple-400 group-hover:underline flex items-center gap-1">
                {t('hub.card4_btn', currentLanguage)} {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">Create</span>
            </div>
          </div>

          {/* Card 5: Guests & Families Directory */}
          <div 
            onClick={() => onNavigate('guests')}
            className="royal-glass rounded-3xl p-6 border border-neutral-300 dark:border-indigo-500/30 hover:border-indigo-500 bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent bg-white dark:bg-neutral-950 transition-all duration-300 hover:scale-103 hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-500/40">
                  {t('hub.card5_step', currentLanguage)}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
                {t('hub.card5_title', currentLanguage)}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 leading-relaxed">
                {t('hub.card5_desc', currentLanguage)}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-black text-indigo-700 dark:text-indigo-400 group-hover:underline flex items-center gap-1">
                {t('hub.card5_btn', currentLanguage)} {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">Directory</span>
            </div>
          </div>

          {/* Card 6: Final Ledger & PDF Export */}
          <div 
            onClick={() => onNavigate('reports')}
            className="royal-glass rounded-3xl p-6 border border-neutral-300 dark:border-emerald-500/30 hover:border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent bg-white dark:bg-neutral-950 transition-all duration-300 hover:scale-103 hover:shadow-2xl cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black shadow-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
                  {t('hub.card6_step', currentLanguage)}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-black text-neutral-900 dark:text-neutral-100">
                {t('hub.card6_title', currentLanguage)}
              </h3>

              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium mt-2 leading-relaxed">
                {t('hub.card6_desc', currentLanguage)}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 group-hover:underline flex items-center gap-1">
                {t('hub.card6_btn', currentLanguage)} {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </span>
              <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-md">PDF & Excel</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
