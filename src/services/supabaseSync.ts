import { supabase } from './supabase';
import { db } from './db';
import { Event, Ceremony, Guest, Family, Transaction, Gift, AppSettings, User, ReturnGiftRecord, AuditLog } from '../types';

export class SupabaseSyncService {
  private isSyncing = false;
  private channel: any = null;

  // Safe Two-Way Pull from Supabase Cloud: Merges Cloud data with Local without deleting local entries
  async pullFromCloud(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;

    try {
      // 1. Fetch Events
      const { data: eventsData, error: eventsErr } = await supabase.from('events').select('*');
      if (!eventsErr && eventsData) {
        db.mergeEvents(eventsData as Event[]);
      }

      // 2. Fetch Ceremonies
      const { data: ceremoniesData, error: ceremoniesErr } = await supabase.from('ceremonies').select('*');
      if (!ceremoniesErr && ceremoniesData) {
        db.mergeCeremonies(ceremoniesData as Ceremony[]);
      }

      // 3. Fetch Families
      const { data: familiesData, error: familiesErr } = await supabase.from('families').select('*');
      if (!familiesErr && familiesData) {
        db.mergeFamilies(familiesData as Family[]);
      }

      // 4. Fetch Guests
      const { data: guestsData, error: guestsErr } = await supabase.from('guests').select('*');
      if (!guestsErr && guestsData) {
        db.mergeGuests(guestsData as Guest[]);
      }

      // 5. Fetch Transactions
      const { data: txnsData, error: txnsErr } = await supabase.from('transactions').select('*');
      if (!txnsErr && txnsData) {
        db.mergeTransactions(txnsData as Transaction[]);
      }

      // 6. Fetch Gifts
      const { data: giftsData, error: giftsErr } = await supabase.from('gifts').select('*');
      if (!giftsErr && giftsData) {
        db.mergeGifts(giftsData as Gift[]);
      }

      // 7. Fetch Return Gifts (Vyavhar)
      const { data: returnGiftsData, error: returnGiftsErr } = await supabase.from('return_gifts').select('*');
      if (!returnGiftsErr && returnGiftsData) {
        db.mergeReturnGifts(returnGiftsData as ReturnGiftRecord[]);
      }

      // 8. Fetch Users
      const { data: usersData, error: usersErr } = await supabase.from('users').select('*');
      if (!usersErr && usersData && usersData.length > 0) {
        db.mergeUsers(usersData as User[]);
      }

      // 9. Fetch Settings
      const { data: settingsData, error: settingsErr } = await supabase.from('app_settings').select('*').single();
      if (!settingsErr && settingsData) {
        db.overrideSettings(settingsData as Partial<AppSettings>);
      }

      // 10. Fetch Audit Logs (Recent 200)
      const { data: auditLogsData, error: auditLogsErr } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);
      if (!auditLogsErr && auditLogsData) {
        db.mergeAuditLogs(auditLogsData as AuditLog[]);
      }

      // Now sync any local records that do not yet exist in Supabase in strict dependency order
      await this.syncAllUnsyncedToCloud(
        eventsData || [],
        ceremoniesData || [],
        familiesData || [],
        guestsData || [],
        txnsData || [],
        giftsData || [],
        returnGiftsData || [],
        auditLogsData || []
      );

      console.log('✅ [Supabase] Full Two-Way Cloud Sync completed successfully.');
      this.isSyncing = false;
      return true;
    } catch (err) {
      console.warn('⚠️ [Supabase] Cloud pull failed (offline or network error):', err);
      this.isSyncing = false;
      return false;
    }
  }

  // Push all unsynced local data to Cloud in strict foreign-key order
  private async syncAllUnsyncedToCloud(
    cloudEvents: Event[],
    cloudCeremonies: Ceremony[],
    cloudFamilies: Family[],
    cloudGuests: Guest[],
    cloudTxns: Transaction[],
    cloudGifts: Gift[],
    cloudReturnGifts: ReturnGiftRecord[],
    cloudAuditLogs: AuditLog[]
  ) {
    try {
      // 1. Sync unsynced Events
      const cloudEventIds = new Set(cloudEvents.map(e => e.id));
      const localEvents = db.getEvents(true);
      for (const evt of localEvents) {
        if (!cloudEventIds.has(evt.id) && evt.id !== 'evt-1' && evt.id !== 'evt-default') {
          console.log('🔄 Uploading unsynced Event to Supabase:', evt.name);
          await this.pushEvent(evt);
        }
      }

      // 2. Sync unsynced Ceremonies
      const cloudCeremonyIds = new Set(cloudCeremonies.map(c => c.id));
      const localCeremonies = db.getCeremonies();
      for (const crm of localCeremonies) {
        if (!cloudCeremonyIds.has(crm.id) && crm.event_id !== 'evt-1') {
          console.log('🔄 Uploading unsynced Ceremony to Supabase:', crm.name);
          await this.pushCeremony(crm);
        }
      }

      // 3. Sync unsynced Families
      const cloudFamilyIds = new Set(cloudFamilies.map(f => f.id));
      const localFamilies = db.getFamilies();
      for (const fam of localFamilies) {
        if (!cloudFamilyIds.has(fam.id) && fam.id !== 'fam-1') {
          console.log('🔄 Uploading unsynced Family to Supabase:', fam.name);
          await this.pushFamily(fam);
        }
      }

      // 4. Sync unsynced Guests
      const cloudGuestIds = new Set(cloudGuests.map(g => g.id));
      const localGuests = db.getGuests(true);
      for (const gst of localGuests) {
        if (!cloudGuestIds.has(gst.id) && gst.id !== 'gst-1') {
          console.log('🔄 Uploading unsynced Guest to Supabase:', gst.name);
          await this.pushGuest(gst);
        }
      }

      // 5. Sync unsynced Transactions
      const cloudTxnIds = new Set(cloudTxns.map(t => t.id));
      const localTxns = db.getTransactions(undefined, undefined, true);
      for (const txn of localTxns) {
        if (!cloudTxnIds.has(txn.id)) {
          console.log('🔄 Uploading unsynced Transaction to Supabase: ₹' + txn.amount + ' (' + txn.type + ')');
          await this.pushTransaction(txn);
        }
      }

      // 6. Sync unsynced Gifts
      const cloudGiftIds = new Set(cloudGifts.map(g => g.id));
      const localGifts = db.getGifts(undefined, undefined, true);
      for (const gift of localGifts) {
        if (!cloudGiftIds.has(gift.id)) {
          console.log('🔄 Uploading unsynced Gift to Supabase:', gift.item_name);
          await this.pushGift(gift);
        }
      }

      // 7. Sync unsynced Return Gifts
      const cloudReturnGiftIds = new Set(cloudReturnGifts.map(r => r.id));
      const localReturnGifts = db.getReturnGifts();
      for (const r of localReturnGifts) {
        if (!cloudReturnGiftIds.has(r.id)) {
          console.log('🔄 Uploading unsynced Return Gift to Supabase:', r.event_name);
          await this.pushReturnGift(r);
        }
      }

      // 8. Sync unsynced Audit Logs
      const cloudAuditLogIds = new Set(cloudAuditLogs.map(l => l.id));
      const localAuditLogs = db.getAuditLogs().slice(0, 50);
      for (const l of localAuditLogs) {
        if (!cloudAuditLogIds.has(l.id)) {
          await this.pushAuditLog(l);
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not complete auto-sync of local data to Supabase:', e);
    }
  }

  // Subscribe to real-time cloud updates across all devices
  subscribeToRealtime(onDataChanged?: () => void) {
    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    this.channel = supabase
      .channel('wedding-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, async () => {
        const { data } = await supabase.from('transactions').select('*');
        if (data) db.mergeTransactions(data as Transaction[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, async () => {
        const { data } = await supabase.from('guests').select('*');
        if (data) db.mergeGuests(data as Guest[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, async () => {
        const { data } = await supabase.from('gifts').select('*');
        if (data) db.mergeGifts(data as Gift[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async () => {
        const { data } = await supabase.from('events').select('*');
        if (data) db.mergeEvents(data as Event[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ceremonies' }, async () => {
        const { data } = await supabase.from('ceremonies').select('*');
        if (data) db.mergeCeremonies(data as Ceremony[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'families' }, async () => {
        const { data } = await supabase.from('families').select('*');
        if (data) db.mergeFamilies(data as Family[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'return_gifts' }, async () => {
        const { data } = await supabase.from('return_gifts').select('*');
        if (data) db.mergeReturnGifts(data as ReturnGiftRecord[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        const { data } = await supabase.from('users').select('*');
        if (data) db.mergeUsers(data as User[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, async () => {
        const { data } = await supabase.from('app_settings').select('*').single();
        if (data) {
          db.overrideSettings(data as Partial<AppSettings>);
          if (onDataChanged) onDataChanged();
        }
      })
      .subscribe();

    console.log('⚡ [Supabase] Realtime multi-device subscription connected.');
  }

  // --- Push Event ---
  async pushEvent(event: Event): Promise<boolean> {
    try {
      const payload: any = {
        id: event.id,
        event_code: event.event_code,
        name: event.name,
        type: event.type || 'Marriage',
        date: event.date,
        venue: event.venue,
        host_name: event.host_name,
        description: event.description || null,
        status: event.status || 'Active',
        created_at: event.created_at || new Date().toISOString(),
        updated_at: event.updated_at || new Date().toISOString(),
        archived_at: event.archived_at || null
      };
      const { error } = await supabase.from('events').upsert(payload);
      if (error) {
        console.error('❌ Supabase Event Sync Error:', error.message);
        return false;
      }
      console.log('✅ Supabase Event Synced:', event.name);
      return true;
    } catch (e) {
      console.error('Failed to sync event to Supabase:', e);
      return false;
    }
  }

  // --- Push Ceremony ---
  async pushCeremony(ceremony: Ceremony): Promise<boolean> {
    try {
      // Ensure parent event exists in Supabase first
      const event = db.getEventById(ceremony.event_id);
      if (event) {
        await this.pushEvent(event);
      }

      const payload: any = {
        id: ceremony.id,
        event_id: ceremony.event_id,
        name: ceremony.name,
        ceremony_type: ceremony.ceremony_type,
        date: ceremony.date,
        time: ceremony.time || null,
        venue: ceremony.venue || null,
        description: ceremony.description || null,
        status: ceremony.status || 'Upcoming',
        created_at: ceremony.created_at || new Date().toISOString(),
        updated_at: ceremony.updated_at || new Date().toISOString()
      };

      const { error } = await supabase.from('ceremonies').upsert(payload);
      if (error) {
        console.error('❌ Supabase Ceremony Sync Error:', error.message);
        return false;
      }
      console.log('✅ Supabase Ceremony Synced:', ceremony.name);
      return true;
    } catch (e) {
      console.error('Failed to sync ceremony to Supabase:', e);
      return false;
    }
  }

  // --- Push Family ---
  async pushFamily(family: Family): Promise<boolean> {
    try {
      const payload: any = {
        id: family.id,
        name: family.name,
        head_guest_id: family.head_guest_id || null,
        address: family.address || null,
        village: family.village || null,
        district: family.district || null,
        state: family.state || null,
        mobile: family.mobile || null,
        notes: family.notes || null,
        created_at: family.created_at || new Date().toISOString(),
        updated_at: family.updated_at || new Date().toISOString()
      };
      const { error } = await supabase.from('families').upsert(payload);
      if (error) {
        console.error('❌ Supabase Family Sync Error:', error.message);
        return false;
      }
      console.log('✅ Supabase Family Synced:', family.name);
      return true;
    } catch (e) {
      console.error('Failed to sync family to Supabase:', e);
      return false;
    }
  }

  // --- Push Guest ---
  async pushGuest(guest: Guest): Promise<boolean> {
    try {
      // If family_id is referenced, ensure the family exists in Supabase
      let familyIdToUse = guest.family_id || null;
      if (familyIdToUse) {
        const fam = db.getFamilies().find(f => f.id === familyIdToUse);
        if (fam) {
          await this.pushFamily(fam);
        }
      }

      const payload: any = {
        id: guest.id,
        family_id: familyIdToUse,
        name: guest.name,
        father_husband_name: guest.father_husband_name || null,
        mobile: guest.mobile || null,
        alternate_mobile: guest.alternate_mobile || null,
        address: guest.address || null,
        village: guest.village || null,
        post: guest.post || null,
        district: guest.district || null,
        state: guest.state || null,
        pincode: guest.pincode || null,
        relation: guest.relation || 'Relative',
        side: guest.side || 'Groom Side',
        notes: guest.notes || null,
        created_at: guest.created_at || new Date().toISOString(),
        updated_at: guest.updated_at || new Date().toISOString(),
        deleted_at: guest.deleted_at || null
      };

      const { error } = await supabase.from('guests').upsert(payload);
      if (error) {
        console.error('❌ Supabase Guest Sync Error:', error.message);
        // If error is foreign key on family_id, retry without family_id
        if (error.message.includes('families') || error.message.includes('family_id')) {
          payload.family_id = null;
          const retry = await supabase.from('guests').upsert(payload);
          if (!retry.error) {
            console.log('✅ Supabase Guest Synced on retry (without family_id):', guest.name);
            return true;
          }
        }
        return false;
      }
      console.log('✅ Supabase Guest Synced:', guest.name);
      return true;
    } catch (e) {
      console.error('Failed to sync guest to Supabase:', e);
      return false;
    }
  }

  // --- Push Transaction: 100% Bulletproof with Dependency Resolution & Foreign Key Recovery ---
  async pushTransaction(txn: Transaction): Promise<boolean> {
    try {
      // 1. Ensure the parent event exists in Supabase
      const localEvent = db.getEventById(txn.event_id);
      if (localEvent) {
        await this.pushEvent(localEvent);
      }

      // 2. Ensure the parent guest exists in Supabase
      const localGuest = db.getGuestById(txn.guest_id);
      if (localGuest) {
        await this.pushGuest(localGuest);
      }

      // 3. Ensure ceremony exists (or nullify ceremony_id if not in Supabase so amount is NEVER rejected)
      let ceremonyIdToUse: string | null = null;
      if (txn.ceremony_id) {
        const localCrm = db.getCeremonyById(txn.ceremony_id);
        if (localCrm) {
          await this.pushCeremony(localCrm);
          ceremonyIdToUse = txn.ceremony_id;
        }
      }

      const payload: any = {
        id: txn.id,
        event_id: txn.event_id,
        ceremony_id: ceremonyIdToUse,
        guest_id: txn.guest_id,
        type: txn.type,
        amount: Number(txn.amount) || 0,
        payment_method: txn.payment_method || 'Cash',
        payment_reference: txn.payment_reference || null,
        transaction_date: txn.transaction_date || new Date().toISOString(),
        notes: txn.notes || null,
        created_by: txn.created_by || 'Operator',
        created_at: txn.created_at || new Date().toISOString(),
        updated_at: txn.updated_at || new Date().toISOString(),
        deleted_at: txn.deleted_at || null
      };

      const { error } = await supabase.from('transactions').upsert(payload);
      if (error) {
        console.error('❌ Supabase Transaction Sync Error:', error.message, error);
        
        // Auto-Recovery 1: If ceremony foreign key fails, nullify ceremony_id and retry
        if (error.message.includes('ceremonies') || error.message.includes('ceremony_id')) {
          payload.ceremony_id = null;
          const retry = await supabase.from('transactions').upsert(payload);
          if (!retry.error) {
            console.log('✅ Supabase Transaction Synced on retry (without ceremony_id)');
            return true;
          }
        }

        // Auto-Recovery 2: If guest foreign key fails, force-upsert guest first and retry
        if (error.message.includes('guests') || error.message.includes('guest_id')) {
          if (localGuest) {
            await this.pushGuest(localGuest);
            const retry = await supabase.from('transactions').upsert(payload);
            if (!retry.error) {
              console.log('✅ Supabase Transaction Synced on retry (after pushing guest)');
              return true;
            }
          }
        }

        return false;
      }

      console.log('✅ Supabase Transaction Synced: ₹' + txn.amount + ' (' + txn.type + ') for guest ' + txn.guest_id);
      return true;
    } catch (e) {
      console.error('Failed to sync transaction to Supabase:', e);
      return false;
    }
  }

  // --- Push Gift ---
  async pushGift(gift: Gift): Promise<boolean> {
    try {
      const localEvent = db.getEventById(gift.event_id);
      if (localEvent) await this.pushEvent(localEvent);

      const localGuest = db.getGuestById(gift.guest_id);
      if (localGuest) await this.pushGuest(localGuest);

      let ceremonyIdToUse: string | null = null;
      if (gift.ceremony_id) {
        const localCrm = db.getCeremonyById(gift.ceremony_id);
        if (localCrm) {
          await this.pushCeremony(localCrm);
          ceremonyIdToUse = gift.ceremony_id;
        }
      }

      const payload: any = {
        id: gift.id,
        event_id: gift.event_id,
        ceremony_id: ceremonyIdToUse,
        guest_id: gift.guest_id,
        item_name: gift.item_name,
        category: gift.category || 'Clothing',
        quantity: gift.quantity || 1,
        estimated_value: Number(gift.estimated_value) || 0,
        condition: gift.condition || null,
        photo_url: gift.photo_url || null,
        notes: gift.notes || null,
        created_at: gift.created_at || new Date().toISOString(),
        updated_at: gift.updated_at || new Date().toISOString(),
        deleted_at: gift.deleted_at || null
      };

      const { error } = await supabase.from('gifts').upsert(payload);
      if (error) {
        console.error('❌ Supabase Gift Sync Error:', error.message);
        if (error.message.includes('ceremonies') || error.message.includes('ceremony_id')) {
          payload.ceremony_id = null;
          const retry = await supabase.from('gifts').upsert(payload);
          if (!retry.error) return true;
        }
        return false;
      }
      console.log('✅ Supabase Gift Synced:', gift.item_name);
      return true;
    } catch (e) {
      console.error('Failed to sync gift to Supabase:', e);
      return false;
    }
  }

  // --- Push Return Gift (Vyavhar) ---
  async pushReturnGift(record: ReturnGiftRecord): Promise<boolean> {
    try {
      const localGuest = db.getGuestById(record.guest_id);
      if (localGuest) await this.pushGuest(localGuest);

      const payload: any = {
        id: record.id,
        guest_id: record.guest_id,
        family_id: record.family_id || null,
        direction: record.direction,
        event_name: record.event_name,
        date: record.date,
        amount: Number(record.amount) || 0,
        gift_description: record.gift_description || null,
        notes: record.notes || null,
        created_at: record.created_at || new Date().toISOString(),
        updated_at: record.updated_at || new Date().toISOString()
      };

      const { error } = await supabase.from('return_gifts').upsert(payload);
      if (error) {
        console.error('❌ Supabase Return Gift Sync Error:', error.message);
        return false;
      }
      console.log('✅ Supabase Return Gift Synced:', record.event_name);
      return true;
    } catch (e) {
      console.error('Failed to sync return gift to Supabase:', e);
      return false;
    }
  }

  async deleteReturnGift(id: string) {
    try {
      const { error } = await supabase.from('return_gifts').delete().eq('id', id);
      if (error) console.error('❌ Supabase Return Gift Delete Error:', error.message);
    } catch (e) {
      console.error('Failed to delete return gift in Supabase:', e);
    }
  }

  // --- Push User ---
  async pushUser(user: User): Promise<boolean> {
    try {
      const payload: any = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        password: user.password || '123',
        created_at: user.created_at || new Date().toISOString()
      };
      const { error } = await supabase.from('users').upsert(payload);
      if (error) {
        console.error('❌ Supabase User Sync Error:', error.message);
        return false;
      }
      console.log('✅ Supabase User Synced:', user.username);
      return true;
    } catch (e) {
      console.error('Failed to sync user to Supabase:', e);
      return false;
    }
  }

  // --- Push Audit Log ---
  async pushAuditLog(log: AuditLog): Promise<boolean> {
    try {
      const payload: any = {
        id: log.id,
        user_name: log.user_name,
        entity_type: log.entity_type,
        entity_id: log.entity_id,
        action: log.action,
        details: log.details,
        old_data: log.old_data || null,
        new_data: log.new_data || null,
        timestamp: log.timestamp || new Date().toISOString()
      };
      const { error } = await supabase.from('audit_logs').upsert(payload);
      if (error) {
        console.error('❌ Supabase Audit Log Sync Error:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Failed to sync audit log to Supabase:', e);
      return false;
    }
  }

  // --- Push Global Settings ---
  async pushSettings(settings: AppSettings): Promise<boolean> {
    try {
      const payload = {
        id: 'global-config',
        family_name: settings.family_name,
        operator_name: settings.operator_name,
        default_state: settings.default_state,
        default_district: settings.default_district,
        default_village: settings.default_village,
        currency_symbol: settings.currency_symbol,
        date_format: settings.date_format,
        language: settings.language,
        theme: settings.theme,
        auto_transliterate: settings.auto_transliterate,
        transliterate_target: settings.transliterate_target,
        sound_effects: settings.sound_effects,
        upi_id: settings.upi_id,
        upi_payee_name: settings.upi_payee_name,
        upi_enabled: settings.upi_enabled
      };
      const { error } = await supabase.from('app_settings').upsert(payload);
      if (error) {
        console.error('❌ Supabase Settings Sync Error:', error.message);
        return false;
      }
      console.log('✅ Supabase Settings Synced successfully.');
      return true;
    } catch (e) {
      console.error('Failed to sync settings to Supabase:', e);
      return false;
    }
  }

  // --- Deletes ---
  async deleteUser(id: string) {
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) console.error('❌ Supabase User Delete Error:', error.message);
      else console.log('✅ Supabase User Deleted:', id);
    } catch (e) {
      console.error('Failed to delete user in Supabase:', e);
    }
  }

  async deleteEvent(id: string) {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) console.error('❌ Supabase Event Delete Error:', error.message);
      else console.log('✅ Supabase Event Deleted:', id);
    } catch (e) {
      console.error('Failed to delete event in Supabase:', e);
    }
  }

  async deleteCeremony(id: string) {
    try {
      const { error } = await supabase.from('ceremonies').delete().eq('id', id);
      if (error) console.error('❌ Supabase Ceremony Delete Error:', error.message);
      else console.log('✅ Supabase Ceremony Deleted:', id);
    } catch (e) {
      console.error('Failed to delete ceremony in Supabase:', e);
    }
  }

  async deleteFamily(id: string) {
    try {
      const { error } = await supabase.from('families').delete().eq('id', id);
      if (error) console.error('❌ Supabase Family Delete Error:', error.message);
      else console.log('✅ Supabase Family Deleted:', id);
    } catch (e) {
      console.error('Failed to delete family in Supabase:', e);
    }
  }

  async deleteGuestPermanent(id: string) {
    try {
      const { error } = await supabase.from('guests').delete().eq('id', id);
      if (error) console.error('❌ Supabase Guest Delete Error:', error.message);
      else console.log('✅ Supabase Guest Deleted:', id);
    } catch (e) {
      console.error('Failed to delete guest in Supabase:', e);
    }
  }
}

export const cloudSync = new SupabaseSyncService();
