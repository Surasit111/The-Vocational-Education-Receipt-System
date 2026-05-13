DROP TABLE IF EXISTS payment_entries CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS receipts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    value VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Receipts Table (Main Data)
CREATE TABLE IF NOT EXISTS receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    academic_year VARCHAR(20),
    semester INTEGER,
    name_type VARCHAR(100),
    payer_name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    agency VARCHAR(255),
    supervisor VARCHAR(255),
    supervisor_position VARCHAR(255),
    pdf_data BYTEA,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Payment Entries Table (Details)
CREATE TABLE IF NOT EXISTS payment_entries (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    entry_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_receipts_number ON receipts(receipt_number);
CREATE INDEX IF NOT EXISTS idx_payment_entries_receipt ON payment_entries(receipt_id);
