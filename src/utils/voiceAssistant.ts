// ============================================================================
// SULTAN MARRIAGE SYSTEM - VOICE ASSISTANT & AUDIO SOUNDBOX ENGINE
// 1. Speech-to-Text Multi-Language Parser (Hindi, English, Urdu)
// 2. Hindi & English Spoken Number-Words to Digits Converter
// 3. Devanagari Numerals Converter
// 4. Live Counter Audio Soundbox (Text-to-Speech Voice Announcement)
// ============================================================================

// Map of Hindi number words to their numeric value
const HINDI_WORDS_MAP: Record<string, number> = {
  'शून्य': 0, 'जीरो': 0, 'zero': 0,
  'एक': 1, 'one': 1,
  'दो': 2, 'two': 2,
  'तीन': 3, 'three': 3,
  'चार': 4, 'four': 4,
  'पांच': 5, 'पाँच': 5, 'five': 5,
  'छह': 6, 'छः': 6, 'six': 6,
  'सात': 7, 'seven': 7,
  'आठ': 8, 'eight': 8,
  'नौ': 9, 'nine': 9,
  'दस': 10, 'ten': 10,
  'ग्यारह': 11, 'eleven': 11,
  'बारह': 12, 'twelve': 12,
  'तेरह': 13, 'thirteen': 13,
  'चौदह': 14, 'fourteen': 14,
  'पंद्रह': 15, 'fifteen': 15,
  'सोलह': 16, 'sixteen': 16,
  'सत्रह': 17, 'seventeen': 17,
  'अठारह': 18, 'eighteen': 18,
  'उन्नीस': 19, 'nineteen': 19,
  'बीस': 20, 'twenty': 20,
  'इक्कीस': 21, 'twenty one': 21,
  'बाईस': 22, 'twenty two': 22,
  'तेईस': 23, 'twenty three': 23,
  'चौबीस': 24, 'twenty four': 24,
  'पच्चीस': 25, 'twenty five': 25,
  'छब्बीस': 26, 'twenty six': 26,
  'सत्ताईस': 27, 'twenty seven': 27,
  'अट्ठाईस': 28, 'twenty eight': 28,
  'उनतीस': 29, 'twenty nine': 29,
  'तीस': 30, 'thirty': 30,
  'इकतीस': 31, 'बत्तीस': 32, 'तेतीस': 33, 'चौंतीस': 34, 'पैंतीस': 35,
  'छत्तीस': 36, 'सैंतीस': 37, 'अड़तीस': 38, 'उनतालीस': 39, 'चालीस': 40, 'forty': 40,
  'इकतालीस': 41, 'बयालीस': 42, 'तैंतालीस': 43, 'चौवालीस': 44, 'पैंतालीस': 45,
  'छियालीस': 46, 'सैंतालीस': 47, 'अड़तालीस': 48, 'उनचास': 49, 'पचास': 50, 'fifty': 50,
  'इक्यावन': 51, 'बावन': 52, 'तिरेपन': 53, 'चौवन': 54, 'पचपन': 55,
  'छप्पन': 56, 'सत्तावन': 57, 'अट्ठावन': 58, 'उनसठ': 59, 'साठ': 60, 'sixty': 60,
  'इकसठ': 61, 'बासठ': 62, 'तिरेसठ': 63, 'चौंसठ': 64, 'पैंसठ': 65,
  'छियासठ': 66, 'सरसठ': 67, 'अड़सठ': 68, 'उनहत्तर': 69, 'सत्तर': 70, 'seventy': 70,
  'इकहत्तर': 71, 'बहत्तर': 72, 'तिहत्तर': 73, 'चौहत्तर': 74, 'पचहत्तर': 75,
  'छिहत्तर': 76, 'सतहत्तर': 77, 'अठहत्तर': 78, 'उनासी': 79, 'अस्सी': 80, 'eighty': 80,
  'इक्यासी': 81, 'बयासी': 82, 'तिरासी': 83, 'चौरासी': 84, 'पचासी': 85,
  'छियासी': 86, 'सत्तासी': 87, 'अट्ठासी': 88, 'नवासी': 89, 'नब्बे': 90, 'ninety': 90,
  'इक्यानवे': 91, 'बानवे': 92, 'तिरानवे': 93, 'चौरानवे': 94, 'पंचानवे': 95,
  'छियानवे': 96, 'सत्तानवे': 97, 'अट्ठानवे': 98, 'निन्यानवे': 99
};

// Convert Devanagari numerals (०, १, २, ३, ४, ५, ६, ७, ८, ९) to ASCII digits (0-9)
export function convertDevanagariNumeralsToAscii(str: string): string {
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let result = str;
  devanagariDigits.forEach((d, idx) => {
    result = result.replace(new RegExp(d, 'g'), String(idx));
  });
  return result;
}

