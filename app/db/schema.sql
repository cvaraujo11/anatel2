-- Habilitar a extensão uuid-ossp para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Concursos
CREATE TABLE concursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  titulo TEXT NOT NULL,
  organizadora TEXT,
  data_prova TIMESTAMP WITH TIME ZONE,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de Conteúdo Programático
CREATE TABLE conteudo_programatico (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  concurso_id UUID REFERENCES concursos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  progresso INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Configurar Policies de RLS (Row Level Security)

-- Habilitar RLS na tabela de concursos
ALTER TABLE concursos ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela de conteúdo programático
ALTER TABLE conteudo_programatico ENABLE ROW LEVEL SECURITY;

-- Criar policy para usuários lerem apenas seus próprios concursos
CREATE POLICY "Usuários podem ler seus próprios concursos"
  ON concursos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Criar policy para usuários inserirem seus próprios concursos
CREATE POLICY "Usuários podem inserir seus próprios concursos"
  ON concursos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Criar policy para usuários atualizarem seus próprios concursos
CREATE POLICY "Usuários podem atualizar seus próprios concursos"
  ON concursos
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Criar policy para usuários excluírem seus próprios concursos
CREATE POLICY "Usuários podem excluir seus próprios concursos"
  ON concursos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Criar policy para acesso ao conteúdo programático via relação com concursos
CREATE POLICY "Usuários podem ler o conteúdo programático de seus próprios concursos"
  ON conteudo_programatico
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM concursos
      WHERE concursos.id = conteudo_programatico.concurso_id
      AND concursos.user_id = auth.uid()
    )
  );

-- Criar policy para inserção de conteúdo programático
CREATE POLICY "Usuários podem inserir conteúdo programático para seus próprios concursos"
  ON conteudo_programatico
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM concursos
      WHERE concursos.id = conteudo_programatico.concurso_id
      AND concursos.user_id = auth.uid()
    )
  );

-- Criar policy para atualização de conteúdo programático
CREATE POLICY "Usuários podem atualizar conteúdo programático de seus próprios concursos"
  ON conteudo_programatico
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM concursos
      WHERE concursos.id = conteudo_programatico.concurso_id
      AND concursos.user_id = auth.uid()
    )
  );

-- Criar policy para exclusão de conteúdo programático
CREATE POLICY "Usuários podem excluir conteúdo programático de seus próprios concursos"
  ON conteudo_programatico
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM concursos
      WHERE concursos.id = conteudo_programatico.concurso_id
      AND concursos.user_id = auth.uid()
    )
  );

-- Índices para melhorar performance de consultas
CREATE INDEX idx_concursos_user_id ON concursos(user_id);
CREATE INDEX idx_conteudo_concurso_id ON conteudo_programatico(concurso_id);

-- Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_concursos_updated_at
BEFORE UPDATE ON concursos
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 