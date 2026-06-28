-- Supabase schema for perfume e-commerce
-- Run in Supabase SQL Editor

create extension if not exists pgcrypto;

-- ===== Helpers =====
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language plpgsql
stable
as $$
declare
  result boolean;
begin
  if to_regclass('public.profiles') is null then
    return false;
  end if;

  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
  into result;

  return coalesce(result, false);
end;
$$;

-- ===== Profiles =====
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  telegram text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- ===== Products =====
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  brand text not null,
  category text not null check (
    category in (
      'aquatic','aldehydic','amber','balsamic','oriental','gourmand','woody',
      'leather','musky','spicy','sweet','tobacco','fruity','fougere','floral','citrus','other'
    )
  ),
  gender text not null default 'unisex' check (gender in ('unisex', 'feminine', 'masculine')),
  price numeric(10,2) not null check (price >= 0),
  sale_price numeric(10,2) check (sale_price is null or sale_price >= 0),
  volume_ml integer check (volume_ml is null or volume_ml > 0),
  description text,
  top_notes text,
  heart_notes text,
  base_notes text,
  image_url text,
  is_active boolean not null default true,
  bestseller boolean not null default false,
  popular boolean not null default false,
  featured boolean not null default false,
  stock_qty integer not null default 0 check (stock_qty >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sale_price_less_or_equal_price check (
    sale_price is null or sale_price <= price
  )
);

create index if not exists idx_products_active on public.products (is_active);
create index if not exists idx_products_category on public.products (category);
create index if not exists idx_products_gender on public.products (gender);
create index if not exists idx_products_brand on public.products (brand);
create index if not exists idx_products_popular on public.products (popular, bestseller, featured);
create index if not exists idx_products_created_at on public.products (created_at desc);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- ===== Carts =====
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ux_carts_active_per_user
on public.carts (user_id)
where is_active = true;

create index if not exists idx_carts_user on public.carts (user_id);

drop trigger if exists trg_carts_updated_at on public.carts;
create trigger trg_carts_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),

  -- snapshot fields to keep frontend fast and resilient
  product_name text not null,
  product_price numeric(10,2) not null check (product_price >= 0),
  product_image text,
  product_volume integer,
  product_category text,
  product_gender text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id)
);

create index if not exists idx_cart_items_cart on public.cart_items (cart_id);
create index if not exists idx_cart_items_product on public.cart_items (product_id);

drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

