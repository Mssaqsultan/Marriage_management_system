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

const DEFAULT_FALLBACK_EVENT: Event = {
  id: 'evt-default',
  event_code: 'EVT-NEW',
  name: 'Celebration',
  type: 'Marriage',
  date: new Date().toISOString().split('T')[0],
  venue: 'Main Venue',
  host_name: 'Host Family',
  status: 'Active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const SEED_EVENTS: Event[] = [];
const SEED_CEREMONIES: Ceremony[] = [];
const SEED_FAMILIES: Family[] = [];
const SEED_GUESTS: Guest[] = [];

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
  private activeEventId: string = '';
  private activeCeremonyId: string = '';
  private users: User[] = [];
  private currentUser: User | null = null;
  private returnGifts: ReturnGiftRecord[] = [];

  constructor() {
    this.loadFromStorage();
    this.initCloudSync();
  }

  private loadFromStorage() {
    try {
      this.events = (JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS) || '[]') as Event[])
        .filter(e => e.id !== 'evt-1' && e.name !== 'Sultan Ki Grand Shaadi');
      this.eventTypes = JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENT_TYPES) || 'null') || [...DEFAULT_EVENT_TYPES];
      this.ceremonies = (JSON.parse(localStorage.getItem(STORAGE_KEYS.CEREMONIES) || '[]') as Ceremony[])
        .filter(c => c.event_id !== 'evt-1');
      this.guests = (JSON.parse(localStorage.getItem(STORAGE_KEYS.GUESTS) || '[]') as Guest[])
        .filter(g => g.id !== 'gst-1');
      this.families = (JSON.parse(localStorage.getItem(STORAGE_KEYS.FAMILIES) || '[]') as Family[])
        .filter(f => f.id !== 'fam-1');
      this.transactions = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '[]');
      this.gifts = JSON.parse(localStorage.getItem(STORAGE_KEYS.GIFTS) || '[]');
      this.auditLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
      this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}') };
      
      const storedEventId = localStorage.getItem(STORAGE_KEYS.ACTIVE_EVENT_ID);
      this.activeEventId = (storedEventId && storedEventId !== 'evt-1') ? storedEventId : (this.events[0]?.id || '');

      const storedCeremonyId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CEREMONY_ID);
      const validCeremonies = this.getCeremonies(this.activeEventId);
      this.activeCeremonyId = (storedCeremonyId && validCeremonies.some(c => c.id === storedCeremonyId))
        ? storedCeremonyId
        : (validCeremonies[0]?.id || '');

      this.users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || 'null') || [...SEED_USERS];
      this.currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || 'null');
      this.returnGifts = JSON.parse(localStorage.getItem(STORAGE_KEYS.RETURN_GIFTS) || '[]');
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      this.resetToDefaults();
    }
  }

  private async initCloudSync() {
    try {
      if (typeof (cloudSync as any).pullFromCloud === 'function') {
        await (cloudSync as any).pullFromCloud();
      }
    } catch (err) {
      console.warn('Cloud sync offline or failed:', err);
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
    localStorage.setItem(STORAGE_KEYS.RETURN_GIFTS, JSON.stringify(this.returnGifts));
  }

  public resetToDefaults() {
    this.events = [];
    this.eventTypes = [...DEFAULT_EVENT_TYPES];
    this.ceremonies = [];
    this.guests = [];
    this.families = [];
    this.transactions = [];
    this.gifts = [];
    this.auditLogs = [];
    this.settings = { ...DEFAULT_SETTINGS };
    this.activeEventId = '';
    this.activeCeremonyId = '';
    this.users = [...SEED_USERS];
    this.returnGifts = [];
    this.saveAll();
  }

  // --- Auth & Users ---
  public getUsers(): User[] { return [...this.users]; }
  public getCurrentUser(): User | null { return this.currentUser; }
  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
  public login(username: string, password?: string): User | null {
    const cleanUser = username.trim().toLowerCase();
    const user = this.users.find(u => u.username.toLowerCase() === cleanUser);
    if (!user || (password && user.password && user.password !== password)) return null;
    this.setCurrentUser(user);
    return user;
  }
  public logout() { this.setCurrentUser(null); }
  public addUser(userData: Omit<User, 'id' | 'created_at'>): User {
    const newUser: User = { ...userData, id: 'usr-' + Date.now(), created_at: new Date().toISOString() };
    this.users.push(newUser);
    this.saveAll();
    cloudSync.pushUser(newUser);
    return newUser;
  }
  public deleteUser(id: string): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    this.saveAll();
    cloudSync.deleteUser(id);
    return true;
  }
  public updateUserPassword(id: string, newPassword: string): boolean {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return false;
    this.users[idx] = { ...this.users[idx], password: newPassword };
    this.saveAll();
    cloudSync.pushUser(this.users[idx]);
    return true;
  }

  // --- Audit & Settings ---
  public logAudit(entity_type: AuditLog['entity_type'], entity_id: string, action: AuditLog['action'], details: string) {
    const log: AuditLog = {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      user_name: this.currentUser?.name || this.settings.operator_name || 'Sultan',
      entity_type, entity_id, action, details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
  }
  public getAuditLogs(): AuditLog[] { return [...this.auditLogs]; }
  public getSettings(): AppSettings { return { ...this.settings }; }
  public updateSettings(newSettings: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.saveAll();
    cloudSync.pushSettings(this.settings);
    return this.settings;
  }

  // --- Overrides ---
  public overrideUsers(users: User[]) { this.users = users; this.saveAll(); }
  public overrideSettings(settings: Partial<AppSettings>) { this.settings = { ...this.settings, ...settings }; this.saveAll(); }
  public overrideEvents(events: Event[]) {
    this.events = events.filter(e => e.id !== 'evt-1' && e.name !== 'Sultan Ki Grand Shaadi');
    if (!this.events.some(e => e.id === this.activeEventId)) {
      this.activeEventId = this.events[0]?.id || '';
      localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, this.activeEventId);
    }
    this.saveAll();
  }
  public overrideCeremonies(ceremonies: Ceremony[]) {
    this.ceremonies = ceremonies.filter(c => c.event_id !== 'evt-1');
    const validCeremonies = this.getCeremonies(this.activeEventId);
    if (!validCeremonies.some(c => c.id === this.activeCeremonyId)) {
      this.activeCeremonyId = validCeremonies[0]?.id || '';
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CEREMONY_ID, this.activeCeremonyId);
    }
    this.saveAll();
  }
  public overrideFamilies(families: Family[]) { this.families = families; this.saveAll(); }
  public overrideGuests(guests: Guest[]) { this.guests = guests; this.saveAll(); }
  public overrideTransactions(transactions: Transaction[]) { this.transactions = transactions; this.saveAll(); }
  public overrideGifts(gifts: Gift[]) { this.gifts = gifts; this.saveAll(); }

  // --- Events ---
  public getEvents(includeArchived = false): Event[] { return this.events.filter(e => includeArchived || e.status !== 'Archived'); }
  public getEventById(id: string): Event | undefined { return this.events.find(e => e.id === id); }
  public getActiveEvent(): Event {
    if (this.events.length === 0) return DEFAULT_FALLBACK_EVENT;
    const found = this.events.find(e => e.id === this.activeEventId);
    if (found) return found;
    this.activeEventId = this.events[0].id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, this.activeEventId);
    return this.events[0];
  }
  public setActiveEventId(id: string) {
    this.activeEventId = id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EVENT_ID, id);
    const eventCeremonies = this.getCeremonies(id);
    if (eventCeremonies.length > 0) {
      this.setActiveCeremonyId(eventCeremonies[0].id);
    } else {
      this.activeCeremonyId = '';
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CEREMONY_ID, '');
    }
  }
  public addEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>, createDefaultCeremonies = true): Event {
    const newEvent: Event = { ...eventData, id: 'evt-' + Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    this.events.unshift(newEvent);
    this.activeEventId = newEvent.id;
    this.saveAll();
    cloudSync.pushEvent(newEvent);

    if (createDefaultCeremonies) {
      const nikah = this.addCeremony({
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
      this.setActiveCeremonyId(nikah.id);
    }

    return newEvent;
  }
  public updateEvent(id: string, updates: Partial<Event>): Event | null {
    const idx = this.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.events[idx] = { ...this.events[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveAll();
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
  public getEventTypes(): string[] { return [...this.eventTypes]; }
  public addEventType(name: string): string[] {
    const trimmed = name.trim();
    if (trimmed && !this.eventTypes.includes(trimmed)) {
      this.eventTypes.push(trimmed);
      localStorage.setItem(STORAGE_KEYS.EVENT_TYPES, JSON.stringify(this.eventTypes));
    }
    return [...this.eventTypes];
  }
  public deleteEventType(name: string): string[] {
    if (this.eventTypes.length <= 1) return [...this.eventTypes];
    this.eventTypes = this.eventTypes.filter(t => t !== name);
    localStorage.setItem(STORAGE_KEYS.EVENT_TYPES, JSON.stringify(this.eventTypes));
    return [...this.eventTypes];
  }

  // --- Ceremonies ---
  public getCeremonies(eventId?: string): Ceremony[] {
    if (eventId) return this.ceremonies.filter(c => c.event_id === eventId);
    return [...this.ceremonies];
  }
  public getCeremonyById(id: string): Ceremony | undefined { return this.ceremonies.find(c => c.id === id); }
  public getActiveCeremony(): Ceremony | undefined {
    const eventCeremonies = this.getCeremonies(this.activeEventId);
    if (eventCeremonies.length === 0) return undefined;
    const found = eventCeremonies.find(c => c.id === this.activeCeremonyId);
    if (found) return found;
    this.activeCeremonyId = eventCeremonies[0].id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CEREMONY_ID, this.activeCeremonyId);
    return eventCeremonies[0];
  }
  public getActiveCeremonyId(): string { return this.activeCeremonyId; }
  public setActiveCeremonyId(id: string) {
    this.activeCeremonyId = id;
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CEREMONY_ID, id);
  }
  public addCeremony(ceremonyData: Omit<Ceremony, 'id' | 'created_at' | 'updated_at'>): Ceremony {
    const newCeremony: Ceremony = { ...ceremonyData, id: 'crm-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    this.ceremonies.push(newCeremony);
    this.saveAll();
    cloudSync.pushCeremony(newCeremony);
    return newCeremony;
  }
  public updateCeremony(id: string, updates: Partial<Ceremony>): Ceremony | null {
    const idx = this.ceremonies.findIndex(c => c.id === id);
    if (idx === -1) return null;
    this.ceremonies[idx] = { ...this.ceremonies[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveAll();
    cloudSync.pushCeremony(this.ceremonies[idx]);
    return this.ceremonies[idx];
  }
  public deleteCeremony(id: string): boolean {
    const idx = this.ceremonies.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.ceremonies.splice(idx, 1);
    this.saveAll();
    cloudSync.deleteCeremony(id);
    return true;
  }

  // --- Guests ---
  public getGuests(includeDeleted = false): Guest[] { return this.guests.filter(g => includeDeleted || !g.deleted_at); }
  public getGuestById(id: string): Guest | undefined { return this.guests.find(g => g.id === id); }
  public addGuest(guestData: Omit<Guest, 'id' | 'created_at' | 'updated_at'>): Guest {
    const newGuest: Guest = { ...guestData, id: 'gst-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    this.guests.unshift(newGuest);
    this.saveAll();
    cloudSync.pushGuest(newGuest);
    return newGuest;
  }
  public updateGuest(id: string, updates: Partial<Guest>): Guest | null {
    const idx = this.guests.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.guests[idx] = { ...this.guests[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveAll();
    cloudSync.pushGuest(this.guests[idx]);
    return this.guests[idx];
  }
  public softDeleteGuest(id: string): boolean {
    const guest = this.guests.find(g => g.id === id);
    if (!guest) return false;
    guest.deleted_at = new Date().toISOString();
    this.saveAll();
    cloudSync.pushGuest(guest);
    return true;
  }
  public restoreGuest(id: string): boolean {
    const guest = this.guests.find(g => g.id === id);
    if (!guest) return false;
    guest.deleted_at = null;
    this.saveAll();
    cloudSync.pushGuest(guest);
    return true;
  }
  public permanentDeleteGuest(id: string): boolean {
    const idx = this.guests.findIndex(g => g.id === id);
    if (idx === -1) return false;
    this.guests.splice(idx, 1);
    this.saveAll();
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
  public getFamilies(): Family[] { return [...this.families]; }
  public addFamily(familyData: Omit<Family, 'id' | 'created_at' | 'updated_at'>): Family {
    const newFamily: Family = { ...familyData, id: 'fam-' + Date.now(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    this.families.unshift(newFamily);
    this.saveAll();
    return newFamily;
  }
  public updateFamily(id: string, updates: Partial<Family>): Family | null {
    const idx = this.families.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.families[idx] = { ...this.families[idx], ...updates, updated_at: new Date().toISOString() };
    this.saveAll();
    cloudSync.pushFamily(this.families[idx]);
    return this.families[idx];
  }
  public deleteFamily(id: string): boolean {
    const idx = this.families.findIndex(f => f.id === id);
    if (idx === -1) return false;
    this.families.splice(idx, 1);
    this.saveAll();
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
    const eventCeremonies = this.getCeremonies(txnData.event_id);
    let validCeremonyId = txnData.ceremony_id;
    if (validCeremonyId && !eventCeremonies.some(c => c.id === validCeremonyId)) {
      validCeremonyId = undefined;
    }
    if (!validCeremonyId && this.activeCeremonyId && eventCeremonies.some(c => c.id === this.activeCeremonyId)) {
      validCeremonyId = this.activeCeremonyId;
    }

    const newTxn: Transaction = {
      ...txnData,
      id: 'txn-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      ceremony_id: validCeremonyId,
      created_by: txnData.created_by || this.currentUser?.name || this.settings.operator_name || 'Operator',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.transactions.unshift(newTxn);
    this.saveAll();
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
    const eventCeremonies = this.getCeremonies(giftData.event_id);
    let validCeremonyId = giftData.ceremony_id;
    if (validCeremonyId && !eventCeremonies.some(c => c.id === validCeremonyId)) {
      validCeremonyId = undefined;
    }

    const newGift: Gift = {
      ...giftData,
      id: 'gft-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      ceremony_id: validCeremonyId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.gifts.unshift(newGift);
    this.saveAll();
    cloudSync.pushGift(newGift);
    return newGift;
  }
  public deleteTransaction(id: string): boolean {
    const idx = this.transactions.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.transactions[idx].deleted_at = new Date().toISOString();
    this.saveAll();
    cloudSync.pushTransaction(this.transactions[idx]);
    return true;
  }
  public deleteGift(id: string): boolean {
    const idx = this.gifts.findIndex(g => g.id === id);
    if (idx === -1) return false;
    this.gifts[idx].deleted_at = new Date().toISOString();
    this.saveAll();
    cloudSync.pushGift(this.gifts[idx]);
    return true;
  }

  // --- Guest History Summary ---
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

  // --- Vyavhar (Return Gifts) ---
  public getReturnGifts(guestId?: string): ReturnGiftRecord[] {
    if (guestId) return this.returnGifts.filter(r => r.guest_id === guestId);
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
    this.saveAll();
    return newRecord;
  }
  public deleteReturnGift(id: string): boolean {
    const idx = this.returnGifts.findIndex(r => r.id === id);
    if (idx === -1) return false;
    this.returnGifts.splice(idx, 1);
    this.saveAll();
    return true;
  }
  public getVyavharSummary(guestId: string): VyavharSummary | null {
    const guest = this.getGuestById(guestId);
    if (!guest) return null;
    const family = guest.family_id ? this.families.find(f => f.id === guest.family_id) : undefined;
    const lifetimeHistory = this.getGuestLifetimeHistory(guestId);
    const softwareReceived = lifetimeHistory ? lifetimeHistory.lifetimeTotalValue : 0;

    const guestRecords = this.getReturnGifts(guestId);
    const extraReceived = guestRecords.filter(r => r.direction === 'received_by_us').reduce((s, r) => s + r.amount, 0);
    const totalReceived = softwareReceived + extraReceived;
    const totalGiven = guestRecords.filter(r => r.direction === 'given_by_us').reduce((s, r) => s + r.amount, 0);
    const balance = totalGiven - totalReceived;

    let status: 'settled' | 'surplus_given' | 'pending_return' = 'settled';
    if (balance > 0) status = 'surplus_given';
    else if (balance < 0) status = 'pending_return';

    return { guest, family, totalReceived, totalGiven, balance, status, records: guestRecords };
  }

  // --- Backup & Restore JSON ---
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
    return JSON.stringify(backupData, null, 2);
  }

  public restoreBackupJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data || !Array.isArray(parsed.data.events)) throw new Error('Invalid schema');
      this.events = parsed.data.events;
      this.ceremonies = parsed.data.ceremonies || [];
      this.guests = parsed.data.guests;
      this.families = parsed.data.families || [];
      this.transactions = parsed.data.transactions || [];
      this.gifts = parsed.data.gifts || [];
      this.auditLogs = parsed.data.auditLogs || [];
      this.settings = parsed.data.settings || DEFAULT_SETTINGS;
      this.activeEventId = parsed.data.activeEventId || this.events[0]?.id || '';
      this.activeCeremonyId = parsed.data.activeCeremonyId || this.ceremonies[0]?.id || '';
      if (parsed.data.users) this.users = parsed.data.users;
      this.saveAll();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // --- Analytics with Breakdowns ---
  public getEventAnalytics(eventId?: string, ceremonyId?: string) {
    const targetEventId = eventId || this.activeEventId;
    const activeTxns = this.getTransactions(targetEventId, ceremonyId);
    const activeGifts = this.getGifts(targetEventId, ceremonyId);

    const totalNevta = activeTxns.filter(t => t.type === 'nevta').reduce((sum, t) => sum + t.amount, 0);
    const totalNahuchua = activeTxns.filter(t => t.type === 'nahuchua').reduce((sum, t) => sum + t.amount, 0);
    const uniqueGuestIds = new Set<string>([...activeTxns.map(t => t.guest_id), ...activeGifts.map(g => g.guest_id)]);

    const villageMap: Record<string, { guests: number; nevta: number; nahuchua: number; total: number }> = {};
    const sideMap: Record<string, { count: number; total: number }> = {
      'Groom Side': { count: 0, total: 0 },
      'Bride Side': { count: 0, total: 0 },
      'Host Side': { count: 0, total: 0 },
      'Other': { count: 0, total: 0 }
    };
    const relationMap: Record<string, { count: number; total: number }> = {};

    uniqueGuestIds.forEach(gid => {
      const g = this.getGuestById(gid);
      if (!g) return;
      const vName = g.village || 'Other / Unknown';
      if (!villageMap[vName]) villageMap[vName] = { guests: 0, nevta: 0, nahuchua: 0, total: 0 };
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
      if (!relationMap[relKey]) relationMap[relKey] = { count: 0, total: 0 };
      relationMap[relKey].count += 1;
      relationMap[relKey].total += gTotal;
    });

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
      },
      villageBreakdown: villageMap,
      sideBreakdown: sideMap,
      relationBreakdown: relationMap
    };
  }
}

export const db = new DatabaseService();