-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID REFERENCES users(id) ON DELETE CASCADE,
  bankName TEXT NOT NULL,
  payee TEXT NOT NULL,
  address TEXT,
  dvNumber TEXT,
  particulars TEXT,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  checkNumber TEXT,
  controlNumber TEXT,
  accountCode TEXT,
  debit NUMERIC DEFAULT 0,
  credit NUMERIC DEFAULT 0,
  remarks TEXT,
  fund TEXT DEFAULT 'General Fund',
  responsibilityCenter TEXT,
  moph TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Viewer Access Table
CREATE TABLE IF NOT EXISTS viewer_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewerId UUID REFERENCES users(id) ON DELETE CASCADE,
  entryUserId UUID REFERENCES users(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(viewerId, entryUserId)
);

-- Transaction Batches Table
CREATE TABLE IF NOT EXISTS transaction_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewerId UUID REFERENCES users(id) ON DELETE CASCADE,
  entryUserId UUID REFERENCES users(id) ON DELETE CASCADE,
  batchName TEXT,
  transactionCount INTEGER DEFAULT 0,
  totalAmount NUMERIC DEFAULT 0,
  appliedFilters JSONB,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Batch Transactions Mapping Table
CREATE TABLE IF NOT EXISTS batch_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batchId UUID REFERENCES transaction_batches(id) ON DELETE CASCADE,
  transactionId UUID REFERENCES transactions(id) ON DELETE CASCADE,
  transactionData JSONB NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewer_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_transactions ENABLE ROW LEVEL SECURITY;

-- Create Policies (Initial: Allow all authenticated access for simplicity, or refine based on role)
CREATE POLICY "Allow public read-write for ease of migration" ON users FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for ease of migration" ON transactions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for ease of migration" ON viewer_access FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for ease of migration" ON transaction_batches FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for ease of migration" ON batch_transactions FOR ALL TO public USING (true) WITH CHECK (true);
