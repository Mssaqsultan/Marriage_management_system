import React, { useState } from 'react';
import { 
  Crown, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  Sun, 
  Moon, 
  Key, 
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { User, ThemeMode } from '../types';
import { db } from '../services/db';
import { cloudSync } from '../services/supabaseSync';
import { t, getLanguageFontClass } from '../utils/i18n';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  currentLanguage?: 'en' | 'hi' | 'ur';
  onChangeLanguage?: (lang: 'en' | 'hi' | 'ur') => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  theme,
  onToggleTheme,
  currentLanguage = 'en',
  onChangeLanguage
}) => {
  const [username, setUsername] = useState<string>('sultan');
  const [password, setPassword] = useState<string>('123');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [usersList, setUsersList] = useState<User[]>(() => db.getUsers());
  const langFont = getLanguageFontClass(currentLanguage);

  // Auto-sync users from Supabase Cloud on mount
  React.useEffect(() => {
    cloudSync.pullFromCloud().then((success) => {
      if (success) {
        setUsersList(db.getUsers());
      }
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter username');
      return;
    }

    const user = db.login(username.trim(), password);
    if (!user) {
      setErrorMsg(`Invalid username or password for "${username.trim()}". Please check your credentials.`);
      return;
    }

    onLoginSuccess(user);
  };

  const handleSelectUser = (u: User) => {
    setErrorMsg('');
    setUsername(u.username);
    setPassword(u.password || '123');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between items-center p-4 sm:p-6 transition-colors duration-300 ${langFont}`}>
      
      {/* Top Bar with Theme & Language Switcher */}
      <header className="w-full max-w-6xl flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 shadow-md">
            <Crown className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-extrabold font-cinzel text-neutral-900 dark:text-neutral-100 tracking-wider">
              NEVTA <span className="gold-gradient-text font-black">{t('app.title', currentLanguage).split(' ')[1] || 'PORTAL'}</span>
            </h1>
            <p className="text-[10px] text-neutral-600 dark:text-neutral-400 font-outfit font-semibold">{t('app.subtitle', currentLanguage)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          {onChangeLanguage && (
            <div className="flex items-center bg-white/80 dark:bg-neutral-900/80 border border-neutral-300 dark:border-amber-500/30 rounded-xl p-0.5 text-xs font-bold shadow-md">
              <button
                onClick={() => onChangeLanguage('en')}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  currentLanguage === 'en' ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-black' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onChangeLanguage('hi')}
                className={`px-2 py-1 rounded-lg font-devanagari transition-all cursor-pointer ${
                  currentLanguage === 'hi' ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-black' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                हिं
              </button>
              <button
                onClick={() => onChangeLanguage('ur')}
                className={`px-2 py-1 rounded-lg font-urdu transition-all cursor-pointer ${
                  currentLanguage === 'ur' ? 'bg-amber-500/20 text-purple-900 dark:text-amber-300 border border-amber-500/40 font-black' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                }`}
              >
                اردو
              </button>
            </div>
          )}

          <button
            onClick={onToggleTheme}
            className="px-3.5 py-2 rounded-xl royal-glass border border-neutral-300 dark:border-amber-500/30 text-xs font-bold flex items-center gap-2 text-neutral-800 dark:text-neutral-200 hover:border-amber-500 transition-all shadow-md cursor-pointer"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'royal-dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-700" />
                <span className="hidden sm:inline font-bold">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Center Box: Login Card */}
      <div className="w-full max-w-4xl my-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Login Form (7 cols) */}
        <div className="lg:col-span-7 royal-glass rounded-3xl p-6 sm:p-8 border-2 border-amber-500/40 shadow-2xl flex flex-col justify-between bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-500/40 font-outfit">
                {t('app.secure_gate', currentLanguage)}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono font-bold">{t('app.rbac', currentLanguage)}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-cinzel text-neutral-900 dark:text-neutral-100 mb-2">
              {t('app.login_title', currentLanguage)}
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-6 font-medium">
              {t('app.login_desc', currentLanguage)}
            </p>

            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-100 dark:bg-red-500/15 border border-red-300 dark:border-red-500/40 text-red-900 dark:text-red-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Username Input */}
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {t('common.username', currentLanguage)}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. sultan, operator"
                  required
                  className="royal-input"
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {t('common.password', currentLanguage)}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret passcode"
                  required
                  className="royal-input"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full gold-gradient-btn py-3 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 cursor-pointer"
              >
                <span>{t('common.login', currentLanguage)}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
            <span>{t('app.identity', currentLanguage)}</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{t('app.encrypted_local', currentLanguage)}</span>
          </div>
        </div>

        {/* Right Side: Quick One-Click Demo Role Badges (5 cols) */}
        <div className="lg:col-span-5 royal-glass rounded-3xl p-6 sm:p-7 border border-neutral-300 dark:border-amber-500/20 shadow-xl flex flex-col justify-between space-y-6 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-black uppercase tracking-wider font-outfit text-neutral-900 dark:text-neutral-200">
                {t('app.quick_role_switch', currentLanguage)}
              </h3>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4 font-medium">
              {t('app.quick_role_desc', currentLanguage)}
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {usersList.map((u) => {
                const isSelected = username.toLowerCase() === u.username.toLowerCase();
                const isAdmin = u.role === 'admin';
                return (
                  <div 
                    key={u.id}
                    onClick={() => handleSelectUser(u)}
                    className={`p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/80 border-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md group ${
                      isSelected 
                        ? (isAdmin ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-emerald-500 ring-2 ring-emerald-500/30')
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl font-black ${
                          isAdmin 
                            ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300' 
                            : 'bg-emerald-500/20 text-emerald-900 dark:text-emerald-300'
                        }`}>
                          {isAdmin ? <Crown className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-neutral-900 dark:text-neutral-100 group-hover:text-amber-700 dark:group-hover:text-amber-300">
                            {u.name}
                          </h4>
                          <p className="text-[10px] text-neutral-500 font-mono">user: {u.username} • pass: {u.password || '123'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          isAdmin 
                            ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300' 
                            : 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300'
                        }`}>
                          {isAdmin ? (t('app.super_admin', currentLanguage) || 'Admin') : (t('app.staff', currentLanguage) || 'Operator')}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
                      {isAdmin 
                        ? 'Full master control: celebrations, backups, deletions & staff credentials.' 
                        : 'Fast counter entry, instant print receipts, live summary.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-400 font-medium">
            💡 <strong>Cloud Synced Accounts:</strong> Credentials created by Super Admin are securely synced to Supabase database.
          </div>
        </div>

      </div>

      {/* Footer Branding */}
      <footer className="w-full max-w-6xl text-center py-2 text-xs text-neutral-500 font-medium">
        {t('app.footer', currentLanguage)}
      </footer>

    </div>
  );
};
