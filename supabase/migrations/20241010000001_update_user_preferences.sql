-- Adicionar campo pomodoro_state à tabela user_preferences
ALTER TABLE user_preferences ADD COLUMN pomodoro_state JSONB DEFAULT NULL;

-- Garantir que o trigger updated_at está configurado
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verificar se o trigger já existe e criar apenas se não existir
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_user_preferences_updated_at') THEN
    CREATE TRIGGER set_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$; 