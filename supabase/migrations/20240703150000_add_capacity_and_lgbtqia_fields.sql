-- Adicionar campo para capacidade de trabalho na tabela lawyers (se ela existir)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'lawyers' AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.lawyers
        ADD COLUMN IF NOT EXISTS max_concurrent_cases INTEGER DEFAULT 10;
        
        COMMENT ON COLUMN public.lawyers.max_concurrent_cases IS 'Número máximo de casos que o advogado pode atender simultaneamente.';
    END IF;
END $$;

-- Adicionar campo para orientação sexual/identidade de gênero na tabela profiles, se não existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'profiles' AND table_schema = 'public'
    ) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'profiles' AND column_name = 'lgbtqia'
        ) THEN
            ALTER TABLE public.profiles ADD COLUMN lgbtqia BOOLEAN DEFAULT FALSE;
            COMMENT ON COLUMN public.profiles.lgbtqia IS 'Indica se o usuário se identifica como parte da comunidade LGBTQIA+ (opcional)';
        END IF;
    END IF;
END $$; 