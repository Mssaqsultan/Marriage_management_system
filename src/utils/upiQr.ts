import QRCode from 'qrcode';

export interface UpiPaymentDetails {
  upiId: string;
  payeeName: string;
  amount?: number;
  transactionNote?: string;
  transactionRef?: string;
}

/**
 * Generate standard NPCI Compliant UPI URI
 * Compatible with Google Pay, PhonePe, Paytm, BHIM, Amazon Pay, Cred & all banking apps
 */
export const generateUpiUri = (details: UpiPaymentDetails): string => {
  const { upiId, payeeName, amount, transactionNote } = details;
  
  // Clean VPA (must be trimmed, no spaces)
  const cleanUpiId = (upiId || 'sultan.family@okaxis').trim().toLowerCase();
  
  // Clean Payee Name (remove &, special symbols that break UPI parsers)
  const cleanPayeeName = (payeeName || 'Sultan Family')
    .replace(/&/g, 'and')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();
  
  // Construct standard query params (using encodeURIComponent for clean %20 instead of +)
  let uri = `upi://pay?pa=${encodeURIComponent(cleanUpiId)}&pn=${encodeURIComponent(cleanPayeeName)}&cu=INR`;
  
  // If amount is specified and > 0, include formatted amount
  if (amount && Number(amount) > 0) {
    const cleanAmount = Number(amount).toFixed(2);
    uri += `&am=${cleanAmount}`;
  }
  
  // Clean transaction note (max 40 chars, alphanumeric only)
  if (transactionNote) {
    const cleanNote = transactionNote
      .replace(/&/g, 'and')
      .replace(/[^a-zA-Z0-9 ]/g, ' ')
      .trim()
      .substring(0, 40);
    if (cleanNote) {
      uri += `&tn=${encodeURIComponent(cleanNote)}`;
    }
  }

  return uri;
};

/**
 * Generate high-contrast, crisp UPI QR Code Data URL optimized for all phone cameras
 */
export const generateUpiQrDataUrl = async (details: UpiPaymentDetails): Promise<string> => {
  const upiUri = generateUpiUri(details);
  try {
    const dataUrl = await QRCode.toDataURL(upiUri, {
      margin: 2,
      width: 450,
      color: {
        dark: '#000000', // Pure Black for maximum optical contrast
        light: '#FFFFFF' // Pure White
      },
      errorCorrectionLevel: 'M' // Medium is optimal for scanner readability without overly dense matrix
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate UPI QR code:', err);
    throw err;
  }
};
