import { 
  Event, Guest, Family, Transaction, Gift, AuditLog, AppSettings, GuestHistorySummary, User, Ceremony, ReturnGiftRecord, VyavharSummary 
} from '../types';
import { cloudSync } from './supabaseSync';

const STORAGE_KEYS = {
  EVENTS: 'nevta_system_events_v8',
  EVENT_TYPES: 'nevta_system_event_types_v8',
  CEREMONIES: 'nevta_system_ceremonies_v8',
  GUESTS: 'nevta_system_guests_v8',
  FAMILIES: 'nevta_system_families_v8',
  TRANSACTIONS: 'nevta_system_transactions_v8',
  GIFTS: 'nevta_system_gifts_v8',
  AUDIT_LOGS: 'nevta_system_audit_logs_v8',
  SETTINGS: 'nevta_system_settings_v8',
  ACTIVE_EVENT_ID: 'nevta_system_active_event_id_v8',
  ACTIVE_CEREMONY_ID: 'nevta_system_active_ceremony_id_v8',
  USERS: 'nevta_system_users_v8',
  CURRENT_USER: 'nevta_system_current_user_v8',
  RETURN_GIFTS: 'nevta_system_return_gifts_v8'
};

const DEFAULT_EVENT_TYPES: string[] = ['Marriage'];

const DEFAULT_SETTINGS: AppSettings = {
  family_name: 'Sultan Family',
  operator_name: 'Sultan',
  default_state: 'Uttar Pradesh',
  default_district: 'Lucknow',
  default_village: 'Chauriya khas',
  currency_symbol: '₹',
  date_format: 'DD/MM/YYYY',
  language: 'en',
  theme: 'royal-light',
  auto_transliterate: true,
  transliterate_target: 'both',
  sound_effects: true,
  upi_id: 'sultan.family@okaxis',
  upi_payee_name: 'Sultan Salahuddin & Family',
  upi_enabled: true
};

const SEED_USERS: User[] = [
  {
    id: 'usr-1',
    username: 'sultan',
    name: 'Sultan Salahuddin (Super Admin)',
    role: 'admin',
    password: '123',
    created_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'usr-2',
    username: 'operator',
    name: 'Farhan (Counter Operator)',
    role: 'operator',
    password: '123',
    created_at: '2026-09-01T10:00:00.000Z'
  }
];

// 1 Event Type and 1 Event (Marriage) - User can add more anytime
const SEED_EVENTS: Event[] = [
  {
    id: 'evt-1',
    event_code: 'EVT-2027-MAR',
    name: 'Sultan Ki Grand Shaadi',
    type: 'Marriage',
    date: '2027-02-15',
    venue: 'Royal Emerald Palace & Gardens, Chauriya khas',
    host_name: 'Sultan Salahuddin & Family',
    description: 'Grand Wedding Celebrations of Sultan with Haldi, Mehendi, Nikah & Walima',
    status: 'Active',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  }
];

// Specific Ceremonies / Functions for the Wedding
const SEED_CEREMONIES: Ceremony[] = [
  // Under evt-1 (Marriage)
  {
    id: 'crm-1-1',
    event_id: 'evt-1',
    name: 'Haldi & Manjha Rasam',
    ceremony_type: 'Haldi',
    date: '2027-02-13',
    time: '11:00 AM',
    venue: 'Sultan Haveli Courtyard, Chauriya khas',
    description: 'Traditional turmeric blessing ritual and family gathering',
    status: 'Upcoming',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'crm-1-2',
    event_id: 'evt-1',
    name: 'Mehendi Ki Raat & Sangeet',
    ceremony_type: 'Mehendi',
    date: '2027-02-14',
    time: '07:30 PM',
    venue: 'Emerald Royal Lawn, Chauriya khas',
    description: 'Musical evening & traditional henna application',
    status: 'Upcoming',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'crm-1-3',
    event_id: 'evt-1',
    name: 'Nikah & Main Barat Ceremony',
    ceremony_type: 'Nikah',
    date: '2027-02-15',
    time: '01:00 PM',
    venue: 'Royal Emerald Palace Grand Ballroom',
    description: 'Main marriage nikah solemnization, Barat reception & auspicious Nevta ledger',
    status: 'Live / Active',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'crm-1-4',
    event_id: 'evt-1',
    name: 'Royal Dawat-e-Walima / Reception',
    ceremony_type: 'Walima',
    date: '2027-02-18',
    time: '07:00 PM',
    venue: 'Taj Heritage Grand Hall, Lucknow',
    description: 'Post-wedding grand feast and reception for all honorable guests',
    status: 'Upcoming',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  }
];

const SEED_FAMILIES: Family[] = [
  {
    id: 'fam-1',
    name: 'Sultan Household',
    head_guest_id: 'gst-1',
    address: 'Main Royal Haveli, Station Road',
    village: 'Chauriya khas',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    mobile: '9876543210',
    notes: 'Primary Host Family for Sultan Ki Shaadi',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'fam-2',
    name: 'Siddiqui Family',
    head_guest_id: 'gst-2',
    address: 'Near Shahi Masjid, Ward 4',
    village: 'Rampur',
    district: 'Rampur',
    state: 'Uttar Pradesh',
    mobile: '9812345678',
    notes: 'Primary Host Family for Rizwan Ki Shaadi',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'fam-3',
    name: 'Rashid Khan Household',
    head_guest_id: 'gst-3',
    address: 'Kisan Marg, Sector 2',
    village: 'Chauriya khas',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    mobile: '9834567890',
    notes: 'Mama side family with historical connections',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'fam-4',
    name: 'Haji Qureshi Family',
    head_guest_id: 'gst-5',
    address: 'Gomti Nagar Extension, Plot 12',
    village: 'Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    mobile: '9712345678',
    notes: 'Bride side close elders',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'fam-5',
    name: 'Ansari & Sons Family',
    head_guest_id: 'gst-6',
    address: 'Bunkar Colony, Civil Lines',
    village: 'Azamgarh',
    district: 'Azamgarh',
    state: 'Uttar Pradesh',
    mobile: '9612345678',
    notes: 'Respected maternal branch',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  }
];

