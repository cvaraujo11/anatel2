
# Plano de Micro-tarefas para Migração de Cada Página para Supabase

## 1. Dashboard (app/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabelas para armazenar dados do dashboard
  - [ ] Implementar políticas RLS para isolamento de dados

- [ ] **Migração do Estado**
  - [ ] Refatorar `useDashboard` hook para buscar dados do Supabase
  - [ ] Implementar carregamento inicial via Server Components
  - [ ] Configurar função para sincronização de preferências visuais

- [ ] **Implementação de Real-time**
  - [ ] Configurar listeners para atualizações de prioridades
  - [ ] Implementar `useHybridState` para otimização de carregamento

## 2. Alimentação (app/alimentacao/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `refeicoes`
  - [ ] Criar tabela `hidratacao`
  - [ ] Configurar políticas RLS para essas tabelas

- [ ] **Migração do Estado**
  - [ ] Refatorar `alimentacaoStore.ts` para usar Supabase
  - [ ] Implementar hooks para gerenciamento de refeições e hidratação
  - [ ] Migrar dados existentes no localStorage para novas tabelas

- [ ] **Implementação de Componentes**
  - [ ] Refatorar `PlanejadorRefeicoes` para sincronização em tempo real
  - [ ] Atualizar `RegistroRefeicoes` para usar dados do Supabase
  - [ ] Adaptar `LembreteHidratacao` para persistência entre dispositivos

## 3. Autoconhecimento (app/autoconhecimento/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `notas_autoconhecimento` com campo `categoria`
  - [ ] Implementar política RLS com filtro por categoria e user_id

- [ ] **Migração do Estado**
  - [ ] Refatorar `autoconhecimentoStore` para usar Supabase
  - [ ] Migrar `modoRefugio` para tabela de preferências do usuário
  - [ ] Implementar hook para consulta e filtragem de notas por categoria

- [ ] **Implementação de Componentes**
  - [ ] Adaptar sistema de abas para manter estado entre sessões
  - [ ] Refatorar `EditorNotas` para salvar em tempo real
  - [ ] Implementar sincronização bidirecional para `ListaNotas`

## 4. Concursos (app/concursos/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `concursos`
  - [ ] Criar tabela `conteudo_programatico`
  - [ ] Configurar relações e políticas RLS

- [ ] **Migração do Estado**
  - [ ] Refatorar `concursosStore.ts` para usar Supabase
  - [ ] Implementar function para cálculo de progresso
  - [ ] Criar hook para gestão de concursos

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `ConcursoForm` para salvar diretamente no Supabase
  - [ ] Refatorar importação JSON para usar API Supabase
  - [ ] Implementar visualização em tempo real de progresso de estudos

## 5. Estudos Materiais (app/estudos/materiais/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `materiais_drive` para referências ao Google Drive
  - [ ] Configurar políticas RLS para dados de materiais

- [ ] **Migração da API**
  - [ ] Refatorar endpoint `/api/drive/listar-materiais` para usar Supabase
  - [ ] Implementar cache de consultas frequentes ao Drive
  - [ ] Criar opção para storage direto no Supabase

- [ ] **Implementação de Componentes**
  - [ ] Adaptar seleção de tipo de material para usar preferences
  - [ ] Refatorar modais de visualização para armazenar estado de uso
  - [ ] Implementar histórico de materiais acessados recentemente

## 6. Estudos (app/estudos/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `sessoes_estudo`
  - [ ] Configurar relacionamento com concursos
  - [ ] Implementar políticas RLS para isolamento

- [ ] **Migração do Estado**
  - [ ] Refatorar registro de estudos para usar Supabase
  - [ ] Implementar sincronização do Pomodoro entre dispositivos
  - [ ] Criar hooks para consulta do próximo concurso

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `TemporizadorPomodoro` para persistência
  - [ ] Refatorar `RegistroEstudos` para salvar em tempo real
  - [ ] Implementar carregamento otimizado de materiais recentes

