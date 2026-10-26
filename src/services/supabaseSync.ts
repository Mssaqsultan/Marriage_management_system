import { supabase } from './supabase';
import { db } from './db';
import { Event, Ceremony, Guest, Family, Transaction, Gift, AppSettings, User } from '../types';

export class SupabaseSyncService {
  private isSyncing = false;
  private channel: any = null;

  // Initial pull from Supabase Cloud into local cache
  async pullFromCloud(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;

    try {
      // 1. Fetch Events
      const { data: eventsData } = await supabase.from('events').select('*');
      if (eventsData && eventsData.length > 0) {
        db.overrideEvents(eventsData as Event[]);
      }

      // 2. Fetch Ceremonies
      const { data: ceremoniesData } = await supabase.from('ceremonies').select('*');
      if (ceremoniesData && ceremoniesData.length > 0) {
        db.overrideCeremonies(ceremoniesData as Ceremony[]);
      }

      // 3. Fetch Families
      const { data: familiesData } = await supabase.from('families').select('*');
      if (familiesData && familiesData.length > 0) {
        db.overrideFamilies(familiesData as Family[]);
      }

      // 4. Fetch Guests
      const { data: guestsData } = await supabase.from('guests').select('*');
      if (guestsData && guestsData.length > 0) {
        db.overrideGuests(guestsData as Guest[]);
      }

      // 5. Fetch Transactions
      const { data: txnsData } = await supabase.from('transactions').select('*');
      if (txnsData && txnsData.length > 0) {
        db.overrideTransactions(txnsData as Transaction[]);
      }

      // 6. Fetch Gifts
      const { data: giftsData } = await supabase.from('gifts').select('*');
      if (giftsData && giftsData.length > 0) {
        db.overrideGifts(giftsData as Gift[]);
      }

      // 7. Fetch Users
      const { data: usersData } = await supabase.from('users').select('*');
      if (usersData && usersData.length > 0) {
        db.overrideUsers(usersData as User[]);
      }

      // 8. Fetch Settings
      const { data: settingsData } = await supabase.from('app_settings').select('*').single();
      if (settingsData) {
        db.overrideSettings(settingsData as Partial<AppSettings>);
      }

      console.log('✅ [Supabase] Cloud database synced successfully with local storage.');
      this.isSyncing = false;
      return true;
    } catch (err) {
      console.warn('⚠️ [Supabase] Cloud pull failed (working in offline mode):', err);
      this.isSyncing = false;
      return false;
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
        if (data) db.overrideTransactions(data as Transaction[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests' }, async () => {
        const { data } = await supabase.from('guests').select('*');
        if (data) db.overrideGuests(data as Guest[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gifts' }, async () => {
        const { data } = await supabase.from('gifts').select('*');
        if (data) db.overrideGifts(data as Gift[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async () => {
        const { data } = await supabase.from('events').select('*');
        if (data) db.overrideEvents(data as Event[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ceremonies' }, async () => {
        const { data } = await supabase.from('ceremonies').select('*');
        if (data) db.overrideCeremonies(data as Ceremony[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'families' }, async () => {
        const { data } = await supabase.from('families').select('*');
        if (data) db.overrideFamilies(data as Family[]);
        if (onDataChanged) onDataChanged();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        const { data } = await supabase.from('users').select('*');
        if (data) db.overrideUsers(data as User[]);
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

  // Push individual entity to cloud asynchronously
  async pushUser(user: User) {
    try {
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        password: user.password || '123',
        created_at: user.created_at || new Date().toISOString()
      });
      if (error) console.error('❌ Supabase User Sync Error:', error.message);
      else console.log('✅ Supabase User Synced:', user.username);
    } catch (e) {
      console.error('Failed to sync user to Supabase:', e);
    }
  }

  async pushGuest(guest: Guest) {
    try {
      const { error } = await supabase.from('guests').upsert(guest);
      if (error) console.error('❌ Supabase Guest Sync Error:', error.message);
      else console.log('✅ Supabase Guest Synced:', guest.name);
    } catch (e) {
      console.error('Failed to sync guest to Supabase:', e);
    }
  }

  async pushTransaction(txn: Transaction) {
    try {
      const { error } = await supabase.from('transactions').upsert(txn);
      if (error) console.error('❌ Supabase Transaction Sync Error:', error.message);
      else console.log('✅ Supabase Transaction Synced: ₹' + txn.amount);
    } catch (e) {
      console.error('Failed to sync transaction to Supabase:', e);
    }
  }

  async pushGift(gift: Gift) {
    try {
      const { error } = await supabase.from('gifts').upsert(gift);
      if (error) console.error('❌ Supabase Gift Sync Error:', error.message);
      else console.log('✅ Supabase Gift Synced:', gift.item_name);
    } catch (e) {
      console.error('Failed to sync gift to Supabase:', e);
    }
  }

  async pushEvent(event: Event) {
    try {
      const { error } = await supabase.from('events').upsert(event);
      if (error) console.error('❌ Supabase Event Sync Error:', error.message);
      else console.log('✅ Supabase Event Synced:', event.name);
    } catch (e) {
      console.error('Failed to sync event to Supabase:', e);
    }
  }

  async pushCeremony(ceremony: Ceremony) {
    try {
      const { error } = await supabase.from('ceremonies').upsert(ceremony);
      if (error) console.error('❌ Supabase Ceremony Sync Error:', error.message);
      else console.log('✅ Supabase Ceremony Synced:', ceremony.name);
    } catch (e) {
      console.error('Failed to sync ceremony to Supabase:', e);
    }
  }

  async pushFamily(family: Family) {
    try {
      const { error } = await supabase.from('families').upsert(family);
      if (error) console.error('❌ Supabase Family Sync Error:', error.message);
      else console.log('✅ Supabase Family Synced:', family.name);
    } catch (e) {
      console.error('Failed to sync family to Supabase:', e);
    }
  }

  async pushSettings(settings: AppSettings) {
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
      if (error) console.error('❌ Supabase Settings Sync Error:', error.message);
      else console.log('✅ Supabase Settings Synced successfully.');
    } catch (e) {
      console.error('Failed to sync settings to Supabase:', e);
    }
  }

  // Improved Delete Methods with proper error handling and logging
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