const SEED_GUESTS: Guest[] = [
  {
    id: 'gst-1',
    family_id: 'fam-1',
    name: 'Sultan Salahuddin',
    father_husband_name: 'Haji Iqbal Khan',
    mobile: '9876543210',
    alternate_mobile: '9876543211',
    address: 'Royal Haveli, Station Road',
    village: 'Chauriya khas',
    post: 'Chauriya khas',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226001',
    relation: 'Brother',
    side: 'Host Side',
    notes: 'Chief Host & Groom (Sultan Ki Shaadi)',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-2',
    family_id: 'fam-2',
    name: 'Mukhtar Ahmad Siddiqui',
    father_husband_name: 'Janab Asghar Siddiqui',
    mobile: '9812345678',
    alternate_mobile: '9812345679',
    address: 'Ward 4, Near Shahi Masjid',
    village: 'Rampur',
    post: 'Rampur City',
    district: 'Rampur',
    state: 'Uttar Pradesh',
    pincode: '244901',
    relation: 'Brother',
    side: 'Host Side',
    notes: 'Chief Host (Rizwan Ki Shaadi)',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-3',
    family_id: 'fam-3',
    name: 'Rashid Khan',
    father_husband_name: 'Janab Afzal Khan',
    mobile: '9834567890',
    alternate_mobile: '9834567899',
    address: 'Kisan Marg, Sector 2',
    village: 'Chauriya khas',
    post: 'Chauriya khas',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226001',
    relation: 'Mama',
    side: 'Groom Side',
    notes: 'Arrived with entire family; prestigious elder',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-4',
    family_id: 'fam-3',
    name: 'Bilal Khan',
    father_husband_name: 'Rashid Khan',
    mobile: '9834567891',
    village: 'Chauriya khas',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    relation: 'Cousin',
    side: 'Groom Side',
    notes: 'Rashid Khan\'s eldest son',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-5',
    family_id: 'fam-4',
    name: 'Maqbool Qureshi',
    father_husband_name: 'Haji Mushtaq Qureshi',
    mobile: '9712345678',
    address: 'Gomti Nagar Extension, Plot 12',
    village: 'Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226010',
    relation: 'Chacha',
    side: 'Bride Side',
    notes: 'Respected elder & teacher',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-6',
    family_id: 'fam-5',
    name: 'Tariq Ansari',
    father_husband_name: 'Haji Bashir Ansari',
    mobile: '9612345678',
    address: 'Bunkar Colony',
    village: 'Azamgarh',
    district: 'Azamgarh',
    state: 'Uttar Pradesh',
    pincode: '276001',
    relation: 'Mama',
    side: 'Bride Side',
    notes: 'Handloom textile merchant',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-7',
    name: 'Danish Ali',
    father_husband_name: 'Zahid Ali',
    mobile: '9512345678',
    village: 'Delhi',
    district: 'South Delhi',
    state: 'Delhi',
    pincode: '110025',
    relation: 'Friend',
    side: 'Groom Side',
    notes: 'College friend of Sultan',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-8',
    name: 'Farhan Khan',
    father_husband_name: 'Nawab Aslam Khan',
    mobile: '9412345678',
    village: 'Rampur',
    district: 'Rampur',
    state: 'Uttar Pradesh',
    relation: 'Fufa',
    side: 'Host Side',
    notes: 'Arrived early to help coordinate arrangements',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-9',
    name: 'Salman Sheikh',
    father_husband_name: 'Kareem Sheikh',
    mobile: '9312345678',
    village: 'Kanpur',
    district: 'Kanpur Nagar',
    state: 'Uttar Pradesh',
    relation: 'Business Partner',
    side: 'Bride Side',
    notes: 'Industrialist colleague',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-10',
    name: 'Imran Malik',
    father_husband_name: 'Subedar Jameel Malik',
    mobile: '9212345678',
    village: 'Chauriya khas',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    relation: 'Neighbor',
    side: 'Groom Side',
    notes: 'Respected village elder neighbor',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'gst-11',
    name: 'Fatima Bibi',
    father_husband_name: 'Syed Anwar',
    mobile: '9112345678',
    village: 'Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    relation: 'Mami',
    side: 'Bride Side',
    notes: 'Elder aunt',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  }
];

const SEED_TRANSACTIONS: Transaction[] = [
  // Under Sultan Ki Shaadi (evt-1) -> Nikah & Barat (crm-1-3)
  {
    id: 'txn-1',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-3',
    guest_id: 'gst-3', // Rashid Khan
    type: 'nevta',
    amount: 5100,
    payment_method: 'Cash',
    transaction_date: '2027-02-15T11:30:00.000Z',
    notes: 'Gave in auspicious gold envelope at Nikah',
    created_by: 'Sultan',
    created_at: '2027-02-15T11:30:00.000Z',
    updated_at: '2027-02-15T11:30:00.000Z'
  },
  {
    id: 'txn-2',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-3',
    guest_id: 'gst-3', // Rashid Khan
    type: 'nahuchua',
    amount: 1100,
    payment_method: 'Cash',
    transaction_date: '2027-02-15T11:30:00.000Z',
    notes: 'Nahuchua ritual blessings',
    created_by: 'Sultan',
    created_at: '2027-02-15T11:30:00.000Z',
    updated_at: '2027-02-15T11:30:00.000Z'
  },
  {
    id: 'txn-3',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-3',
    guest_id: 'gst-5', // Maqbool Qureshi
    type: 'nevta',
    amount: 3100,
    payment_method: 'UPI',
    payment_reference: 'UPI/2027/9887711234',
    transaction_date: '2027-02-15T12:00:00.000Z',
    notes: 'Received on Counter QR Code',
    created_by: 'Sultan',
    created_at: '2027-02-15T12:00:00.000Z',
    updated_at: '2027-02-15T12:00:00.000Z'
  },
  {
    id: 'txn-4',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-3',
    guest_id: 'gst-5', // Maqbool Qureshi
    type: 'nahuchua',
    amount: 501,
    payment_method: 'Cash',
    transaction_date: '2027-02-15T12:00:00.000Z',
    created_by: 'Sultan',
    created_at: '2027-02-15T12:00:00.000Z',
    updated_at: '2027-02-15T12:00:00.000Z'
  },
  // Under Sultan Ki Shaadi (evt-1) -> Walima (crm-1-4)
  {
    id: 'txn-5',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-4',
    guest_id: 'gst-6', // Tariq Ansari
    type: 'nevta',
    amount: 11000,
    payment_method: 'Bank Transfer',
    payment_reference: 'IMPS/HDFC/554433221',
    transaction_date: '2027-02-18T19:45:00.000Z',
    notes: 'Walima contribution transferred directly',
    created_by: 'Farhan (Counter Operator)',
    created_at: '2027-02-18T19:45:00.000Z',
    updated_at: '2027-02-18T19:45:00.000Z'
  },
  {
    id: 'txn-6',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-4',
    guest_id: 'gst-6', // Tariq Ansari
    type: 'nahuchua',
    amount: 2100,
    payment_method: 'Cash',
    transaction_date: '2027-02-18T19:45:00.000Z',
    created_by: 'Farhan (Counter Operator)',
    created_at: '2027-02-18T19:45:00.000Z',
    updated_at: '2027-02-18T19:45:00.000Z'
  },
  {
    id: 'txn-7',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-3',
    guest_id: 'gst-7', // Danish Ali
    type: 'nevta',
    amount: 5000,
    payment_method: 'UPI',
    payment_reference: 'UPI/2027/GPay889977',
    transaction_date: '2027-02-15T13:10:00.000Z',
    notes: 'GPay friend contribution',
    created_by: 'Farhan (Counter Operator)',
    created_at: '2027-02-15T13:10:00.000Z',
    updated_at: '2027-02-15T13:10:00.000Z'
  },
  {
    id: 'txn-8',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-3',
    guest_id: 'gst-8', // Farhan Khan
    type: 'nevta',
    amount: 5100,
    payment_method: 'Cash',
    transaction_date: '2027-02-15T13:30:00.000Z',
    created_by: 'Sultan',
    created_at: '2027-02-15T13:30:00.000Z',
    updated_at: '2027-02-15T13:30:00.000Z'
  }
];

