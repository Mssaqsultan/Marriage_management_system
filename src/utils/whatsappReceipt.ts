export interface WhatsAppReceiptData {
  guestName: string;
  fatherName?: string;
  mobile: string;
  village: string;
  nevtaAmount: number;
  nahuchuaAmount: number;
  giftItemName?: string;
  totalCash: number;
  paymentMethod: string;
  paymentRef?: string;
  date?: string;
  ceremonyName?: string;
  hostName?: string;
  receiptNumber?: string;
  receiptId?: string;
  eventName?: string;
  side?: string;
  relation?: string;
  venue?: string;
}

export type ReceiptLanguage = 'en' | 'hi' | 'ur' | 'combo';

export const generateWhatsAppReceiptMessage = (
  data: WhatsAppReceiptData, 
  lang: ReceiptLanguage = 'en'
): string => {
  const receiptNum = data.receiptNumber || data.receiptId || `NVT-${Date.now().toString().slice(-6)}`;
  const dateStr = data.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const event = data.eventName || 'Wedding & Celebration';
  const host = data.hostName || data.eventName || 'Family & Hosts';
  const ceremony = data.ceremonyName && data.ceremonyName !== data.eventName ? ` (${data.ceremonyName})` : '';

  // --------------------------------------------------------------------------
  // 1. TRILINGUAL COMBINED (ENGLISH + HINDI + URDU - COMPLETE)
  // --------------------------------------------------------------------------
  if (lang === 'combo') {
    const lines: string[] = [
      `👑 ═════════════════════════ 👑`,
      `   *${event.toUpperCase()}*`,
      `   *DIGITAL NEVTA RECEIPT*`,
      `   *डिजिटल नेवता पावती रसीद*`,
      `   *ڈیجیٹل نوتہ اور تحائف رسید*`,
      `👑 ═════════════════════════ 👑`,
      ``,
      `🔖 *Receipt ID / रसीद क्र. / رسید نمبر*: \`#${receiptNum}\``,
      `📅 *Date / दिनांक / تاریخ*: \`${dateStr}\``,
      `🎪 *Occasion / शुभ अवसर / تقریب*: *${event}*${ceremony}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Honorable Guest / सम्मानित अतिथि / معزز مہمان*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• *Name / नाम / نام*: *${data.guestName}*`,
      ...(data.fatherName ? [`• *S/o / पिता-पति / ولدیت*: ${data.fatherName}`] : []),
      `• *Location / गाँव-शहर / پتہ*: *${data.village || 'N/A'}*`,
      ...(data.relation ? [`• *Relation / संबंध / رشتہ*: ${data.relation} (${data.side || 'Host Side'})`] : []),
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💵 *Contribution / नेवता विवरण / نوتہ تفصیل*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...(data.nevtaAmount > 0 ? [`💰 *Nevta / नेवता / نوتہ*: \`₹${data.nevtaAmount.toLocaleString('en-IN')}\``] : []),
      ...(data.nahuchuaAmount > 0 ? [`🌺 *Nahuchua / नहुछुआ / نہوچھوا*: \`₹${data.nahuchuaAmount.toLocaleString('en-IN')}\``] : []),
      ...(data.giftItemName ? [`🎁 *Gift / उपहार / تحفہ*: *${data.giftItemName}*`] : []),
      `─────────────────────────`,
      `💎 *Total Cash / कुल नकद / کل نقد*:`,
      `👉 *₹${data.totalCash.toLocaleString('en-IN')} /- (${data.paymentMethod || 'Cash'})* 👈`,
      ...(data.paymentRef ? [`🔖 *Ref / संदर्भ / حوالہ*: \`${data.paymentRef}\``] : []),
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `💐 *Thank You & Gratitude / धन्यवाद एवं आभार / شکریہ و جزاک اللہ:*`,
      `🇬🇧 *Thank you for gracing our celebration with your warm presence and blessings.*`,
      `🇮🇳 *आपकी गरिमामयी उपस्थिति और अमूल्य आशीर्वाद के लिए आपका हृदय से बहुत-बहुत धन्यवाद एवं आभार।*`,
      `🌙 *آپ کی پرخلوص تشریف آوری اور دعاؤں کے لیے ہمارے پورے خاندان کی جانب سے تہہ دل سے شکریہ اور جزاک اللہ۔*`,
      ``,
      `— *With Warm Regards / सस्नेह विनीत / مخلص و شکر گزار:*`,
      `👑 *${host}*`,
      ...(data.venue ? [`📍 *Venue / स्थान / مقام*: ${data.venue}`] : []),
      `✨ _Digital Nevta Ledger System • डिजिटल नेवता बही-खाता • ڈیجیٹل نوتہ کھاتہ_`
    ];
    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // 2. ENGLISH RECEIPT (PURE EN)
  // --------------------------------------------------------------------------
  if (lang === 'en') {
    const lines: string[] = [
      `👑 ═════════════════════════ 👑`,
      `   *${event.toUpperCase()}*`,
      `   *Digital Nevta & Gift Receipt*`,
      `👑 ═════════════════════════ 👑`,
      ``,
      `🔖 *Receipt ID*: \`#${receiptNum}\``,
      `📅 *Date*: \`${dateStr}\``,
      `🎪 *Occasion*: *${event}*${ceremony}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *Honorable Guest Details*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• *Name*: *${data.guestName}*`,
      ...(data.fatherName ? [`• *S/o / W/o*: ${data.fatherName}`] : []),
      `• *Location / Village*: *${data.village || 'N/A'}*`,
      ...(data.relation ? [`• *Relationship*: ${data.relation} (${data.side || 'Host Side'})`] : []),
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💵 *Contribution & Gifts*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...(data.nevtaAmount > 0 ? [`💰 *Nevta Amount*: \`₹${data.nevtaAmount.toLocaleString('en-IN')}\``] : []),
      ...(data.nahuchuaAmount > 0 ? [`🌺 *Nahuchua*: \`₹${data.nahuchuaAmount.toLocaleString('en-IN')}\``] : []),
      ...(data.giftItemName ? [`🎁 *Gift Item*: *${data.giftItemName}*`] : []),
      `─────────────────────────`,
      `💎 *Total Cash Received*:`,
      `👉 *₹${data.totalCash.toLocaleString('en-IN')} /- (${data.paymentMethod || 'Cash'})* 👈`,
      ...(data.paymentRef ? [`🔖 *Payment Reference*: \`${data.paymentRef}\``] : []),
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `💐 *Thank you for gracing our celebration with your warm presence and heartfelt blessings. Your generosity and love mean the world to our family.*`,
      ``,
      `— *With Warm Regards & Gratitude:*`,
      `👑 *${host}*`,
      ...(data.venue ? [`📍 *Venue*: ${data.venue}`] : []),
      `✨ _Digital Nevta Ledger System_`
    ];
    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // 3. URDU RECEIPT (PURE URDU - اردو)
  // --------------------------------------------------------------------------
  if (lang === 'ur') {
    const lines: string[] = [
      `👑 ═════════════════════════ 👑`,
      `   *${event.toUpperCase()}*`,
      `   *ڈیجیٹل نوتہ اور تحائف رسید*`,
      `👑 ═════════════════════════ 👑`,
      ``,
      `🔖 *رسید نمبر*: \`#${receiptNum}\``,
      `📅 *تاریخ*: \`${dateStr}\``,
      `🎪 *بابرکت تقریب*: *${event}*${ceremony}`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `👤 *معزز مہمان کی تفصیل*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `• *نام*: *${data.guestName}*`,
      ...(data.fatherName ? [`• *ولدیت / زوجیت*: ${data.fatherName}`] : []),
      `• *گاؤں / پتہ*: *${data.village || 'N/A'}*`,
      ...(data.relation ? [`• *رشتہ*: ${data.relation} (${data.side || 'میزبان'})`] : []),
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `💵 *نوتہ اور تحائف کی تفصیل*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...(data.nevtaAmount > 0 ? [`💰 *نوتہ رقم*: \`₹${data.nevtaAmount.toLocaleString('en-IN')}\``] : []),
      ...(data.nahuchuaAmount > 0 ? [`🌺 *نہوچھوا*: \`₹${data.nahuchuaAmount.toLocaleString('en-IN')}\``] : []),
      ...(data.giftItemName ? [`🎁 *تحفہ*: *${data.giftItemName}*`] : []),
      `─────────────────────────`,
      `💎 *کل نقد وصولی*:`,
      `👉 *₹${data.totalCash.toLocaleString('en-IN')} /- (${data.paymentMethod || 'نقد'})* 👈`,
      ...(data.paymentRef ? [`🔖 *حوالہ نمبر*: \`${data.paymentRef}\``] : []),
      `━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      `💐 *آپ کی پرخلوص تشریف آوری اور دعاؤں سے ہماری خوشیاں دوبالا ہوئیں۔ ہمارے پورے خاندان کی جانب سے آپ کا تہہ دل سے بہت بہت شکریہ اور جزاک اللہ۔*`,
      ``,
      `— *مخلص و شکر گزار:*`,
      `👑 *${host}*`,
      ...(data.venue ? [`📍 *مقام*: ${data.venue}`] : []),
      `✨ _ڈیجیٹل نوتہ کھاتہ سسٹم_`
    ];
    return lines.join('\n');
  }

  // --------------------------------------------------------------------------
  // 4. HINDI RECEIPT (PURE HINDI - हिंदी)
  // --------------------------------------------------------------------------
  const lines: string[] = [
    `👑 ═════════════════════════ 👑`,
    `   *${event.toUpperCase()}*`,
    `   *डिजिटल नेवता एवं उपहार पावती रसीद*`,
    `👑 ═════════════════════════ 👑`,
    ``,
    `🔖 *रसीद क्र.*: \`#${receiptNum}\``,
    `📅 *दिनांक*: \`${dateStr}\``,
    `🎪 *शुभ अवसर*: *${event}*${ceremony}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *सम्मानित अतिथि विवरण*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `• *नाम*: *${data.guestName}*`,
    ...(data.fatherName ? [`• *पिता / पति*: ${data.fatherName}`] : []),
    `• *गाँव / शहर*: *${data.village || 'N/A'}*`,
    ...(data.relation ? [`• *संबंध*: ${data.relation} (${data.side || 'आयोजक पक्ष'})`] : []),
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `💵 *नेवता एवं उपहार विवरण*`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ...(data.nevtaAmount > 0 ? [`💰 *नेवता राशि*: \`₹${data.nevtaAmount.toLocaleString('en-IN')}\``] : []),
    ...(data.nahuchuaAmount > 0 ? [`🌺 *नहुछुआ राशि*: \`₹${data.nahuchuaAmount.toLocaleString('en-IN')}\``] : []),
    ...(data.giftItemName ? [`🎁 *उपहार सामग्री*: *${data.giftItemName}*`] : []),
    `─────────────────────────`,
    `💎 *कुल नकद योगदान*:`,
    `👉 *₹${data.totalCash.toLocaleString('en-IN')} /- (${data.paymentMethod || 'नकद'})* 👈`,
    ...(data.paymentRef ? [`🔖 *भुगतान संदर्भ*: \`${data.paymentRef}\``] : []),
    `━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `💐 *आपकी गरिमामयी उपस्थिति और अमूल्य आशीर्वाद से हमारा आयोजन सफल और पावन हुआ। हमारे समस्त परिवार की ओर से आपका हृदय से बहुत-बहुत धन्यवाद एवं आभार।*`,
    ``,
    `— *विनीत एवं सस्नेह धन्यवाद:*`,
    `👑 *${host}*`,
    ...(data.venue ? [`📍 *स्थान*: ${data.venue}`] : []),
    `✨ _डिजिटल नेवता बही-खाता प्रणाली_`
  ];

  return lines.join('\n');
};
