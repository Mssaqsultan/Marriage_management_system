/**
 * Transliteration & Language Detection Utility for Hindi (Devanagari) and Urdu (Arabic/Nastaliq)
 */

export type DetectedScript = 'latin' | 'devanagari' | 'urdu_arabic' | 'mixed';

export interface ScriptDetectionResult {
  script: DetectedScript;
  confidence: number;
  label: string;
  badgeColor: string;
  flag: string;
}

export interface TransliterationOption {
  hindi: string;
  urdu: string;
  original: string;
}

// Common dictionary words for Indian weddings, names, places, relations, and items
const dictionary: Record<string, { hi: string; ur: string }> = {
  // Names & Placeholders
  'sultan': { hi: 'सुल्तान', ur: 'سلطان' },
  'rizwan': { hi: 'रिज़वान', ur: 'رضوان' },
  'khan': { hi: 'खान', ur: 'خان' },
  'ahmad': { hi: 'अहमद', ur: 'احمد' },
  'ahmed': { hi: 'अहमद', ur: 'احمد' },
  'ali': { hi: 'अली', ur: 'علی' },
  'mohammad': { hi: 'मोहम्मद', ur: 'محمد' },
  'mohammed': { hi: 'मोहम्मद', ur: 'محمد' },
  'singh': { hi: 'सिंह', ur: 'سنگھ' },
  'kumar': { hi: 'कुमार', ur: 'کمار' },
  'sharma': { hi: 'शर्मा', ur: 'شرما' },
  'verma': { hi: 'वर्मा', ur: 'ورما' },
  'gupta': { hi: 'गुप्ता', ur: 'گپتا' },
  'yadav': { hi: 'यादव', ur: 'یادو' },
  'ram': { hi: 'राम', ur: 'رام' },
  'mohan': { hi: 'मोहन', ur: 'موہن' },
  'sohan': { hi: 'सोहन', ur: 'سوہن' },
  'rohan': { hi: 'रोहन', ur: ' Rohan' },
  'sita': { hi: 'सीता', ur: 'سیتا' },
  'gita': { hi: 'गीता', ur: 'گیتا' },
  'priya': { hi: 'प्रिया', ur: 'پریا' },
  'fatima': { hi: 'फातिमा', ur: 'فاطمہ' },
  'aisha': { hi: 'आयशा', ur: 'عائشہ' },
  'zainab': { hi: 'ज़ैनब', ur: 'زینب' },
  'salman': { hi: 'सलमान', ur: 'سلمان' },
  'imran': { hi: 'इमरान', ur: 'عمران' },
  'tariq': { hi: 'तारिक', ur: 'طارق' },
  'rashid': { hi: 'राशिद', ur: 'راشد' },
  'farhan': { hi: 'फरहान', ur: 'فرہان' },
  'bilal': { hi: 'बिलाल', ur: 'بلال' },
  'danish': { hi: 'दानिश', ur: 'دانش' },
  'suresh': { hi: 'सुरेश', ur: 'سریش' },
  'ramesh': { hi: 'रमेश', ur: 'رمیش' },
  'mahesh': { hi: 'महेश', ur: 'مہیش' },
  'dinesh': { hi: 'दिनेश', ur: 'دنیش' },
  'mukesh': { hi: 'मुकेश', ur: 'مکیش' },
  'rajesh': { hi: 'राजेश', ur: 'راجیش' },

  // Villages & Places
  'chauriya': { hi: 'चौरीया', ur: 'چوریہ' },
  'chauriya khas': { hi: 'चौरीया खास', ur: 'چوریہ خاص' },
  'lakhanpur': { hi: 'लखनपुर', ur: 'لکھن پور' },
  'rampur': { hi: 'रामपुर', ur: 'رام پور' },
  'shivpur': { hi: 'शिवपुर', ur: 'شیو پور' },
  'lucknow': { hi: 'लखनऊ', ur: 'لکھنؤ' },
  'delhi': { hi: 'दिल्ली', ur: 'دہلی' },
  'azamgarh': { hi: 'आज़मगढ़', ur: 'اعظم گڑھ' },
  'varanasi': { hi: 'वाराणसी', ur: 'وارانسی' },
  'kanpur': { hi: 'कानपुर', ur: 'کانپور' },
  'allahabad': { hi: 'इलाहाबाद', ur: 'الہ آباد' },
  'prayagraj': { hi: 'प्रयागराज', ur: 'پریاگ راج' },
  'gorakhpur': { hi: 'गोरखपुर', ur: 'گورکھپور' },
  'patna': { hi: 'पटना', ur: 'پٹنہ' },
  'basti': { hi: 'बस्ती', ur: 'بستی' },
  'faizabad': { hi: 'फैजाबाद', ur: 'فیض آباد' },
  'ayodhya': { hi: 'अयोध्या', ur: 'ایودھیا' },
  'mau': { hi: 'मऊ', ur: 'مئو' },
  'jaunpur': { hi: 'जौनपुर', ur: 'جونپور' },
  'sultanpur': { hi: 'सुल्तानपुर', ur: 'سلطان پور' },
  'ghazipur': { hi: 'गाजीपुर', ur: 'غازی پور' },
  'mirzapur': { hi: 'मिर्जापुर', ur: 'مرزا پور' },

  // Relations
  'chacha': { hi: 'चाचा', ur: 'چچا' },
  'chachi': { hi: 'चाची', ur: 'چچی' },
  'mama': { hi: 'मामा', ur: 'ماموں' },
  'mami': { hi: 'मामी', ur: 'ممانی' },
  'fufa': { hi: 'फूफा', ur: 'پھوپھا' },
  'bua': { hi: 'बुआ', ur: 'پھوپھی' },
  'tau': { hi: 'ताऊ', ur: 'تایا' },
  'tai': { hi: 'ताई', ur: 'تائی' },
  'bhai': { hi: 'भाई', ur: 'بھائی' },
  'behan': { hi: 'बहन', ur: 'بہن' },
  'bahen': { hi: 'बहन', ur: 'بہن' },
  'dost': { hi: 'दोस्त', ur: 'دوست' },
  'friend': { hi: 'दोस्त', ur: 'دوست' },
  'padosi': { hi: 'पड़ोसी', ur: 'پڑوسی' },
  'neighbor': { hi: 'पड़ोसी', ur: 'ہمسایہ' },
  'khalu': { hi: 'खालू', ur: 'خالو' },
  'khala': { hi: 'खाला', ur: 'خالہ' },
  'mausa': { hi: 'मौसा', ur: 'موسا' },
  'mausi': { hi: 'मौसी', ur: 'موسی' },
  'samdhi': { hi: 'समधी', ur: 'سمدھی' },
  'damad': { hi: 'दामाद', ur: 'داماد' },
  'bahu': { hi: 'बहू', ur: 'بہو' },
  'sasur': { hi: 'ससुर', ur: 'سسر' },
  'saas': { hi: 'सास', ur: 'ساس' },
  'jija': { hi: 'जीजा', ur: 'جیجا' },
  'sala': { hi: 'साला', ur: 'سالہ' },
  'sali': { hi: 'साली', ur: 'سالی' },

  // Wedding & Items & Terms
  'nevta': { hi: 'नेवता', ur: 'نوتا' },
  'nahuchua': { hi: 'नहछुआ', ur: 'نہچوا' },
  'gift': { hi: 'उपहार', ur: 'تحفہ' },
  'mehmaan': { hi: 'मेहमान', ur: 'مہمان' },
  'shaadi': { hi: 'शादी', ur: 'شادی' },
  'shadi': { hi: 'शादी', ur: 'شادی' },
  'vivah': { hi: 'विवाह', ur: 'شادی' },
  'nikah': { hi: 'निकाह', ur: 'نکاح' },
  'walima': { hi: 'वलीमा', ur: 'ولیمہ' },
  'reception': { hi: 'रिसेप्शन', ur: 'استقبالیہ' },
  'mundan': { hi: 'मुंडन', ur: 'منڈن' },
  'suit': { hi: 'सूट', ur: 'سوٹ' },
  'sari': { hi: 'साड़ी', ur: 'ساڑی' },
  'saree': { hi: 'साड़ी', ur: 'ساڑی' },
  'sherwani': { hi: 'शेरवानी', ur: 'شیروانی' },
  'ghadi': { hi: 'घड़ी', ur: 'گھڑی' },
  'watch': { hi: 'घड़ी', ur: 'گھڑی' },
  'clock': { hi: 'दीवार घड़ी', ur: 'دیوار گھڑی' },
  'bartan': { hi: 'बर्तन', ur: 'برتن' },
  'silver': { hi: 'चांदी', ur: 'چاندی' },
  'gold': { hi: 'सोना', ur: 'سونا' },
  'ring': { hi: 'अंगूठी', ur: 'انگوٹھی' },
  'mithai': { hi: 'मिठाई', ur: 'مٹھائی' },
  'kaju': { hi: 'काजू', ur: 'کاجو' },
  'badam': { hi: 'बादाम', ur: 'بادام' },
  'dry fruits': { hi: 'मेवा / ड्राई फ्रूट्स', ur: 'خشک میوہ جات' },
  'lifafa': { hi: 'लिफाफा', ur: 'لفافہ' },
  'nugad': { hi: 'नकद', ur: 'نقد' },
  'cash': { hi: 'नकद', ur: 'نقد' },
  'upi': { hi: 'यूपीआई', ur: 'یو پی آئی' },
  'cheque': { hi: 'चेक', ur: 'چیک' }
};