// Convert complex spoken Hindi/English phrases like "इक्कीस सौ", "दो हजार एक सौ", "पांच सौ", "1100" to number
export function extractAmountFromSpokenText(text: string): { amount: number | null; matchedPhrase: string } {
  let clean = convertDevanagariNumeralsToAscii(text.toLowerCase());

  // 1. Direct Digit Match (e.g., 2100, 500, 1100, 501, 5000)
  const digitMatch = clean.match(/\b(\d+)\s*(?:rupaye|rupees|rs|rupya|रुपये|रुपया|रुपिया)?\b/i);
  if (digitMatch && parseInt(digitMatch[1], 10) > 0) {
    return {
      amount: parseInt(digitMatch[1], 10),
      matchedPhrase: digitMatch[0]
    };
  }

  // 2. Common Hindi spoken wedding amounts
  const weddingCombinations: [RegExp, number][] = [
    [/\b(इक्कीस\s*सौ|twenty\s*one\s*hundred)\b/i, 2100],
    [/\b(ग्यारह\s*सौ|eleven\s*hundred)\b/i, 1100],
    [/\b(इक्यावन\s*सौ|fifty\s*one\s*hundred)\b/i, 5100],
    [/\b(इकतीस\s*सौ|thirty\s*one\s*hundred)\b/i, 3100],
    [/\b(इकतालीस\s*सौ|forty\s*one\s*hundred)\b/i, 4100],
    [/\b(पंद्रह\s*सौ|fifteen\s*hundred)\b/i, 1500],
    [/\b(पच्चीस\s*सौ|twenty\s*five\s*hundred)\b/i, 2500],
    [/\b(पैंतीस\s*सौ|thirty\s*five\s*hundred)\b/i, 3500],
    [/\b(पैंतालीस\s*सौ|forty\s*five\s*hundred)\b/i, 4500],
    [/\b(दो\s*हजार\s*एक\s*सौ|two\s*thousand\s*one\s*hundred)\b/i, 2100],
    [/\b(दो\s*हजार\s*पांच\s*सौ|two\s*thousand\s*five\s*hundred)\b/i, 2500],
    [/\b(एक\s*हजार\s*एक\s*सौ|one\s*thousand\s*one\s*hundred)\b/i, 1100],
    [/\b(पांच\s*हजार\s*एक\s*सौ|five\s*thousand\s*one\s*hundred)\b/i, 5100],
    [/\b(पांच\s*सौ\s*एक|five\s*hundred\s*one)\b/i, 501],
    [/\b(एक\s*सौ\s*एक|one\s*hundred\s*one)\b/i, 101],
    [/\b(दो\s*सौ\s*एक|two\s*hundred\s*one)\b/i, 201],
    [/\b(ग्यारह\s*सौ\s*एक|eleven\s*hundred\s*one)\b/i, 1101],
    [/\b(इक्कीस\s*सौ\s*एक|twenty\s*one\s*hundred\s*one)\b/i, 2101],
    [/\b(इक्यावन\s*सौ\s*एक|fifty\s*one\s*hundred\s*one)\b/i, 5101],
    [/\b(एक\s*लाख|one\s*lakh)\b/i, 100000],
    [/\b(पचास\s*हजार|fifty\s*thousand)\b/i, 50000],
    [/\b(पच्चीस\s*हजार|twenty\s*five\s*thousand)\b/i, 25000],
    [/\b(बीस\s*हजार|twenty\s*thousand)\b/i, 20000],
    [/\b(पंद्रह\s*हजार|fifteen\s*thousand)\b/i, 15000],
    [/\b(दस\s*हजार|ten\s*thousand)\b/i, 10000],
    [/\b(पांच\s*हजार|five\s*thousand)\b/i, 5000],
    [/\b(चार\s*हजार|four\s*thousand)\b/i, 4000],
    [/\b(तीन\s*हजार|three\s*thousand)\b/i, 3000],
    [/\b(दो\s*हजार|two\s*thousand)\b/i, 2000],
    [/\b(एक\s*हजार|हजार|हज़ार|one\s*thousand|thousand)\b/i, 1000],
    [/\b(नौ\s*सौ|nine\s*hundred)\b/i, 900],
    [/\b(आठ\s*सौ|eight\s*hundred)\b/i, 800],
    [/\b(सात\s*सौ|seven\s*hundred)\b/i, 700],
    [/\b(छह\s*सौ|six\s*hundred)\b/i, 600],
    [/\b(पांच\s*सौ|पाँच\s*सौ|five\s*hundred)\b/i, 500],
    [/\b(चार\s*सौ|four\s*hundred)\b/i, 400],
    [/\b(तीन\s*सौ|three\s*hundred)\b/i, 300],
    [/\b(दो\s*सौ|two\s*hundred)\b/i, 200],
    [/\b(एक\s*सौ|सौ|one\s*hundred|hundred)\b/i, 100]
  ];

  for (const [pattern, val] of weddingCombinations) {
    const match = clean.match(pattern);
    if (match) {
      return {
        amount: val,
        matchedPhrase: match[0]
      };
    }
  }

  // 3. Single words from HINDI_WORDS_MAP
  const words = clean.split(/\s+/);
  for (const w of words) {
    if (HINDI_WORDS_MAP[w] !== undefined && HINDI_WORDS_MAP[w] > 0) {
      return {
        amount: HINDI_WORDS_MAP[w],
        matchedPhrase: w
      };
    }
  }

  return { amount: null, matchedPhrase: '' };
}

