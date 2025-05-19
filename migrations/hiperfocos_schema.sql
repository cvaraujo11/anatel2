-- Tabela de projetos de hiperfoco
CREATE TABLE IF NOT EXISTS public.hiperfoco_projetos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    cor TEXT NOT NULL DEFAULT '#4CAF50',
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas de hiperfoco
CREATE TABLE IF NOT EXISTS public.hiperfoco_tarefas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    projeto_id UUID NOT NULL REFERENCES public.hiperfoco_projetos(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    concluida BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de preferências do usuário
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    hiperfoco_aba_selecionada TEXT DEFAULT 'conversor',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.hiperfoco_projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiperfoco_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Definir políticas para projetos de hiperfoco
CREATE POLICY "Usuários podem ver seus projetos de hiperfoco" 
ON public.hiperfoco_projetos FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus projetos de hiperfoco" 
ON public.hiperfoco_projetos FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus projetos de hiperfoco" 
ON public.hiperfoco_projetos FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus projetos de hiperfoco" 
ON public.hiperfoco_projetos FOR DELETE 
USING (auth.uid() = user_id);

-- Definir políticas para tarefas de hiperfoco
CREATE POLICY "Usuários podem ver tarefas de seus projetos de hiperfoco" 
ON public.hiperfoco_tarefas FOR SELECT 
USING (
    projeto_id IN (
        SELECT id FROM public.hiperfoco_projetos WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem inserir tarefas em seus projetos de hiperfoco" 
ON public.hiperfoco_tarefas FOR INSERT 
WITH CHECK (
    projeto_id IN (
        SELECT id FROM public.hiperfoco_projetos WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem atualizar tarefas de seus projetos de hiperfoco" 
ON public.hiperfoco_tarefas FOR UPDATE 
USING (
    projeto_id IN (
        SELECT id FROM public.hiperfoco_projetos WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Usuários podem deletar tarefas de seus projetos de hiperfoco" 
ON public.hiperfoco_tarefas FOR DELETE 
USING (
    projeto_id IN (
        SELECT id FROM public.hiperfoco_projetos WHERE user_id = auth.uid()
    )
);

-- Definir políticas para preferências do usuário
CREATE POLICY "Usuários podem ver suas preferências" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas preferências" 
ON public.user_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas preferências" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar triggers para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hiperfoco_projetos_modtime
BEFORE UPDATE ON public.hiperfoco_projetos
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_hiperfoco_tarefas_modtime
BEFORE UPDATE ON public.hiperfoco_tarefas
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_user_preferences_modtime
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column(); 