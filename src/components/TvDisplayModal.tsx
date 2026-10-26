import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  X, 
  Crown, 
  Maximize2, 
  Minimize2, 
  Sparkles, 
  QrCode, 
  Users, 
  Heart,
  PartyPopper
} from 'lucide-react';
import { Event, Ceremony, Guest, Transaction } from '../types';
import { db } from '../services/db';
import { generateUpiQrDataUrl } from '../utils/upiQr';

interface TvDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEvent: Event;
  activeCeremony?: Ceremony;
}

export const TvDisplayModal: React.FC<TvDisplayModalProps> = ({
  isOpen,
  onClose,
  activeEvent,
  activeCeremony
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [recentGuests, setRecentGuests] = useState<Guest[]>([]);
  const settings = db.getSettings();

  useEffect(() => {
    if (!isOpen) return;

    // Generate static/standing QR for TV Screen
    generateUpiQrDataUrl({
      upiId: settings.upi_id || 'sultan.family@okaxis',
      payeeName: settings.upi_payee_name || activeEvent.host_name,
      amount: 0, // Open amount for general shagun
      transactionNote: 'Wedding Shagun'
    }).then(url => setQrUrl(url)).catch(() => {});

    // Fetch recent guests
    const allGuests = db.getGuests();
    setRecentGuests(allGuests.slice(0, 15));
  }, [isOpen, activeEvent, settings]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950 text-white flex flex-col overflow-hidden animate-fadeIn select-none font-outfit">
      
      {/* Background Royal Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-amber-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Floating Control Bar */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFullscreen}
          className="p-2.5 rounded-2xl bg-neutral-900/80 hover:bg-neutral-800 text-amber-400 border border-amber-500/30 transition-all cursor-pointer shadow-lg"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="p-2.5 rounded-2xl bg-neutral-900/80 hover:bg-rose-900/80 text-neutral-300 hover:text-white border border-neutral-700 transition-all cursor-pointer shadow-lg"
          title="Exit TV Mode"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Stage Content */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 z-10 max-w-7xl mx-auto w-full">
        
        {/* Top Header: Royal Crest & Wedding Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-400/40 shadow-xl backdrop-blur-md">
            <Crown className="w-6 h-6 text-amber-400 animate-pulse" />
            <span className="text-sm font-extrabold uppercase tracking-widest text-amber-300 font-cinzel">
              Royal Wedding Reception & Nevta Counter
            </span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>

          <h1 className="text-4xl sm:text-6xl font-black font-cinzel tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 drop-shadow-2xl">
            {activeEvent.name}
          </h1>

          <p className="text-base sm:text-xl text-neutral-300 font-semibold max-w-3xl mx-auto">
            Host: <strong className="text-amber-300">{activeEvent.host_name}</strong> • Venue: {activeEvent.venue}
          </p>
        </div>

        {/* Center Grid: Left Side QR Code • Right Side Celebration Live Welcome */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center py-6">
          
          {/* Left: Standing Live UPI QR Code */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border-2 border-amber-500/50 shadow-2xl backdrop-blur-xl text-center space-y-4 max-w-sm w-full">
              <div className="flex items-center justify-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider">
                <QrCode className="w-5 h-5" />
                <span>Scan & Pay Shagun (UPI)</span>
              </div>

              <div className="p-4 rounded-2xl bg-white shadow-2xl inline-block border-4 border-amber-400">
                {qrUrl ? (
                  <img src={qrUrl} alt="UPI QR" className="w-56 h-56 object-contain mx-auto rounded-lg" />
                ) : (
                  <div className="w-56 h-56 flex items-center justify-center text-neutral-400">Loading QR...</div>
                )}
              </div>

              <div>
                <p className="text-xs text-neutral-400 font-bold uppercase">GPay • PhonePe • Paytm • BHIM</p>
                <p className="text-xs text-amber-300 font-mono font-bold mt-1">{settings.upi_id || 'sultan.family@okaxis'}</p>
              </div>
            </div>
          </div>

          {/* Right: Live Welcome & Warm Blessings Showcase */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Active Ceremony Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-transparent border border-amber-500/30 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <PartyPopper className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">Current Ceremony</span>
                  <h3 className="text-2xl sm:text-3xl font-black font-cinzel text-neutral-100">
                    {activeCeremony?.name || 'Nikah & Reception Celebration'}
                  </h3>
                </div>
              </div>
            </div>

            {/* Total Mehmaan Counter */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 text-center">
                <Users className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                <span className="text-xs text-neutral-400 font-bold uppercase">Total Guests Welcomed</span>
                <p className="text-3xl sm:text-4xl font-black text-amber-400 font-cinzel mt-1">
                  {recentGuests.length}+
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-neutral-900/80 border border-neutral-800 text-center">
                <Heart className="w-6 h-6 text-rose-400 mx-auto mb-1" />
                <span className="text-xs text-neutral-400 font-bold uppercase">Aagman & Blessings</span>
                <p className="text-3xl sm:text-4xl font-black text-rose-400 font-cinzel mt-1">
                  100%
                </p>
              </div>
            </div>

            {/* Warm Welcome Note */}
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
              <p className="text-base sm:text-lg font-bold text-amber-200">
                "आप सभी आदरणीय अतिथियों का शादी समारोह में हार्दिक स्वागत एवं अभिनन्दन है!"
              </p>
              <p className="text-xs text-neutral-400 font-semibold">
                — {activeEvent.host_name}
              </p>
            </div>

          </div>

        </div>

        {/* Bottom Live Welcome Marquee Ticker */}
        <div className="w-full bg-neutral-900/90 border border-amber-500/30 rounded-2xl py-3 px-4 overflow-hidden backdrop-blur-md shadow-2xl flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-amber-500 text-neutral-950 text-xs font-black uppercase tracking-wider shrink-0">
            👑 Live Welcome:
          </div>

          <div className="overflow-hidden whitespace-nowrap flex-1">
            <div className="inline-block animate-marquee text-sm font-bold text-amber-200 space-x-8">
              {recentGuests.map((g, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5">
                  <span className="text-amber-400">✦</span>
                  <span>Swagat: <strong>{g.name}</strong> {g.village ? `(${g.village})` : ''}</span>
                </span>
              ))}
              <span>✦ Sultan Family welcomes all prestigious guests and relatives with warm greetings & blessings!</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
