import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  MapPin, 
  Users, 
  HeartHandshake, 
  Gift, 
  IndianRupee, 
  Search, 
  Filter, 
  CheckCircle2,
  Crown,
  Calendar,
  Building,
  MessageSquare
} from 'lucide-react';
import { Event, Guest, Transaction, Gift as GiftType } from '../types';
import { db } from '../services/db';
import { exportGuestReportCSV, exportVillageReportCSV } from '../services/export';
import { t, getLanguageFontClass } from '../utils/i18n';

interface ReportsViewProps {
  activeEvent: Event;
  onSelectGuest: (guestId: string) => void;
  onSuccessToast: (msg: string) => void;
  onOpenBulkThankYou?: () => void;
  currentLanguage?: 'en' | 'hi' | 'ur';
}

type ReportTab = 'guest' | 'village' | 'family' | 'relation' | 'gifts';

export const ReportsView: React.FC<ReportsViewProps> = ({
  activeEvent,
  onSelectGuest,
  onSuccessToast,
  onOpenBulkThankYou,
  currentLanguage = 'en'
}) => {
  const langFont = getLanguageFontClass(currentLanguage);
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('guest');
  const [searchQuery, setSearchQuery] = useState('');

  const guests = db.getGuests();
  const txns = db.getTransactions(activeEvent.id);
  const gifts = db.getGifts(activeEvent.id);
  const families = db.getFamilies();
  const analytics = db.getEventAnalytics(activeEvent.id);

  const formatRupees = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const handleExportCSV = () => {
    if (activeReportTab === 'village') {
      exportVillageReportCSV(activeEvent, analytics.villageBreakdown);
      onSuccessToast('Exported Village-wise Collection Report CSV!');
    } else {
      exportGuestReportCSV(activeEvent, guests, txns, gifts);
      onSuccessToast('Exported Report CSV!');
    }
  };

  const handlePrintPortrait = () => {
    document.body.classList.remove('print-mode-landscape');
    window.print();
  };

  const handlePrintLandscape = () => {
    document.body.classList.add('print-mode-landscape');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-mode-landscape');
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header Bar */}
      <div className="royal-glass rounded-2xl p-6 border-amber-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-[#064E3B] dark:text-emerald-300 border border-emerald-500/40 font-outfit">
              Official Reporting & Audit Center
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">Active Event: <strong className="text-neutral-900 dark:text-neutral-100">{activeEvent.name}</strong></span>
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 font-cinzel">
            Ledger Reports & Export Engine
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenBulkThankYou && (
            <button
              onClick={onOpenBulkThankYou}
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>WhatsApp</span>
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-neutral-200 dark:bg-neutral-900 hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>CSV / Excel</span>
          </button>
          
          {/* Portrait Print */}
          <button
            onClick={handlePrintPortrait}
            className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Print in standard A4 Portrait layout"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>🖨️ Print Portrait</span>
          </button>

          {/* Landscape Print */}
          <button
            onClick={handlePrintLandscape}
            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-amber-500/20 hover:bg-amber-500/30 text-amber-950 dark:text-amber-300 border border-amber-500/50 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Print in wide A4 Landscape layout"
          >
            <Printer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>📄 Print Landscape</span>
          </button>
        </div>
      </div>

      {/* Report Statement Letterhead: EVENT NAME IS BIG, LEDGER STATEMENT LABEL IS SMALL */}
      <div className="royal-glass rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 text-center space-y-3 shadow-xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 print:p-3 print:space-y-1.5 print:border print:shadow-none print:rounded-2xl">
        
        {/* Compact Small Statement Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[11px] font-black uppercase tracking-widest text-[#78350F] dark:text-amber-300 font-outfit shadow-sm print:px-2 print:py-0.5 print:text-[9px]">
            <Crown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Nevta & Guest Ledger Statement
          </span>
        </div>

        {/* BIG & PROMINENT EVENT NAME */}
        <h1 className="text-2xl sm:text-4xl print:text-xl font-black font-cinzel tracking-wide text-[#78350F] dark:text-amber-300 uppercase py-1 drop-shadow-sm">
          {activeEvent.name}
        </h1>

        {/* Event Type & Meta info */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold text-neutral-600 dark:text-neutral-400 font-outfit print:text-[10px] print:gap-1.5">
          <span className="px-2.5 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold print:p-0.5">
            {activeEvent.type}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <strong>Date:</strong> {new Date(activeEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <strong>Venue:</strong> {activeEvent.venue}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <strong>Hosted By:</strong> <span className="text-[#78350F] dark:text-amber-300 font-bold">{activeEvent.host_name}</span>
          </span>
        </div>

        {/* Financial Summary Highlight Row */}
        <div className="pt-3 print:pt-1.5 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-bold font-outfit border-t border-neutral-300 dark:border-neutral-800/80 print:gap-1.5">
          <span className="p-1.5 sm:p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 print:text-[9.5px] print:p-1">
            Total Guests: <strong className="text-neutral-900 dark:text-neutral-100 text-sm print:text-[10px] ml-1">{analytics.totalGuests}</strong>
          </span>
          <span className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 print:text-[9.5px] print:p-1">
            Nevta Collection: <strong className="text-[#78350F] dark:text-amber-300 text-sm print:text-[10px] ml-1">{formatRupees(analytics.totalNevta)}</strong>
          </span>
          <span className="p-1.5 sm:p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 print:text-[9.5px] print:p-1">
            Nahuchua: <strong className="text-[#064E3B] dark:text-emerald-300 text-sm print:text-[10px] ml-1">{formatRupees(analytics.totalNahuchua)}</strong>
          </span>
          <span className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 print:text-[9.5px] print:p-1">
            Gifts: <strong className="text-[#581C87] dark:text-purple-300 text-sm print:text-[10px] ml-1">{analytics.totalGiftItems} Items ({formatRupees(analytics.totalGiftValue)})</strong>
          </span>
          <span className="p-1.5 sm:p-2 rounded-xl bg-amber-500/20 border-2 border-amber-500/50 print:text-[9.5px] print:p-1">
            Grand Total: <strong className="text-[#78350F] dark:text-amber-300 text-base print:text-[11px] font-black ml-1">{formatRupees(analytics.grandTotalValue)}</strong>
          </span>
        </div>
      </div>

      {/* Navigation Tabs for Reports */}
      <div className="flex space-x-2 border-b border-neutral-300 dark:border-neutral-800 pb-2 no-print overflow-x-auto">
        <button
          onClick={() => setActiveReportTab('guest')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeReportTab === 'guest' ? 'bg-amber-500/20 text-[#78350F] dark:text-amber-300 border border-amber-500/40 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Guest-wise Full Ledger
        </button>

        <button
          onClick={() => setActiveReportTab('village')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeReportTab === 'village' ? 'bg-amber-500/20 text-[#78350F] dark:text-amber-300 border border-amber-500/40 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" /> Village-wise Summary
        </button>

        <button
          onClick={() => setActiveReportTab('family')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeReportTab === 'family' ? 'bg-amber-500/20 text-[#78350F] dark:text-amber-300 border border-amber-500/40 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Building className="w-3.5 h-3.5" /> Family Households
        </button>

        <button
          onClick={() => setActiveReportTab('relation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeReportTab === 'relation' ? 'bg-amber-500/20 text-[#78350F] dark:text-amber-300 border border-amber-500/40 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" /> Relation Analysis
        </button>

        <button
          onClick={() => setActiveReportTab('gifts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeReportTab === 'gifts' ? 'bg-amber-500/20 text-[#78350F] dark:text-amber-300 border border-amber-500/40 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Gift className="w-3.5 h-3.5" /> Physical Gifts Inventory
        </button>
      </div>

      {/* Tab 1: Guest-wise Detailed Report */}
      {activeReportTab === 'guest' && (
        <div className="royal-glass rounded-2xl p-4 sm:p-6 border-amber-500/20 overflow-x-auto print:overflow-visible print:p-1 print:border-none print:shadow-none bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-lg">
          <table className="w-full text-left text-xs print:text-[8px] border-collapse">
            <thead className="text-[11px] print:text-[8px] text-neutral-600 dark:text-neutral-400 uppercase bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-300 dark:border-neutral-800 font-bold">
              <tr>
                <th className="py-2.5 px-2 print:py-1 print:px-0.5 text-center w-[3%]">#</th>
                <th className="py-2.5 px-2.5 print:py-1 print:px-1 w-[16%]">Guest Name</th>
                <th className="py-2.5 px-2 print:py-1 print:px-1 w-[13%]">Father / Husband</th>
                <th className="py-2.5 px-2 print:py-1 print:px-1 w-[12%]">Village / Town</th>
                <th className="py-2.5 px-1.5 print:py-1 print:px-0.5 text-center w-[8%]">Relation</th>
                <th className="py-2.5 px-1.5 print:py-1 print:px-0.5 text-center w-[6%]">Side</th>
                <th className="py-2.5 px-2 print:py-1 print:px-0.5 text-right w-[11%]">Nevta (₹)</th>
                <th className="py-2.5 px-2 print:py-1 print:px-0.5 text-right w-[10%]">Nahuchua (₹)</th>
                <th className="py-2.5 px-2 print:py-1 print:px-0.5 text-right w-[11%]">Total Cash</th>
                <th className="py-2.5 px-1.5 print:py-1 print:px-0.5 text-center w-[5%]">Gifts</th>
                <th className="py-2.5 px-1.5 print:py-1 print:px-0.5 text-center w-[5%]">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-medium">
              {guests.map((g, idx) => {
                const guestTxns = txns.filter(t => t.guest_id === g.id && !t.deleted_at);
                const guestGifts = gifts.filter(t => t.guest_id === g.id && !t.deleted_at);
                const nevta = guestTxns.filter(t => t.type === 'nevta').reduce((s, t) => s + t.amount, 0);
                const nahuchua = guestTxns.filter(t => t.type === 'nahuchua').reduce((s, t) => s + t.amount, 0);
                const total = nevta + nahuchua;
                const pModes = Array.from(new Set(guestTxns.map(t => t.payment_method))).join(', ') || '-';

                return (
                  <tr key={g.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800/40 transition-colors">
                    <td className="py-2.5 px-2 print:py-1 print:px-0.5 text-neutral-500 font-mono font-bold text-center">{idx + 1}</td>
                    <td className="py-2.5 px-2.5 print:py-1 print:px-1 font-extrabold text-neutral-900 dark:text-neutral-100">
                      <button onClick={() => onSelectGuest(g.id)} className="hover:underline text-left cursor-pointer no-print">
                        {g.name}
                      </button>
                      <span className="hidden print:inline font-bold">{g.name}</span>
                    </td>
                    <td className="py-2.5 px-2 print:py-1 print:px-1 text-neutral-700 dark:text-neutral-300">{g.father_husband_name || '-'}</td>
                    <td className="py-2.5 px-2 print:py-1 print:px-1 text-neutral-700 dark:text-neutral-300">{g.village || '-'}</td>
                    <td className="py-2.5 px-1.5 print:py-1 print:px-0.5 text-center">
                      <span className="px-2 py-0.5 print:px-0 print:py-0 rounded-full text-[10px] print:text-[7.5px] font-bold bg-neutral-200 dark:bg-neutral-800 text-[#78350F] dark:text-amber-300 border border-neutral-300 dark:border-neutral-700 print:border-none print:bg-transparent">
                        {g.relation}
                      </span>
                    </td>
                    <td className="py-2.5 px-1.5 print:py-1 print:px-0.5 text-neutral-700 dark:text-neutral-300 text-center">{g.side}</td>
                    <td className="py-2.5 px-2 print:py-1 print:px-0.5 text-right font-black text-[#78350F] dark:text-amber-300 font-outfit">
                      {nevta > 0 ? formatRupees(nevta) : '-'}
                    </td>
                    <td className="py-2.5 px-2 print:py-1 print:px-0.5 text-right font-black text-[#064E3B] dark:text-emerald-300 font-outfit">
                      {nahuchua > 0 ? formatRupees(nahuchua) : '-'}
                    </td>
                    <td className="py-2.5 px-2 print:py-1 print:px-0.5 text-right font-black text-neutral-900 dark:text-neutral-100 font-outfit text-sm print:text-[8.5px]">
                      {total > 0 ? formatRupees(total) : '-'}
                    </td>
                    <td className="py-2.5 px-1.5 print:py-1 print:px-0.5 text-center">
                      {guestGifts.length > 0 ? (
                        <span className="px-2 py-0.5 print:px-0 print:py-0 rounded-full text-[10px] print:text-[7.5px] bg-purple-100 dark:bg-purple-900/40 text-purple-950 dark:text-purple-300 font-black print:bg-transparent">
                          {guestGifts.reduce((s, gf) => s + gf.quantity, 0)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-2.5 px-1.5 print:py-1 print:px-0.5 text-neutral-600 dark:text-neutral-400 text-[11px] print:text-[7.5px] font-semibold text-center">{pModes}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-amber-500/50 font-bold bg-neutral-100 dark:bg-neutral-900/90 text-neutral-900 dark:text-neutral-100">
              <tr>
                <td colSpan={6} className="py-3 px-2 print:py-1.5 print:px-0.5 text-right uppercase tracking-wider font-cinzel font-black print:text-[8px]">Total Event Collection</td>
                <td className="py-3 px-2 print:py-1.5 print:px-0.5 text-right font-black text-[#78350F] dark:text-amber-300 font-outfit text-sm print:text-[8.5px]">{formatRupees(analytics.totalNevta)}</td>
                <td className="py-3 px-2 print:py-1.5 print:px-0.5 text-right font-black text-[#064E3B] dark:text-emerald-300 font-outfit text-sm print:text-[8.5px]">{formatRupees(analytics.totalNahuchua)}</td>
                <td className="py-3 px-2 print:py-1.5 print:px-0.5 text-right font-black text-[#78350F] dark:text-amber-300 font-outfit text-base print:text-[9px]">{formatRupees(analytics.totalCollection)}</td>
                <td className="py-3 px-1.5 print:py-1.5 print:px-0.5 text-center font-bold text-[#581C87] dark:text-purple-300 print:text-[8px]">{analytics.totalGiftItems}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab 2: Village-wise Report */}
      {activeReportTab === 'village' && (
        <div className="royal-glass rounded-2xl p-4 sm:p-6 border-amber-500/20 overflow-x-auto print:overflow-visible print:p-1 print:border-none print:shadow-none bg-white dark:bg-neutral-950 shadow-lg">
          <table className="w-full text-left text-xs print:text-[8.5px] border-collapse">
            <thead className="text-[11px] print:text-[8.5px] text-neutral-600 dark:text-neutral-400 uppercase bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-300 dark:border-neutral-800 font-bold">
              <tr>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-center w-[5%]">Sr</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1">Village / City</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-center">Total Guests</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-right">Nevta (₹)</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-right">Nahuchua (₹)</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-right">Total Collection (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-medium">
              {Object.entries(analytics.villageBreakdown).map(([villageName, vData], idx) => (
                <tr key={villageName} className="hover:bg-neutral-100 dark:hover:bg-neutral-800/40">
                  <td className="py-2.5 px-3 print:py-1 print:px-1 text-neutral-500 font-mono font-bold text-center">{idx + 1}</td>
                  <td className="py-2.5 px-3 print:py-1 print:px-1 font-extrabold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-600 no-print" />
                    <span>{villageName}</span>
                  </td>
                  <td className="py-2.5 px-3 print:py-1 print:px-1 text-center font-bold text-neutral-800 dark:text-neutral-200">{vData.guests}</td>
                  <td className="py-2.5 px-3 print:py-1 print:px-1 text-right font-black text-[#78350F] dark:text-amber-300 font-outfit">{formatRupees(vData.nevta)}</td>
                  <td className="py-2.5 px-3 print:py-1 print:px-1 text-right font-black text-[#064E3B] dark:text-emerald-300 font-outfit">{formatRupees(vData.nahuchua)}</td>
                  <td className="py-2.5 px-3 print:py-1 print:px-1 text-right font-black text-neutral-900 dark:text-neutral-100 font-outfit text-sm print:text-xs">{formatRupees(vData.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Family Households */}
      {activeReportTab === 'family' && (
        <div className="royal-glass rounded-2xl p-4 sm:p-6 border-amber-500/20 overflow-x-auto print:overflow-visible print:p-1 print:border-none print:shadow-none bg-white dark:bg-neutral-950 shadow-lg">
          <table className="w-full text-left text-xs print:text-[8.5px] border-collapse">
            <thead className="text-[11px] print:text-[8.5px] text-neutral-600 dark:text-neutral-400 uppercase bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-300 dark:border-neutral-800 font-bold">
              <tr>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-center w-[5%]">Sr</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1">Family Group</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1">Village / Location</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1">Contact</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-right">Family Total Cash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-medium">
              {families.map((fam, idx) => {
                const famGuests = guests.filter(g => g.family_id === fam.id);
                const famGuestIds = new Set(famGuests.map(g => g.id));
                const famTxns = txns.filter(t => famGuestIds.has(t.guest_id));
                const famTotal = famTxns.reduce((s, t) => s + t.amount, 0);

                return (
                  <tr key={fam.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800/40">
                    <td className="py-2.5 px-3 print:py-1 print:px-1 text-neutral-500 font-mono font-bold text-center">{idx + 1}</td>
                    <td className="py-2.5 px-3 print:py-1 print:px-1 font-extrabold text-neutral-900 dark:text-neutral-100">{fam.name}</td>
                    <td className="py-2.5 px-3 print:py-1 print:px-1 text-neutral-700 dark:text-neutral-300">{fam.village || '-'}</td>
                    <td className="py-2.5 px-3 print:py-1 print:px-1 text-neutral-700 dark:text-neutral-300">{fam.mobile || '-'}</td>
                    <td className="py-2.5 px-3 print:py-1 print:px-1 text-right font-black text-[#78350F] dark:text-amber-300 font-outfit text-sm print:text-xs">{formatRupees(famTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Relation Analysis */}
      {activeReportTab === 'relation' && (
        <div className="royal-glass rounded-2xl p-4 sm:p-6 border-amber-500/20 overflow-x-auto print:overflow-visible print:p-1 print:border-none print:shadow-none bg-white dark:bg-neutral-950 shadow-lg">
          <table className="w-full text-left text-xs print:text-[8.5px] border-collapse">
            <thead className="text-[11px] print:text-[8.5px] text-neutral-600 dark:text-neutral-400 uppercase bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-300 dark:border-neutral-800 font-bold">
              <tr>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-center w-[5%]">Sr</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1">Relation Category</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-center">Guest Count</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-right">Total Collection (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-medium">
              {Object.entries(analytics.relationBreakdown).map(([relName, rData], idx) => (
                <tr key={relName} className="hover:bg-neutral-100 dark:hover:bg-neutral-800/40">
                  <td className="py-2.5 px-3 print:py-1 print:px-1 text-neutral-500 font-mono font-bold text-center">{idx + 1}</td>
                  <td className="py-2.5 px-3 print:py-1 print:px-1 font-extrabold text-[#78350F] dark:text-amber-300">{relName}</td>
                  <td className="py-2.5 px-3 print:py-1 print:px-1 text-center font-bold text-neutral-800 dark:text-neutral-200">{rData.count}</td>
                  <td className="py-2.5 px-3 print:py-1 print:px-1 text-right font-black text-neutral-900 dark:text-neutral-100 font-outfit text-sm print:text-xs">{formatRupees(rData.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Physical Gifts Inventory */}
      {activeReportTab === 'gifts' && (
        <div className="royal-glass rounded-2xl p-4 sm:p-6 border-purple-500/20 overflow-x-auto print:overflow-visible print:p-1 print:border-none print:shadow-none bg-white dark:bg-neutral-950 shadow-lg">
          <table className="w-full text-left text-xs print:text-[8.5px] border-collapse">
            <thead className="text-[11px] print:text-[8.5px] text-neutral-600 dark:text-neutral-400 uppercase bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-300 dark:border-neutral-800 font-bold">
              <tr>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-center w-[5%]">Sr</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1">Gift Item Name</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1">Category</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1">Given By (Guest)</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-center">Qty</th>
                <th className="py-2.5 px-3 print:py-1 print:px-1 text-right">Est. Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-medium">
              {gifts.map((gft, idx) => {
                const guest = db.getGuestById(gft.guest_id);
                return (
                  <tr key={gft.id} className="hover:bg-neutral-100 dark:hover:bg-neutral-800/40">
                    <td className="py-2.5 px-3 print:py-1 print:px-1 text-neutral-500 font-mono font-bold text-center">{idx + 1}</td>
                    <td className="py-2.5 px-3 print:py-1 print:px-1 font-extrabold text-[#581C87] dark:text-purple-300">{gft.item_name}</td>
                    <td className="py-2.5 px-3 print:py-1 print:px-1">
                      <span className="px-2 py-0.5 print:px-0 print:py-0 rounded-full text-[10px] print:text-[8px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-950 dark:text-purple-300 print:bg-transparent">
                        {gft.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 print:py-1 print:px-1 font-bold text-neutral-900 dark:text-neutral-100">{guest?.name || '-'}</td>
                    <td className="py-2.5 px-3 print:py-1 print:px-1 text-center font-bold">{gft.quantity}</td>
                    <td className="py-2.5 px-3 print:py-1 print:px-1 text-right font-black text-[#78350F] dark:text-amber-300 font-outfit text-sm print:text-xs">
                      {formatRupees(gft.estimated_value * gft.quantity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