// Hindi phonetic conversion rule table
const hindiVowels: Record<string, string> = {
  'aa': 'आ', 'a': 'अ', 'ee': 'ई', 'i': 'इ', 'oo': 'ऊ', 'u': 'उ',
  'e': 'ए', 'ai': 'ऐ', 'o': 'ओ', 'au': 'औ', 'ri': 'ऋ'
};

const hindiMatras: Record<string, string> = {
  'aa': 'ा', 'a': '', 'ee': 'ी', 'i': 'ि', 'oo': 'ू', 'u': 'ु',
  'e': 'े', 'ai': 'ै', 'o': 'ो', 'au': 'ौ'
};

const hindiConsonants: Record<string, string> = {
  'kh': 'ख', 'k': 'क', 'gh': 'घ', 'g': 'ग',
  'chh': 'छ', 'ch': 'च', 'jh': 'झ', 'j': 'ज', 'z': 'ज़',
  'thh': 'ठ', 'tth': 'ठ', 'th': 'थ', 'tt': 'ट', 't': 'त',
  'dhh': 'ढ', 'dh': 'ध', 'dd': 'ड', 'd': 'द',
  'ph': 'फ', 'f': 'फ़', 'p': 'प', 'bh': 'भ', 'b': 'ब',
  'sh': 'श', 'shh': 'ष', 's': 'स', 'h': 'ह',
  'm': 'म', 'n': 'न', 'ng': 'ङ', 'ny': 'ञ',
  'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व', 'gy': 'ज्ञ', 'tr': 'त्र', 'ksh': 'क्ष'
};

