# Documentação da Página: Autoconhecimento ([`app/autoconhecimento/page.tsx`](app/autoconhecimento/page.tsx:1))

## Propósito Geral da Página

A página de Autoconhecimento serve como um diário digital estruturado, permitindo ao usuário registrar, organizar e refletir sobre diferentes aspectos de sua personalidade, motivações e padrões de comportamento. O objetivo é facilitar o autoconhecimento através da documentação e revisão de notas pessoais em seções temáticas. A página também oferece um "Modo Refúgio" para uma experiência de escrita focada e com menos distrações.

## Principais Funcionalidades

*   **Navegação por Abas Temáticas:** O usuário pode alternar entre três seções principais para organizar suas notas:
    *   "Quem sou"
    *   "Meus porquês"
    *   "Meus padrões"
*   **Criação e Edição de Notas:** Permite criar novas notas ou editar notas existentes dentro da seção selecionada.
*   **Listagem de Notas:** Exibe uma lista das notas previamente salvas para a aba ativa, permitindo fácil acesso e seleção.
*   **Modo Refúgio:** Uma funcionalidade que simplifica a interface, possivelmente ocultando elementos visuais secundários para promover foco durante a escrita ou leitura.
*   **Gerenciamento de Estado de Edição:** Controla se o usuário está criando uma nova nota, editando uma existente ou visualizando a lista de notas.

## Componentes Visuais Chave e Sua Função

*   **Abas de Navegação (Dinâmicas):**
    *   Localização: Topo da página, abaixo do título principal ([`app/autoconhecimento/page.tsx:70-89`](app/autoconhecimento/page.tsx:70)).
    *   Função: Permitem ao usuário selecionar qual categoria de notas de autoconhecimento deseja visualizar ou editar ("Quem sou", "Meus porquês", "Meus padrões").
*   **[`ListaNotas`](app/components/autoconhecimento/ListaNotas.tsx:6) ([`app/components/autoconhecimento/ListaNotas.tsx`](app/components/autoconhecimento/ListaNotas.tsx:1)):**
    *   Localização: Na coluna da esquerda (em telas maiores) quando nenhuma nota está selecionada para edição ou criação ([`app/autoconhecimento/page.tsx:124-127`](app/autoconhecimento/page.tsx:124)).
    *   Função: Exibe os títulos ou resumos das notas existentes para a aba selecionada. Clicar em uma nota da lista a seleciona para visualização/edição no [`EditorNotas`](app/components/autoconhecimento/EditorNotas.tsx:5).
*   **[`EditorNotas`](app/components/autoconhecimento/EditorNotas.tsx:5) ([`app/components/autoconhecimento/EditorNotas.tsx`](app/components/autoconhecimento/EditorNotas.tsx:1)):**
    *   Localização: Ocupa a área principal (ou coluna da direita em telas maiores) quando uma nota está sendo criada ou editada ([`app/autoconhecimento/page.tsx:148-152`](app/autoconhecimento/page.tsx:148)).
    *   Função: Provê uma interface rica (provavelmente um editor de texto) para o usuário escrever e formatar o conteúdo de suas notas. Salva as alterações ou a nova nota.
*   **[`ModoRefugio`](app/components/autoconhecimento/ModoRefugio.tsx:7) ([`app/components/autoconhecimento/ModoRefugio.tsx`](app/components/autoconhecimento/ModoRefugio.tsx:1)):**
    *   Localização: Renderizado no final do container da página, possivelmente como um botão flutuante ou um toggle ([`app/autoconhecimento/page.tsx:159`](app/autoconhecimento/page.tsx:159)).
    *   Função: Ativa ou desativa o "Modo Refúgio". Quando ativo, a interface é simplificada (e.g., descrições de seção e o botão "Nova nota" podem ser ocultados).
