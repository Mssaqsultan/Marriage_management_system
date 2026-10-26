import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  UserCheck, 
  Plus, 
  IndianRupee, 
  Gift as GiftIcon, 
  CheckCircle2, 
  CreditCard,
  Keyboard,
  Search,
  Languages,
  Eye,
  Printer,
  Calendar,
  MapPin,
  HeartHandshake,
  QrCode,
  Award,
  Crown,
  PartyPopper,
  MessageSquare,
  Send,
  X,
  Share2,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Event, Guest, RelationType, SideType, PaymentMethod, GiftCategory, User, Ceremony } from '../types';
import { db } from '../services/db';
import { TransliteratedInput } from './TransliteratedInput';
import { getTransliterations, detectScript } from '../utils/transliteration';
import { t, getLanguageFontClass } from '../utils/i18n';
import { 
  WhatsAppReceiptData, 
  generateWhatsAppReceiptMessage 
} from '../utils/whatsappReceipt';
import { parseVoiceTranscript, soundboxService } from '../utils/voiceAssistant';
import { WhatsAppReceiptModal } from './WhatsAppReceiptModal';
import { DynamicUpiQrModal } from './DynamicUpiQrModal';

interface QuickEntryProps {
  activeEvent: Event;
  ceremonies?: Ceremony[];
  activeCeremony?: Ceremony;
  onSelectCeremony?: (ceremonyId: string) => void;
  currentUser?: User | null;
  onClose?: () => void;
  onSuccessToast: (msg: string) => void;
  currentLanguage?: 'en' | 'hi' | 'ur';
}

const RELATIONS: RelationType[] = [
  'Mama', 'Mami', 'Chacha', 'Chachi', 'Tau', 'Tai', 'Fufa', 'Bua', 
  'Brother', 'Sister', 'Father', 'Mother', 'Cousin', 'Mausera', 
  'Friend', 'Neighbor', 'Business Partner', 'Relative', 'Other'
];

const SIDES: SideType[] = ['Groom Side', 'Bride Side', 'Host Side', 'Other'];
const PAYMENT_METHODS: PaymentMethod[] = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];
const GIFT_CATEGORIES: GiftCategory[] = [
  'Clothing', 'Jewellery', 'Electronics', 'Utensils', 'Dry Fruits', 'Food', 'Home Decor', 'Cash Envelope', 'Other'
];

