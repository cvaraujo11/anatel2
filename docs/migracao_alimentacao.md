# Migração da Página de Alimentação para Supabase

## Estrutura de Dados Criada

De acordo com as especificações, foram criadas as seguintes tabelas no Supabase:

```sql
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
```

Foram configuradas políticas de RLS (Row Level Security) para garantir que cada usuário só acesse seus próprios dados.

## Hooks Implementados

Foram criados os seguintes hooks customizados:

1. **useRealtimeData** (lib/hooks/useRealtimeData.js)
   - Hook genérico para sincronização em tempo real com o Supabase
   - Implementa funcionalidades CRUD com isolamento por usuário
   - Suporta subscriptions para atualizações em tempo real

2. **useHidratacao** (lib/hooks/useHidratacao.js)
   - Hook específico para gerenciar os dados de hidratação
   - Implementa funções para adicionar/remover copos e ajustar meta diária
   - Sincroniza alterações em tempo real entre dispositivos

3. **useRefeicoes** (lib/hooks/useRefeicoes.js)
   - Hook para gerenciar refeições planejadas e registros de refeições realizadas
   - Separa dados por tipo (planejada/realizada) para facilitar o uso nos componentes
   - Inicializa refeições padrão para novos usuários

## Componentes Atualizados

1. **LembreteHidratacao.tsx**
   - Migrado do useAlimentacaoStore para o hook useHidratacao
   - Adicionado estado de loading enquanto os dados são carregados
   - Interface atualizada para melhor responsividade

2. **PlanejadorRefeicoes.tsx**
   - Migrado para usar o hook useRefeicoes
   - Interface atualizada para melhor experiência de usuário
   - Adicionada ordenação de refeições por horário

3. **RegistroRefeicoes.tsx**
   - Atualizado para usar o hook useRefeicoes
   - Melhorada a experiência de registro de refeições
   - Adicionada ordem cronológica (mais recentes primeiro)

## Migração de Dados Existentes

Foi criada uma função de migração (lib/migracao/migrarAlimentacao.js) que:

1. Lê os dados existentes do localStorage
2. Converte os dados para o formato do Supabase
3. Insere os dados nas tabelas apropriadas
4. Mantém a referência ao usuário autenticado

## Próximos Passos

1. **Integração com Autenticação**
   - Garantir que a migração de dados seja executada após o login do usuário
   - Implementar fluxo para detectar primeiro login vs. uso contínuo

2. **Testes**
   - Verificar o comportamento em diferentes dispositivos
   - Confirmar a sincronização em tempo real entre sessões

3. **Otimizações**
   - Implementar estratégias de cache para reduzir consultas frequentes
   - Considerar paginação para históricos extensos de refeições

## Conclusão

A migração da página de alimentação para o Supabase foi concluída com sucesso, implementando todas as especificações solicitadas. A nova implementação permite sincronização em tempo real entre dispositivos, isolamento de dados por usuário e persistência dos dados no servidor, representando uma evolução significativa em relação à implementação baseada em localStorage. 