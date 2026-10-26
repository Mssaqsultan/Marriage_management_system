import React from 'react';
import { 
  Users, 
  IndianRupee, 
  Gift, 
  TrendingUp, 
  Sparkles, 
  MapPin, 
  HeartHandshake, 
  CreditCard, 
  ChevronRight, 
  PlusCircle,
  Calendar,
  Clock,
  Crown,
  ArrowLeft,
  PartyPopper,
  Trash2
} from 'lucide-react';
import { Event, Transaction, Gift as GiftType, User } from '../types';
import { db } from '../services/db';
import { t, getLanguageFontClass } from '../utils/i18n';

interface EventDashboardViewProps {
  activeEvent: Event;
  currentUser?: User | null;
  onNavigate: (tab: any) => void;
  onSelectGuest: (guestId: string) => void;
  onOpenQuickEntry: () => void;
  currentLanguage: 'en' | 'hi' | 'ur';
}

export const EventDashboardView: React.FC<EventDashboardViewProps> = ({
  activeEvent,
  currentUser,
  onNavigate,
  onSelectGuest,
  onOpenQuickEntry,
  currentLanguage
}) => {
  const analytics = db.getEventAnalytics(activeEvent.id);
  const transactions = db.getTransactions(activeEvent.id).slice(0, 7);
  const gifts = db.getGifts(activeEvent.id).slice(0, 5);
  const ceremonies = db.getCeremonies(activeEvent.id);
  const langFont = getLanguageFontClass(currentLanguage);

  const formatRupees = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const topVillages = Object.entries(analytics.villageBreakdown)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5);

  const totalPaymentSum = 
    analytics.paymentSplit.cash + 
    analytics.paymentSplit.upi + 
    analytics.paymentSplit.bank + 
    analytics.paymentSplit.cheque || 1;

  return (
    <div className={`space-y-6 animate-fadeIn pb-12 ${langFont}`}>
      
      {/* Event Header Banner with Back to Hub */}
      <div className="royal-glass rounded-3xl p-6 sm:p-7 relative overflow-hidden border-2 border-amber-500/40 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Action Hub (होम)</span>
              </button>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border border-emerald-500/40 font-outfit">
                {activeEvent.type} • {activeEvent.status}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-[#78350F] dark:text-neutral-100 font-cinzel tracking-wide">
              {activeEvent.name}
            </h1>
            
            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 mt-1 flex flex-wrap items-center gap-2 font-semibold">
              <span className="text-neutral-900 dark:text-amber-400 font-bold font-outfit">Host:</span> <strong className="text-[#78350F] dark:text-amber-300">{activeEvent.host_name}</strong> 
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400" /> {activeEvent.venue}</span>
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-600 dark:text-neutral-400 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {activeEvent.date}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
            <button
              onClick={onOpenQuickEntry}
              className="gold-gradient-btn px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>{t('dashboard.btn_open_counter', currentLanguage)}</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900/80 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span>{t('nav.reports', currentLanguage)}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            {currentUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete celebration "${activeEvent.name}"? All associated ceremonies, transactions and gifts will be removed.`)) {
                    db.deleteEvent(activeEvent.id);
                    onNavigate('dashboard');
                    window.location.reload();
                  }
                }}
                className="px-3 sm:px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                title={`Delete celebration "${activeEvent.name}" (Admin Only)`}
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete Shaadi</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Key Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Guests */}
        <div className="royal-glass rounded-2xl p-5 royal-glass-hover border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 tracking-wider uppercase">{t('dashboard.total_mehmaan', currentLanguage)}</span>
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-neutral-900 dark:text-neutral-100">{analytics.totalGuests}</p>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-1 flex items-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Sultan Registry
            </p>
          </div>
        </div>

        {/* Card 2: Total Nevta */}
        <div className="royal-glass rounded-2xl p-5 royal-glass-hover border-2 border-amber-500/40 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#78350F] dark:text-amber-300 tracking-wider uppercase">{t('dashboard.total_nevta', currentLanguage)}</span>
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
              <IndianRupee className="w-5 h-5 font-black" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-[#78350F] dark:text-amber-300">{formatRupees(analytics.totalNevta)}</p>
            <p className="text-[11px] text-neutral-600 dark:text-amber-400/80 mt-1 font-semibold">{t('dashboard.payment_split', currentLanguage)}</p>
          </div>
        </div>

        {/* Card 3: Total Nahuchua */}
        <div className="royal-glass rounded-2xl p-5 royal-glass-hover border border-neutral-300 dark:border-emerald-500/20 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 tracking-wider uppercase">Nahuchua</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-[#064E3B] dark:text-emerald-300">{formatRupees(analytics.totalNahuchua)}</p>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 font-semibold">Ritual Blessings</p>
          </div>
        </div>

        {/* Card 4: Total Gifts Count */}
        <div className="royal-glass rounded-2xl p-5 royal-glass-hover border border-neutral-300 dark:border-purple-500/20 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 tracking-wider uppercase">{t('dashboard.physical_gifts', currentLanguage)}</span>
            <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-900 dark:text-purple-400 border border-purple-500/30">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-neutral-900 dark:text-neutral-100">{analytics.totalGiftItems}</p>
            <p className="text-[11px] text-[#581C87] dark:text-purple-300 mt-1 font-bold">{t('gifts.title', currentLanguage)}</p>
          </div>
        </div>

        {/* Card 5: Grand Combined Value */}
        <div className="royal-glass rounded-2xl p-5 royal-glass-hover border-2 border-amber-500/40 bg-white dark:bg-neutral-950">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-neutral-900 dark:text-cyan-300 tracking-wider uppercase">{t('common.total', currentLanguage)}</span>
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-[#78350F] dark:text-cyan-300 border border-amber-500/40">
              <TrendingUp className="w-5 h-5 font-black" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black text-[#78350F] dark:text-cyan-200 truncate">{formatRupees(analytics.grandTotalValue)}</p>
            <p className="text-[11px] text-neutral-600 dark:text-cyan-400/80 mt-1 font-semibold">{t('common.amount', currentLanguage)}</p>
          </div>
        </div>

      </div>

      {/* Middle Row: Payment Mode Split & Village-wise Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Payment Reconciliation Card */}
        <div className="royal-glass rounded-3xl p-5 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-neutral-900 dark:text-neutral-100 tracking-wide flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {t('dashboard.payment_split', currentLanguage)}
              </h3>
              <span className="text-xs text-[#78350F] dark:text-amber-400 font-black">{formatRupees(analytics.totalCollection)}</span>
            </div>

            <div className="space-y-3.5">
              {/* Cash */}
              <div>
                <div className="flex justify-between text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  <span>💵 {t('common.cash', currentLanguage)}</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{formatRupees(analytics.paymentSplit.cash)} ({Math.round((analytics.paymentSplit.cash / totalPaymentSum) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.paymentSplit.cash / totalPaymentSum) * 100}%` }}
                  />
                </div>
              </div>

              {/* UPI */}
              <div>
                <div className="flex justify-between text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  <span>📱 {t('common.upi', currentLanguage)}</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{formatRupees(analytics.paymentSplit.upi)} ({Math.round((analytics.paymentSplit.upi / totalPaymentSum) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.paymentSplit.upi / totalPaymentSum) * 100}%` }}
                  />
                </div>
              </div>

              {/* Bank Transfer */}
              <div>
                <div className="flex justify-between text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  <span>🏛️ {t('common.bank', currentLanguage)}</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{formatRupees(analytics.paymentSplit.bank)} ({Math.round((analytics.paymentSplit.bank / totalPaymentSum) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.paymentSplit.bank / totalPaymentSum) * 100}%` }}
                  />
                </div>
              </div>

              {/* Cheque */}
              <div>
                <div className="flex justify-between text-xs text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
                  <span>🧾 {t('common.cheque', currentLanguage)}</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{formatRupees(analytics.paymentSplit.cheque)} ({Math.round((analytics.paymentSplit.cheque / totalPaymentSum) * 100)}%)</span>
                </div>
                <div className="w-full h-2.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${(analytics.paymentSplit.cheque / totalPaymentSum) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 font-semibold">
            <span>Operator: {currentUser?.name || 'Sultan Salahuddin'}</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">100% Balanced</span>
          </div>
        </div>

        {/* Top Village Contributions */}
        <div className="royal-glass rounded-3xl p-5 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-neutral-900 dark:text-neutral-100 tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t('dashboard.top_villages', currentLanguage)}
              </h3>
              <button onClick={() => onNavigate('reports')} className="text-xs text-amber-800 dark:text-amber-400 font-bold hover:underline cursor-pointer">
                {t('dashboard.view_all', currentLanguage)}
              </button>
            </div>

            <div className="space-y-2.5">
              {topVillages.map(([village, stats], idx) => (
                <div key={village} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/40 transition-all">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-[#78350F] dark:text-amber-400 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{village}</p>
                      <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-medium">{stats.guests} {t('dashboard.contributors', currentLanguage)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#78350F] dark:text-amber-300 font-outfit">{formatRupees(stats.total)}</p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Nevta: {formatRupees(stats.nevta)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 text-center">
            <span className="text-[11px] text-neutral-500 font-medium">Auto-aggregated by village origin</span>
          </div>
        </div>

        {/* Side & Relation Breakdown */}
        <div className="royal-glass rounded-3xl p-5 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-neutral-900 dark:text-neutral-100 tracking-wide flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              {t('counter.side', currentLanguage)}
            </h3>
          </div>

          <div className="space-y-2.5">
            {Object.entries(analytics.sideBreakdown).map(([side, stats]) => (
              <div key={side} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                    side === 'Groom Side' ? 'bg-blue-100 text-blue-900 border-blue-400 dark:bg-blue-900/40 dark:text-blue-200' :
                    side === 'Bride Side' ? 'bg-pink-100 text-pink-900 border-pink-400 dark:bg-pink-900/40 dark:text-pink-200' :
                    'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-900/40 dark:text-amber-200'
                  }`}>
                    {side}
                  </span>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 mt-1">{stats.count} {t('dashboard.contributors', currentLanguage)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-neutral-900 dark:text-neutral-100 font-outfit">{formatRupees(stats.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Live Transactions & Physical Gifts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions Feed (2 cols) */}
        <div className="lg:col-span-2 royal-glass rounded-3xl p-5 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                {t('dashboard.recent_entries', currentLanguage)}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Real-time receipts recorded in ledger</p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-amber-800 dark:text-amber-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>View & Edit All Entries</span> <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-neutral-600 dark:text-neutral-400 uppercase bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 font-bold">
                <tr>
                  <th className="py-2.5 px-3">{t('guests.th_name', currentLanguage)}</th>
                  <th className="py-2.5 px-3">{t('guests.th_location', currentLanguage)}</th>
                  <th className="py-2.5 px-3">{t('counter.relation', currentLanguage)}</th>
                  <th className="py-2.5 px-3">{t('common.amount', currentLanguage)}</th>
                  <th className="py-2.5 px-3">{t('counter.payment_mode', currentLanguage)}</th>
                  <th className="py-2.5 px-3 text-right">{t('common.actions', currentLanguage)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60 font-medium">
                {transactions.map((txn) => {
                  const guest = db.getGuestById(txn.guest_id);
                  return (
                    <tr key={txn.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-900 dark:text-amber-300 flex items-center justify-center font-black text-[10px]">
                          {guest?.name.substring(0, 2).toUpperCase() || 'GH'}
                        </span>
                        <div>
                          <p className="font-extrabold text-neutral-900 dark:text-neutral-100">{guest?.name || 'Guest'}</p>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400">{guest?.father_husband_name ? `S/o ${guest.father_husband_name}` : ''}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">{guest?.village || '-'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 dark:bg-neutral-800 text-[#78350F] dark:text-amber-300 border border-neutral-300 dark:border-neutral-700">
                          {guest?.relation || 'Relative'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-black text-[#78350F] dark:text-amber-300 font-outfit">
                          {formatRupees(txn.amount)}
                        </div>
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase font-bold">{txn.type}</span>
                      </td>
                      <td className="py-3 px-3 text-neutral-700 dark:text-neutral-300">
                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-bold">
                          {txn.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => guest && onSelectGuest(guest.id)}
                          className="text-[11px] text-amber-800 dark:text-amber-400 hover:underline font-bold cursor-pointer"
                        >
                          {t('common.history', currentLanguage)}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Physical Gifts Card (1 col) */}
        <div className="royal-glass rounded-3xl p-5 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Gift className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                {t('dashboard.gift_highlights', currentLanguage)}
              </h3>
              <button onClick={() => onNavigate('gifts')} className="text-xs text-amber-800 dark:text-amber-400 font-bold hover:underline cursor-pointer">
                {t('dashboard.view_all', currentLanguage)}
              </button>
            </div>

            <div className="space-y-2.5">
              {gifts.map((gft) => {
                const guest = db.getGuestById(gft.guest_id);
                return (
                  <div key={gft.id} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100">{gft.item_name}</p>
                      <p className="text-[10px] text-neutral-600 dark:text-neutral-400">
                        From: <span className="text-[#78350F] dark:text-amber-300 font-bold">{guest?.name || 'Guest'}</span> ({gft.category})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-[#581C87] dark:text-purple-300 font-outfit">{formatRupees(gft.estimated_value * gft.quantity)}</p>
                      <p className="text-[10px] text-neutral-500 font-semibold">Qty: {gft.quantity}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-neutral-200 dark:border-neutral-800 text-center">
            <button
              onClick={() => onNavigate('gifts')}
              className="w-full py-2.5 rounded-xl text-xs font-extrabold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 transition-all cursor-pointer shadow-sm"
            >
              {t('gifts.title', currentLanguage)} →
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