-- ===== Orders =====
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,

  full_name text not null,
  phone text,
  address text not null,
  delivery_date date,
  delivery_time_slot text,

  payment_method text not null check (payment_method in ('card', 'cash')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),

  status text not null default 'new' check (status in ('new', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  comment text,

  subtotal_amount numeric(10,2) not null default 0 check (subtotal_amount >= 0),
  discount_amount numeric(10,2) not null default 0 check (discount_amount >= 0),
  delivery_amount numeric(10,2) not null default 0 check (delivery_amount >= 0),
  total_amount numeric(10,2) not null default 0 check (total_amount >= 0),

  -- compatibility with current app storage format
  items_snapshot jsonb,
  client_identifier text,
  client_contact_value text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user on public.orders (user_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,

  product_name text not null,
  product_brand text,
  product_category text,
  product_gender text,
  product_volume integer,
  product_image text,

  unit_price numeric(10,2) not null check (unit_price >= 0),
  sale_price numeric(10,2) check (sale_price is null or sale_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) not null check (line_total >= 0),

  created_at timestamptz not null default now()
);

create index if not exists idx_order_items_order on public.order_items (order_id);
create index if not exists idx_order_items_product on public.order_items (product_id);

create table if not exists public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_order_status_history_order on public.order_status_history (order_id, created_at desc);

-- ===== Reviews =====
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  text text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index if not exists idx_reviews_product on public.reviews (product_id, created_at desc);
create index if not exists idx_reviews_user on public.reviews (user_id, created_at desc);

drop trigger if exists trg_reviews_updated_at on public.reviews;
create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

-- ===== Favorites (optional but useful) =====
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create index if not exists idx_favorites_user on public.favorites (user_id);
create index if not exists idx_favorites_product on public.favorites (product_id);

-- ===== RLS =====
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;

-- Profiles policies
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
for insert with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

-- Products policies
drop policy if exists products_select_public on public.products;
create policy products_select_public on public.products
for select using (is_active = true or public.is_admin());

drop policy if exists products_admin_insert on public.products;
create policy products_admin_insert on public.products
for insert with check (public.is_admin());

drop policy if exists products_admin_update on public.products;
create policy products_admin_update on public.products
for update using (public.is_admin())
with check (public.is_admin());

drop policy if exists products_admin_delete on public.products;
create policy products_admin_delete on public.products
for delete using (public.is_admin());

-- Carts policies
drop policy if exists carts_select_own on public.carts;
create policy carts_select_own on public.carts
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists carts_insert_own on public.carts;
create policy carts_insert_own on public.carts
for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists carts_update_own on public.carts;
create policy carts_update_own on public.carts
for update using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists carts_delete_own on public.carts;
create policy carts_delete_own on public.carts
for delete using (user_id = auth.uid() or public.is_admin());

-- Cart items policies
drop policy if exists cart_items_select_own on public.cart_items;
create policy cart_items_select_own on public.cart_items
for select using (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and (c.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists cart_items_insert_own on public.cart_items;
create policy cart_items_insert_own on public.cart_items
for insert with check (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and (c.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists cart_items_update_own on public.cart_items;
create policy cart_items_update_own on public.cart_items
for update using (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and (c.user_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and (c.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists cart_items_delete_own on public.cart_items;
create policy cart_items_delete_own on public.cart_items
for delete using (
  exists (
    select 1 from public.carts c
    where c.id = cart_items.cart_id
      and (c.user_id = auth.uid() or public.is_admin())
  )
);

-- Orders policies
drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_insert_own on public.orders;
create policy orders_insert_own on public.orders
for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
for update using (public.is_admin())
with check (public.is_admin());

-- Order items policies
drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists order_items_insert_admin on public.order_items;
create policy order_items_insert_admin on public.order_items
for insert with check (public.is_admin());

drop policy if exists order_items_update_admin on public.order_items;
create policy order_items_update_admin on public.order_items
for update using (public.is_admin())
with check (public.is_admin());

drop policy if exists order_items_delete_admin on public.order_items;
create policy order_items_delete_admin on public.order_items
for delete using (public.is_admin());

-- Order status history policies
drop policy if exists order_status_history_select_own on public.order_status_history;
create policy order_status_history_select_own on public.order_status_history
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_status_history.order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists order_status_history_insert_admin on public.order_status_history;
create policy order_status_history_insert_admin on public.order_status_history
for insert with check (public.is_admin());

-- Reviews policies
drop policy if exists reviews_select_public on public.reviews;
create policy reviews_select_public on public.reviews
for select using (is_published = true or user_id = auth.uid() or public.is_admin());

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews
for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists reviews_update_own on public.reviews;
create policy reviews_update_own on public.reviews
for update using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists reviews_delete_own on public.reviews;
create policy reviews_delete_own on public.reviews
for delete using (user_id = auth.uid() or public.is_admin());

-- Favorites policies
drop policy if exists favorites_select_own on public.favorites;
create policy favorites_select_own on public.favorites
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists favorites_insert_own on public.favorites;
create policy favorites_insert_own on public.favorites
for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists favorites_delete_own on public.favorites;
create policy favorites_delete_own on public.favorites
for delete using (user_id = auth.uid() or public.is_admin());

-- ===== Optional helper view =====
create or replace view public.product_card_view as
select
  p.id,
  p.name,
  p.brand,
  p.category,
  p.gender,
  p.price,
  p.sale_price,
  p.volume_ml,
  p.image_url,
  p.bestseller,
  p.popular,
  p.featured,
  p.is_active,
  p.stock_qty,
  coalesce(avg(r.rating), 0)::numeric(3,2) as avg_rating,
  count(r.id)::int as review_count
from public.products p
left join public.reviews r on r.product_id = p.id and r.is_published = true
group by p.id;

comment on view public.product_card_view is 'Catalog-ready view with product info and review aggregates.';
