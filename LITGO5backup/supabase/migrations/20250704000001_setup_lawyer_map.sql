-- Enable required extensions for geospatial functionality
create extension if not exists postgis;
create extension if not exists cube;
create extension if not exists earthdistance;

-- Add latitude and longitude columns to the lawyers table
alter table public.lawyers add column if not exists lat numeric;
alter table public.lawyers add column if not exists lng numeric;
alter table public.lawyers add column if not exists rating numeric default 0;

-- Ensure column types are numeric for consistency
alter table public.lawyers alter column lat type numeric using lat::numeric;
alter table public.lawyers alter column lng type numeric using lng::numeric;
alter table public.lawyers alter column rating type numeric using rating::numeric;

-- Create a geospatial index to speed up location-based queries
create index if not exists lawyers_lat_lng_idx on public.lawyers using gist (ll_to_earth(lat,lng));

-- Drop any existing versions of the function to avoid conflicts
drop function if exists public.lawyers_nearby(numeric, numeric, numeric, text, numeric, boolean);
drop function if exists public.lawyers_nearby(double precision, double precision, double precision, text, double precision, boolean);

-- Function to find lawyers nearby a given location with filters
-- This function uses PostGIS's earth distance functions for accurate geospatial queries
create or replace function public.lawyers_nearby(
    _lat numeric,
    _lng numeric,
    _radius_km numeric default 50,
    _area text default null,
    _rating_min numeric default 0,
    _available boolean default null
)
returns table(
    id uuid,
    name text,
    oab_number text,
    primary_area text,
    specialties text[],
    avatar_url text,
    is_available boolean,
    rating numeric,
    lat numeric,
    lng numeric,
    distance_km numeric
)
language plpgsql
as $$
begin
    return query
    select
        l.id,
        l.name,
        l.oab_number,
        l.primary_area,
        l.specialties,
        l.avatar_url,
        l.is_available,
        l.rating,
        l.lat,
        l.lng,
        (earth_distance(ll_to_earth(_lat, _lng), ll_to_earth(l.lat, l.lng)) / 1000) as distance_km
    from
        public.lawyers as l
    where
        l.lat is not null
        and l.lng is not null
        and earth_box(ll_to_earth(_lat, _lng), _radius_km * 1000) @> ll_to_earth(l.lat, l.lng)
        and earth_distance(ll_to_earth(_lat, _lng), ll_to_earth(l.lat, l.lng)) <= (_radius_km * 1000)
        and (_area is null or l.primary_area ilike '%' || _area || '%')
        and l.rating >= _rating_min
        and (_available is null or l.is_available = _available)
    order by
        (l.rating * 0.3 + (5 - least(earth_distance(ll_to_earth(_lat, _lng), ll_to_earth(l.lat, l.lng)) / 1000 / _radius_km * 5, 5)) * 0.7) desc,
        earth_distance(ll_to_earth(_lat, _lng), ll_to_earth(l.lat, l.lng)) asc;
end;
$$; 