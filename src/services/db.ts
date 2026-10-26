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

const SEED_CEREMONIES: Ceremony[] = [
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
  }
];

const SEED_GUESTS: Guest[] = [
  {
    id: 'gst-1',
    family_id: 'fam-1',
    name: 'Sultan Salahuddin',
    father_husband_name: 'Haji Iqbal Khan',
    mobile: '9876543210',
    address: 'Royal Haveli, Station Road',
    village: 'Chauriya khas',
    post: 'Chauriya khas',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    pincode: '226001',
    relation: 'Brother',
    side: 'Host Side',
    notes: 'Chief Host & Groom',
    created_at: '2026-09-01T10:00:00.000Z',
    updated_at: '2026-09-01T10:00:00.000Z'
  }
];

const SEED_TRANSACTIONS: Transaction[] = [];
const SEED_GIFTS: Gift[] = [];
const SEED_AUDIT_LOGS: AuditLog[] = [];

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
    this.initCloudSync();
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
    } catch (e) {
      console.error('Error loading data from localStorage, falling back to defaults', e);
      this.resetToDefaults();
    }
  }

  // --- Cloud Sync Initialization ---
  private async initCloudSync() {
    try {
      const cloudData = await cloudSync.fetchAllData();
      if (cloudData) {
        if (cloudData.events && cloudData.events.length > 0) {
          this.overrideEvents(cloudData.events);
        }
        if (cloudData.ceremonies && cloudData.ceremonies.length > 0) {
          this.overrideCeremonies(cloudData.ceremonies);
        }
        if (cloudData.guests && cloudData.guests.length > 0) {
          this.overrideGuests(cloudData.guests);
        }
        if (cloudData.families && cloudData.families.length > 0) {
          this.overrideFamilies(cloudData.families);
        }
        if (cloudData.transactions && cloudData.transactions.length > 0) {
          this.overrideTransactions(cloudData.transactions);
        }
        if (cloudData.gifts && cloudData.gifts.length > 0) {
          this.overrideGifts(cloudData.gifts);
        }
        if (cloudData.users && cloudData.users.length > 0) {
          this.overrideUsers(cloudData.users);
        }
        if (cloudData.settings) {
          this.overrideSettings(cloudData.settings);
        }
        console.log('✅ Successfully synced data from Supabase Cloud!');
      }
    } catch (err) {
      console.warn('⚠️ Cloud sync offline or failed, using local storage cache:', err);
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
    this.logAudit('System', 'sys-reset', 'RESTORE', 'Reset database to seed dataset');
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
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  public login(username: string, password?: string): User | null {
    const cleanUser = username.trim().toLowerCase();
    const user = this.users.find(u => u.username.toLowerCase() === cleanUser);
    if (!user) return null;
    if (password && user.password && user.password !== password) return null;
    this.setCurrentUser(user);
    return user;
  }

  public logout() {
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
    cloudSync.pushUser(newUser);
    return newUser;
  }

  public deleteUser(id: string): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    cloudSync.deleteUser(id);
    return true;
  }

  public updateUserPassword(id: string, newPassword: string): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users[idx] = { ...this.users[idx], password: newPassword };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
    if (this.currentUser && this.currentUser.id === id) {
      this.currentUser = { ...this.users[idx] };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
    }
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
    cloudSync.pushSettings(this.settings);
    return this.settings;
  }

  // --- Cloud Sync Overrides ---
  public overrideUsers(users: User[]) {
    this.users = users;
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

  // --- Events ---
  public getEvents(includeArchived = false): Event[] {
    return this.events.filter(e => includeArchived || e.status !== 'Archived');
  }

  public getEventById(id: string): Event | undefined {
    return this.events.find(e => e.id === id);
  }

  public getActiveEvent(): Event {
    return this.events.find(e => e.id === this.activeEventId) || this.events[0] || SEED_EVENTS[0];
  }

  public setActiveEventId(id: string) {
    this.activeEventId = id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
    const eventCeremonies = this.getCeremonies(id);
    if (eventCeremonies.length > 0) {
      this.setActiveCeremonyId(eventCeremonies[0].id);
    }
  }

  public addEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Event {
    const newEvent: Event = {
      ...eventData,
      id: 'evt-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.events.unshift(newEvent);
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    cloudSync.pushEvent(newEvent);
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<Event>): Event | null {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.events[idx] = { ...this.events[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
    cloudSync.pushEvent(this.events[idx]);
    return this.events[idx];
  }

  public deleteEvent(id: string): boolean {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx === -1) return false;
    this.events.splice(idx, 1);
    this.saveAll();
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
    }
    return [...this.eventTypes];
  }

  // --- Ceremonies ---
  public getCeremonies(eventId?: string): Ceremony[] {
    if (eventId) return this.ceremonies.filter(c => c.event_id === eventId);
    return [...this.ceremonies];
  }

  public getCeremonyById(id: string): Ceremony | undefined {
    return this.ceremonies.find(c => c.id === id);
  }

  public getActiveCeremony(): Ceremony | undefined {
    return this.ceremonies.find(c => c.id === this.activeCeremonyId && c.event_id === this.activeEventId) || this.getCeremonies(this.activeEventId)[0];
  }

  public getActiveCeremonyId(): string {
    return this.activeCeremonyId;
  }

  public setActiveCeremonyId(id: string) {
    this.activeCeremonyId = id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CEREMONY_ID, id);
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
    cloudSync.pushCeremony(newCeremony);
    return newCeremony;
  }

  public updateCeremony(id: string, updates: Partial<Ceremony>): Ceremony | null {
    const idx = this.ceremonies.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.ceremonies[idx] = { ...this.ceremonies[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.CEREMONIES, JSON.stringify(this.ceremonies));
    cloudSync.pushCeremony(this.ceremonies[idx]);
    return this.ceremonies[idx];
  }

  public deleteCeremony(id: string): boolean {
    const idx = this.ceremonies.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.ceremonies.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.CEREMONIES, JSON.stringify(this.ceremonies));
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
    cloudSync.pushGuest(newGuest);
    return newGuest;
  }

  public updateGuest(id: string, updates: Partial<Guest>): Guest | null {
    const idx = this.guests.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.guests[idx] = { ...this.guests[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    cloudSync.pushGuest(this.guests[idx]);
    return this.guests[idx];
  }

  public softDeleteGuest(id: string): boolean {
    const guest = this.guests.find(g => g.id === id);
    if (!guest) return false;
    guest.deleted_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    cloudSync.pushGuest(guest);
    return true;
  }

  public permanentDeleteGuest(id: string): boolean {
    const idx = this.guests.findIndex(g => g.id === id);
    if (idx === -1) return false;
    this.guests.splice(idx, 1);
    localStorage.setItem(STORAGE_KEYS.GUESTS, JSON.stringify(this.guests));
    cloudSync.deleteGuestPermanent(id);
    return true;
  }

  public checkDuplicates(name: string, mobile?: string, village?: string): Guest[] {
    const cleanName = name.trim().toLowerCase();
    const cleanMobile = mobile ? mobile.replace(/\D/g, '') : '';
    const cleanVillage = village ? village.trim().toLowerCase() : '';

    return this.guests.filter(g => {
      if (g.deleted_at) return false;
      if (cleanMobile && g.mobile && g.mobile.replace(/\D/g, '') === cleanMobile) return true;
      if (g.name.toLowerCase() === cleanName) {
        if (cleanVillage && g.village) return g.village.toLowerCase() === cleanVillage;
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
    cloudSync.pushFamily(newFamily);
    return newFamily;
  }

  public updateFamily(id: string, updates: Partial<Family>): Family | null {
    const idx = this.families.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.families[idx] = { ...this.families[idx], ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.FAMILIES, JSON.stringify(this.families));
    cloudSync.pushFamily(this.families[idx]);
    return this.families[idx];
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
    return newGift;
  }

  public deleteTransaction(id: string): boolean {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.transactions[idx].deleted_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(this.transactions));
    cloudSync.pushTransaction(this.transactions[idx]);
    return true;
  }

  public deleteGift(id: string): boolean {
    const idx = this.gifts.findIndex(g => g.id === id);
    if (idx === -1) return false;
    this.gifts[idx].deleted_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.GIFTS, JSON.stringify(this.gifts));
    cloudSync.pushGift(this.gifts[idx]);
    return true;
  }

  // --- Analytics ---
  public getEventAnalytics(eventId?: string, ceremonyId?: string) {
    const targetEventId = eventId || this.activeEventId;
    const activeTxns = this.getTransactions(targetEventId, ceremonyId);
    const activeGifts = this.getGifts(targetEventId, ceremonyId);

    const totalNevta = activeTxns.filter(t => t.type === 'nevta').reduce((sum, t) => sum + t.amount, 0);
    const totalNahuchua = activeTxns.filter(t => t.type === 'nahuchua').reduce((sum, t) => sum + t.amount, 0);
    const uniqueGuestIds = new Set<string>([...activeTxns.map(t => t.guest_id), ...activeGifts.map(g => g.guest_id)]);

    return {
      totalGuests: uniqueGuestIds.size,
      totalNevta,
      totalNahuchua,
      totalCollection: totalNevta + totalNahuchua,
      totalGiftItems: activeGifts.reduce((sum, g) => sum + g.quantity, 0),
      totalGiftValue: activeGifts.reduce((sum, g) => sum + (g.estimated_value * g.quantity), 0),
      grandTotalValue: totalNevta + totalNahuchua + activeGifts.reduce((sum, g) => sum + (g.estimated_value * g.quantity), 0),
      paymentSplit: {
        cash: activeTxns.filter(t => t.payment_method === 'Cash').reduce((sum, t) => sum + t.amount, 0),
        upi: activeTxns.filter(t => t.payment_method === 'UPI').reduce((sum, t) => sum + t.amount, 0),
        bank: activeTxns.filter(t => t.payment_method === 'Bank Transfer').reduce((sum, t) => sum + t.amount, 0),
        cheque: activeTxns.filter(t => t.payment_method === 'Cheque').reduce((sum, t) => sum + t.amount, 0)
      }
    };
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }
}

export const db = new DatabaseService();
