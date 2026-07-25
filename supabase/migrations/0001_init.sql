-- ============================================================================
-- BarrioMap — Fase 2: esquema multitenant (PostgreSQL + PostGIS + RLS)
-- Correr en: Supabase Dashboard -> SQL Editor -> New query -> pegar y Run.
-- ============================================================================

-- 1) Extensiones ------------------------------------------------------------
create extension if not exists postgis;

-- 2) Tipos ------------------------------------------------------------------
do $$ begin
  create type business_category as enum ('gastronomia','indumentaria','servicios','showrooms');
exception when duplicate_object then null; end $$;

do $$ begin
  create type house_style as enum ('clasica','moderna','local_comercial','showroom','esquina');
exception when duplicate_object then null; end $$;

do $$ begin
  create type business_status as enum ('pending','published','hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('superadmin','owner');
exception when duplicate_object then null; end $$;

-- 3) Perfiles (rol + negocio asignado) --------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'owner',
  full_name text,
  created_at timestamptz not null default now()
);

-- 4) Negocios ---------------------------------------------------------------
create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category business_category not null,
  house_style house_style not null default 'local_comercial',
  lat double precision not null,
  lng double precision not null,
  location geography(Point, 4326)
    generated always as (ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) stored,
  address text not null default '',
  neighborhood text not null default '',
  whatsapp text not null,
  instagram text,
  phone text,
  description text not null default '',
  status business_status not null default 'published',
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists businesses_location_idx on businesses using gist (location);
create index if not exists businesses_owner_idx on businesses (owner_id);
create index if not exists businesses_status_idx on businesses (status);

-- 5) Productos / servicios --------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  price numeric(12,2) not null default 0,
  photo_url text,
  is_offer boolean not null default false,
  offer_label text,
  keywords text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists products_business_idx on products (business_id);

-- 6) Leads (formulario público "Sumar mi negocio") --------------------------
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category business_category not null,
  house_style house_style not null default 'local_comercial',
  lat double precision not null,
  lng double precision not null,
  address text,
  neighborhood text,
  whatsapp text not null,
  instagram text,
  phone text,
  description text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- 7) Helpers ----------------------------------------------------------------
-- security definer: puede leer profiles ignorando RLS (evita recursión).
create or replace function is_superadmin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'superadmin');
$$;

-- updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists businesses_updated_at on businesses;
create trigger businesses_updated_at before update on businesses
  for each row execute function set_updated_at();

-- Búsqueda por proximidad (PostGIS): negocios publicados ordenados por cercanía.
create or replace function businesses_near(in_lat double precision, in_lng double precision, in_limit int default 60)
returns setof businesses language sql stable as $$
  select * from businesses
  where status = 'published'
  order by location <-> ST_SetSRID(ST_MakePoint(in_lng, in_lat), 4326)::geography
  limit in_limit;
$$;

-- 8) Row Level Security -----------------------------------------------------
alter table profiles   enable row level security;
alter table businesses enable row level security;
alter table products   enable row level security;
alter table leads      enable row level security;

-- profiles
drop policy if exists profiles_read on profiles;
create policy profiles_read on profiles for select
  using (id = auth.uid() or is_superadmin());
drop policy if exists profiles_admin on profiles;
create policy profiles_admin on profiles for all
  using (is_superadmin()) with check (is_superadmin());

-- businesses: público ve publicados; dueño ve/edita lo suyo; superadmin todo.
drop policy if exists businesses_read on businesses;
create policy businesses_read on businesses for select
  using (status = 'published' or owner_id = auth.uid() or is_superadmin());
drop policy if exists businesses_owner_update on businesses;
create policy businesses_owner_update on businesses for update
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists businesses_admin on businesses;
create policy businesses_admin on businesses for all
  using (is_superadmin()) with check (is_superadmin());

-- products: lectura pública si el negocio está publicado; dueño gestiona los suyos.
drop policy if exists products_read on products;
create policy products_read on products for select using (
  exists (select 1 from businesses b where b.id = business_id
          and (b.status = 'published' or b.owner_id = auth.uid() or is_superadmin()))
);
drop policy if exists products_owner on products;
create policy products_owner on products for all using (
  exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
) with check (
  exists (select 1 from businesses b where b.id = business_id and b.owner_id = auth.uid())
);
drop policy if exists products_admin on products;
create policy products_admin on products for all
  using (is_superadmin()) with check (is_superadmin());

-- leads: cualquiera puede enviar; solo superadmin lee.
drop policy if exists leads_insert on leads;
create policy leads_insert on leads for insert with check (true);
drop policy if exists leads_read on leads;
create policy leads_read on leads for select using (is_superadmin());

-- 9) Storage: bucket público para fotos de productos ------------------------
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

-- Lectura pública de las fotos
drop policy if exists "product photos public read" on storage.objects;
create policy "product photos public read" on storage.objects for select
  using (bucket_id = 'product-photos');

-- Subida/edición: dueños autenticados y superadmin (afinamos por negocio en el panel)
drop policy if exists "product photos write" on storage.objects;
create policy "product photos write" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-photos');
drop policy if exists "product photos update" on storage.objects;
create policy "product photos update" on storage.objects for update to authenticated
  using (bucket_id = 'product-photos');
drop policy if exists "product photos delete" on storage.objects;
create policy "product photos delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-photos');
