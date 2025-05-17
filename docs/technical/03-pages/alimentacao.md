# Documentação da Página: Alimentação ([`app/alimentacao/page.tsx`](app/alimentacao/page.tsx:1))

## Propósito Geral da Página

A página de Alimentação ([`app/alimentacao/page.tsx`](app/alimentacao/page.tsx:1)) centraliza as funcionalidades relacionadas ao gerenciamento da dieta e hidratação do usuário. Ela permite o planejamento de refeições, o registro do que foi consumido e o acompanhamento da ingestão de água.

## Principais Funcionalidades

*   **Planejamento de Refeições:** Os usuários podem definir horários e descrições para suas refeições diárias (ex: café da manhã, almoço, jantar).
*   **Registro de Refeições Consumidas:** Permite que o usuário registre as refeições que efetivamente consumiu, incluindo horário, descrição, um ícone representativo do tipo de alimento e, opcionalmente, uma foto da refeição.
*   **Acompanhamento de Hidratação:** Os usuários podem registrar a quantidade de copos de água bebidos, ajustar uma meta diária de consumo e visualizar seu progresso.
*   **Acesso à Seção de Receitas:** Fornece um atalho para a seção "Minhas Receitas", onde o usuário pode organizar suas receitas favoritas.

## Componentes Visuais Chave e Sua Função

A página é estruturada utilizando o componente [`Card`](app/components/ui/Card.tsx:1) para agrupar funcionalidades relacionadas:

1.  **`PlanejadorRefeicoes` ([`app/components/alimentacao/PlanejadorRefeicoes.tsx`](app/components/alimentacao/PlanejadorRefeicoes.tsx:13))**
    *   **Localização:** Dentro de um [`Card`](app/components/ui/Card.tsx:1) com o título "Planejador de Refeições".
    *   **Função:** Exibe uma lista de refeições planejadas (horário e descrição). Permite ao usuário adicionar novas refeições, editar refeições existentes (alterando horário e/ou descrição) e remover refeições do planejamento.

2.  **`RegistroRefeicoes` ([`app/components/alimentacao/RegistroRefeicoes.tsx`](app/components/alimentacao/RegistroRefeicoes.tsx:18))**
    *   **Localização:** Dentro de um [`Card`](app/components/ui/Card.tsx:1) com o título "Registro de Refeições".
    *   **Função:** Mostra os registros de refeições já feitos pelo usuário. Permite adicionar um novo registro, especificando horário, descrição, um ícone visual para o tipo de refeição (ex: ☕ para café, 🍎 para fruta) e a opção de anexar uma foto (simulada). Os registros existentes podem ser removidos.

3.  **`LembreteHidratacao` ([`app/components/alimentacao/LembreteHidratacao.tsx`](app/components/alimentacao/LembreteHidratacao.tsx:6))**
    *   **Localização:** Dentro de um [`Card`](app/components/ui/Card.tsx:1) com o título "Hidratação".
    *   **Função:** Apresenta o acompanhamento do consumo de água. Exibe a quantidade de copos bebidos em relação a uma meta diária ajustável. O usuário pode registrar ou remover copos de água bebidos. Mostra o progresso visualmente através de uma barra e ícones de gotas. Também exibe o horário do último copo registrado e dicas de hidratação.

4.  **Card "Minhas Receitas"**
    *   **Localização:** É um [`Card`](app/components/ui/Card.tsx:1) com o título "Minhas Receitas".
    *   **Função:** Contém um texto introdutório que incentiva o usuário a organizar e acessar suas receitas. Possui um botão ([`Button`](app/components/ui/Button.tsx:1) estilizado dentro de um componente [`Link`](app/alimentacao/page.tsx:7) do Next.js) "Acessar Minhas Receitas" que redireciona o usuário para a página [`/receitas`](app/receitas/page.tsx:1).

## Conteúdo Textual Estático Proeminente

*   **Título Principal da Página:** "Alimentação" (tag `<h1>`).
*   **Títulos dos Cards:**
    *   "Planejador de Refeições"
    *   "Registro de Refeições"
    *   "Hidratação"
    *   "Minhas Receitas"
*   **Texto Introdutório no Card "Minhas Receitas":** "Organize e acesse suas receitas favoritas aqui. Crie listas de compras e planeje suas refeições."

## Interações com Stores de Estado (Zustand)

A página [`app/alimentacao/page.tsx`](app/alimentacao/page.tsx:1), através de seus componentes filhos, interage intensamente com a store [`useAlimentacaoStore`](app/stores/alimentacaoStore.ts:41) (localizada em [`app/stores/alimentacaoStore.ts`](app/stores/alimentacaoStore.ts:1)).

*   **Store Utilizada:** [`useAlimentacaoStore`](app/stores/alimentacaoStore.ts:41)
*   **Propósito da Interação:**
    *   O componente [`PlanejadorRefeicoes`](app/components/alimentacao/PlanejadorRefeicoes.tsx:13) utiliza a store para:
        *   Ler a lista de `refeicoes` planejadas.
        *   Chamar `adicionarRefeicao` para criar novas refeições.
        *   Chamar `atualizarRefeicao` para modificar refeições existentes.
        *   Chamar `removerRefeicao` para excluir refeições.
    *   O componente [`RegistroRefeicoes`](app/components/alimentacao/RegistroRefeicoes.tsx:18) utiliza a store para:
        *   Ler a lista de `registros` de refeições consumidas.
        *   Chamar `adicionarRegistro` para salvar um novo registro de refeição.
        *   Chamar `removerRegistro` para excluir um registro.
    *   O componente [`LembreteHidratacao`](app/components/alimentacao/LembreteHidratacao.tsx:6) utiliza a store para:
        *   Ler o estado de `coposBebidos`, `metaDiaria` e `ultimoRegistro` de hidratação.
        *   Chamar `adicionarCopo` para incrementar o número de copos bebidos.
        *   Chamar `removerCopo` para decrementar o número de copos bebidos.
        *   Chamar `ajustarMeta` para modificar a meta diária de copos de água.

A store [`useAlimentacaoStore`](app/stores/alimentacaoStore.ts:41) também utiliza o middleware `persist` do Zustand para salvar o estado relacionado à alimentação no `localStorage` do navegador sob a chave `alimentacao-storage`, garantindo que os dados do usuário persistam entre as sessões.