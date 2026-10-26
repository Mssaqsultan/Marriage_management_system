import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  User, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { db } from '../services/db';
import { AuditLog, Guest } from '../types';
import { t, getLanguageFontClass } from '../utils/i18n';

interface AuditLogViewProps {
  onSuccessToast: (msg: string) => void;
  currentLanguage?: 'en' | 'hi' | 'ur';
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ 
  onSuccessToast,
  currentLanguage = 'en'
}) => {
  const langFont = getLanguageFontClass(currentLanguage);
  const [activeTab, setActiveTab] = useState<'logs' | 'trash'>('logs');

  const auditLogs = db.getAuditLogs();
  const deletedGuests = db.getGuests(true).filter(g => g.deleted_at);

  const handleRestoreGuest = (guest: Guest) => {
    db.restoreGuest(guest.id);
    onSuccessToast(`Restored "${guest.name}" from Recycle Bin`);
  };

  const handlePermanentDelete = (guest: Guest) => {
    if (confirm(`Permanently delete "${guest.name}"? This action cannot be undone!`)) {
      db.permanentDeleteGuest(guest.id);
      onSuccessToast(`Permanently deleted "${guest.name}"`);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header */}
      <div className="royal-glass rounded-3xl p-6 border-2 border-amber-500/40 bg-white dark:bg-neutral-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-blue-100 text-blue-950 dark:bg-cyan-500/20 dark:text-cyan-300 border border-blue-300 dark:border-cyan-500/40 font-outfit">
              Security & Audit Trail
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold">Total Logs: <strong className="text-neutral-900 dark:text-neutral-100 font-outfit">{auditLogs.length} Actions</strong></span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 font-cinzel">
            Audit Ledger & Soft Delete Recycle Bin
          </h2>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-300 dark:border-neutral-800 rounded-2xl p-1 shadow-sm">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'logs' ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-black shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Activity Trail
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'trash' ? 'bg-red-100 text-red-900 dark:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-500/40 font-black shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Recycle Bin ({deletedGuests.length})
          </button>
        </div>
      </div>

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <div className="royal-glass rounded-3xl p-6 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 overflow-x-auto shadow-md">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-neutral-600 dark:text-neutral-400 uppercase bg-neutral-100 dark:bg-neutral-900/80 border-b border-neutral-300 dark:border-neutral-800 font-bold">
              <tr>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Operator</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entity Type</th>
                <th className="py-3 px-3">Action Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-medium">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                  <td className="py-3 px-3 text-neutral-600 dark:text-neutral-400 font-mono text-[11px] font-semibold">
                    {new Date(log.timestamp).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-extrabold text-[#78350F] dark:text-amber-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {log.user_name}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-950 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-300 dark:border-blue-500/30' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-950 dark:bg-red-500/15 dark:text-red-300 border border-red-300 dark:border-red-500/30' :
                      log.action === 'RESTORE' ? 'bg-purple-100 text-purple-950 dark:bg-purple-500/15 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30' :
                      'bg-neutral-200 text-neutral-800'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-neutral-800 dark:text-neutral-300 font-bold">{log.entity_type}</td>
                  <td className="py-3 px-3 text-neutral-900 dark:text-neutral-200">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Recycle Bin (Trash) Tab */}
      {activeTab === 'trash' && (
        <div className="royal-glass rounded-3xl p-6 border-2 border-red-500/30 bg-white dark:bg-neutral-950 space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 font-outfit">Recycle Bin (Soft Deleted Records)</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Accidentally deleted mehmaan can be safely restored here without data loss.</p>
            </div>
          </div>

          {deletedGuests.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-xs font-semibold">
              <ShieldCheck className="w-10 h-10 text-emerald-600 dark:text-emerald-500/50 mx-auto mb-2" />
              Recycle Bin is currently empty. No soft-deleted records found.
            </div>
          ) : (
            <div className="space-y-3">
              {deletedGuests.map((g) => (
                <div key={g.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-neutral-900 dark:text-neutral-200">{g.name}</h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-0.5">
                      Village: {g.village || 'N/A'} • Relation: {g.relation} • Deleted at: {g.deleted_at ? new Date(g.deleted_at).toLocaleString() : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreGuest(g)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </button>
                    <button
                      onClick={() => handlePermanentDelete(g)}
                      className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-500/20 text-red-950 dark:text-red-400 border border-red-300 dark:border-red-500/40 text-xs font-bold cursor-pointer"
                    >
                      Delete Forever
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