const SEED_GIFTS: Gift[] = [
  {
    id: 'gft-1',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-3',
    guest_id: 'gst-3', // Rashid Khan
    item_name: 'Pure Silk Sherwani & Shawl Set',
    category: 'Clothing',
    quantity: 1,
    estimated_value: 8500,
    condition: 'New with Gold Ribbon',
    notes: 'Special gift for Sultan Nikah from Mama',
    created_at: '2027-02-15T11:30:00.000Z',
    updated_at: '2027-02-15T11:30:00.000Z'
  },
  {
    id: 'gft-2',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-4',
    guest_id: 'gst-6', // Tariq Ansari
    item_name: 'Traditional Banarasi Brocade Suit',
    category: 'Clothing',
    quantity: 2,
    estimated_value: 12000,
    condition: 'Exclusive Handloom',
    notes: 'Presented at Walima',
    created_at: '2027-02-18T19:45:00.000Z',
    updated_at: '2027-02-18T19:45:00.000Z'
  },
  {
    id: 'gft-3',
    event_id: 'evt-1',
    ceremony_id: 'crm-1-2',
    guest_id: 'gst-7', // Danish Ali
    item_name: 'Smart Watch Luxury Edition',
    category: 'Electronics',
    quantity: 1,
    estimated_value: 6500,
    condition: 'Sealed Box',
    notes: 'Given on Mehendi Night',
    created_at: '2027-02-14T20:10:00.000Z',
    updated_at: '2027-02-14T20:10:00.000Z'
  }
];

const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    user_name: 'Sultan',
    entity_type: 'System',
    entity_id: 'sys-init',
    action: 'CREATE',
    details: 'System initialized with Sultan & Rizwan Multi-Celebration Architecture',
    timestamp: '2026-09-01T10:00:00.000Z'
  },
  {
    id: 'aud-2',
    user_name: 'Sultan',
    entity_type: 'Event',
    entity_id: 'evt-1',
    action: 'CREATE',
    details: 'Created Celebration "Sultan Ki Grand Shaadi" with 4 Ceremonies',
    timestamp: '2026-09-01T10:05:00.000Z'
  }
];