## 7. Simulado (app/estudos/simulado/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `simulados`
  - [ ] Criar tabela `questoes_simulado`
  - [ ] Configurar relacionamentos e políticas

- [ ] **Migração do Estado**
  - [ ] Refatorar `simuladoStore.ts` para usar Supabase
  - [ ] Implementar states (idle, loading, reviewing, results)
  - [ ] Criar funções para cálculo de resultados

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `SimuladoLoader` para carregar do Supabase
  - [ ] Refatorar `SimuladoReview` para salvar respostas em tempo real
  - [ ] Implementar sincronização do histórico de simulados

## 8. Simulado Personalizado (app/estudos/simulado-personalizado/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Alterar tabela `simulados` para incluir campo `personalizado`
  - [ ] Configurar consultas específicas para simulados personalizados

- [ ] **Migração do Estado**
  - [ ] Criar função para migrar dados de `simulado_personalizado_questoes`
  - [ ] Implementar carregamento de simulados personalizados do Supabase
  - [ ] Adaptar transformação de dados para o formato esperado

- [ ] **Implementação de Componentes**
  - [ ] Refatorar lógica de carregamento para usar Supabase
  - [ ] Implementar persistência entre dispositivos

## 9. Finanças (app/financas/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `gastos`
  - [ ] Criar tabela `envelopes`
  - [ ] Criar tabela `pagamentos`
  - [ ] Implementar triggers para cálculo de saldo

- [ ] **Migração do Estado**
  - [ ] Refatorar `financasStore.ts` para usar Supabase
  - [ ] Implementar funções para cálculos financeiros
  - [ ] Criar hooks para consultas por período

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `RastreadorGastos` para usar dados do Supabase (manter carregamento dinâmico)
  - [ ] Refatorar `EnvelopesVirtuais` para persistência e sincronização
  - [ ] Implementar `CalendarioPagamentos` com sincronização em tempo real

## 10. Hiperfocos (app/hiperfocos/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `hiperfoco_projetos`
  - [ ] Criar tabela `hiperfoco_tarefas`
  - [ ] Configurar relacionamentos e políticas RLS

- [ ] **Migração do Estado**
  - [ ] Refatorar `hiperfocosStore.ts` para usar Supabase
  - [ ] Implementar funções para cálculo de progresso
  - [ ] Criar hooks para consulta de projetos e tarefas

- [ ] **Implementação de Componentes**
  - [ ] Adaptar navegação por abas para persistência
  - [ ] Refatorar resumo de projetos para usar dados em tempo real
  - [ ] Implementar atualização automática de cores de projetos

## 11. Lazer (app/lazer/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `atividades_lazer`
  - [ ] Criar tabela `sugestoes_descanso`
  - [ ] Configurar políticas RLS

- [ ] **Migração do Estado**
  - [ ] Refatorar armazenamento de atividades para usar Supabase
  - [ ] Implementar persistência do temporizador
  - [ ] Criar hooks para consulta de sugestões

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `TemporizadorLazer` para sincronização
  - [ ] Refatorar `AtividadesLazer` para gestão em tempo real
  - [ ] Implementar funcionalidade de favoritos para sugestões

## 12. Perfil Ajuda (app/perfil/ajuda/page.tsx)

- [ ] **Atualização de Conteúdo**
  - [ ] Atualizar documentação de importação/exportação para Supabase
  - [ ] Modificar instruções de backup para incluir dados do servidor
  - [ ] Adicionar explicações sobre sincronização entre dispositivos

## 13. Perfil (app/perfil/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `user_preferences` com campos para preferências visuais
  - [ ] Configurar política RLS para acesso exclusivo

- [ ] **Migração do Estado**
  - [ ] Refatorar `perfilStore.ts` para usar Supabase
  - [ ] Implementar hook para gerenciamento de tema
  - [ ] Adaptar função de reset para chamada à API

- [ ] **Implementação de Componentes**
  - [ ] Refatorar `InformacoesPessoais` para salvar em tempo real
  - [ ] Adaptar `PreferenciasVisuais` para persistência entre dispositivos
  - [ ] Implementar `ExportarImportarDados` para funcionar com Supabase

