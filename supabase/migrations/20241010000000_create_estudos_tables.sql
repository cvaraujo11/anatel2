-- Criação da tabela de sessões de estudo
CREATE TABLE sessoes_estudo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fim TIMESTAMP WITH TIME ZONE,
  duracao_minutos INTEGER,
  assunto TEXT,
  concurso_id UUID REFERENCES concursos(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Configuração de RLS (Row Level Security)
ALTER TABLE sessoes_estudo ENABLE ROW LEVEL SECURITY;

-- Política para garantir que usuários só vejam suas próprias sessões
CREATE POLICY "Usuários podem ver apenas suas próprias sessões de estudo"
  ON sessoes_estudo
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para permitir que usuários criem suas próprias sessões
CREATE POLICY "Usuários podem criar suas próprias sessões de estudo"
  ON sessoes_estudo
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias sessões
CREATE POLICY "Usuários podem atualizar suas próprias sessões de estudo"
  ON sessoes_estudo
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para permitir que usuários excluam suas próprias sessões
CREATE POLICY "Usuários podem excluir suas próprias sessões de estudo"
  ON sessoes_estudo
  FOR DELETE
  USING (auth.uid() = user_id); 