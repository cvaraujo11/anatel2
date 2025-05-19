# Plano de Micro-tarefas para Migração para Supabase e Desenvolvimento do MVP Sati

## Fase 1: Configuração Inicial do Ambiente Supabase

### 1.2 Instalação de Dependências
- [x] Instalar @supabase/supabase-js
- [x] Instalar @supabase/auth-ui-react (opcional para UI de autenticação)
- [x] Instalar @supabase/auth-helpers-nextjs

### 1.3 Configuração do Cliente Supabase
- [x] Criar arquivo lib/supabase.js para cliente do navegador
- [x] Implementar lib/supabase-server.js para server components
- [x] Configurar middleware.js para sessões e proteção de rotas

## Fase 2: Modelagem de Dados e Scripts SQL

### 2.1 Análise das Stores Existentes
- [ ] Mapear todas as stores do Zustand (alimentacaoStore, concursosStore, etc.)
- [ ] Identificar estruturas de dados e relacionamentos
- [ ] Documentar requisitos de persistência para cada store

### 2.2 Criação de Esquemas SQL
- [ ] Criar script para tabela `users_profiles` (dados básicos do usuário)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

- [ ] Criar script para tabela `user_preferences` (preferências visuais e configurações)
```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  theme TEXT DEFAULT 'light',
  alto_contraste BOOLEAN DEFAULT false,
  reducao_estimulos BOOLEAN DEFAULT false,
  texto_grande BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);
```

- [ ] Criar tabelas para cada domínio funcional:
  - [ ] `alimentacao` (refeições, hidratação)
  - [ ] `estudos` (registros, materiais)
  - [ ] `concursos` (dados de concursos, conteúdo programático)
  - [ ] `financas` (gastos, envelopes)
  - [ ] `hiperfocos` (projetos, tarefas)
  - [ ] `medicamentos` (registro, lembretes)
  - [ ] `sono` (registros, metas)
  - [ ] `autoconhecimento` (notas, reflexões)

### 2.3 Configuração de Políticas RLS (Row Level Security)
- [ ] Configurar políticas para isolamento de dados entre usuários
- [ ] Implementar políticas para cada tabela criada
```sql
-- Exemplo de política para perfil
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários acessam apenas seus perfis"
  ON profiles FOR ALL
  USING (auth.uid() = id);
```

## Fase 3: Implementação da Autenticação

### 3.1 Criação do Hook de Autenticação
- [ ] Implementar hook useAuth.js
- [ ] Configurar provider de autenticação
- [ ] Implementar funções de signIn, signUp e signOut

### 3.2 Integração na Aplicação
- [ ] Atualizar _app.js ou layout.js com AuthProvider
- [ ] Configurar redirecionamentos para páginas de autenticação
- [ ] Implementar páginas de login/cadastro

### 3.3 Proteção de Rotas
- [ ] Implementar middleware para verificação de sessão
- [ ] Configurar matcher para rotas protegidas
- [ ] Testar fluxo de autenticação completo

## Fase 4: Refatoração das Stores

### 4.1 Criação de Hooks de Sincronização com Supabase
- [ ] Implementar hook useRealtimeData para coleções
- [ ] Implementar hook useRealtimeItem para itens individuais
- [ ] Criar hook useHybridState para otimização de carregamento inicial

### 4.2 Refatoração por Domínio Funcional
- [ ] Migrar alimentacaoStore
- [ ] Migrar concursosStore
- [ ] Migrar financasStore
- [ ] Migrar hiperfocosStore
- [ ] Migrar sonoStore
- [ ] Migrar autoconhecimentoStore
- [ ] Migrar perfilStore
- [ ] Migrar demais stores restantes

### 4.3 Integração de Real-time Subscriptions
- [ ] Implementar listeners para atualizações em tempo real
- [ ] Configurar canais Supabase para cada entidade
- [ ] Testar sincronização entre múltiplas sessões/dispositivos

## Fase 5: Refatoração dos Componentes

### 5.1 Componentes de Perfil e Autenticação
- [ ] Refatorar componentes que usam dados de autenticação
- [ ] Implementar logout e gerenciamento de sessão
- [ ] Testar fluxos de autenticação na interface

### 5.2 Componentes de Dados
- [ ] Atualizar componentes que usam localStorage diretamente
- [ ] Substituir referências por hooks Supabase
- [ ] Implementar estados de carregamento/erro

### 5.3 Componentes de App Router e Server Components
- [ ] Otimizar componentes para usar Server Components onde possível
- [ ] Implementar padrão de separação client/server
- [ ] Testar carregamento e hidratação de dados

## Fase 6: Desenvolvimento do MVP Sati (Assistente RAG)

### 6.1 Configuração da API Maritaca
- [ ] Criar conta na plataforma Maritaca AI
- [ ] Obter chave de API
- [ ] Implementar cliente para comunicação com API Maritaca

### 6.2 Implementação do Backend RAG
- [ ] Criar estrutura de dados para contexto do usuário
- [ ] Implementar endpoint para processamento de consultas
- [ ] Configurar tabelas no Supabase para armazenar histórico de interações

### 6.3 Configuração do WhatsApp
- [ ] Criar conta Business no WhatsApp
- [ ] Configurar Webhook para recebimento de mensagens
- [ ] Implementar controlador para processar mensagens recebidas

### 6.4 Implementação do Fluxo RAG
- [ ] Desenvolver sistema de recuperação de dados do usuário
- [ ] Implementar lógica de contextualização para o LLM
- [ ] Criar mecanismo de geração de respostas personalizadas

### 6.5 Integração com Dados do StayFocus
- [ ] Criar consultas para extrair dados relevantes do usuário (envelopes, hiperfocos, etc.)
- [ ] Implementar mecanismo de formatação de contexto para o RAG
- [ ] Testar integração com dados reais

## Fase 7: Testes e Otimização

### 7.1 Implementação de Testes
- [ ] Configurar ambiente de testes com mocks do Supabase
- [ ] Implementar testes para autenticação
- [ ] Implementar testes para sincronização de dados
- [ ] Implementar testes para o assistente RAG

### 7.2 Otimização de Desempenho
- [ ] Implementar estratégias de cache
- [ ] Otimizar consultas Supabase
- [ ] Configurar ISR (Incremental Static Regeneration) onde apropriado

### 7.3 Validação de Segurança
- [ ] Revisar políticas RLS
- [ ] Testar isolamento de dados entre usuários
- [ ] Verificar exposição de endpoints

## Fase 8: Deployment e Finalização

### 8.1 Configuração do Ambiente de Produção
- [ ] Configurar variáveis de ambiente de produção
- [ ] Implementar pipeline CI/CD
- [ ] Testar build de produção

### 8.2 Migração de Dados
- [ ] Criar scripts para migração de dados do localStorage
- [ ] Testar processo de migração com dados reais
- [ ] Implementar sistema de backup automático

### 8.3 Lançamento
- [ ] Realizar testes finais end-to-end
- [ ] Documentar infraestrutura e processos
- [ ] Lançar versão MVP

## Acompanhamento e Monitoramento
- [ ] Configurar monitoramento de erros
- [ ] Implementar sistema de telemetria para uso
- [ ] Definir KPIs para avaliar desempenho e adoção
