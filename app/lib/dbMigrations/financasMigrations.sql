-- Migração das tabelas do módulo de finanças para o Supabase

-- Tabela de gastos
CREATE TABLE IF NOT EXISTS gastos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT,
  data TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de envelopes virtuais
CREATE TABLE IF NOT EXISTS envelopes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  nome TEXT NOT NULL,
  orcamento DECIMAL(10,2) DEFAULT 0,
  saldo_atual DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
  recorrente BOOLEAN DEFAULT false,
  pago BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_gastos_user_id ON gastos(user_id);
CREATE INDEX IF NOT EXISTS idx_gastos_data ON gastos(data);
CREATE INDEX IF NOT EXISTS idx_gastos_categoria ON gastos(categoria);
CREATE INDEX IF NOT EXISTS idx_envelopes_user_id ON envelopes(user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_user_id ON pagamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data_vencimento ON pagamentos(data_vencimento);

-- Políticas de segurança (RLS)
-- Política para gastos
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
CREATE POLICY gastos_user_policy ON gastos
  USING (auth.uid() = user_id);

-- Política para envelopes
ALTER TABLE envelopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY envelopes_user_policy ON envelopes
  USING (auth.uid() = user_id);

-- Política para pagamentos
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY pagamentos_user_policy ON pagamentos
  USING (auth.uid() = user_id);

-- Função para cálculo de saldo em tempo real
CREATE OR REPLACE FUNCTION atualizar_saldo_envelope()
RETURNS TRIGGER AS $$
BEGIN
  -- Ao registrar um novo gasto, atualiza o saldo do envelope correspondente
  IF TG_OP = 'INSERT' THEN
    UPDATE envelopes
    SET saldo_atual = saldo_atual + NEW.valor,
        updated_at = now()
    WHERE user_id = NEW.user_id AND nome = NEW.categoria;
  
  -- Ao remover um gasto, também atualiza o saldo
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE envelopes
    SET saldo_atual = saldo_atual - OLD.valor,
        updated_at = now()
    WHERE user_id = OLD.user_id AND nome = OLD.categoria;
  
  -- Ao atualizar um gasto, ajusta a diferença no saldo
  ELSIF TG_OP = 'UPDATE' THEN
    -- Se a categoria mudou, precisa atualizar os dois envelopes
    IF OLD.categoria <> NEW.categoria THEN
      -- Reduz do envelope antigo
      UPDATE envelopes
      SET saldo_atual = saldo_atual - OLD.valor,
          updated_at = now()
      WHERE user_id = OLD.user_id AND nome = OLD.categoria;
      
      -- Aumenta no envelope novo
      UPDATE envelopes
      SET saldo_atual = saldo_atual + NEW.valor,
          updated_at = now()
      WHERE user_id = NEW.user_id AND nome = NEW.categoria;
    
    -- Se só o valor mudou, atualiza o envelope com a diferença
    ELSE
      UPDATE envelopes
      SET saldo_atual = saldo_atual - OLD.valor + NEW.valor,
          updated_at = now()
      WHERE user_id = NEW.user_id AND nome = NEW.categoria;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar os saldos automaticamente
CREATE TRIGGER trigger_atualizar_saldo_envelope
AFTER INSERT OR UPDATE OR DELETE ON gastos
FOR EACH ROW EXECUTE FUNCTION atualizar_saldo_envelope(); 