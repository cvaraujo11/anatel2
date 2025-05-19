-- Criação da tabela para notas de autoconhecimento
CREATE TABLE IF NOT EXISTS notas_autoconhecimento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para a tabela
ALTER TABLE notas_autoconhecimento ENABLE ROW LEVEL SECURITY;

-- Criar política de RLS para permitir leitura apenas das próprias notas
CREATE POLICY "Usuários podem ler suas próprias notas" 
ON notas_autoconhecimento 
FOR SELECT 
USING (auth.uid() = user_id);

-- Criar política de RLS para permitir inserção apenas para o próprio usuário
CREATE POLICY "Usuários podem inserir suas próprias notas" 
ON notas_autoconhecimento 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Criar política de RLS para permitir atualização apenas das próprias notas
CREATE POLICY "Usuários podem atualizar suas próprias notas" 
ON notas_autoconhecimento 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Criar política de RLS para permitir exclusão apenas das próprias notas
CREATE POLICY "Usuários podem excluir suas próprias notas" 
ON notas_autoconhecimento 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar índice para melhorar performance de busca por categoria
CREATE INDEX IF NOT EXISTS idx_notas_autoconhecimento_categoria 
ON notas_autoconhecimento(user_id, categoria);

-- Adicionar o campo modoRefugio à tabela user_preferences
ALTER TABLE IF EXISTS user_preferences 
ADD COLUMN IF NOT EXISTS modo_refugio BOOLEAN DEFAULT false;

-- Adicionar campo para armazenar o estado do temporizador de lazer na tabela user_preferences
ALTER TABLE IF EXISTS user_preferences 
ADD COLUMN IF NOT EXISTS temporizador_lazer_state JSONB DEFAULT NULL;

-- Tabelas para a página de lazer
CREATE TABLE atividades_lazer (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nome TEXT NOT NULL,
  categoria TEXT,
  duracao_minutos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Configurar RLS para atividades_lazer
ALTER TABLE atividades_lazer ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas suas próprias atividades de lazer"
  ON atividades_lazer
  FOR ALL
  USING (auth.uid() = user_id);

CREATE TABLE sugestoes_descanso (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  descricao TEXT NOT NULL,
  favorita BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Configurar RLS para sugestoes_descanso
ALTER TABLE sugestoes_descanso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas suas próprias sugestões de descanso"
  ON sugestoes_descanso
  FOR ALL
  USING (auth.uid() = user_id); 