// Core Data Types for Nevta (Marriage & Event Gift Ledger) Management System

export type EventStatus = 'Draft' | 'Active' | 'Completed' | 'Archived';
export type EventType = string;

export type CeremonyType = 
  | 'Haldi' 
  | 'Mehendi' 
  | 'Barat' 
  | 'Nikah' 
  | 'Walima' 
  | 'Reception' 
  | 'Nahuchua' 
  | 'Tilak' 
  | 'Sangeet' 
  | 'Dawat' 
  | 'Other';

export type RelationType = 
  | 'Mama' 
  | 'Mami' 
  | 'Chacha' 
  | 'Chachi' 
  | 'Tau' 
  | 'Tai' 
  | 'Fufa' 
  | 'Bua' 
  | 'Brother' 
  | 'Sister' 
  | 'Father' 
  | 'Mother' 
  | 'Cousin' 
  | 'Mausera' 
  | 'Friend' 
  | 'Neighbor' 
  | 'Business Partner' 
  | 'Relative' 
  | 'Other';

export type SideType = 'Groom Side' | 'Bride Side' | 'Host Side' | 'Other';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other';

export type GiftCategory = 
  | 'Clothing' 
  | 'Jewellery' 
  | 'Electronics' 
  | 'Utensils' 
  | 'Dry Fruits' 
  | 'Food' 
  | 'Home Decor' 
  | 'Cash Envelope' 
  | 'Other';

export type UserRole = 'admin' | 'operator';
export type ThemeMode = 'royal-dark' | 'royal-light';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  created_at: string;
}

export interface Ceremony {
  id: string;
  event_id: string;
  name: string;
  ceremony_type: CeremonyType;
  date: string;
  time?: string;
  venue?: string;
  description?: string;
  status: 'Upcoming' | 'Live / Active' | 'Completed';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  event_code: string;
  name: string;
  type: EventType;
  date: string;
  venue: string;
  host_name: string;
  description?: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  archived_at?: string;
}

export interface Guest {
  id: string;
  family_id?: string;
  name: string;
  father_husband_name?: string;
  mobile?: string;
  alternate_mobile?: string;
  address?: string;
  village?: string;
  post?: string;
  district?: string;
  state?: string;
  pincode?: string;
  relation: RelationType;
  side: SideType;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Family {
  id: string;
  name: string;
  head_guest_id?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  mobile?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  event_id: string;
  ceremony_id?: string;
  guest_id: string;
  type: 'nevta' | 'nahuchua';
  amount: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  transaction_date: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Gift {
  id: string;
  event_id: string;
  ceremony_id?: string;
  guest_id: string;
  item_name: string;
  category: GiftCategory;
  quantity: number;
  estimated_value: number;
  condition?: string;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AuditLog {
  id: string;
  user_name: string;
  entity_type: 'Guest' | 'Transaction' | 'Gift' | 'Family' | 'Event' | 'Ceremony' | 'System' | 'User';
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'BACKUP';
  details: string;
  old_data?: string;
  new_data?: string;
  timestamp: string;
}

export interface AppSettings {
  family_name: string;
  operator_name: string;
  default_state: string;
  default_district: string;
  default_village: string;
  currency_symbol: string;
  date_format: string;
  language: 'en' | 'hi' | 'ur';
  theme: ThemeMode;
  auto_transliterate: boolean;
  transliterate_target: 'hi' | 'ur' | 'both';
  sound_effects: boolean;
  upi_id?: string;
  upi_payee_name?: string;
  upi_enabled?: boolean;
}

export interface GuestHistorySummary {
  guest: Guest;
  family?: Family;
  eventsParticipation: {
    event: Event;
    nevtaAmount: number;
    nahuchuaAmount: number;
    gifts: Gift[];
    totalAmount: number;
    transactions: Transaction[];
  }[];
  lifetimeNevta: number;
  lifetimeNahuchua: number;
  lifetimeGiftsCount: number;
  lifetimeGiftValue: number;
  lifetimeTotalValue: number;
}

export interface ReturnGiftRecord {
  id: string;
  guest_id: string;
  family_id?: string;
  direction: 'given_by_us' | 'received_by_us'; // 'given_by_us' (Humne unke yahan diya) | 'received_by_us' (Unhone humare yahan diya)
  event_name: string; // e.g. "Ramesh Ji Beta Nikah 2028"
  date: string;
  amount: number;
  gift_description?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface VyavharSummary {
  guest: Guest;
  family?: Family;
  totalReceived: number; // Unhone humare yahan kitna diya
  totalGiven: number;    // Humne unke yahan kitna diya
  balance: number;       // totalGiven - totalReceived
  status: 'settled' | 'surplus_given' | 'pending_return';
  records: ReturnGiftRecord[];
}