// Urdu phonetic conversion rule table
const urduMapping: Record<string, string> = {
  'kh': 'خ', 'k': 'ک', 'gh': 'غ', 'g': 'گ',
  'ch': 'چ', 'jh': 'جھ', 'j': 'ج', 'z': 'ز', 'zh': 'ژ',
  'th': 'تھ', 'tt': 'ٹ', 't': 'ت',
  'dh': 'دھ', 'dd': 'ڈ', 'd': 'د',
  'ph': 'پھ', 'f': 'ف', 'p': 'پ', 'bh': 'بھ', 'b': 'ب',
  'sh': 'ش', 's': 'س', 'h': 'ہ',
  'm': 'م', 'n': 'ن',
  'y': 'ی', 'r': 'ر', 'l': 'ل', 'v': 'و', 'w': 'و',
  'aa': 'ا', 'a': 'ا', 'ee': 'ی', 'i': 'ی', 'oo': 'و', 'u': 'و',
  'e': 'ے', 'ai': 'ئے', 'o': 'و', 'au': 'ئو'
};

/**
 * Auto-detect the script of any input string
 */
export function detectScript(input: string): ScriptDetectionResult {
  if (!input || !input.trim()) {
    return {
      script: 'latin',
      confidence: 1,
      label: 'English / Roman',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      flag: '🔤'
    };
  }

  const clean = input.trim();
  const devanagariRegex = /[\u0900-\u097F]/;
  const arabicUrduRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

  let hasDevanagari = false;
  let hasArabicUrdu = false;
  let hasLatin = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (devanagariRegex.test(char)) hasDevanagari = true;
    else if (arabicUrduRegex.test(char)) hasArabicUrdu = true;
    else if (/[a-zA-Z]/.test(char)) hasLatin = true;
  }

  if (hasArabicUrdu && !hasDevanagari) {
    return {
      script: 'urdu_arabic',
      confidence: 0.95,
      label: 'اردو (Urdu / Nastaliq)',
      badgeColor: 'bg-purple-500/20 text-purple-950 dark:text-purple-300 border-purple-500/50 font-bold',
      flag: '✍️'
    };
  }

  if (hasDevanagari && !hasArabicUrdu) {
    return {
      script: 'devanagari',
      confidence: 0.95,
      label: 'हिंदी (Devanagari)',
      badgeColor: 'bg-amber-500/20 text-amber-950 dark:text-amber-300 border-amber-500/50 font-bold',
      flag: '✍️'
    };
  }

  if ((hasArabicUrdu && hasDevanagari) || (hasLatin && (hasArabicUrdu || hasDevanagari))) {
    return {
      script: 'mixed',
      confidence: 0.8,
      label: 'Mixed Script',
      badgeColor: 'bg-cyan-500/20 text-cyan-950 dark:text-cyan-300 border-cyan-500/50 font-bold',
      flag: '🌐'
    };
  }

  return {
    script: 'latin',
    confidence: 0.9,
    label: 'English / Roman',
    badgeColor: 'bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 border-emerald-500/50 font-bold',
    flag: '🔤'
  };
}