export const QuickEntry: React.FC<QuickEntryProps> = ({
  activeEvent,
  ceremonies = [],
  activeCeremony,
  onSelectCeremony,
  currentUser,
  onClose,
  onSuccessToast,
  currentLanguage = 'en'
}) => {
  const langFont = getLanguageFontClass(currentLanguage);
  const [selectedGuestId, setSelectedGuestId] = useState<string>('');
  const [guestSearchQuery, setGuestSearchQuery] = useState<string>('');
  const [isNewGuestMode, setIsNewGuestMode] = useState<boolean>(true);

  // Guest fields
  const [name, setName] = useState<string>('');
  const [fatherName, setFatherName] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [village, setVillage] = useState<string>('');
  const [relation, setRelation] = useState<RelationType>('Relative');
  const [side, setSide] = useState<SideType>('Groom Side');
  const [familyId, setFamilyId] = useState<string>('');
  const [guestNotes, setGuestNotes] = useState<string>('');

  // Transaction fields
  const [nevtaAmount, setNevtaAmount] = useState<string>('');
  const [nahuchuaAmount, setNahuchuaAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [txnNotes, setTxnNotes] = useState<string>('');

  // Gift fields
  const [hasGift, setHasGift] = useState<boolean>(false);
  const [giftItemName, setGiftItemName] = useState<string>('');
  const [giftCategory, setGiftCategory] = useState<GiftCategory>('Clothing');
  const [giftQuantity, setGiftQuantity] = useState<number>(1);
  const [giftEstimatedValue, setGiftEstimatedValue] = useState<string>('');
  const [giftCondition, setGiftCondition] = useState<string>('New Box');

  // Duplicates state
  const [duplicates, setDuplicates] = useState<Guest[]>([]);
  const [ignoreDuplicateWarning, setIgnoreDuplicateWarning] = useState<boolean>(false);

  // WhatsApp Post-Save Modal State
  const [waModalData, setWaModalData] = useState<WhatsAppReceiptData | null>(null);
  const [isUpiModalOpen, setIsUpiModalOpen] = useState<boolean>(false);
  const [lastSavedGuest, setLastSavedGuest] = useState<{ name: string; amount: number } | null>(null);
  
  // Voice Assistant & Soundbox State
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-IN' | 'ur-PK'>('hi-IN');
  const [soundboxEnabled, setSoundboxEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('mms_soundbox_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const appSettings = db.getSettings();
  const [customWaMobile, setCustomWaMobile] = useState<string>('');

  const totalAmount = (parseFloat(nevtaAmount) || 0) + (parseFloat(nahuchuaAmount) || 0);

  const families = db.getFamilies();
  const allGuests = db.getGuests();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const nevtaInputRef = useRef<HTMLInputElement>(null);

  // Dynamic live transliterations for preview
  const nameTranslit = getTransliterations(name);
  const nameScript = detectScript(name);

  // Duplicate checker effect
  useEffect(() => {
    if (isNewGuestMode && name.trim().length >= 3) {
      const found = db.checkDuplicates(name, mobile, village);
      setDuplicates(found);
    } else {
      setDuplicates([]);
    }
  }, [name, mobile, village, isNewGuestMode]);

  // Keyboard shortcut listener (Ctrl+S / Cmd+S to Save & New)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const resetForm = () => {
    setSelectedGuestId('');
    setGuestSearchQuery('');
    setIsNewGuestMode(true);
    setName('');
    setFatherName('');
    setMobile('');
    setVillage('');
    setRelation('Relative');
    setSide('Groom Side');
    setFamilyId('');
    setGuestNotes('');

    setNevtaAmount('');
    setNahuchuaAmount('');
    setPaymentMethod('Cash');
    setPaymentRef('');
    setTxnNotes('');

    setHasGift(false);
    setGiftItemName('');
    setGiftCategory('Clothing');
    setGiftQuantity(1);
    setGiftEstimatedValue('');
    setGiftCondition('New Box');

    setDuplicates([]);
    setIgnoreDuplicateWarning(false);

    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  };

  // 🎙️ Voice-Assisted Speech Recognition
  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge on HTTPS / localhost.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListeningVoice(true);
        setVoiceStatusText('🎙️ Listening... साफ़ आवाज़ में बोलिए (उदा: "मोहम्मद असलम, 2100 रुपये, कैश, चौरीया खास")');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceStatusText(`✅ सुना: "${transcript}"`);
        parseAndApplyVoice(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech error:', event.error);
        setIsListeningVoice(false);
        if (event.error === 'not-allowed') {
          setVoiceStatusText('⚠️ Microphone permission blocked. Please allow mic in browser address bar (🔒 icon).');
          onSuccessToast('⚠️ Microphone permission blocked. Please allow mic access in your browser.');
        } else if (event.error === 'no-speech') {
          setVoiceStatusText('⚠️ कोई आवाज़ नहीं सुनाई दी। दोबारा माइक दबाकर बोलिए।');
        } else if (event.error === 'network') {
          setVoiceStatusText('⚠️ Network error during speech recognition. Ensure active internet.');
        } else {
          setVoiceStatusText(`⚠️ Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListeningVoice(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListeningVoice(false);
      setVoiceStatusText(`⚠️ Microphone error: ${err.message || 'Check browser permissions'}`);
    }
  };

  const parseAndApplyVoice = (text: string) => {
    const knownVillages = Array.from(new Set(allGuests.map(g => g.village).filter(Boolean))) as string[];
    const parsed = parseVoiceTranscript(text, knownVillages);

    if (parsed.guestName && parsed.guestName !== 'Guest') {
      setName(parsed.guestName);
    }
    if (parsed.amount !== null && parsed.amount > 0) {
      if (parsed.type === 'nahuchua') {
        setNahuchuaAmount(String(parsed.amount));
      } else {
        setNevtaAmount(String(parsed.amount));
      }
    }
    if (parsed.paymentMethod) {
      setPaymentMethod(parsed.paymentMethod);
    }
    if (parsed.village) {
      setVillage(parsed.village);
    }

    onSuccessToast(`🎙️ Voice parsed: "${parsed.guestName}" ${parsed.amount ? `₹${parsed.amount}` : ''} (${parsed.paymentMethod})`);
    setTimeout(() => {
      nevtaInputRef.current?.focus();
    }, 250);
  };

  const handleSelectExistingGuest = (guest: Guest) => {
    setSelectedGuestId(guest.id);
    setIsNewGuestMode(false);
    setName(guest.name);
    setFatherName(guest.father_husband_name || '');
    setMobile(guest.mobile || '');
    setVillage(guest.village || '');
    setRelation(guest.relation);
    setSide(guest.side);
    setFamilyId(guest.family_id || '');
    setGuestNotes(guest.notes || '');
    setDuplicates([]);
    setIgnoreDuplicateWarning(true);

    if (nevtaInputRef.current) {
      nevtaInputRef.current.focus();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isNewGuestMode && !name.trim()) {
      alert('Please enter Guest Full Name');
      return;
    }

    const nevtaNum = parseFloat(nevtaAmount) || 0;
    const nahuchuaNum = parseFloat(nahuchuaAmount) || 0;
    const giftValueNum = parseFloat(giftEstimatedValue) || 0;

    if (nevtaNum <= 0 && nahuchuaNum <= 0 && !hasGift) {
      alert('Please enter Nevta Amount, Nahuchua Amount, or a Gift item');
      return;
    }

    let guestIdToUse = selectedGuestId;

    // Create new guest if needed
    if (isNewGuestMode) {
      const createdGuest = db.addGuest({
        name: name.trim(),
        father_husband_name: fatherName.trim() || undefined,
        mobile: mobile.trim() || undefined,
        village: village.trim() || 'Chauriya khas',
        relation,
        side,
        family_id: familyId || undefined,
        notes: guestNotes.trim() || undefined
      });
      guestIdToUse = createdGuest.id;
    }

    const targetCeremonyId = activeCeremony?.id || ceremonies[0]?.id;

    // Record Nevta transaction
    if (nevtaNum > 0) {
      db.addTransaction({
        event_id: activeEvent.id,
        ceremony_id: targetCeremonyId,
        guest_id: guestIdToUse,
        type: 'nevta',
        amount: Math.round(nevtaNum),
        payment_method: paymentMethod,
        payment_reference: paymentRef.trim() || undefined,
        transaction_date: new Date().toISOString(),
        notes: txnNotes.trim() || undefined,
        created_by: currentUser?.name || 'Sultan Salahuddin'
      });
    }

    // Record physical gift if entered
    if (hasGift && giftItemName.trim()) {
      db.addGift({
        event_id: activeEvent.id,
        ceremony_id: activeCeremony?.id || activeEvent.id,
        guest_id: guestIdToUse,
        item_name: giftItemName.trim(),
        category: giftCategory,
        quantity: 1,
        estimated_value: Math.round(giftValueNum),
        condition: 'New Box',
        notes: txnNotes.trim() || undefined
      });
    }

    const receiptId = `NVT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiptData: WhatsAppReceiptData = {
      guestName: name.trim(),
      fatherName: fatherName.trim() || undefined,
      mobile: mobile.trim() || '',
      village: village.trim() || 'Chauriya khas',
      nevtaAmount: Math.round(nevtaNum),
      nahuchuaAmount: Math.round(nahuchuaNum),
      giftItemName: (hasGift && giftItemName.trim()) ? giftItemName.trim() : undefined,
      totalCash: Math.round(nevtaNum + nahuchuaNum),
      paymentMethod: paymentMethod,
      paymentRef: paymentRef.trim() || undefined,
      receiptId: receiptId,
      eventName: activeEvent.name,
      ceremonyName: activeCeremony?.name || activeEvent.name,
      hostName: activeEvent.host_name || activeEvent.name,
      venue: activeEvent.venue,
      relation: relation,
      side: side
    };

    // If mobile number was provided, prepare and open WhatsApp receipt modal
    if (mobile.trim()) {
      setWaModalData(receiptData);
    }

    // Trigger celebration effects
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#F59E0B', '#10B981', '#EAB308', '#8B5CF6']
    });

    // 🔊 Voice Soundbox Live Audio Announcement (Paytm style voice for wedding counter)
    if (soundboxEnabled && (nevtaNum > 0 || nahuchuaNum > 0)) {
      soundboxService.announceTransaction(
        name.trim(),
        Math.round(nevtaNum + nahuchuaNum),
        nevtaNum > 0 ? 'nevta' : 'nahuchua',
        activeCeremony?.name
      );
    }

    setLastSavedGuest({ name: name.trim(), amount: Math.round(nevtaNum + nahuchuaNum) });
    onSuccessToast(`Saved entry for "${name}" (₹${Math.round(nevtaNum + nahuchuaNum)})`);
    resetForm();
  };

  const filteredGuests = allGuests.filter(g => {
    if (!guestSearchQuery) return false;
    const q = guestSearchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || (g.mobile && g.mobile.includes(q)) || (g.village && g.village.toLowerCase().includes(q));
  }).slice(0, 5);

  const parsedNevta = parseFloat(nevtaAmount) || 0;
  const parsedNahuchua = parseFloat(nahuchuaAmount) || 0;
  const totalCashAmount = parsedNevta + parsedNahuchua;
  const parsedGiftValue = parseFloat(giftEstimatedValue) || 0;

  return (
    <div className={`max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16 ${langFont}`}>
      
      {/* Top Banner with Active Celebration & Ceremony Selector */}
      <div className="royal-glass rounded-2xl p-6 border-amber-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-amber-500/10 text-[#78350F] dark:text-amber-300 border-2 border-amber-500/60 font-outfit shadow-sm">
              {t('counter.badge', currentLanguage)}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-white dark:bg-neutral-900 text-[#78350F] dark:text-amber-300 border-2 border-amber-600 dark:border-amber-500/70 shadow-sm font-cinzel">
              👑 {activeEvent.name}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100 font-cinzel flex items-center gap-2">
            {t('counter.title', currentLanguage)}
          </h2>

          {/* Ceremony selector chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            <span className="text-xs text-neutral-600 dark:text-neutral-400 font-bold flex items-center gap-1 mr-1">
              <PartyPopper className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {t('app.ceremonies_ribbon', currentLanguage)}
            </span>
            {ceremonies.map(crm => {
              const isSelected = activeCeremony?.id === crm.id;
              return (
                <button
                  key={crm.id}
                  type="button"
                  onClick={() => onSelectCeremony && onSelectCeremony(crm.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 shadow-md scale-105'
                      : 'bg-neutral-200 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 hover:border-amber-500/50'
                  }`}
                >
                  {crm.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 🔊 Live Audio Soundbox Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundboxEnabled;
              setSoundboxEnabled(next);
              localStorage.setItem('mms_soundbox_enabled', String(next));
              onSuccessToast(next ? '🔊 Voice Soundbox Enabled!' : '🔇 Voice Soundbox Disabled');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${
              soundboxEnabled
                ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/50 shadow-emerald-500/10'
                : 'bg-neutral-200 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-800'
            }`}
            title="Toggle Live Audio Soundbox (Paytm style Voice Announcements upon counter entry)"
          >
            <Volume2 className={`w-3.5 h-3.5 ${soundboxEnabled ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
            <span>{soundboxEnabled ? '🔊 Soundbox: ON' : '🔇 Soundbox: OFF'}</span>
          </button>

          {/* Test Soundbox Voice Button */}
          <button
            type="button"
            onClick={() => {
              soundboxService.testSoundbox();
              onSuccessToast('📢 Testing Soundbox Announcement...');
            }}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-900 dark:text-amber-300 transition-all cursor-pointer shadow-sm"
            title="Test Wedding Counter Soundbox Voice"
          >
            📢 Test Voice
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-neutral-900 border border-amber-300 dark:border-neutral-800 text-[11px] text-amber-950 dark:text-neutral-300 font-mono font-extrabold shadow-sm">
            <Keyboard className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
            <span>Ctrl + S: Save</span>
          </div>

          <button
            type="button"
            onClick={resetForm}
            className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-400" /> {t('counter.btn_reset', currentLanguage)}
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Form (7 cols), Right side Real-Time Live Preview Receipt (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Entry Form */}
        <div className="lg:col-span-7 space-y-5">
          {/* Next Guest Entry Alert Banner */}
          {lastSavedGuest && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/50 flex items-center justify-between gap-3 animate-fadeIn text-xs text-emerald-950 dark:text-emerald-200 shadow-md">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-extrabold text-[13px]">
                    ✓ {lastSavedGuest.name} (₹{lastSavedGuest.amount.toLocaleString('en-IN')}) Saved!
                  </span>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    Counter ready for Next Guest Entry (अगला नेवता दर्ज करें)...
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setLastSavedGuest(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Section 1: Mehmaan (Guest) Details */}
            <div className="royal-glass rounded-2xl p-5 sm:p-6 border-amber-500/20 space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-neutral-300 dark:border-neutral-800/80 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-[#78350F] dark:text-amber-300 font-black text-xs flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 font-outfit">
                    {t('guests.th_name', currentLanguage)}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* 🎙️ Voice Input Button with Language Switcher */}
                  <div className="inline-flex items-center bg-amber-500/10 border border-amber-500/40 rounded-xl p-0.5 shadow-sm">
                    <button
                      type="button"
                      onClick={startVoiceInput}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isListeningVoice
                          ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/30'
                          : 'hover:bg-amber-500/20 text-amber-900 dark:text-amber-300'
                      }`}
                      title="बोलकर एंट्री करें (Click and speak)"
                    >
                      {isListeningVoice ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                      <span>{isListeningVoice ? 'Listening...' : '🎙️ बोलकर लिखें'}</span>
                    </button>
                    
                    {/* Voice Language Selector */}
                    <select
                      value={voiceLang}
                      onChange={(e) => setVoiceLang(e.target.value as any)}
                      className="bg-transparent text-[10px] font-bold text-amber-950 dark:text-amber-300 pl-1 pr-1.5 py-0.5 outline-none cursor-pointer border-l border-amber-500/30"
                      title="Voice Recognition Language"
                    >
                      <option value="hi-IN" className="text-neutral-900">हिन्दी</option>
                      <option value="en-IN" className="text-neutral-900">English</option>
                      <option value="ur-PK" className="text-neutral-900">اردو</option>
                    </select>
                  </div>

                  {/* Existing Guest Search Autocomplete */}
                  <div className="relative w-44 sm:w-52">
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none select-none">
                        <Search className="w-3.5 h-3.5 text-neutral-500" />
                      </div>
                      <input
                        type="text"
                        value={guestSearchQuery}
                        onChange={(e) => setGuestSearchQuery(e.target.value)}
                        placeholder={t('common.search', currentLanguage)}
                        className="royal-input py-1 text-xs font-semibold"
                        style={{ paddingLeft: '2.25rem' }}
                      />
                    </div>

                    {filteredGuests.length > 0 && (
                      <div className="absolute right-0 mt-1 w-full bg-white dark:bg-neutral-900 border-2 border-amber-500/40 rounded-xl shadow-2xl z-30 overflow-hidden divide-y divide-neutral-200 dark:divide-neutral-800">
                        {filteredGuests.map(g => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => handleSelectExistingGuest(g)}
                            className="w-full px-3 py-2 text-left hover:bg-amber-500/10 text-xs flex items-center justify-between"
                          >
                            <div>
                              <p className="font-bold text-[#78350F] dark:text-amber-300">{g.name}</p>
                              <p className="text-[10px] text-neutral-600 dark:text-neutral-400">{g.village} • {g.relation}</p>
                            </div>
                            <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-bold text-neutral-800 dark:text-neutral-300">Select</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Voice Listening Banner */}
              {voiceStatusText && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-950 dark:text-amber-200 flex items-center gap-2 animate-fadeIn">
                  <Volume2 className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
                  <span className="font-medium">{voiceStatusText}</span>
                </div>
              )}

              {/* Duplicate Warning Modal Banner */}
              {duplicates.length > 0 && !ignoreDuplicateWarning && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border-2 border-amber-500/50 animate-fadeIn space-y-2">
                  <div className="flex items-center gap-2 text-[#78350F] dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>⚠️ Possible Duplicate Guest Found in Database:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {duplicates.map(dup => (
                      <div key={dup.id} className="p-2.5 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-300 dark:border-neutral-700 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-neutral-100">{dup.name}</p>
                          <p className="text-[10px] text-neutral-600 dark:text-neutral-400">{dup.village || 'No Village'} • Mobile: {dup.mobile || 'N/A'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectExistingGuest(dup)}
                          className="px-2 py-1 rounded-md bg-amber-500/20 text-[#78350F] dark:text-amber-300 hover:bg-amber-500/30 font-bold text-[10px]"
                        >
                          Use Existing
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="text-right pt-1">
                    <button
                      type="button"
                      onClick={() => setIgnoreDuplicateWarning(true)}
                      className="text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline font-semibold"
                    >
                      Ignore & Create As New Person
                    </button>
                  </div>
                </div>
              )}

              {/* Guest Form Grid with Transliteration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Full Name */}
                <div>
                  <TransliteratedInput
                    label={t('counter.mehmaan_name', currentLanguage)}
                    value={name}
                    onChange={setName}
                    placeholder="e.g. Sultan Salahuddin, Rashid Khan"
                    required
                    autoTransliterate
                  />
                </div>

                {/* Father / Husband Name */}
                <div>
                  <TransliteratedInput
                    label={t('counter.father_name', currentLanguage)}
                    value={fatherName}
                    onChange={setFatherName}
                    placeholder="e.g. Haji Iqbal Khan, Janab Afzal Khan"
                    autoTransliterate
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="form-label">
                    {t('counter.mobile', currentLanguage)}
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 9876543210"
                    maxLength={13}
                    className="royal-input"
                  />
                </div>

                {/* Village / Gaon */}
                <div>
                  <TransliteratedInput
                    label={t('counter.village', currentLanguage)}
                    value={village}
                    onChange={setVillage}
                    placeholder="e.g. Chauriya khas, Rampur, Lucknow"
                    autoTransliterate
                  />
                </div>

                {/* Relation */}
                <div>
                  <label className="form-label">
                    {t('counter.relation', currentLanguage)} *
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as RelationType)}
                    className="royal-input"
                  >
                    {RELATIONS.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>

                {/* Side */}
                <div>
                  <label className="form-label">
                    {t('counter.side', currentLanguage)} *
                  </label>
                  <select
                    value={side}
                    onChange={(e) => setSide(e.target.value as SideType)}
                    className="royal-input"
                  >
                    {SIDES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Family */}
                <div className="sm:col-span-2">
                  <label className="form-label">
                    {t('nav.families', currentLanguage)} (Optional)
                  </label>
                  <select
                    value={familyId}
                    onChange={(e) => setFamilyId(e.target.value)}
                    className="royal-input"
                  >
                    <option value="">None / Independent Individual</option>
                    {families.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.village || 'No Village'})
                      </option>
                    ))}
                  </select>
                </div>

              </div>
            </div>

            {/* Section 2: Nevta & Nahuchua Amounts */}
            <div className="royal-glass rounded-2xl p-5 sm:p-6 border-amber-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-300 dark:border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-[#064E3B] dark:text-emerald-300 font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 font-outfit">
                    {t('counter.amount', currentLanguage)}
                  </h3>
                </div>
                <span className="text-xs text-[#78350F] dark:text-amber-300 font-bold">
                  {activeCeremony?.name || 'Nikah Ceremony'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nevta Amount */}
                <div>
                  <label className="form-label text-[#78350F] dark:text-amber-300">
                    {t('counter.amount', currentLanguage)}
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none select-none">
                      <span className="text-amber-700 dark:text-amber-400 font-black text-xl font-outfit">₹</span>
                    </div>
                    <input
                      ref={nevtaInputRef}
                      type="number"
                      value={nevtaAmount}
                      onChange={(e) => setNevtaAmount(e.target.value)}
                      placeholder="0"
                      step="1"
                      className="royal-input text-xl font-black font-outfit"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[501, 1100, 2100, 5100, 11000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setNevtaAmount(amt.toString())}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-xs text-[#78350F] dark:text-amber-300 font-bold cursor-pointer transition-all hover:scale-105"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nahuchua Amount */}
                <div>
                  <label className="form-label text-[#064E3B] dark:text-emerald-300">
                    Nahuchua (₹)
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none select-none">
                      <span className="text-emerald-700 dark:text-emerald-400 font-black text-xl font-outfit">₹</span>
                    </div>
                    <input
                      type="number"
                      value={nahuchuaAmount}
                      onChange={(e) => setNahuchuaAmount(e.target.value)}
                      placeholder="0"
                      step="1"
                      className="royal-input text-xl font-black font-outfit"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[251, 501, 1100, 2100].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setNahuchuaAmount(amt.toString())}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs text-[#064E3B] dark:text-emerald-300 font-bold cursor-pointer transition-all hover:scale-105"
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="form-label">
                      {t('counter.payment_mode', currentLanguage)} *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsUpiModalOpen(true)}
                      className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>📲 Show UPI QR</span>
                    </button>
                  </div>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const newMethod = e.target.value as PaymentMethod;
                      setPaymentMethod(newMethod);
                      if (newMethod === 'UPI') {
                        setIsUpiModalOpen(true);
                      }
                    }}
                    className="royal-input"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  {/* Quick Dynamic QR Code Button */}
                  <button
                    type="button"
                    onClick={() => setIsUpiModalOpen(true)}
                    className="w-full mt-2 py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-amber-500/15 to-emerald-500/15 hover:from-emerald-500/25 hover:to-amber-500/25 border border-emerald-500/40 text-[11px] font-black text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer hover:scale-101"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Scan & Pay via Dynamic UPI QR (₹{totalAmount > 0 ? totalAmount.toLocaleString('en-IN') : 'Custom'})</span>
                  </button>
                </div>

                {/* Reference ID / Cheque No */}
                <div>
                  <label className="form-label">
                    Reference / UPI Ref / Cheque (Optional)
                  </label>
                  <input
                    type="text"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    placeholder="e.g. UPI/2027/9887711234 or UTR"
                    className="royal-input"
                  />
                </div>

              </div>
            </div>

            {/* Section 3: Physical Gifts */}
            <div className="royal-glass rounded-2xl p-5 sm:p-6 border-purple-500/20 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-300 dark:border-neutral-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-[#581C87] dark:text-purple-300 font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <h3 className="text-base font-extrabold text-neutral-900 dark:text-neutral-100 font-outfit">
                    {t('gifts.title', currentLanguage)}
                  </h3>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGift}
                    onChange={(e) => setHasGift(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-300 dark:bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  <span className="ml-2 text-xs font-bold text-[#581C87] dark:text-purple-300">{t('dashboard.physical_gifts', currentLanguage)}</span>
                </label>
              </div>

              {hasGift && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 animate-fadeIn pt-1">
                  <div className="sm:col-span-2">
                    <TransliteratedInput
                      label={t('gifts.th_item', currentLanguage)}
                      value={giftItemName}
                      onChange={setGiftItemName}
                      placeholder="e.g. Pure Silk Suit, Sherwani, Silver Coin, Smart Watch"
                      autoTransliterate
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      {t('gifts.th_category', currentLanguage)}
                    </label>
                    <select
                      value={giftCategory}
                      onChange={(e) => setGiftCategory(e.target.value as GiftCategory)}
                      className="royal-input"
                    >
                      {GIFT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">
                      {t('gifts.th_value', currentLanguage)} (₹)
                    </label>
                    <input
                      type="number"
                      value={giftEstimatedValue}
                      onChange={(e) => setGiftEstimatedValue(e.target.value)}
                      placeholder="e.g. 2500"
                      className="royal-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Remarks */}
            <div className="royal-glass rounded-2xl p-4 border-amber-500/20">
              <TransliteratedInput
                label={t('counter.note', currentLanguage)}
                value={txnNotes}
                onChange={setTxnNotes}
                placeholder="e.g. Arrived with whole family, Mama blessings, VIP seating"
                autoTransliterate
              />
            </div>

            {/* Action Buttons Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5 font-bold">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Operator: <strong className="text-neutral-900 dark:text-neutral-200">{currentUser?.name || 'Sultan Salahuddin'}</strong></span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-1/2 sm:w-auto px-6 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
                >
                  {t('counter.btn_reset', currentLanguage)}
                </button>
                <button
                  type="submit"
                  className="w-1/2 sm:w-auto gold-gradient-btn px-8 py-3 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 stroke-[2.5]" />
                  <span>{t('counter.btn_save_only', currentLanguage)}</span>
                </button>
              </div>
            </div>

          </form>
        </div>

        {/* Right Column: Real-Time Live Preview Receipt Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          
          <div className="receipt-card p-6 relative overflow-hidden">
            
            {/* Receipt Header Badge */}
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 shadow-md">
                  <Crown className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-[10px] font-extrabold tracking-wider font-cinzel uppercase text-neutral-600 dark:text-neutral-400">
                    {t('common.print', currentLanguage)}
                  </h4>
                  <p className="text-xs text-amber-950 dark:text-amber-300 font-cinzel font-black tracking-wide">
                    {activeEvent.name}
                  </p>
                  <p className="text-[11px] text-neutral-700 dark:text-neutral-400 font-bold">
                    Function: <span className="text-emerald-900 dark:text-emerald-300 font-black">{activeCeremony?.name || 'Main Event'}</span>
                  </p>
                </div>
              </div>

              {/* Pulsing Live Indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-black tracking-wider text-emerald-800 dark:text-emerald-300 font-mono uppercase">
                  LIVE PREVIEW
                </span>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="py-4 space-y-4">
              
              {/* Guest Identity Section */}
              <div className="receipt-box p-4 space-y-3 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">{t('counter.mehmaan_name', currentLanguage)}</span>
                    <h3 className="text-xl font-black font-cinzel break-words text-neutral-950 dark:text-neutral-100">
                      {name || <span className="text-neutral-400 italic font-normal">Type guest name...</span>}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border shadow-sm ${
                    side === 'Groom Side' ? 'bg-blue-100 text-blue-950 border-blue-400 dark:bg-blue-900/40 dark:text-blue-200' :
                    side === 'Bride Side' ? 'bg-pink-100 text-pink-950 border-pink-400 dark:bg-pink-900/40 dark:text-pink-200' :
                    'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-900/40 dark:text-amber-200'
                  }`}>
                    {side}
                  </span>
                </div>

                {/* Multilingual Transliterated Badges */}
                {name && (nameTranslit.hindi || nameTranslit.urdu) && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {nameTranslit.hindi && (
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-400 dark:bg-amber-900/50 dark:text-amber-200 font-devanagari font-black shadow-sm">
                        {nameTranslit.hindi}
                      </span>
                    )}
                    {nameTranslit.urdu && (
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-950 border border-purple-400 dark:bg-purple-900/50 dark:text-purple-200 font-urdu font-black shadow-sm">
                        {nameTranslit.urdu}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-neutral-300 dark:border-neutral-800 text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider block">{t('counter.father_name', currentLanguage)}:</span>
                    <p className="font-black text-neutral-950 dark:text-neutral-100 text-xs mt-0.5 truncate">{fatherName ? `S/o ${fatherName}` : '-'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider block">{t('counter.village', currentLanguage)}:</span>
                    <p className="font-black text-emerald-950 dark:text-emerald-300 text-xs mt-0.5 truncate">{village || 'Chauriya khas'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider block">{t('counter.relation', currentLanguage)}:</span>
                    <p className="font-black text-amber-950 dark:text-amber-300 text-xs mt-0.5">{relation}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-bold uppercase tracking-wider block">{t('counter.mobile', currentLanguage)}:</span>
                    <p className="font-black text-blue-950 dark:text-blue-300 text-xs mt-0.5">{mobile || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Financial Amounts Table */}
              <div className="receipt-box p-4 space-y-2.5 text-xs font-bold bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between items-center py-1">
                  <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">Nevta Amount:</span>
                  <span className="text-base font-black text-amber-950 dark:text-amber-300 font-outfit">
                    ₹{parsedNevta.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-t border-neutral-200 dark:border-neutral-800/80">
                  <span className="text-neutral-700 dark:text-neutral-300 font-extrabold">Nahuchua Blessing:</span>
                  <span className="text-base font-black text-emerald-950 dark:text-emerald-300 font-outfit">
                    ₹{parsedNahuchua.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Total Cash Box */}
                <div className="receipt-cash-box p-3 flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-black font-cinzel text-amber-950 dark:text-amber-200">Total Cash Paid</span>
                    <p className="text-[10px] text-amber-900 dark:text-amber-300 font-bold">Via {paymentMethod} {paymentRef ? `(${paymentRef})` : ''}</p>
                  </div>
                  <span className="text-2xl font-black font-outfit text-amber-950 dark:text-amber-200">
                    ₹{totalCashAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Physical Gift Preview (if toggled) */}
              {hasGift && (
                <div className="p-3.5 rounded-2xl bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-500/40 space-y-1.5 text-xs animate-fadeIn text-purple-950 dark:text-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase flex items-center gap-1">
                      <GiftIcon className="w-3.5 h-3.5" /> Physical Gift Included
                    </span>
                    <span className="text-[10px] bg-purple-200 dark:bg-purple-800/60 px-2 py-0.5 rounded font-black">
                      {giftCategory}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>{giftItemName || 'Gift Item'}</span>
                    <span className="font-outfit">Est. ₹{parsedGiftValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              {/* Remarks preview */}
              {(txnNotes || guestNotes) && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 space-y-1 text-xs animate-fadeIn shadow-sm">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-300 flex items-center gap-1">
                    ✍️ Remarks & Auspicious Notes:
                  </span>
                  <p className="font-black text-neutral-950 dark:text-neutral-100 text-xs break-words pl-1">
                    {txnNotes || guestNotes}
                  </p>
                </div>
              )}

            </div>

            {/* Receipt Footer & Barcode Simulation */}
            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400 font-bold">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verified: <strong>{currentUser?.name || 'Sultan'}</strong></span>
              </div>
              <div className="font-mono text-[10px] tracking-widest text-neutral-500">
                #NVT-{new Date().getFullYear()}-{Math.floor(1000 + Math.random() * 9000)}
              </div>
            </div>

            {/* Direct WhatsApp Share Button in Receipt */}
            <button
              type="button"
              onClick={() => {
                if (!name.trim()) {
                  alert('Please enter Guest Full Name');
                  return;
                }
                const receiptData: WhatsAppReceiptData = {
                  guestName: name.trim(),
                  fatherName: fatherName.trim() || undefined,
                  mobile: mobile.trim() || '',
                  village: village.trim() || 'Chauriya khas',
                  nevtaAmount: Math.round(parsedNevta),
                  nahuchuaAmount: Math.round(parsedNahuchua),
                  giftItemName: (hasGift && giftItemName.trim()) ? giftItemName.trim() : undefined,
                  totalCash: Math.round(totalCashAmount),
                  paymentMethod: paymentMethod,
                  paymentRef: paymentRef.trim() || undefined,
                  receiptId: `NVT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                  eventName: activeEvent.name,
                  ceremonyName: activeCeremony?.name || activeEvent.name,
                  hostName: activeEvent.host_name || activeEvent.name,
                  venue: activeEvent.venue,
                  relation: relation,
                  side: side
                };
                setWaModalData(receiptData);
              }}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-102"
            >
              <Send className="w-4 h-4" />
              <span>📲 Share Receipt on WhatsApp (Preview & Send)</span>
            </button>

          </div>

          <div className="text-center">
            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 flex items-center justify-center gap-1 font-bold">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Stamping entry for: <strong className="text-amber-700 dark:text-amber-300">{activeCeremony?.name}</strong>
            </span>
          </div>

        </div>

      </div>

      {/* WhatsApp Receipt Modal */}
      {waModalData && (
        <WhatsAppReceiptModal
          data={waModalData}
          onClose={() => {
            setWaModalData(null);
            setTimeout(() => {
              nameInputRef.current?.focus();
            }, 100);
          }}
          onSuccessToast={onSuccessToast}
        />
      )}

      {/* 📲 Dynamic UPI QR Code Modal */}
      <DynamicUpiQrModal
        isOpen={isUpiModalOpen}
        onClose={() => setIsUpiModalOpen(false)}
        guestName={name || 'Guest'}
        amount={totalAmount}
        eventName={activeEvent.name}
        upiId={appSettings.upi_id || 'sultan.family@okaxis'}
        payeeName={appSettings.upi_payee_name || activeEvent.host_name || 'Sultan Salahuddin'}
        onPaymentReceived={(utrRef) => {
          setPaymentMethod('UPI');
          if (utrRef) setPaymentRef(utrRef);
        }}
        onSuccessToast={onSuccessToast}
      />

    </div>
  );
};
