-- Tabela para refeições planejadas e realizadas
CREATE TABLE refeicoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo TEXT NOT NULL, -- 'planejada' ou 'realizada'
  horario TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo_icone TEXT, -- Referência ao tipo de refeição (café, fruta, etc.)
  foto TEXT, -- Possível URL para foto da refeição
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para registros de hidratação
CREATE TABLE hidratacao (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  data DATE NOT NULL,
  quantidade_ml INTEGER NOT NULL DEFAULT 0,
  meta_diaria_ml INTEGER NOT NULL DEFAULT 2000, -- Equivalente a 8 copos de 250ml
  ultimo_registro TEXT, -- Horário do último registro no formato HH:MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Configuração de índices para otimizar consultas comuns
CREATE INDEX refeicoes_user_id_data_idx ON refeicoes(user_id, data);
CREATE INDEX hidratacao_user_id_data_idx ON hidratacao(user_id, data);

-- Políticas RLS para isolamento de dados entre usuários
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidratacao ENABLE ROW LEVEL SECURITY;

-- Política para refeições: usuário só acessa seus próprios dados
CREATE POLICY "Refeições isoladas por usuário" 
  ON refeicoes 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Política para hidratação: usuário só acessa seus próprios dados
CREATE POLICY "Hidratação isolada por usuário" 
  ON hidratacao 
  FOR ALL 
  USING (auth.uid() = user_id);

-- Trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_refeicoes_timestamp
BEFORE UPDATE ON refeicoes
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_hidratacao_timestamp
BEFORE UPDATE ON hidratacao
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 