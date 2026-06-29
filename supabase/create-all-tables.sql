-- Create all required tables for the application

-- 1. Clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  contact_type TEXT,
  contact_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT,
  price NUMERIC,
  sale_price NUMERIC,
  volume_ml TEXT,
  description TEXT,
  category TEXT,
  top_notes TEXT,
  heart_notes TEXT,
  base_notes TEXT,
  image_url TEXT,
  gender TEXT,
  featured BOOLEAN DEFAULT FALSE,
  bestseller BOOLEAN DEFAULT FALSE,
  popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Carts table
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT,
  product_price NUMERIC,
  product_image TEXT,
  product_volume TEXT,
  product_category TEXT,
  product_gender TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  phone TEXT,
  address TEXT,
  delivery_date TEXT,
  delivery_time_slot TEXT,
  payment_method TEXT,
  total_amount NUMERIC,
  items_snapshot TEXT,
  status TEXT DEFAULT 'new',
  client_identifier TEXT,
  client_contact_type TEXT,
  client_contact_value TEXT,
  client_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT,
  user_id UUID,
  rating INTEGER,
  text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Site visits table
CREATE TABLE IF NOT EXISTS site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT,
  device TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_carts_product_id ON carts(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_client_identifier ON orders(client_identifier);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON site_visits(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
DROP POLICY IF EXISTS "Allow public read" ON clients;
CREATE POLICY "Allow public read" ON clients
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read" ON products;
CREATE POLICY "Allow public read" ON products
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read" ON carts;
CREATE POLICY "Allow public read" ON carts
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read" ON orders;
CREATE POLICY "Allow public read" ON orders
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read" ON reviews;
CREATE POLICY "Allow public read" ON reviews
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow public read" ON site_visits;
CREATE POLICY "Allow public read" ON site_visits
  FOR SELECT
  USING (true);

-- Create policies for public insert access
DROP POLICY IF EXISTS "Allow public insert" ON clients;
CREATE POLICY "Allow public insert" ON clients
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert" ON carts;
CREATE POLICY "Allow public insert" ON carts
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert" ON orders;
CREATE POLICY "Allow public insert" ON orders
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert" ON reviews;
CREATE POLICY "Allow public insert" ON reviews
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert" ON site_visits;
CREATE POLICY "Allow public insert" ON site_visits
  FOR INSERT
  WITH CHECK (true);

-- Create policies for public update access
DROP POLICY IF EXISTS "Allow public update" ON carts;
CREATE POLICY "Allow public update" ON carts
  FOR UPDATE
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON orders;
CREATE POLICY "Allow public update" ON orders
  FOR UPDATE
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update" ON products;
CREATE POLICY "Allow public update" ON products
  FOR UPDATE
  WITH CHECK (true);

-- Create policies for public delete access
DROP POLICY IF EXISTS "Allow public delete" ON carts;
CREATE POLICY "Allow public delete" ON carts
  FOR DELETE
  USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON site_visits;
CREATE POLICY "Allow public delete" ON site_visits
  FOR DELETE
  USING (true);
