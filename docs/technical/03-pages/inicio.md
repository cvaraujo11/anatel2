# Documentação da Página Inicial ([`app/page.tsx`](app/page.tsx:1))

## Propósito Geral da Página

A página inicial ([`app/page.tsx`](app/page.tsx:1)) serve como um painel de controle central para o usuário, fornecendo uma visão geral de suas atividades, prioridades, compromissos e configurações relevantes para o dia. Seu objetivo é oferecer acesso rápido às informações e funcionalidades mais importantes do aplicativo.

## Principais Funcionalidades

*   **Visualização do Painel do Dia:** Exibe os blocos de tempo e atividades planejadas para o dia.
*   **Gerenciamento de Prioridades:** Mostra a lista de tarefas prioritárias para o dia e permite o acompanhamento do status (pendentes/concluídas).
*   **Checklist de Medicamentos:** Apresenta um checklist para o usuário marcar os medicamentos que já tomou.
*   **Lembretes de Pausas:** Caso ativado nas configurações, exibe lembretes para pausas.
*   **Visualização da Próxima Prova:** Mostra informações sobre a próxima prova agendada.
*   **Resumo Rápido:** Apresenta um sumário com o número de prioridades pendentes, prioridades concluídas e próximos compromissos.
*   **Acesso Rápido:** Fornece links diretos para seções importantes do aplicativo como Estudos, Saúde, Hiperfocos e Lazer.
*   **Preferências de Acessibilidade:** Permite ao usuário ajustar preferências visuais como texto grande, alto contraste e redução de estímulos através do botão de preferências.

## Componentes Visuais Chave e Sua Função

A página utiliza diversos componentes, principalmente das pastas [`app/components/ui/`](app/components/ui/) para elementos de interface genéricos e [`app/components/inicio/`](app/components/inicio/) para componentes específicos da página inicial.

*   **Componentes de UI (de [`app/components/ui/`](app/components/ui/)):**
    *   [`DashboardCard`](app/components/ui/DashboardCard.tsx:6): Contêiner padrão para seções do dashboard, com título e opção de estado de carregamento. Usado para envolver o `PainelDia`, `ListaPrioridades`, etc.
    *   [`DashboardSection`](app/components/ui/DashboardSection.tsx:7): Define uma seção dentro do dashboard, agrupando cartões ou outros elementos.
    *   [`DashboardHeader`](app/components/ui/DashboardHeader.tsx:8): Cabeçalho da página do dashboard, exibindo título, nome do usuário, descrição e ações (como o botão de preferências).
    *   [`DashboardSummary`](app/components/ui/DashboardSummary.tsx:9): Exibe um resumo de estatísticas chave (prioridades pendentes/concluídas, próximos compromissos).
    *   [`SuspenseWrapper`](app/components/ui/SuspenseWrapper.tsx:10): Envolve componentes que podem ter carregamento assíncrono, exibindo um placeholder enquanto o conteúdo não está pronto.
    *   [`PreferencesButton`](app/components/ui/PreferencesButton.tsx:11): Botão que provavelmente abre um modal ou menu para o usuário configurar suas preferências visuais.
    *   [`Button`](app/components/ui/Button.tsx:12): Componente de botão genérico.
    *   [`cn`](app/lib/utils.ts:19): Utilitário para concatenar classes CSS condicionalmente (usado com `buttonVariants`).

*   **Componentes da Página Inicial (de [`app/components/inicio/`](app/components/inicio/)):**
    *   [`PainelDia`](app/components/inicio/PainelDia.tsx:13): Exibe uma visualização dos blocos de tempo e atividades agendadas para o dia corrente.
    *   [`ListaPrioridades`](app/components/inicio/ListaPrioridades.tsx:14): Mostra a lista de tarefas definidas como prioritárias para o dia.
    *   [`LembretePausas`](app/components/inicio/LembretePausas.tsx:15): Apresenta um lembrete visual para o usuário fazer pausas, provavelmente baseado nas configurações de metas de pausas.
    *   [`ChecklistMedicamentos`](app/components/inicio/ChecklistMedicamentos.tsx:16): Permite ao usuário marcar os medicamentos que já foram administrados no dia.
    *   [`ProximaProvaCard`](app/components/inicio/ProximaProvaCard.tsx:17): Exibe informações sobre a próxima prova ou avaliação importante agendada.

