-- Enable insert for products table with anonymous key
-- Run this in Supabase SQL Editor

-- Option 1: Temporarily disable RLS for products table (simple for development)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- Option 2: OR create proper RLS policy that allows inserts
-- Uncomment if you prefer to keep RLS enabled with explicit policies
/*
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for authenticated users" ON products
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select for all" ON products
  FOR SELECT
  USING (true);

CREATE POLICY "Allow update for authenticated users" ON products
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow delete for authenticated users" ON products
  FOR DELETE
  USING (true);
*/
