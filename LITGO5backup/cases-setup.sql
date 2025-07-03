-- Configuração da tabela 'cases' para LITGO

-- 1. Criar enumeração para o status do caso
CREATE TYPE case_status AS ENUM ('pending_assignment', 'assigned', 'in_progress', 'closed', 'cancelled');

-- 2. Criar a tabela de casos
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL, -- Removido REFERENCES auth.users(id) temporariamente para desenvolvimento
    lawyer_id UUID REFERENCES public.lawyers(id),
    status case_status DEFAULT 'pending_assignment' NOT NULL,
    ai_analysis JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para otimizar as buscas
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases (client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON public.cases (lawyer_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON public.cases (status);

-- 4. TEMPORARIAMENTE DESABILITADO PARA DESENVOLVIMENTO
-- Habilitar Row Level Security (RLS)
-- ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DESABILITADAS PARA DESENVOLVIMENTO
-- Quando implementar autenticação real, descomente as políticas abaixo:

-- Clientes podem criar casos para si mesmos
-- CREATE POLICY "cases_insert_own" ON public.cases
--     FOR INSERT
--     WITH CHECK (auth.uid() = client_id);

-- Clientes podem ver seus próprios casos
-- CREATE POLICY "cases_read_own" ON public.cases
--     FOR SELECT
--     USING (auth.uid() = client_id);

-- Advogados podem ver os casos que foram atribuídos a eles
-- CREATE POLICY "cases_read_assigned" ON public.cases
--     FOR SELECT
--     USING (auth.uid() = lawyer_id);

-- Clientes podem atribuir um advogado a um caso PENDENTE
-- CREATE POLICY "cases_assign_lawyer" ON public.cases
--     FOR UPDATE
--     USING (auth.uid() = client_id AND status = 'pending_assignment')
--     WITH CHECK (status = 'assigned');

-- Advogados podem atualizar o status de seus casos
-- CREATE POLICY "cases_update_status_by_lawyer" ON public.cases
--     FOR UPDATE
--     USING (auth.uid() = lawyer_id AND status != 'pending_assignment');
    
-- 6. Trigger para atualizar 'updated_at'
CREATE TRIGGER update_cases_updated_at 
    BEFORE UPDATE ON public.cases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Observação: A função 'update_updated_at_column' já deve existir
-- a partir do script 'supabase-setup.sql'. Se não, descomente abaixo.
/*
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
*/ 