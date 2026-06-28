-- Create site_visits table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT,
  device TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at 
ON site_visits(created_at DESC);

-- Enable RLS
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones for site_visits
DROP POLICY IF EXISTS "Allow public insert" ON site_visits;
DROP POLICY IF EXISTS "Allow public read" ON site_visits;

CREATE POLICY "Allow public insert" ON site_visits
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read" ON site_visits
  FOR SELECT
  USING (true);

-- Ensure all other tables have read access
-- Products table
DROP POLICY IF EXISTS "Allow public read" ON products;
CREATE POLICY "Allow public read" ON products
  FOR SELECT
  USING (true);

-- Carts table
DROP POLICY IF EXISTS "Allow public read" ON carts;
CREATE POLICY "Allow public read" ON carts
  FOR SELECT
  USING (true);

-- Orders table
DROP POLICY IF EXISTS "Allow public read" ON orders;
CREATE POLICY "Allow public read" ON orders
  FOR SELECT
  USING (true);

-- Clients table
DROP POLICY IF EXISTS "Allow public read" ON clients;
CREATE POLICY "Allow public read" ON clients
  FOR SELECT
  USING (true);

-- Reviews table
DROP POLICY IF EXISTS "Allow public read" ON reviews;
CREATE POLICY "Allow public read" ON reviews
  FOR SELECT
  USING (true);
