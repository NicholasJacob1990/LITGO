-- Cria o tipo 'case_status' se ele não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status') THEN
        CREATE TYPE case_status AS ENUM ('pending_assignment', 'assigned', 'in_progress', 'closed', 'cancelled');
    END IF;
END$$;

-- Cria a tabela 'cases' com a estrutura correta para desenvolvimento
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL, -- Sem a restrição de chave estrangeira para auth.users
    lawyer_id UUID,
    status case_status DEFAULT 'pending_assignment' NOT NULL,
    ai_analysis JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria índices para otimizar as buscas
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases (client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON public.cases (lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases (status);

-- Garante que a função de trigger para 'updated_at' exista
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remove o trigger antigo se existir, para evitar duplicatas
DROP TRIGGER IF EXISTS update_cases_updated_at ON public.cases;

-- Cria o trigger para atualizar 'updated_at' em cada update
CREATE TRIGGER update_cases_updated_at 
    BEFORE UPDATE ON public.cases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 