/**
 * Phonetic conversion from Roman/English to Hindi Devanagari
 */
export function romanToHindiPhonetic(word: string): string {
  const lower = word.toLowerCase().trim();
  if (!lower) return '';
  if (dictionary[lower]) return dictionary[lower].hi;

  let result = '';
  let i = 0;
  let isStart = true;

  while (i < lower.length) {
    // Check 3-char consonants
    let matched = false;
    const char3 = lower.substr(i, 3);
    const char2 = lower.substr(i, 2);
    const char1 = lower.substr(i, 1);

    if (hindiConsonants[char3]) {
      result += hindiConsonants[char3];
      i += 3;
      matched = true;
    } else if (hindiConsonants[char2]) {
      result += hindiConsonants[char2];
      i += 2;
      matched = true;
    } else if (hindiConsonants[char1]) {
      result += hindiConsonants[char1];
      i += 1;
      matched = true;
    }

    if (matched) {
      isStart = false;
      // Look for trailing vowels
      const nextVowel2 = lower.substr(i, 2);
      const nextVowel1 = lower.substr(i, 1);

      if (hindiMatras[nextVowel2] !== undefined) {
        result += hindiMatras[nextVowel2];
        i += 2;
      } else if (hindiMatras[nextVowel1] !== undefined) {
        result += hindiMatras[nextVowel1];
        i += 1;
      }
      continue;
    }

    // Independent vowels
    if (isStart) {
      if (hindiVowels[char2]) {
        result += hindiVowels[char2];
        i += 2;
        isStart = false;
        continue;
      } else if (hindiVowels[char1]) {
        result += hindiVowels[char1];
        i += 1;
        isStart = false;
        continue;
      }
    }

    // fallback character
    result += lower[i];
    i++;
  }

  return result;
}

/**
 * Phonetic conversion from Roman/English to Urdu
 */
export function romanToUrduPhonetic(word: string): string {
  const lower = word.toLowerCase().trim();
  if (!lower) return '';
  if (dictionary[lower]) return dictionary[lower].ur;

  let result = '';
  let i = 0;

  while (i < lower.length) {
    const char2 = lower.substr(i, 2);
    const char1 = lower.substr(i, 1);

    if (urduMapping[char2]) {
      result += urduMapping[char2];
      i += 2;
    } else if (urduMapping[char1]) {
      result += urduMapping[char1];
      i += 1;
    } else {
      result += lower[i];
      i++;
    }
  }

  return result;
}

/**
 * Get instant transliteration options for input string (e.g. Sultan -> सुल्तान / سلطان)
 */
export function getTransliterations(input: string): TransliterationOption {
  if (!input || !input.trim()) {
    return { hindi: '', urdu: '', original: input };
  }

  const words = input.trim().split(/\s+/);
  const hindiWords = words.map(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (dictionary[clean]) return dictionary[clean].hi;
    return romanToHindiPhonetic(w);
  });

  const urduWords = words.map(w => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (dictionary[clean]) return dictionary[clean].ur;
    return romanToUrduPhonetic(w);
  });

  return {
    hindi: hindiWords.join(' '),
    urdu: urduWords.join(' '),
    original: input
  };
}

/**
 * Normalize and search across English, Hindi, and Urdu terms
 */
export function matchesSearch(recordText: string, query: string): boolean {
  if (!query) return true;
  if (!recordText) return false;

  const normalizedRecord = recordText.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  // Direct match
  if (normalizedRecord.includes(normalizedQuery)) return true;

  // Transliterate query
  const queryTranslit = getTransliterations(normalizedQuery);
  if (queryTranslit.hindi && normalizedRecord.includes(queryTranslit.hindi.toLowerCase())) return true;
  if (queryTranslit.urdu && normalizedRecord.includes(queryTranslit.urdu.toLowerCase())) return true;

  // Transliterate record
  const recordTranslit = getTransliterations(normalizedRecord);
  if (recordTranslit.hindi && recordTranslit.hindi.toLowerCase().includes(normalizedQuery)) return true;
  if (recordTranslit.urdu && recordTranslit.urdu.toLowerCase().includes(normalizedQuery)) return true;

  return false;
}
