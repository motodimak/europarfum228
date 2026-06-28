-- Enable public read access for products table
-- Run this in Supabase SQL Editor before using the app

-- Create RLS policy for SELECT (public read)
CREATE POLICY "Allow public read" ON products
  FOR SELECT
  USING (true);