## Conteúdo Textual Estático Proeminente

*   **Título Principal (via [`DashboardHeader`](app/components/ui/DashboardHeader.tsx:89)):** "Início"
*   **Descrição (via [`DashboardHeader`](app/components/ui/DashboardHeader.tsx:92)):** "Aqui está seu progresso e tarefas para hoje."
*   **Títulos de Seção (via [`DashboardCard`](app/components/ui/DashboardCard.tsx:6) e [`DashboardSection`](app/components/ui/DashboardSection.tsx:7)):**
    *   "Painel do Dia"
    *   "Prioridades do Dia"
    *   "Acesso Rápido"
*   **Links de Acesso Rápido:**
    *   "Estudos" (com subtítulo "Materiais e Técnicas")
    *   "Saúde" (com subtítulo "Medicamentos e Bem-estar")
    *   "Hiperfocos" (com subtítulo "Projetos e Interesses")
    *   "Lazer" (com subtítulo "Atividades e Descanso")

## Interações com Stores de Estado (Zustand)

A página [`app/page.tsx`](app/page.tsx:1) obtém a maior parte de seus dados dinâmicos através do hook personalizado [`useDashboard`](app/hooks/useDashboard.ts:18). Este hook, por sua vez, interage com as seguintes stores Zustand localizadas em [`app/stores/`](app/stores/):

*   **[`usePainelDiaStore`](app/stores/painelDiaStore.ts:4) (via [`app/hooks/useDashboard.ts:50`](app/hooks/useDashboard.ts:50)):**
    *   Utilizada para buscar os `blocos` de tempo agendados para o dia, que são exibidos no componente [`PainelDia`](app/components/inicio/PainelDia.tsx:13).
*   **[`usePrioridadesStore`](app/stores/prioridadesStore.ts:5) (via [`app/hooks/useDashboard.ts:51`](app/hooks/useDashboard.ts:51)):**
    *   Utilizada para buscar as `prioridades` do dia através da função `getHistoricoPorData`. Essas prioridades são exibidas no componente [`ListaPrioridades`](app/components/inicio/ListaPrioridades.tsx:14) e usadas para calcular as estatísticas de prioridades pendentes e concluídas no [`DashboardSummary`](app/components/ui/DashboardSummary.tsx:9).
*   **[`usePerfilStore`](app/stores/perfilStore.ts:6) (via [`app/hooks/useDashboard.ts:52`](app/hooks/useDashboard.ts:52)):**
    *   Utilizada para obter:
        *   `nome`: Nome do usuário, exibido no [`DashboardHeader`](app/components/ui/DashboardHeader.tsx:91).
        *   `metasDiarias`: Contém informações sobre `pausasProgramadas` e `tarefasPrioritarias`, usadas para configurar o comportamento do [`LembretePausas`](app/components/inicio/LembretePausas.tsx:15) e potencialmente para a lógica de exibição de prioridades.
        *   `pausasAtivas`: Um booleano que determina se os lembretes de pausa devem ser mostrados ([`LembretePausas`](app/components/inicio/LembretePausas.tsx:144)).
        *   `preferenciasVisuais`: Objeto contendo as configurações de acessibilidade (`altoContraste`, `reducaoEstimulos`, `textoGrande`) que são aplicadas dinamicamente ao `document.documentElement` no [`useEffect`](app/page.tsx:62) da página para alterar a aparência global da interface.

Os componentes [`ChecklistMedicamentos`](app/components/inicio/ChecklistMedicamentos.tsx:16) e [`ProximaProvaCard`](app/components/inicio/ProximaProvaCard.tsx:17) provavelmente interagem com suas próprias stores ou com stores mais específicas (ex: `useSaudeStore`, `useConcursosStore`), embora a interação direta não seja visível no código de [`app/page.tsx`](app/page.tsx:1) ou [`app/hooks/useDashboard.ts`](app/hooks/useDashboard.ts:1) e sim encapsulada dentro desses próprios componentes.