export interface ParsedVoiceData {
  guestName: string;
  fatherName?: string;
  amount: number | null;
  type: 'nevta' | 'nahuchua';
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  village?: string;
  rawTranscript: string;
}

// Parse spoken voice transcript into structured counter fields
export function parseVoiceTranscript(
  transcript: string, 
  knownVillages: string[] = []
): ParsedVoiceData {
  let clean = transcript.trim();
  const rawTranscript = clean;

  let type: 'nevta' | 'nahuchua' = 'nevta';
  if (/nahuchua|nahchua|नहुछुआ|नहछुआ/i.test(clean)) {
    type = 'nahuchua';
    clean = clean.replace(/nahuchua|nahchua|नहुछुआ|नहछुआ/gi, ' ').trim();
  } else if (/nevta|nyota|neota|न्योता|नेवता/i.test(clean)) {
    type = 'nevta';
    clean = clean.replace(/nevta|nyota|neota|न्योता|नेवता/gi, ' ').trim();
  }

  // 1. Extract Amount
  let extractedAmount: number | null = null;
  const { amount, matchedPhrase } = extractAmountFromSpokenText(clean);
  if (amount !== null) {
    extractedAmount = amount;
    if (matchedPhrase) {
      clean = clean.replace(new RegExp(matchedPhrase, 'i'), ' ').trim();
    }
  }

  // Clean trailing "rupaye" / "rupees" / "रुपये"
  clean = clean.replace(/(?:rupaye|rupees|rs|rupya|रुपये|रुपया|रुपिया)/gi, ' ').trim();

  // 2. Extract Payment Method
  let paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' = 'Cash';
  if (/upi|online|phonepe|gpay|paytm|google pay|क्यूआर|ऑनलाइन/i.test(clean)) {
    paymentMethod = 'UPI';
    clean = clean.replace(/upi|online|phonepe|gpay|paytm|google pay|क्यूआर|ऑनलाइन/gi, ' ').trim();
  } else if (/cheque|check|चेक/i.test(clean)) {
    paymentMethod = 'Cheque';
    clean = clean.replace(/cheque|check|चेक/gi, ' ').trim();
  } else if (/bank|transfer|बैंक/i.test(clean)) {
    paymentMethod = 'Bank Transfer';
    clean = clean.replace(/bank|transfer|खाता|बैंक/gi, ' ').trim();
  } else if (/cash|rokar|nakad|नकद|कैश|रोकड़/i.test(clean)) {
    paymentMethod = 'Cash';
    clean = clean.replace(/cash|rokar|nakad|नकद|कैश|रोकड़/gi, ' ').trim();
  }

  // 3. Extract Village from known villages
  let matchedVillage: string | undefined = undefined;
  for (const v of knownVillages) {
    if (v && v.trim().length > 2 && clean.toLowerCase().includes(v.toLowerCase())) {
      matchedVillage = v;
      clean = clean.replace(new RegExp(v, 'gi'), ' ').trim();
      break;
    }
  }

  // 4. Remove common helper connecting words
  clean = clean
    .replace(/\b(se|wala|wali|hai|ka|ki|ke|ne|diya|likho|likhna|karo|aur|and|ji|janaab|janab|from|of|is)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 5. Remaining text is Guest Name
  const guestName = clean || 'Guest';

  return {
    guestName,
    amount: extractedAmount,
    type,
    paymentMethod,
    village: matchedVillage,
    rawTranscript
  };
}

// ============================================================================
// AUDIO SOUNDBOX (TEXT-TO-SPEECH ANNOUNCEMENTS)
// Paytm / BharatPe Soundbox style live voice announcement for Wedding Counter
// ============================================================================

export const soundboxService = {
  // Check if browser supports Web Speech Synthesis
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  // Play a brief pleasant chime sound before voice
  playChime() {
    try {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime + 0.15);

      osc1.stop(ctx.currentTime + 0.2);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Ignore audio context error
    }
  },

  // Announce newly saved Nevta or Nahuchua transaction aloud
  announceTransaction(
    guestName: string, 
    amount: number, 
    type: 'nevta' | 'nahuchua' = 'nevta',
    ceremonyName?: string
  ) {
    if (!this.isSupported()) return;

    try {
      this.playChime();

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const typeWord = type === 'nahuchua' ? 'नहुछुआ' : 'न्योता';
      const spokenText = `${guestName} से ₹${amount.toLocaleString('en-IN')} ${typeWord} प्राप्त हुआ। बहुत-बहुत शुक्रिया!`;

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95; // Clear natural Indian tempo
      utterance.pitch = 1.05;

      // Prefer Indian voices if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Soundbox speech error:', err);
    }
  },

  // Test soundbox voice for counter staff
  testSoundbox() {
    this.announceTransaction('सुलतान सलाहुद्दीन', 2100, 'nevta');
  }
};