class DatabaseService {
  private events: Event[] = [];
  private eventTypes: string[] = [...DEFAULT_EVENT_TYPES];
  private ceremonies: Ceremony[] = [];
  private guests: Guest[] = [];
  private families: Family[] = [];
  private transactions: Transaction[] = [];
  private gifts: Gift[] = [];
  private auditLogs: AuditLog[] = [];
  private settings: AppSettings = DEFAULT_SETTINGS;
  private activeEventId: string = 'evt-1';
  private activeCeremonyId: string = 'crm-1-3';
  private users: User[] = [];
  private currentUser: User | null = null;
  private returnGifts: ReturnGiftRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      const storedEventTypes = localStorage.getItem(STORAGE_KEYS.EVENT_TYPES);
      const storedCeremonies = localStorage.getItem(STORAGE_KEYS.CEREMONIES);
      const storedGuests = localStorage.getItem(STORAGE_KEYS.GUESTS);
      const storedFamilies = localStorage.getItem(STORAGE_KEYS.FAMILIES);
      const storedTransactions = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      const storedGifts = localStorage.getItem(STORAGE_KEYS.GIFTS);
      const storedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedActiveEventId = localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
      const storedActiveCeremonyId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CEREMONY_ID);
      const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
      const storedCurrentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);

      this.events = storedEvents ? JSON.parse(storedEvents) : [...SEED_EVENTS];
      this.eventTypes = storedEventTypes ? JSON.parse(storedEventTypes) : [...DEFAULT_EVENT_TYPES];
      this.ceremonies = storedCeremonies ? JSON.parse(storedCeremonies) : [...SEED_CEREMONIES];
      this.guests = storedGuests ? JSON.parse(storedGuests) : [...SEED_GUESTS];
      this.families = storedFamilies ? JSON.parse(storedFamilies) : [...SEED_FAMILIES];
      this.transactions = storedTransactions ? JSON.parse(storedTransactions) : [...SEED_TRANSACTIONS];
      this.gifts = storedGifts ? JSON.parse(storedGifts) : [...SEED_GIFTS];
      this.auditLogs = storedAuditLogs ? JSON.parse(storedAuditLogs) : [...SEED_AUDIT_LOGS];
      this.settings = storedSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) } : { ...DEFAULT_SETTINGS };
      this.activeEventId = storedActiveEventId || 'evt-1';
      this.activeCeremonyId = storedActiveCeremonyId || 'crm-1-3';
      this.users = storedUsers ? JSON.parse(storedUsers) : [...SEED_USERS];
      this.currentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;
      const storedReturnGifts = localStorage.getItem(STORAGE_KEYS.RETURN_GIFTS);
      this.returnGifts = storedReturnGifts ? JSON.parse(storedReturnGifts) : [];

      if (!storedEvents) {
        this.saveAll();
      }

      // Auto-migrate legacy village name to Chauriya khas across loaded data
      let needsSave = false;
      this.events = this.events.map(e => {
        if (e.venue && e.venue.includes('Lakhanpur')) {
          needsSave = true;
          return { ...e, venue: e.venue.replace(/Lakhanpur/gi, 'Chauriya khas') };
        }
        return e;
      });

      this.ceremonies = this.ceremonies.map(c => {
        if (c.venue && c.venue.includes('Lakhanpur')) {
          needsSave = true;
          return { ...c, venue: c.venue.replace(/Lakhanpur/gi, 'Chauriya khas') };
        }
        return c;
      });

      this.guests = this.guests.map(g => {
        if ((g.village && g.village.includes('Lakhanpur')) || (g.post && g.post.includes('Lakhanpur'))) {
          needsSave = true;
          return { 
            ...g, 
            village: g.village ? g.village.replace(/Lakhanpur/gi, 'Chauriya khas') : g.village,
            post: g.post ? g.post.replace(/Lakhanpur/gi, 'Chauriya khas') : g.post,
            address: g.address ? g.address.replace(/Lakhanpur/gi, 'Chauriya khas') : g.address
          };
        }
        return g;
      });

      this.families = this.families.map(f => {
        if (f.village && f.village.includes('Lakhanpur')) {
          needsSave = true;
          return { ...f, village: f.village.replace(/Lakhanpur/gi, 'Chauriya khas') };
        }
        return f;
      });

      if (this.settings.default_village === 'Lakhanpur') {
        this.settings.default_village = 'Chauriya khas';
        needsSave = true;
      }

      // Auto-migrate Sultan Khan -> Sultan Salahuddin
      this.users = this.users.map(u => {
        if (u.username === 'sultan' && (u.name.includes('Sultan Khan') || u.name === 'Sultan (Super Admin)' || !u.name.includes('Salahuddin'))) {
          needsSave = true;
          return { ...u, name: 'Sultan Salahuddin (Super Admin)' };
        }
        return u;
      });

      if (this.currentUser && this.currentUser.username === 'sultan' && (this.currentUser.name.includes('Sultan Khan') || this.currentUser.name === 'Sultan (Super Admin)' || !this.currentUser.name.includes('Salahuddin'))) {
        this.currentUser.name = 'Sultan Salahuddin (Super Admin)';
        needsSave = true;
      }

      this.guests = this.guests.map(g => {
        if (g.name === 'Sultan Khan') {
          needsSave = true;
          return { ...g, name: 'Sultan Salahuddin' };
        }
        return g;
      });

      if (needsSave) {
        this.saveAll();
      }
    } catch (e) {
      console.error('Error loading data from localStorage, falling back to defaults', e);
      this.resetToDefaults();
    }
  }

  private saveAll() {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    localStorage.setItem(STORAGE_KEYS.EVENT_TYPES, JSON.stringify(this.eventTypes));
    localStorage.setItem(STORAGE_KEYS.CEREMONIES, JSON.stringify(this.ceremonies));
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(this.families));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    localStorage.setItem(STORAGE_KEYS.GIFTS, JSON.stringify(this.gifts));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, this.activeEventId);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CEREMONY_ID, this.activeCeremonyId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    if (this.currentUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public resetToDefaults() {
    this.events = [...SEED_EVENTS];
    this.eventTypes = [...DEFAULT_EVENT_TYPES];
    this.ceremonies = [...SEED_CEREMONIES];
    this.guests = [...SEED_GUESTS];
    this.families = [...SEED_FAMILIES];
    this.transactions = [...SEED_TRANSACTIONS];
    this.gifts = [...SEED_GIFTS];
    this.auditLogs = [...SEED_AUDIT_LOGS];
    this.settings = { ...DEFAULT_SETTINGS };
    this.activeEventId = 'evt-1';
    this.activeCeremonyId = 'crm-1-3';
    this.users = [...SEED_USERS];
    this.saveAll();
    this.logAudit('System', 'sys-reset', 'RESTORE', 'Reset database to multi-celebration seed dataset');
  }

  // --- Auth & Users ---
  public getUsers(): User[] {
    return [...this.users];
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      this.logAudit('User', user.id, 'UPDATE', `User "${user.name}" logged in as ${user.role.toUpperCase()}`);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public login(username: string, password?: string): User | null {
    const cleanUser = username.trim().toLowerCase();
    const user = this.users.find(u => u.username.toLowerCase() === cleanUser);
    if (!user) return null;

    if (password && user.password && user.password !== password) {
      return null;
    }

    this.setCurrentUser(user);
    return user;
  }

  public logout() {
    if (this.currentUser) {
      this.logAudit('User', this.currentUser.id, 'UPDATE', `User "${this.currentUser.name}" logged out`);
    }
    this.setCurrentUser(null);
  }

  public addUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
      created_at: new Date().toISOString()
    };
    this.users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    this.logAudit('User', newUser.id, 'CREATE', `Created user "${newUser.name}" (@${newUser.username})`);
    cloudSync.pushUser(newUser);
    return newUser;
  }

  public deleteUser(id: string): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    const name = this.users[idx].name;
    this.users.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    this.logAudit('User', id, 'DELETE', `Deleted user "${name}"`);
    cloudSync.deleteUser(id);
    return true;
  }

  public updateUserPassword(id: string, newPassword: string): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users[idx] = {
      ...this.users[idx],
      password: newPassword
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    if (this.currentUser && this.currentUser.id === id) {
      this.currentUser = { ...this.users[idx] };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    }
    this.logAudit('User', id, 'UPDATE', `Updated password for user "${this.users[idx].name}"`);
    cloudSync.pushUser(this.users[idx]);
    return true;
  }

  // --- Audit Logging ---
  public logAudit(
    entity_type: AuditLog['entity_type'],
    entity_id: string,
    action: AuditLog['action'],
    details: string,
    old_data?: any,
    new_data?: any
  ) {
    const log: AuditLog = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      user_name: this.currentUser?.name || this.settings.operator_name || 'Sultan',
      entity_type,
      entity_id,
      action,
      details,
      old_data: old_data ? JSON.stringify(old_data) : undefined,
      new_data: new_data ? JSON.stringify(new_data) : undefined,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    this.logAudit('System', 'settings', 'UPDATE', 'Updated system preferences');
    cloudSync.pushSettings(this.settings);
    return this.settings;
  }

  // --- Cloud Sync Override Methods ---
  public overrideUsers(users: User[]) {
    if (!users || users.length === 0) return;
    const userMap = new Map<string, User>();
    this.users.forEach(u => userMap.set(u.id, u));
    users.forEach(u => userMap.set(u.id, u));
    this.users = Array.from(userMap.values());
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  public overrideSettings(settings: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
  }
  public overrideEvents(events: Event[]) {
    this.events = events;
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  public overrideCeremonies(ceremonies: Ceremony[]) {
    this.ceremonies = ceremonies;
    localStorage.setItem(STORAGE_KEYS.CEREMONIES, JSON.stringify(ceremonies));
  }

  public overrideFamilies(families: Family[]) {
    this.families = families;
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(families));
  }

  public overrideGuests(guests: Guest[]) {
    this.guests = guests;
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(guests));
  }

  public overrideTransactions(transactions: Transaction[]) {
    this.transactions = transactions;
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  public overrideGifts(gifts: Gift[]) {
    this.gifts = gifts;
    localStorage.setItem(STORAGE_KEYS.GIFTS, JSON.stringify(gifts));
  }

  // --- Events (Celebrations) ---
  public getEvents(includeArchived = false): Event[] {
    return this.events.filter(e => includeArchived || e.status !== 'Archived');
  }

  public getEventById(id: string): Event | undefined {
    return this.events.find(e => e.id === id);
  }

  public getActiveEvent(): Event {
    const active = this.events.find(e => e.id === this.activeEventId);
    if (active) return active;
    return this.events[0] || SEED_EVENTS[0];
  }

  public setActiveEventId(id: string) {
    this.activeEventId = id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
    
    // Automatically switch active ceremony to the first ceremony of this celebration
    const eventCeremonies = this.getCeremonies(id);
    if (eventCeremonies.length > 0) {
      this.setActiveCeremonyId(eventCeremonies[0].id);
    }
    
    this.logAudit('Event', id, 'UPDATE', `Switched active celebration to "${this.getActiveEvent().name}"`);
  }

  public addEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Event {
    const newEvent: Event = {
      ...eventData,
      id: 'evt-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.events.unshift(newEvent);
    
    // Create default ceremonies for this wedding
    this.addCeremony({
      event_id: newEvent.id,
      name: 'Nikah & Main Barat',
      ceremony_type: 'Nikah',
      date: newEvent.date,
      venue: newEvent.venue,
      status: 'Live / Active'
    });
    this.addCeremony({
      event_id: newEvent.id,
      name: 'Walima / Reception',
      ceremony_type: 'Walima',
      date: newEvent.date,
      venue: newEvent.venue,
      status: 'Upcoming'
    });

    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    this.logAudit('Event', newEvent.id, 'CREATE', `Created celebration "${newEvent.name}"`);
    cloudSync.pushEvent(newEvent);
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<Event>): Event | null {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    const old = this.events[idx];
    this.events[idx] = { ...old, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    this.logAudit('Event', id, 'UPDATE', `Updated celebration "${this.events[idx].name}"`, old, this.events[idx]);
    cloudSync.pushEvent(this.events[idx]);
    return this.events[idx];
  }

  public deleteEvent(id: string): boolean {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx === -1) return false;
    const deletedName = this.events[idx].name;

    // If deleting the only celebration, create a fresh clean placeholder event first
    if (this.events.length <= 1) {
      const freshEvent: Event = {
        id: 'evt-' + Date.now(),
        event_code: `EVT-${new Date().getFullYear()}-001`,
        name: 'Nayi Shaadi / Celebration',
        type: 'Marriage',
        date: new Date().toISOString().split('T')[0],
        venue: 'Grand Banquet Hall',
        host_name: 'Host Family',
        description: 'New Celebration Ledger',
        status: 'Active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.events.push(freshEvent);
      cloudSync.pushEvent(freshEvent);
    }

    // Remove the target event
    const targetIdx = this.events.findIndex(e => e.id === id);
    if (targetIdx !== -1) {
      this.events.splice(targetIdx, 1);
    }

    // If deleted event was active, point activeEventId to the remaining event
    if (this.activeEventId === id) {
      this.activeEventId = this.events[0].id;
      localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, this.activeEventId);
    }

    this.ceremonies = this.ceremonies.filter(c => c.event_id !== id);
    this.transactions = this.transactions.filter(t => t.event_id !== id);
    this.gifts = this.gifts.filter(g => g.event_id !== id);
    this.saveAll();
    this.logAudit('Event', id, 'DELETE', `Deleted celebration "${deletedName}"`);
    cloudSync.deleteEvent(id);
    return true;
  }

  // --- Event Types ---
  public getEventTypes(): string[] {
    return [...this.eventTypes];
  }

  public addEventType(name: string): string[] {
    const trimmed = name.trim();
    if (trimmed && !this.eventTypes.includes(trimmed)) {
      this.eventTypes.push(trimmed);
      localStorage.setItem(STORAGE_KEYS.EVENT_TYPES, JSON.stringify(this.eventTypes));
      this.logAudit('System', 'event_type', 'CREATE', `Added event type "${trimmed}"`);
    }
    return [...this.eventTypes];
  }

  public deleteEventType(name: string): string[] {
    if (this.eventTypes.length <= 1) return [...this.eventTypes];
    this.eventTypes = this.eventTypes.filter(t => t !== name);
    localStorage.setItem(STORAGE_KEYS.EVENT_TYPES, JSON.stringify(this.eventTypes));
    this.logAudit('System', 'event_type', 'DELETE', `Deleted event type "${name}"`);
    return [...this.eventTypes];
  }

  // --- Ceremonies (Functions / Rasam) ---
  public getCeremonies(eventId?: string): Ceremony[] {
    if (eventId) {
      return this.ceremonies.filter(c => c.event_id === eventId);
    }
    return [...this.ceremonies];
  }

  public getCeremonyById(id: string): Ceremony | undefined {
    return this.ceremonies.find(c => c.id === id);
  }

  public getActiveCeremony(): Ceremony | undefined {
    const ceremony = this.ceremonies.find(c => c.id === this.activeCeremonyId && c.event_id === this.activeEventId);
    if (ceremony) return ceremony;
    const eventCeremonies = this.getCeremonies(this.activeEventId);
    return eventCeremonies[0];
  }

  public getActiveCeremonyId(): string {
    return this.activeCeremonyId;
  }

  public setActiveCeremonyId(id: string) {
    this.activeCeremonyId = id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CEREMONY_ID, id);
    const ceremony = this.getCeremonyById(id);
    if (ceremony) {
      this.logAudit('Ceremony', id, 'UPDATE', `Switched active ceremony to "${ceremony.name}"`);
    }
  }

  public addCeremony(ceremonyData: Omit<Ceremony, 'id' | 'created_at' | 'updated_at'>): Ceremony {
    const newCeremony: Ceremony = {
      ...ceremonyData,
      id: 'crm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.ceremonies.push(newCeremony);
    localStorage.setItem(STORAGE_KEYS.CEREMONIES, JSON.stringify(this.ceremonies));
    this.logAudit('Ceremony', newCeremony.id, 'CREATE', `Added ceremony "${newCeremony.name}" to celebration`);
    cloudSync.pushCeremony(newCeremony);
    return newCeremony;
  }

  public updateCeremony(id: string, updates: Partial<Ceremony>): Ceremony | null {
    const idx = this.ceremonies.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const old = this.ceremonies[idx];
    this.ceremonies[idx] = { ...old, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CEREMONIES, JSON.stringify(this.ceremonies));
    this.logAudit('Ceremony', id, 'UPDATE', `Updated ceremony "${this.ceremonies[idx].name}"`);
    cloudSync.pushCeremony(this.ceremonies[idx]);
    return this.ceremonies[idx];
  }

  public deleteCeremony(id: string): boolean {
    const idx = this.ceremonies.findIndex(c => c.id === id);
    if (idx === -1) return false;
    const name = this.ceremonies[idx].name;
    this.ceremonies.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.CEREMONIES, JSON.stringify(this.ceremonies));
    this.logAudit('Ceremony', id, 'DELETE', `Deleted ceremony "${name}"`);
    cloudSync.deleteCeremony(id);
    return true;
  }

  // --- Guests ---
  public getGuests(includeDeleted = false): Guest[] {
    return this.guests.filter(g => includeDeleted || !g.deleted_at);
  }

  public getGuestById(id: string): Guest | undefined {
    return this.guests.find(g => g.id === id);
  }

  public addGuest(guestData: Omit<Guest, 'id' | 'created_at' | 'updated_at'>): Guest {
    const newGuest: Guest = {
      ...guestData,
      id: 'gst-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.guests.unshift(newGuest);
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    this.logAudit('Guest', newGuest.id, 'CREATE', `Added guest "${newGuest.name}" (${newGuest.village || 'No Village'})`);
    cloudSync.pushGuest(newGuest);
    return newGuest;
  }

  public updateGuest(id: string, updates: Partial<Guest>): Guest | null {
    const idx = this.guests.findIndex(g => g.id === id);
    if (idx === -1) return null;
    const old = this.guests[idx];
    this.guests[idx] = { ...old, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    this.logAudit('Guest', id, 'UPDATE', `Updated guest details for "${this.guests[idx].name}"`, old, this.guests[idx]);
    cloudSync.pushGuest(this.guests[idx]);
    return this.guests[idx];
  }

  public softDeleteGuest(id: string): boolean {
    const guest = this.guests.find(g => g.id === id);
    if (!guest) return false;
    guest.deleted_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    this.logAudit('Guest', id, 'DELETE', `Moved guest "${guest.name}" to Recycle Bin`);
    cloudSync.pushGuest(guest);
    return true;
  }

  public restoreGuest(id: string): boolean {
    const guest = this.guests.find(g => g.id === id);
    if (!guest) return false;
    guest.deleted_at = null;
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    this.logAudit('Guest', id, 'RESTORE', `Restored guest "${guest.name}" from Recycle Bin`);
    cloudSync.pushGuest(guest);
    return true;
  }

  public permanentDeleteGuest(id: string): boolean {
    const idx = this.guests.findIndex(g => g.id === id);
    if (idx === -1) return false;
    const name = this.guests[idx].name;
    this.guests.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    this.logAudit('Guest', id, 'DELETE', `Permanently deleted guest "${name}"`);
    cloudSync.deleteGuestPermanent(id);
    return true;
  }

  // --- Duplicate Detection ---
  public checkDuplicates(name: string, mobile?: string, village?: string): Guest[] {
    const cleanName = name.trim().toLowerCase();
    const cleanMobile = mobile ? mobile.replace(/\D/g, '') : '';
    const cleanVillage = village ? village.trim().toLowerCase() : '';

    return this.guests.filter(g => {
      if (g.deleted_at) return false;

      if (cleanMobile && g.mobile && g.mobile.replace(/\D/g, '') === cleanMobile) {
        return true;
      }

      const gName = g.name.toLowerCase();
      if (gName === cleanName) {
        if (cleanVillage && g.village) {
          return g.village.toLowerCase() === cleanVillage;
        }
        return true;
      }

      return false;
    });
  }

  // --- Families ---
  public getFamilies(): Family[] {
    return [...this.families];
  }

  public addFamily(familyData: Omit<Family, 'id' | 'created_at' | 'updated_at'>): Family {
    const newFamily: Family = {
      ...familyData,
      id: 'fam-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.families.unshift(newFamily);
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(this.families));
    this.logAudit('Family', newFamily.id, 'CREATE', `Created family group "${newFamily.name}"`);
    return newFamily;
  }

  public updateFamily(id: string, updates: Partial<Family>): Family | null {
    const idx = this.families.findIndex(f => f.id === id);
    if (idx === -1) return null;
    const old = this.families[idx];
    this.families[idx] = { ...old, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(this.families));
    this.logAudit('Family', id, 'UPDATE', `Updated family "${this.families[idx].name}"`);
    cloudSync.pushFamily(this.families[idx]);
    return this.families[idx];
  }

  public deleteFamily(id: string): boolean {
    const idx = this.families.findIndex(f => f.id === id);
    if (idx === -1) return false;
    const name = this.families[idx].name;
    this.families.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(this.families));
    this.logAudit('Family', id, 'DELETE', `Deleted family "${name}"`);
    cloudSync.deleteFamily(id);
    return true;
  }

  // --- Transactions & Gifts ---
  public getTransactions(eventId?: string, ceremonyId?: string, includeDeleted = false): Transaction[] {
    return this.transactions.filter(t => {
      if (!includeDeleted && t.deleted_at) return false;
      if (eventId && t.event_id !== eventId) return false;
      if (ceremonyId && t.ceremony_id !== ceremonyId) return false;
      return true;
    });
  }

  public addTransaction(txnData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Transaction {
    const newTxn: Transaction = {
      ...txnData,
      id: 'txn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      ceremony_id: txnData.ceremony_id || this.activeCeremonyId,
      created_by: txnData.created_by || this.currentUser?.name || this.settings.operator_name || 'Sultan',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.transactions.unshift(newTxn);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    cloudSync.pushTransaction(newTxn);

    const guest = this.getGuestById(newTxn.guest_id);
    const ceremony = newTxn.ceremony_id ? this.getCeremonyById(newTxn.ceremony_id) : undefined;
    this.logAudit(
      'Transaction',
      newTxn.id,
      'CREATE',
      `Recorded ₹${newTxn.amount.toLocaleString()} ${newTxn.type.toUpperCase()} from "${guest?.name || 'Guest'}" for [${ceremony?.name || 'Ceremony'}] via ${newTxn.payment_method}`
    );
    return newTxn;
  }

  public getGifts(eventId?: string, ceremonyId?: string, includeDeleted = false): Gift[] {
    return this.gifts.filter(g => {
      if (!includeDeleted && g.deleted_at) return false;
      if (eventId && g.event_id !== eventId) return false;
      if (ceremonyId && g.ceremony_id !== ceremonyId) return false;
      return true;
    });
  }

  public addGift(giftData: Omit<Gift, 'id' | 'created_at' | 'updated_at'>): Gift {
    const newGift: Gift = {
      ...giftData,
      id: 'gft-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      ceremony_id: giftData.ceremony_id || this.activeCeremonyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.gifts.unshift(newGift);
    localStorage.setItem(STORAGE_KEYS.GIFTS, JSON.stringify(this.gifts));
    cloudSync.pushGift(newGift);

    const guest = this.getGuestById(newGift.guest_id);
    this.logAudit(
      'Gift',
      newGift.id,
      'CREATE',
      `Recorded Gift "${newGift.item_name}" (${newGift.category}) from "${guest?.name || 'Guest'}"`
    );
    return newGift;
  }

  public deleteTransaction(id: string): boolean {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    const old = this.transactions[idx];
    this.transactions[idx].deleted_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    this.logAudit('Transaction', id, 'DELETE', `Deleted transaction of ₹${old.amount} (${old.type})`);
    cloudSync.pushTransaction(this.transactions[idx]);
    return true;
  }

  public deleteGift(id: string): boolean {
    const idx = this.gifts.findIndex(g => g.id === id);
    if (idx === -1) return false;
    const old = this.gifts[idx];
    this.gifts[idx].deleted_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.GIFTS, JSON.stringify(this.gifts));
    this.logAudit('Gift', id, 'DELETE', `Deleted gift "${old.item_name}"`);
    cloudSync.pushGift(this.gifts[idx]);
    return true;
  }

  // --- Multi-Event Lifetime Guest History ---
  public getGuestLifetimeHistory(guestId: string): GuestHistorySummary | null {
    const guest = this.getGuestById(guestId);
    if (!guest) return null;

    const family = guest.family_id ? this.families.find(f => f.id === guest.family_id) : undefined;
    const allEvents = this.getEvents(true);

    let lifetimeNevta = 0;
    let lifetimeNahuchua = 0;
    let lifetimeGiftsCount = 0;
    let lifetimeGiftValue = 0;

    const eventsParticipation = allEvents.map(event => {
      const eventTxns = this.transactions.filter(t => t.event_id === event.id && t.guest_id === guestId && !t.deleted_at);
      const eventGifts = this.gifts.filter(g => g.event_id === event.id && g.guest_id === guestId && !g.deleted_at);

      const nevtaAmount = eventTxns.filter(t => t.type === 'nevta').reduce((sum, t) => sum + t.amount, 0);
      const nahuchuaAmount = eventTxns.filter(t => t.type === 'nahuchua').reduce((sum, t) => sum + t.amount, 0);
      const giftValue = eventGifts.reduce((sum, g) => sum + (g.estimated_value * g.quantity), 0);

      lifetimeNevta += nevtaAmount;
      lifetimeNahuchua += nahuchuaAmount;
      lifetimeGiftsCount += eventGifts.reduce((sum, g) => sum + g.quantity, 0);
      lifetimeGiftValue += giftValue;

      return {
        event,
        nevtaAmount,
        nahuchuaAmount,
        gifts: eventGifts,
        totalAmount: nevtaAmount + nahuchuaAmount,
        transactions: eventTxns
      };
    }).filter(p => p.totalAmount > 0 || p.gifts.length > 0 || p.event.id === this.activeEventId);

    return {
      guest,
      family,
      eventsParticipation,
      lifetimeNevta,
      lifetimeNahuchua,
      lifetimeGiftsCount,
      lifetimeGiftValue,
      lifetimeTotalValue: lifetimeNevta + lifetimeNahuchua + lifetimeGiftValue
    };
  }

  // --- Vyavhar (Return Nevta / Len-Den) Tracker ---
  public getReturnGifts(guestId?: string): ReturnGiftRecord[] {
    if (guestId) {
      return this.returnGifts.filter(r => r.guest_id === guestId);
    }
    return [...this.returnGifts];
  }

  public addReturnGift(recordData: Omit<ReturnGiftRecord, 'id' | 'created_at' | 'updated_at'>): ReturnGiftRecord {
    const newRecord: ReturnGiftRecord = {
      ...recordData,
      id: 'rgn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.returnGifts.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.RETURN_GIFTS, JSON.stringify(this.returnGifts));
    
    const guest = this.getGuestById(newRecord.guest_id);
    this.logAudit(
      'Transaction',
      newRecord.id,
      'CREATE',
      `Recorded Len-Den Vyavhar of ₹${newRecord.amount.toLocaleString()} (${newRecord.direction === 'given_by_us' ? 'Humne Diya' : 'Unhone Diya'}) for [${newRecord.event_name}] with "${guest?.name || 'Guest'}"`
    );
    return newRecord;
  }

  public deleteReturnGift(id: string): boolean {
    const idx = this.returnGifts.findIndex(r => r.id === id);
    if (idx === -1) return false;
    const old = this.returnGifts[idx];
    this.returnGifts.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.RETURN_GIFTS, JSON.stringify(this.returnGifts));
    this.logAudit('Transaction', id, 'DELETE', `Deleted Vyavhar record of ₹${old.amount} (${old.event_name})`);
    return true;
  }

  public getVyavharSummary(guestId: string): VyavharSummary | null {
    const guest = this.getGuestById(guestId);
    if (!guest) return null;

    const family = guest.family_id ? this.families.find(f => f.id === guest.family_id) : undefined;
    
    // Sum of all Nevta/Nahuchua given by guest to us across all weddings in this software
    const lifetimeHistory = this.getGuestLifetimeHistory(guestId);
    const softwareReceived = lifetimeHistory ? lifetimeHistory.lifetimeTotalValue : 0;

    // Sum from explicit ReturnGiftRecords
    const guestRecords = this.getReturnGifts(guestId);
    const extraReceived = guestRecords.filter(r => r.direction === 'received_by_us').reduce((s, r) => s + r.amount, 0);
    const totalReceived = softwareReceived + extraReceived;

    const totalGiven = guestRecords.filter(r => r.direction === 'given_by_us').reduce((s, r) => s + r.amount, 0);
    const balance = totalGiven - totalReceived;

    let status: 'settled' | 'surplus_given' | 'pending_return' = 'settled';
    if (balance > 0) {
      status = 'surplus_given'; // Humne unhe zyada de rakha hai
    } else if (balance < 0) {
      status = 'pending_return'; // Unka zyada aya hua hai, hume agle function mein lautana hai
    }

    return {
      guest,
      family,
      totalReceived,
      totalGiven,
      balance,
      status,
      records: guestRecords
    };
  }

  // --- Aggregated Event & Ceremony Analytics ---
  public getEventAnalytics(eventId?: string, ceremonyId?: string) {
    const targetEventId = eventId || this.activeEventId;
    const activeTxns = this.getTransactions(targetEventId, ceremonyId);
    const activeGifts = this.getGifts(targetEventId, ceremonyId);

    const totalNevta = activeTxns.filter(t => t.type === 'nevta').reduce((sum, t) => sum + t.amount, 0);
    const totalNahuchua = activeTxns.filter(t => t.type === 'nahuchua').reduce((sum, t) => sum + t.amount, 0);
    const totalCash = activeTxns.filter(t => t.payment_method === 'Cash').reduce((sum, t) => sum + t.amount, 0);
    const totalUPI = activeTxns.filter(t => t.payment_method === 'UPI').reduce((sum, t) => sum + t.amount, 0);
    const totalBank = activeTxns.filter(t => t.payment_method === 'Bank Transfer').reduce((sum, t) => sum + t.amount, 0);
    const totalCheque = activeTxns.filter(t => t.payment_method === 'Cheque').reduce((sum, t) => sum + t.amount, 0);

    const uniqueGuestIds = new Set<string>([
      ...activeTxns.map(t => t.guest_id),
      ...activeGifts.map(g => g.guest_id)
    ]);

    const totalGiftItems = activeGifts.reduce((sum, g) => sum + g.quantity, 0);
    const totalGiftValue = activeGifts.reduce((sum, g) => sum + (g.estimated_value * g.quantity), 0);

    // Village Breakdown
    const villageMap: Record<string, { guests: number; nevta: number; nahuchua: number; total: number }> = {};
    // Side Breakdown
    const sideMap: Record<string, { count: number; total: number }> = {
      'Groom Side': { count: 0, total: 0 },
      'Bride Side': { count: 0, total: 0 },
      'Host Side': { count: 0, total: 0 },
      'Other': { count: 0, total: 0 }
    };
    // Relation Breakdown
    const relationMap: Record<string, { count: number; total: number }> = {};

    uniqueGuestIds.forEach(gid => {
      const g = this.getGuestById(gid);
      if (!g) return;

      const vName = g.village || 'Other / Unknown';
      if (!villageMap[vName]) {
        villageMap[vName] = { guests: 0, nevta: 0, nahuchua: 0, total: 0 };
      }
      villageMap[vName].guests += 1;

      const gTxns = activeTxns.filter(t => t.guest_id === gid);
      const gNevta = gTxns.filter(t => t.type === 'nevta').reduce((s, t) => s + t.amount, 0);
      const gNahuchua = gTxns.filter(t => t.type === 'nahuchua').reduce((s, t) => s + t.amount, 0);
      const gTotal = gNevta + gNahuchua;

      villageMap[vName].nevta += gNevta;
      villageMap[vName].nahuchua += gNahuchua;
      villageMap[vName].total += gTotal;

      const sideKey = g.side || 'Other';
      if (sideMap[sideKey]) {
        sideMap[sideKey].count += 1;
        sideMap[sideKey].total += gTotal;
      }

      const relKey = g.relation || 'Other';
      if (!relationMap[relKey]) {
        relationMap[relKey] = { count: 0, total: 0 };
      }
      relationMap[relKey].count += 1;
      relationMap[relKey].total += gTotal;
    });

    // Ceremony-wise breakdown under this event
    const ceremonies = this.getCeremonies(targetEventId);
    const ceremonyStats = ceremonies.map(crm => {
      const cTxns = this.transactions.filter(t => t.event_id === targetEventId && t.ceremony_id === crm.id && !t.deleted_at);
      const cGifts = this.gifts.filter(g => g.event_id === targetEventId && g.ceremony_id === crm.id && !g.deleted_at);
      const cNevta = cTxns.filter(t => t.type === 'nevta').reduce((s, t) => s + t.amount, 0);
      const cNahuchua = cTxns.filter(t => t.type === 'nahuchua').reduce((s, t) => s + t.amount, 0);
      return {
        ceremony: crm,
        txnsCount: cTxns.length,
        nevta: cNevta,
        nahuchua: cNahuchua,
        total: cNevta + cNahuchua,
        giftsCount: cGifts.length
      };
    });

    return {
      totalGuests: uniqueGuestIds.size,
      totalNevta,
      totalNahuchua,
      totalCollection: totalNevta + totalNahuchua,
      totalGiftItems,
      totalGiftValue,
      grandTotalValue: totalNevta + totalNahuchua + totalGiftValue,
      paymentSplit: {
        cash: totalCash,
        upi: totalUPI,
        bank: totalBank,
        cheque: totalCheque
      },
      villageBreakdown: villageMap,
      sideBreakdown: sideMap,
      relationBreakdown: relationMap,
      ceremonyStats
    };
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // --- Backup & Restore ---
  public generateBackupJson(): string {
    const backupData = {
      version: '4.0',
      exported_at: new Date().toISOString(),
      exported_by: this.currentUser?.name || this.settings.operator_name || 'Sultan',
      data: {
        events: this.events,
        ceremonies: this.ceremonies,
        guests: this.guests,
        families: this.families,
        transactions: this.transactions,
        gifts: this.gifts,
        auditLogs: this.auditLogs,
        settings: this.settings,
        activeEventId: this.activeEventId,
        activeCeremonyId: this.activeCeremonyId,
        users: this.users
      }
    };
    this.logAudit('System', 'backup', 'BACKUP', 'Generated full system backup file (.nvbackup)');
    return JSON.stringify(backupData, null, 2);
  }

  public restoreBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !Array.isArray(parsed.data.events) || !Array.isArray(parsed.data.guests)) {
        throw new Error('Invalid backup schema');
      }
      this.events = parsed.data.events;
      this.ceremonies = parsed.data.ceremonies || [...SEED_CEREMONIES];
      this.guests = parsed.data.guests;
      this.families = parsed.data.families || [];
      this.transactions = parsed.data.transactions || [];
      this.gifts = parsed.data.gifts || [];
      this.auditLogs = parsed.data.auditLogs || [];
      this.settings = parsed.data.settings || DEFAULT_SETTINGS;
      this.activeEventId = parsed.data.activeEventId || (this.events[0]?.id || 'evt-1');
      this.activeCeremonyId = parsed.data.activeCeremonyId || (this.ceremonies[0]?.id || 'crm-1-3');
      if (parsed.data.users && Array.isArray(parsed.data.users)) {
        this.users = parsed.data.users;
      }

      this.saveAll();
      this.logAudit('System', 'restore', 'RESTORE', `Restored system data from backup created at ${parsed.exported_at}`);
      return true;
    } catch (e) {
      console.error('Backup restoration failed:', e);
      return false;
    }
  }
}

export const db = new DatabaseService();
