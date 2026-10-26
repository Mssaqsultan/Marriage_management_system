-- ============================================================================
-- SULTAN MARRIAGE MANAGEMENT & NEVTA LEDGER SYSTEM - FULL SUPABASE SCHEMA
-- A to Z Complete Database Setup Script
-- ============================================================================

-- 1. App Users (Admins & Counter Operators)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'operator', -- 'admin' or 'operator'
    password TEXT NOT NULL DEFAULT '123',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Celebrations & Weddings
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    event_code TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Marriage',
    date TEXT NOT NULL,
    venue TEXT NOT NULL,
    host_name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Active', -- 'Active', 'Completed', 'Archived'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    archived_at TIMESTAMPTZ
);

-- 3. Specific Ceremonies / Functions
CREATE TABLE IF NOT EXISTS ceremonies (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    ceremony_type TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    venue TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Upcoming',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Families / Households
CREATE TABLE IF NOT EXISTS families (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    head_guest_id TEXT,
    address TEXT,
    village TEXT,
    district TEXT,
    state TEXT,
    mobile TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Master Mehmaan (Guest) Directory
CREATE TABLE IF NOT EXISTS guests (
    id TEXT PRIMARY KEY,
    family_id TEXT REFERENCES families(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    father_husband_name TEXT,
    mobile TEXT,
    alternate_mobile TEXT,
    address TEXT,
    village TEXT,
    post TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT,
    relation TEXT NOT NULL DEFAULT 'Relative',
    side TEXT NOT NULL DEFAULT 'Groom Side',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 6. Nevta & Nahuchua Financial Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    ceremony_id TEXT REFERENCES ceremonies(id) ON DELETE SET NULL,
    guest_id TEXT REFERENCES guests(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'nevta' or 'nahuchua'
    amount NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'Cash', -- 'Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'
    payment_reference TEXT,
    transaction_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT,
    created_by TEXT NOT NULL DEFAULT 'Sultan Salahuddin',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 7. Physical Gift Registry
CREATE TABLE IF NOT EXISTS gifts (
    id TEXT PRIMARY KEY,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
    ceremony_id TEXT REFERENCES ceremonies(id) ON DELETE SET NULL,
    guest_id TEXT REFERENCES guests(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Clothing',
    quantity INTEGER NOT NULL DEFAULT 1,
    estimated_value NUMERIC NOT NULL DEFAULT 0,
    condition TEXT,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at TIMESTAMPTZ
);

-- 8. Return Gifts & Vyavhar Ledger
CREATE TABLE IF NOT EXISTS return_gifts (
    id TEXT PRIMARY KEY,
    guest_id TEXT REFERENCES guests(id) ON DELETE CASCADE,
    family_id TEXT REFERENCES families(id) ON DELETE SET NULL,
    direction TEXT NOT NULL, -- 'given_by_us' or 'received_by_us'
    event_name TEXT NOT NULL,
    date TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    gift_description TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Audit Trail Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'BACKUP'
    details TEXT NOT NULL,
    old_data TEXT,
    new_data TEXT,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. System Global Settings
CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY DEFAULT 'global-config',
    family_name TEXT NOT NULL DEFAULT 'Sultan Family',
    operator_name TEXT NOT NULL DEFAULT 'Sultan',
    default_state TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    default_district TEXT NOT NULL DEFAULT 'Lucknow',
    default_village TEXT NOT NULL DEFAULT 'Chauriya khas',
    currency_symbol TEXT NOT NULL DEFAULT '₹',
    date_format TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
    language TEXT NOT NULL DEFAULT 'en',
    theme TEXT NOT NULL DEFAULT 'royal-light',
    auto_transliterate BOOLEAN DEFAULT true,
    transliterate_target TEXT DEFAULT 'both',
    sound_effects BOOLEAN DEFAULT true,
    upi_id TEXT DEFAULT 'sultan.family@okaxis',
    upi_payee_name TEXT DEFAULT 'Sultan Salahuddin & Family',
    upi_enabled BOOLEAN DEFAULT true
);

-- ----------------------------------------------------------------------------
-- Enable Row Level Security (RLS)
-- ----------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ceremonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- Allow Public / Anon Key Full Read & Write Access (Idempotent Policies)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public full access on users" ON users;
    CREATE POLICY "Public full access on users" ON users FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on events" ON events;
    CREATE POLICY "Public full access on events" ON events FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on ceremonies" ON ceremonies;
    CREATE POLICY "Public full access on ceremonies" ON ceremonies FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on families" ON families;
    CREATE POLICY "Public full access on families" ON families FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on guests" ON guests;
    CREATE POLICY "Public full access on guests" ON guests FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on transactions" ON transactions;
    CREATE POLICY "Public full access on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on gifts" ON gifts;
    CREATE POLICY "Public full access on gifts" ON gifts FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on return_gifts" ON return_gifts;
    CREATE POLICY "Public full access on return_gifts" ON return_gifts FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on audit_logs" ON audit_logs;
    CREATE POLICY "Public full access on audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public full access on app_settings" ON app_settings;
    CREATE POLICY "Public full access on app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ----------------------------------------------------------------------------
-- Enable Realtime Live Broadcasting for multi-device sync
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE users, events, ceremonies, guests, families, transactions, gifts, return_gifts, app_settings;
    EXCEPTION WHEN duplicate_object THEN
        -- tables already in publication
        NULL;
    END;
END $$;

-- ----------------------------------------------------------------------------
-- Seed Default Super Admin & Initial Wedding Data
-- ----------------------------------------------------------------------------
INSERT INTO users (id, username, name, role, password)
VALUES 
    ('usr-1', 'sultan', 'Sultan Salahuddin (Super Admin)', 'admin', '123'),
    ('usr-2', 'operator', 'Farhan (Counter Operator)', 'operator', '123')
ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    password = EXCLUDED.password;

INSERT INTO events (id, event_code, name, type, date, venue, host_name, description, status)
VALUES (
    'evt-1',
    'EVT-2027-MAR',
    'Sultan Ki Grand Shaadi',
    'Marriage',
    '2027-02-15',
    'Royal Emerald Palace & Gardens, Chauriya khas',
    'Sultan Salahuddin & Family',
    'Grand Wedding Celebrations of Sultan with Haldi, Mehendi, Nikah & Walima',
    'Active'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO ceremonies (id, event_id, name, ceremony_type, date, time, venue, description, status)
VALUES 
    ('crm-1-1', 'evt-1', 'Haldi & Manjha Rasam', 'Haldi', '2027-02-13', '11:00 AM', 'Sultan Haveli Courtyard, Chauriya khas', 'Traditional turmeric blessing ritual', 'Upcoming'),
    ('crm-1-2', 'evt-1', 'Mehendi & Sangeet Night', 'Mehendi', '2027-02-14', '07:30 PM', 'Grand Courtyard, Chauriya khas', 'Henna night and music celebration', 'Upcoming'),
    ('crm-1-3', 'evt-1', 'Shahi Nikah Celebration', 'Nikah', '2027-02-15', '01:00 PM', 'Royal Emerald Palace, Chauriya khas', 'Sacred Wedding Ceremony & Main Nevta Counter', 'Upcoming'),
    ('crm-1-4', 'evt-1', 'Dawat-e-Walima Reception', 'Walima', '2027-02-18', '08:00 PM', 'Imperial Grand Banquet, Lucknow', 'Grand Wedding Reception Feast', 'Upcoming')
ON CONFLICT (id) DO NOTHING;

INSERT INTO app_settings (id, family_name, operator_name, default_village, upi_id, upi_payee_name)
VALUES ('global-config', 'Sultan Family', 'Sultan', 'Chauriya khas', 'sultan.family@okaxis', 'Sultan Salahuddin & Family')
ON CONFLICT (id) DO NOTHING;
