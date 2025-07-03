-- Configuração do Supabase com PostGIS para LITGO
-- Execute este script no SQL Editor do Supabase

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- 2. Criar tabela de advogados com PostGIS
CREATE TABLE IF NOT EXISTS public.lawyers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    oab_number VARCHAR(50) UNIQUE NOT NULL,
    primary_area VARCHAR(100) NOT NULL,
    specialties TEXT[] DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    experience INTEGER DEFAULT 0,
    avatar_url TEXT,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    response_time VARCHAR(50) DEFAULT '24h',
    success_rate INTEGER DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100),
    hourly_rate DECIMAL(10,2) DEFAULT 0.0,
    consultation_fee DECIMAL(10,2) DEFAULT 0.0,
    is_available BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    next_availability VARCHAR(100),
    languages TEXT[] DEFAULT '{}',
    consultation_types TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índice GIST para buscas espaciais rápidas
CREATE INDEX IF NOT EXISTS idx_lawyers_location ON public.lawyers USING GIST (ll_to_earth(lat, lng));
CREATE INDEX IF NOT EXISTS idx_lawyers_approved ON public.lawyers (is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_lawyers_available ON public.lawyers (is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_lawyers_rating ON public.lawyers (rating DESC);

-- 4. Função para buscar advogados próximos
CREATE OR REPLACE FUNCTION lawyers_nearby(
    _lat DECIMAL(10,8),
    _lng DECIMAL(11,8),
    _radius_km INTEGER DEFAULT 50,
    _area VARCHAR(100) DEFAULT NULL,
    _rating_min DECIMAL(3,2) DEFAULT NULL,
    _available BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    oab_number VARCHAR(50),
    primary_area VARCHAR(100),
    rating DECIMAL(3,2),
    review_count INTEGER,
    experience INTEGER,
    avatar_url TEXT,
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    distance_km DECIMAL(10,2),
    response_time VARCHAR(50),
    success_rate INTEGER,
    hourly_rate DECIMAL(10,2),
    consultation_fee DECIMAL(10,2),
    is_available BOOLEAN,
    next_availability VARCHAR(100),
    languages TEXT[],
    consultation_types TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.oab_number,
        l.primary_area,
        l.rating,
        l.review_count,
        l.experience,
        l.avatar_url,
        l.lat,
        l.lng,
        earth_distance(
            ll_to_earth(_lat, _lng),
            ll_to_earth(l.lat, l.lng)
        ) / 1000.0 as distance_km,
        l.response_time,
        l.success_rate,
        l.hourly_rate,
        l.consultation_fee,
        l.is_available,
        l.next_availability,
        l.languages,
        l.consultation_types
    FROM public.lawyers l
    WHERE l.is_approved = true
        AND earth_distance(
            ll_to_earth(_lat, _lng),
            ll_to_earth(l.lat, l.lng)
        ) <= (_radius_km * 1000.0)
        AND (_area IS NULL OR l.primary_area ILIKE '%' || _area || '%')
        AND (_rating_min IS NULL OR l.rating >= _rating_min)
        AND (_available IS NULL OR l.is_available = _available)
    ORDER BY distance_km ASC, l.rating DESC;
END;
$$;

-- 5. Função para buscar advogados com filtros avançados
CREATE OR REPLACE FUNCTION lawyers_with_filters(
    _lat DECIMAL(10,8),
    _lng DECIMAL(11,8),
    _radius_km INTEGER DEFAULT 50,
    _areas TEXT[] DEFAULT NULL,
    _languages TEXT[] DEFAULT NULL,
    _consultation_types TEXT[] DEFAULT NULL,
    _min_rating DECIMAL(3,2) DEFAULT NULL,
    _available_only BOOLEAN DEFAULT false,
    _max_distance INTEGER DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    oab_number VARCHAR(50),
    primary_area VARCHAR(100),
    rating DECIMAL(3,2),
    review_count INTEGER,
    experience INTEGER,
    avatar_url TEXT,
    lat DECIMAL(10,8),
    lng DECIMAL(11,8),
    distance_km DECIMAL(10,2),
    response_time VARCHAR(50),
    success_rate INTEGER,
    hourly_rate DECIMAL(10,2),
    consultation_fee DECIMAL(10,2),
    is_available BOOLEAN,
    next_availability VARCHAR(100),
    languages TEXT[],
    consultation_types TEXT[]
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id,
        l.name,
        l.oab_number,
        l.primary_area,
        l.rating,
        l.review_count,
        l.experience,
        l.avatar_url,
        l.lat,
        l.lng,
        earth_distance(
            ll_to_earth(_lat, _lng),
            ll_to_earth(l.lat, l.lng)
        ) / 1000.0 as distance_km,
        l.response_time,
        l.success_rate,
        l.hourly_rate,
        l.consultation_fee,
        l.is_available,
        l.next_availability,
        l.languages,
        l.consultation_types
    FROM public.lawyers l
    WHERE l.is_approved = true
        AND earth_distance(
            ll_to_earth(_lat, _lng),
            ll_to_earth(l.lat, l.lng)
        ) <= (_radius_km * 1000.0)
        AND (_areas IS NULL OR l.primary_area = ANY(_areas))
        AND (_languages IS NULL OR l.languages && _languages)
        AND (_consultation_types IS NULL OR l.consultation_types && _consultation_types)
        AND (_min_rating IS NULL OR l.rating >= _min_rating)
        AND (NOT _available_only OR l.is_available = true)
        AND (_max_distance IS NULL OR earth_distance(
            ll_to_earth(_lat, _lng),
            ll_to_earth(l.lat, l.lng)
        ) <= (_max_distance * 1000.0))
    ORDER BY distance_km ASC, l.rating DESC;
END;
$$;

-- 6. Row Level Security (RLS) para controle de acesso
ALTER TABLE public.lawyers ENABLE ROW LEVEL SECURITY;

-- Política para leitura pública (apenas advogados aprovados)
CREATE POLICY "lawyers_read_public" ON public.lawyers
    FOR SELECT
    USING (is_approved = true);

-- Política para advogados editarem seus próprios dados
CREATE POLICY "lawyers_update_own" ON public.lawyers
    FOR UPDATE
    USING (auth.uid()::text = id::text);

-- Política para advogados inserirem seus dados
CREATE POLICY "lawyers_insert_own" ON public.lawyers
    FOR INSERT
    WITH CHECK (auth.uid()::text = id::text);

-- 7. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lawyers_updated_at 
    BEFORE UPDATE ON public.lawyers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Dados de exemplo (opcional)
INSERT INTO public.lawyers (
    name, oab_number, primary_area, specialties, rating, review_count, experience,
    avatar_url, lat, lng, response_time, success_rate, hourly_rate, consultation_fee,
    is_available, is_approved, next_availability, languages, consultation_types
) VALUES 
    ('Dr. Ana Silva', 'OAB/SP 123.456', 'Direito Civil', 
     ARRAY['Direito Civil', 'Direito de Família'], 4.8, 127, 8,
     'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
     -23.5505, -46.6333, '2h', 94, 300.00, 150.00,
     true, true, 'Hoje, 14:00', ARRAY['Português', 'Inglês'], ARRAY['chat', 'video', 'presential']),
    
    ('Dr. Carlos Mendes', 'OAB/SP 234.567', 'Direito Trabalhista',
     ARRAY['Direito Trabalhista', 'Direito Previdenciário'], 4.6, 89, 12,
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
     -23.5605, -46.6433, '1h', 91, 350.00, 200.00,
     true, true, 'Hoje, 15:30', ARRAY['Português'], ARRAY['video', 'presential']),
    
    ('Dra. Maria Santos', 'OAB/SP 345.678', 'Direito do Consumidor',
     ARRAY['Direito do Consumidor', 'Direito Civil'], 4.9, 203, 15,
     'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
     -23.5405, -46.6233, '30min', 97, 400.00, 250.00,
     false, true, 'Amanhã, 09:00', ARRAY['Português', 'Espanhol'], ARRAY['chat', 'video']),
    
    ('Dr. João Oliveira', 'OAB/SP 456.789', 'Direito Previdenciário',
     ARRAY['Direito Previdenciário', 'Direito Trabalhista'], 4.7, 156, 10,
     'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
     -23.5705, -46.6533, '4h', 88, 280.00, 180.00,
     true, true, 'Hoje, 16:00', ARRAY['Português'], ARRAY['presential'])
ON CONFLICT (oab_number) DO NOTHING;

-- 9. Comentários para documentação
COMMENT ON TABLE public.lawyers IS 'Tabela de advogados com localização geográfica';
COMMENT ON COLUMN public.lawyers.lat IS 'Latitude em graus decimais';
COMMENT ON COLUMN public.lawyers.lng IS 'Longitude em graus decimais';
COMMENT ON FUNCTION lawyers_nearby IS 'Busca advogados próximos usando PostGIS';
COMMENT ON FUNCTION lawyers_with_filters IS 'Busca advogados com filtros avançados';

-- 10. Configuração para Realtime (opcional)
-- Habilitar Realtime na tabela lawyers via Dashboard do Supabase
-- Dashboard > Database > Replication > Tables > lawyers > Enable 