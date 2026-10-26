import React, { useState, useRef } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  ShieldCheck, 
  Save,
  Users,
  Plus,
  Trash2,
  Lock,
  UserCheck,
  ShieldAlert,
  Sun,
  Moon,
  Key,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { AppSettings, User } from '../types';
import { db } from '../services/db';
import { whatsappClient } from '../services/whatsappClient';
import { soundboxService } from '../utils/voiceAssistant';
import { t, getLanguageFontClass } from '../utils/i18n';

interface BackupSettingsViewProps {
  currentUser: User | null;
  onSuccessToast: (msg: string) => void;
  onRefreshAll: () => void;
  currentLanguage?: 'en' | 'hi' | 'ur';
  onChangeLanguage?: (lang: 'en' | 'hi' | 'ur') => void;
}

export const BackupSettingsView: React.FC<BackupSettingsViewProps> = ({
  currentUser,
  onSuccessToast,
  onRefreshAll,
  currentLanguage = 'en',
  onChangeLanguage
}) => {
  const isAdmin = currentUser?.role === 'admin';
  const [settings, setSettings] = useState<AppSettings>(db.getSettings());
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [gatewayUrl, setGatewayUrl] = useState<string>(() => whatsappClient.getGatewayUrl());
  const [soundboxEnabled, setSoundboxEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('mms_soundbox_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langFont = getLanguageFontClass(currentLanguage);

  // Change Password Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<User | null>(null);
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [showPassText, setShowPassText] = useState(false);

  // New Operator Form state
  const [newOpName, setNewOpName] = useState('');
  const [newOpUsername, setNewOpUsername] = useState('');
  const [newOpPassword, setNewOpPassword] = useState('123');
  const [newOpRole, setNewOpRole] = useState<'operator' | 'admin'>('operator');

  const handleOpenChangePassword = (userToEdit?: User) => {
    const target = userToEdit || users.find(u => u.username === 'sultan') || users[0];
    setSelectedUserForPassword(target);
    setNewPassInput('');
    setConfirmPassInput('');
    setShowPassText(false);
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword) return;

    if (!newPassInput.trim()) {
      alert('Please enter a new password');
      return;
    }

    if (newPassInput !== confirmPassInput) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }

    const success = db.updateUserPassword(selectedUserForPassword.id, newPassInput.trim());
    if (success) {
      setUsers(db.getUsers());
      setIsPasswordModalOpen(false);
      onSuccessToast(`🔑 Password for ${selectedUserForPassword.name} (@${selectedUserForPassword.username}) updated & synced to database!`);
      onRefreshAll();
    } else {
      alert('Failed to update password');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Only Administrators can update system settings.');
      return;
    }
    db.updateSettings(settings);
    whatsappClient.setGatewayUrl(gatewayUrl);
    localStorage.setItem('mms_soundbox_enabled', String(soundboxEnabled));

    if (onChangeLanguage && settings.language) {
      onChangeLanguage(settings.language);
    }
    onSuccessToast('System settings & gateway configuration updated successfully!');
    onRefreshAll();
  };

  const handleDownloadBackup = () => {
    if (!isAdmin) {
      alert('Only Administrators can export full system backups.');
      return;
    }
    const jsonString = db.generateBackupJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `nevta_backup_sultan_${dateStr}.nvbackup`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onSuccessToast('Backup downloaded successfully (.nvbackup)!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      alert('Only Administrators can restore database backups.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = db.restoreBackupJson(content);
        if (success) {
          onSuccessToast('System restored successfully from backup file!');
          onRefreshAll();
        } else {
          alert('Failed to restore. Please check if the file is a valid .nvbackup or JSON file.');
        }
      } catch (err) {
        alert('Invalid backup file format');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetDefaults = () => {
    if (!isAdmin) {
      alert('Only Administrators can reset the database.');
      return;
    }
    if (confirm('Are you sure you want to reset the database to Sultan demo wedding dataset? All unsaved current records will be replaced.')) {
      db.resetToDefaults();
      onSuccessToast('Database reset to Sultan demonstration dataset.');
      onRefreshAll();
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!newOpName.trim() || !newOpUsername.trim()) {
      alert('Please fill out Name and Username');
      return;
    }

    db.addUser({
      name: newOpName.trim(),
      username: newOpUsername.trim().toLowerCase(),
      role: newOpRole,
      password: newOpPassword || '123'
    });

    setUsers(db.getUsers());
    setNewOpName('');
    setNewOpUsername('');
    setNewOpPassword('123');
    onSuccessToast(`User @${newOpUsername.toLowerCase()} created successfully!`);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (!isAdmin) return;
    if (id === currentUser?.id) {
      alert('You cannot delete your own active administrator account.');
      return;
    }
    if (confirm(`Are you sure you want to delete user account "${name}"?`)) {
      db.deleteUser(id);
      setUsers(db.getUsers());
      onSuccessToast(`User ${name} deleted.`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-16 royal-glass rounded-3xl p-8 border-2 border-red-500/40 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-xl">
        <ShieldAlert className="w-12 h-12 text-red-600 dark:text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold font-cinzel">Administrator Access Required</h2>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">Backup export, system restore, and staff management are restricted to Super Admin (Sultan).</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      
      {/* Header Bar */}
      <div className="royal-glass rounded-3xl p-6 border-2 border-amber-500/40 bg-white dark:bg-neutral-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-[#064E3B] dark:text-emerald-300 border border-emerald-500/40 font-outfit">
              Super Admin Authority
            </span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold">Ledger Security & Data Management</span>
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 font-cinzel">
            Database Backup & Staff Management
          </h2>
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/15 dark:hover:bg-red-500/25 border border-red-300 dark:border-red-500/40 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset to Sultan Demo Data</span>
        </button>
      </div>

      {/* Staff Accounts Management */}
      <div className="royal-glass rounded-3xl p-6 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 space-y-4 shadow-md">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 font-cinzel flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Authorized Counter Operators & Admins
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenChangePassword()}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              <span>🔑 Change Admin Password</span>
            </button>
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">{users.length} Active Accounts</span>
          </div>
        </div>

        {/* Existing Users List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map(u => (
            <div 
              key={u.id} 
              className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs hover:border-amber-500/40 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-900 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                  {u.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-extrabold text-neutral-900 dark:text-neutral-100">{u.name}</p>
                  <p className="text-[10px] text-neutral-600 dark:text-neutral-400">@{u.username} • Pass: {u.password || '123'}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  u.role === 'admin' 
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30' 
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                }`}>
                  {u.role}
                </span>
                
                {/* Change Password Button */}
                <button
                  type="button"
                  onClick={() => handleOpenChangePassword(u)}
                  className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-500/15 dark:text-amber-400 transition-all cursor-pointer"
                  title={`Change password for ${u.name}`}
                >
                  <Key className="w-3.5 h-3.5" />
                </button>

                {u.id !== currentUser?.id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u.id, u.name)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 transition-all cursor-pointer"
                    title="Delete User"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Operator Form */}
        <form onSubmit={handleCreateUser} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 space-y-3 pt-3">
          <p className="text-xs font-bold text-neutral-900 dark:text-neutral-200 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Add New Counter Staff / Admin Account:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <input
              type="text"
              value={newOpName}
              onChange={(e) => setNewOpName(e.target.value)}
              placeholder="Staff Full Name"
              required
              className="royal-input text-xs"
            />
            <input
              type="text"
              value={newOpUsername}
              onChange={(e) => setNewOpUsername(e.target.value)}
              placeholder="Username (e.g. imran)"
              required
              className="royal-input text-xs"
            />
            <input
              type="text"
              value={newOpPassword}
              onChange={(e) => setNewOpPassword(e.target.value)}
              placeholder="Password"
              required
              className="royal-input text-xs"
            />
            <div className="flex gap-2">
              <select
                value={newOpRole}
                onChange={(e) => setNewOpRole(e.target.value as any)}
                className="royal-input text-xs"
              >
                <option value="operator">Operator</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="gold-gradient-btn px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap cursor-pointer shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Backup & Restore Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Download Backup */}
        <div className="royal-glass rounded-3xl p-6 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 flex flex-col justify-between space-y-4 shadow-md">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-900 dark:text-amber-300 mb-3 font-bold">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 font-cinzel">
              Export System Backup (.nvbackup)
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
              Download a complete JSON snapshot containing all events, guests, transactions, gifts, families, and audit logs.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full gold-gradient-btn py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download .nvbackup Snapshot</span>
          </button>
        </div>

        {/* Restore Backup */}
        <div className="royal-glass rounded-3xl p-6 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 flex flex-col justify-between space-y-4 shadow-md">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-900 dark:text-emerald-300 mb-3 font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 font-cinzel">
              Restore System Snapshot
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-medium">
              Upload a previously saved <code className="text-amber-800 dark:text-amber-300 font-bold font-mono">.nvbackup</code> file to restore all event records and ledgers.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".nvbackup,.json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-300 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>Select File & Restore</span>
            </button>
          </div>
        </div>

      </div>

      {/* System Settings Form */}
      <div className="royal-glass rounded-3xl p-6 border border-neutral-300 dark:border-amber-500/20 bg-white dark:bg-neutral-950 space-y-5 shadow-md">
        <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 flex items-center justify-between">
          <h3 className="text-base font-black text-neutral-900 dark:text-neutral-100 font-cinzel flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            System Configuration & Language Preferences
          </h3>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Sultan Active Profile
          </span>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="form-label">
                Master Family Name
              </label>
              <input
                type="text"
                value={settings.family_name}
                onChange={(e) => setSettings({ ...settings, family_name: e.target.value })}
                className="royal-input"
              />
            </div>

            <div>
              <label className="form-label">
                Default App Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value as any })}
                className="royal-input"
              >
                <option value="en">English (Default)</option>
                <option value="hi">हिंदी (Devanagari)</option>
                <option value="ur">اردو (Urdu Nastaliq)</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Default Currency Symbol
              </label>
              <input
                type="text"
                value={settings.currency_symbol}
                onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                className="royal-input"
              />
            </div>

            <div>
              <label className="form-label">
                Default Home Village
              </label>
              <input
                type="text"
                value={settings.default_village}
                onChange={(e) => setSettings({ ...settings, default_village: e.target.value })}
                className="royal-input"
              />
            </div>

            {/* Host UPI ID */}
            <div>
              <label className="form-label flex items-center justify-between">
                <span>Host UPI ID (फंड प्राप्त करने के लिए)</span>
                <span className="text-[10px] text-emerald-600 font-bold">QR Auto-Generated</span>
              </label>
              <input
                type="text"
                value={settings.upi_id || ''}
                onChange={(e) => setSettings({ ...settings, upi_id: e.target.value })}
                placeholder="e.g. sultan.family@okaxis or 9876543210@paytm"
                className="royal-input font-mono"
              />
            </div>

            {/* Host UPI Payee Name */}
            <div>
              <label className="form-label">
                UPI Payee Account Name
              </label>
              <input
                type="text"
                value={settings.upi_payee_name || ''}
                onChange={(e) => setSettings({ ...settings, upi_payee_name: e.target.value })}
                placeholder="e.g. Sultan Salahuddin & Family"
                className="royal-input"
              />
            </div>

            {/* WhatsApp Gateway Server URL */}
            <div>
              <label className="form-label flex items-center justify-between">
                <span>WhatsApp Gateway Server URL (Local / Ngrok / Cloud)</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">Auto-Send Mode</span>
              </label>
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="http://localhost:5001/api/whatsapp or https://xxxx.ngrok-free.app"
                className="royal-input font-mono text-xs"
              />
              <p className="text-[10px] text-neutral-500 mt-1">
                For Live Vercel, run <code className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">ngrok http 5001</code> on PC and paste ngrok URL here.
              </p>
            </div>

            {/* Wedding Counter Soundbox Voice Announcement */}
            <div>
              <label className="form-label flex items-center justify-between">
                <span>Wedding Counter Soundbox (बोलकर सुनाने वाला साउंडबॉक्स)</span>
                <button
                  type="button"
                  onClick={() => {
                    soundboxService.testSoundbox();
                    onSuccessToast('📢 Testing Soundbox Announcement...');
                  }}
                  className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold underline cursor-pointer"
                >
                  📢 Test Voice
                </button>
              </label>
              <div className="flex items-center gap-3 mt-1.5 p-3 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <input
                  type="checkbox"
                  id="soundboxEnabledCheck"
                  checked={soundboxEnabled}
                  onChange={(e) => setSoundboxEnabled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="soundboxEnabledCheck" className="text-xs font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer">
                  Enable Voice Announcements on Counter Entry (Paytm/Soundbox style)
                </label>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="submit"
              className="gold-gradient-btn px-6 py-2.5 rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* 🔑 Change Password Modal */}
      {isPasswordModalOpen && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="royal-glass w-full max-w-md rounded-3xl border-2 border-amber-500/50 shadow-2xl p-6 sm:p-7 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-cinzel text-neutral-900 dark:text-neutral-100">
                    Change User Password
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                    Update credentials & sync to Supabase cloud
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target User Info Badge */}
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500">Account:</span>
                <p className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">
                  {selectedUserForPassword.name}
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-mono">
                  Username: @{selectedUserForPassword.username}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                selectedUserForPassword.role === 'admin'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300'
              }`}>
                {selectedUserForPassword.role}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="form-label flex items-center justify-between">
                  <span>New Password (नया पासवर्ड)</span>
                  <button
                    type="button"
                    onClick={() => setShowPassText(!showPassText)}
                    className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1 font-bold cursor-pointer"
                  >
                    {showPassText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassText ? 'Hide' : 'Show'}</span>
                  </button>
                </label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="Enter secret new password"
                  required
                  className="royal-input text-xs"
                />
              </div>

              <div>
                <label className="form-label">
                  Confirm Password (पासवर्ड दोबारा डालें)
                </label>
                <input
                  type={showPassText ? 'text' : 'password'}
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  placeholder="Re-enter password to verify"
                  required
                  className="royal-input text-xs"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-neutral-500 font-bold">Quick suggestions:</span>
                <button
                  type="button"
                  onClick={() => {
                    setNewPassInput('sultan@123');
                    setConfirmPassInput('sultan@123');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 hover:border-amber-500"
                >
                  sultan@123
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewPassInput('123456');
                    setConfirmPassInput('123456');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 hover:border-amber-500"
                >
                  123456
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewPassInput('admin@2027');
                    setConfirmPassInput('admin@2027');
                  }}
                  className="px-2 py-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-[10px] font-bold text-neutral-700 dark:text-neutral-300 hover:border-amber-500"
                >
                  admin@2027
                </button>
              </div>

              <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-gradient-btn px-5 py-2 rounded-xl text-xs font-extrabold shadow-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update & Sync Password</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