## 14. Receitas Adicionar (app/receitas/adicionar/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `receitas` com campos para ingredientes em JSONB
  - [ ] Configurar política RLS para acesso às receitas

- [ ] **Migração do Estado**
  - [ ] Refatorar formulário para salvar diretamente no Supabase
  - [ ] Implementar validação em tempo real

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `AdicionarReceitaForm` para usar hooks do Supabase
  - [ ] Implementar feedback de salvamento em tempo real

## 15. Receitas Lista de Compras (app/receitas/lista-compras/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `lista_compras`
  - [ ] Configurar relacionamento com receitas
  - [ ] Implementar políticas RLS

- [ ] **Migração do Estado**
  - [ ] Refatorar gerenciamento da lista para usar Supabase
  - [ ] Implementar função para geração automática a partir de receitas
  - [ ] Criar hooks para consulta e atualização

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `ListaCompras` para sincronização em tempo real
  - [ ] Implementar marcação de itens com atualização instantânea

## 16. Receitas (app/receitas/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar índices para busca textual em receitas
  - [ ] Configurar política RLS para acesso às receitas

- [ ] **Migração do Estado**
  - [ ] Refatorar `receitasStore.ts` para usar Supabase
  - [ ] Implementar busca otimizada usando SQL
  - [ ] Criar hooks para filtragem e categorização

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `FiltroCategorias` para usar categorias dinâmicas
  - [ ] Refatorar `Pesquisa` para consultas SQL otimizadas
  - [ ] Implementar `ListaReceitas` com carregamento paginado

## 17. Roadmap (app/roadmap/page.tsx)

- [ ] **Atualização de Conteúdo**
  - [ ] Atualizar informações para incluir migração para Supabase
  - [ ] Adicionar detalhes sobre sincronização
  - [ ] Manter como página estática

## 18. Saúde (app/saude/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `medicamentos`
  - [ ] Criar tabela `registros_medicamentos`
  - [ ] Criar tabela `registros_humor`
  - [ ] Configurar políticas RLS

- [ ] **Migração do Estado**
  - [ ] Refatorar gerenciamento de medicamentos para usar Supabase
  - [ ] Implementar registro de humor com persistência
  - [ ] Criar hooks para consultas por período

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `RegistroMedicamentos` para sincronização
  - [ ] Refatorar `MonitoramentoHumor` para visualização em tempo real
  - [ ] Implementar notificações para medicamentos

## 19. Sono (app/sono/page.tsx)

- [ ] **Estrutura de Dados**
  - [ ] Criar tabela `registros_sono`
  - [ ] Criar tabela `lembretes_sono`
  - [ ] Configurar políticas RLS

- [ ] **Migração do Estado**
  - [ ] Refatorar `sonoStore.ts` para usar Supabase
  - [ ] Implementar navegação por abas com persistência
  - [ ] Criar hooks para análise de padrões de sono

- [ ] **Implementação de Componentes**
  - [ ] Adaptar `RegistroSono` para salvar em tempo real
  - [ ] Refatorar `VisualizadorSemanal` para usar dados do Supabase
  - [ ] Implementar `ConfiguracaoLembretes` com sincronização

## Tarefas Finais de Integração

- [ ] **Implementar Autenticação Completa**
  - [ ] Criar páginas de login/registro
  - [ ] Configurar redirecionamentos e proteção de rotas
  - [ ] Implementar recuperação de senha

- [ ] **Migração de Dados Existentes**
  - [ ] Desenvolver script para migração de localStorage para Supabase
  - [ ] Testar migração com dados reais
  - [ ] Implementar verificação de integridade

- [ ] **Implementar Sincronização Offline-Online**
  - [ ] Configurar estratégia de cache para funcionamento offline
  - [ ] Implementar resolução de conflitos
  - [ ] Testar sincronização entre múltiplos dispositivos
