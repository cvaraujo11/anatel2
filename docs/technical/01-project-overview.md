# Resumo da Análise do Projeto Anatel2

## Estrutura Geral de Diretórios

O projeto utiliza a estrutura do App Router do Next.js. As principais pastas identificadas são:

*   **`app/`**: Contém a lógica central da aplicação, incluindo:
    *   Páginas (rotas) da aplicação (ex: [`app/page.tsx`](app/page.tsx:1), [`app/alimentacao/page.tsx`](app/alimentacao/page.tsx:1)).
    *   Layouts globais e específicos (ex: [`app/layout.tsx`](app/layout.tsx:1)).
    *   **`app/components/`**: Abriga os componentes React reutilizáveis, frequentemente organizados por funcionalidade (ex: [`app/components/alimentacao/`](app/components/alimentacao), [`app/components/ui/`](app/components/ui)).
    *   **`app/lib/`**: Módulos contendo lógica de negócios, serviços, utilitários e clientes de API (ex: [`app/lib/dataService.ts`](app/lib/dataService.ts:1), [`app/lib/googleDriveClient.ts`](app/lib/googleDriveClient.ts:1)).
    *   **`app/stores/`**: Contém as lojas (stores) do Zustand para gerenciamento de estado global, segmentadas por domínio da aplicação (ex: [`app/stores/alimentacaoStore.ts`](app/stores/alimentacaoStore.ts:1), [`app/stores/concursosStore.ts`](app/stores/concursosStore.ts:1)).
*   **`pages/`**: Principalmente utilizado para as API Routes do Next.js (ex: [`pages/api/gerar-questao.ts`](pages/api/gerar-questao.ts:1), [`pages/api/drive/`](pages/api/drive)).
*   **`public/`**: Armazena arquivos estáticos que são servidos diretamente, como imagens (ex: [`public/images/logo.svg`](public/images/logo.svg)), fontes, arquivos JSON de exemplo (ex: [`public/simulado-exemplo.json`](public/simulado-exemplo.json)) e sons.
*   **`docs/`**: Contém arquivos de documentação do projeto, como guias e exemplos em Markdown e JSON.
*   **`perplexity-mcp-server/`**: Um diretório separado que parece conter um servidor MCP (Model Context Protocol), possivelmente para interagir com a API da Perplexity.

## Principais Tecnologias, Frameworks e Bibliotecas

*   **Next.js ([`package.json#L23`](package.json:23))**: Framework React para desenvolvimento de aplicações web full-stack, utilizado para renderização no servidor (SSR), geração de sites estáticos (SSG), roteamento (App Router) e API routes.
*   **React ([`package.json#L26`](package.json:26))**: Biblioteca JavaScript para construção de interfaces de usuário interativas e componentizadas.
*   **TypeScript ([`package.json#L45`](package.json:45))**: Superset do JavaScript que adiciona tipagem estática, melhorando a robustez e a manutenibilidade do código. Configurado através do [`tsconfig.json`](tsconfig.json:1).
*   **Tailwind CSS ([`package.json#L44`](package.json:44))**: Framework CSS utility-first para estilização rápida e customizável. Configurado em [`tailwind.config.js`](tailwind.config.js:1) com um tema customizado e cores específicas para diferentes seções da aplicação.
*   **Zustand ([`package.json#L32`](package.json:32))**: Biblioteca para gerenciamento de estado global de forma simples e flexível, utilizada nas stores dentro de [`app/stores/`](app/stores).
*   **Lucide React ([`package.json#L22`](package.json:22))**: Biblioteca de ícones SVG leves e customizáveis.
*   **date-fns ([`package.json#L19`](package.json:19))**: Biblioteca para manipulação de datas e horários.
*   **Google APIs (googleapis [`package.json#L20`](package.json:20))**: Biblioteca cliente para interagir com APIs do Google, provavelmente utilizada para integração com o Google Drive, como sugerido pela presença de [`app/lib/googleDriveClient.ts`](app/lib/googleDriveClient.ts:1) e rotas em [`pages/api/drive/`](pages/api/drive).
*   **Iron Session ([`package.json#L21`](package.json:21))**: Biblioteca para gerenciamento de sessões stateless, útil para autenticação.
*   **Recharts ([`package.json#L29`](package.json:29))**: Biblioteca para criação de gráficos e visualizações de dados.
*   **React Markdown ([`package.json#L28`](package.json:28))**: Componente React para renderizar conteúdo Markdown.
*   **Next Themes ([`package.json#L24`](package.json:24))**: Facilita a implementação de temas (ex: dark/light mode) em aplicações Next.js.
*   **ESLint ([`package.json#L40`](package.json:40)) / Prettier ([`package.json#L43`](package.json:43))**: Ferramentas para linting e formatação de código, garantindo consistência e qualidade.
*   **@next/bundle-analyzer ([`package.json#L35`](package.json:35))**: Ferramenta para analisar o tamanho dos bundles gerados pela aplicação Next.js, configurada em [`next.config.js`](next.config.js:1).