*   **[`Button`](app/components/ui/Button.tsx:8) ([`app/components/ui/Button.tsx`](app/components/ui/Button.tsx:1)):**
    *   Função: Utilizado para diversas ações:
        *   "Nova nota": Inicia o processo de criação de uma nova nota ([`app/autoconhecimento/page.tsx:113-120`](app/autoconhecimento/page.tsx:113)).
        *   "Cancelar": Descarta a criação ou edição de uma nota, retornando à visualização da lista ([`app/autoconhecimento/page.tsx:138-145`](app/autoconhecimento/page.tsx:138)).
*   **[`Container`](app/components/ui/Container.tsx:9) ([`app/components/ui/Container.tsx`](app/components/ui/Container.tsx:1)):**
    *   Função: Componente de layout que envolve todo o conteúdo da página, garantindo consistência visual e espaçamento.
*   **[`Section`](app/components/ui/Section.tsx:10) ([`app/components/ui/Section.tsx`](app/components/ui/Section.tsx:1)):**
    *   Função: Agrupa o conteúdo principal relacionado à aba selecionada, contendo a [`ListaNotas`](app/components/autoconhecimento/ListaNotas.tsx:6) e/ou o [`EditorNotas`](app/components/autoconhecimento/EditorNotas.tsx:5) ([`app/autoconhecimento/page.tsx:100-156`](app/autoconhecimento/page.tsx:100)).

## Conteúdo Textual Estático Proeminente

*   **Título Principal da Página:** "Notas de Autoconhecimento" ([`app/autoconhecimento/page.tsx:66`](app/autoconhecimento/page.tsx:66)).
*   **Títulos das Abas/Seções (visíveis nas abas e como cabeçalhos de seção):**
    *   "Quem sou" ([`app/autoconhecimento/page.tsx:22`](app/autoconhecimento/page.tsx:22))
    *   "Meus porquês" ([`app/autoconhecimento/page.tsx:23`](app/autoconhecimento/page.tsx:23))
    *   "Meus padrões" ([`app/autoconhecimento/page.tsx:24`](app/autoconhecimento/page.tsx:24))
*   **Descrições das Seções (exibidas abaixo das abas quando nenhuma nota está sendo editada e o Modo Refúgio está desativado):**
    *   Para "Quem sou": "Registre suas preferências, aversões e características pessoais estáveis" ([`app/autoconhecimento/page.tsx:29`](app/autoconhecimento/page.tsx:29)).
    *   Para "Meus porquês": "Documente motivações e valores fundamentais que guiam suas decisões" ([`app/autoconhecimento/page.tsx:30`](app/autoconhecimento/page.tsx:30)).
    *   Para "Meus padrões": "Anote reações emocionais típicas e estratégias eficazes em momentos de crise" ([`app/autoconhecimento/page.tsx:31`](app/autoconhecimento/page.tsx:31)).
*   **Cabeçalhos Dinâmicos:**
    *   "Suas notas em [Nome da Aba]" (e.g., "Suas notas em Quem sou") ([`app/autoconhecimento/page.tsx:109`](app/autoconhecimento/page.tsx:109)).
    *   "Nova nota" ou "Editar nota", dependendo da ação do usuário ([`app/autoconhecimento/page.tsx:135`](app/autoconhecimento/page.tsx:135)).

## Interações com Stores de Estado (Zustand)

*   A página interage com a store `useAutoconhecimentoStore` (importada de [`app/stores/autoconhecimentoStore.ts`](app/stores/autoconhecimentoStore.ts:11)).
*   **Estado Utilizado:** `modoRefugio` ([`app/autoconhecimento/page.tsx:18`](app/autoconhecimento/page.tsx:18)).
*   **Propósito da Interação:** O estado `modoRefugio` é lido da store para determinar se a interface da página deve ser simplificada. Se `modoRefugio` for `true`, certos elementos da interface, como as descrições das seções ([`app/autoconhecimento/page.tsx:92`](app/autoconhecimento/page.tsx:92)) e o botão para criar uma nova nota ([`app/autoconhecimento/page.tsx:112`](app/autoconhecimento/page.tsx:112)), são ocultados para minimizar distrações. O componente [`ModoRefugio`](app/components/autoconhecimento/ModoRefugio.tsx:7) é responsável por permitir ao usuário alterar este estado na store.