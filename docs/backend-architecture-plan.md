# Plano de Arquitetura de Backend para Anatel2

Este documento detalha a proposta de arquitetura de backend e esquema de banco de dados para a aplicação Anatel2, visando adicionar persistência de dados e lógica server-side para os diversos módulos existentes.

## 1. Análise da Aplicação Atual

A aplicação Anatel2 é um projeto Next.js com uma estrutura de frontend modular (`app/`). Atualmente, a persistência de dados é limitada, com algumas funcionalidades server-side implementadas via Next.js API Routes (Google Drive, geração de questões). Para suportar a persistência e lógica server-side complexa para todos os módulos, um backend dedicado é necessário.

## 2. Arquitetura de Backend Proposta

**Arquitetura:** API REST

*   **Justificativa:** API REST é um padrão amplamente utilizado e bem compreendido para comunicação frontend-backend. Oferece uma abordagem clara e baseada em recursos para acessar e manipular dados, alinhando-se com a natureza modular da aplicação.

## 3. Stack de Tecnologia Sugerida

*   **Linguagem/Framework:** Node.js com NestJS
    *   **Justificativa:** Reutilização de conhecimento em JavaScript/TypeScript, potencial compartilhamento de código. NestJS oferece estrutura robusta, modular e escalável, facilitando a organização e implementação de padrões.
*   **Banco de Dados:** PostgreSQL
    *   **Justificativa:** RDBMS poderoso, confiável e de código aberto. Adequado para dados estruturados e relacionais dos módulos. Suporta transações ACID e oferece recursos avançados.

## 4. Esboço do Esquema do Banco de Dados

Abaixo está um esboço detalhado do esquema do banco de dados proposto, cobrindo a maioria dos módulos:

```mermaid
erDiagram
    users {
        UUID id PK
        VARCHAR username UK
        VARCHAR email UK
        VARCHAR password_hash
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    recipes {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        TEXT description
        TEXT instructions
        INT prep_time
        INT cook_time
        INT servings
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    ingredients {
        UUID id PK
        VARCHAR name UK
        VARCHAR unit
    }

    recipe_ingredients {
        UUID recipe_id FK
        UUID ingredient_id FK
        DECIMAL quantity
        KIND PK
    }

    expenses {
        UUID id PK
        UUID user_id FK
        VARCHAR description
        DECIMAL amount
        DATE date
        VARCHAR category
        VARCHAR payment_method
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    study_sessions {
        UUID id PK
        UUID user_id FK
        VARCHAR subject
        TIMESTAMP start_time
        TIMESTAMP end_time
        INT duration
        TEXT notes
        TIMESTAMP created_at
    }

    study_materials {
        UUID id PK
        UUID user_id FK
        VARCHAR title
        VARCHAR type
        VARCHAR url
        TEXT content
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    meals {
        UUID id PK
        UUID user_id FK
        VARCHAR type
        TIMESTAMP time
        TEXT description
        TIMESTAMP created_at
    }

    hydration_reminders {
        UUID id PK
        UUID user_id FK
        TIMESTAMP reminder_time
        INT volume_ml
        BOOLEAN active
        TIMESTAMP created_at
    }

    meal_plans {
        UUID id PK
        UUID user_id FK
        DATE plan_date
        TEXT plan_details
        TIMESTAMP created_at
    }

    notes {
        UUID id PK
        UUID user_id FK
        VARCHAR title
        TEXT content
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    competitions {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        DATE start_date
        DATE end_date
        TEXT description
        TIMESTAMP created_at
    }

    questions {
        UUID id PK
        UUID competition_id FK
        TEXT question_text
        TEXT answer_text
        VARCHAR subject
        VARCHAR topic
        TIMESTAMP created_at
    }

    simulations {
        UUID id PK
        UUID user_id FK
        UUID competition_id FK
        TIMESTAMP start_time
        TIMESTAMP end_time
        INT score
        TIMESTAMP created_at
    }

    simulation_history {
        UUID id PK
        UUID simulation_id FK
        UUID question_id FK
        TEXT user_answer
        BOOLEAN is_correct
        TIMESTAMP answered_at
    }

    interests {
        UUID id PK
        UUID user_id FK
        VARCHAR name UK
        TEXT description
        TIMESTAMP created_at
    }

    projects {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        TEXT description
        DATE start_date
        DATE end_date
        VARCHAR status
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    focus_sessions {
        UUID id PK
        UUID user_id FK
        UUID project_id FK
        TIMESTAMP start_time
        TIMESTAMP end_time
        INT duration
        TEXT notes
        TIMESTAMP created_at
    }

    medication_checklist {
        UUID id PK
        UUID user_id FK
        VARCHAR medication_name
        BOOLEAN taken
        DATE checklist_date
        TIMESTAMP created_at
    }

    pause_reminders {
        UUID id PK
        UUID user_id FK
        INT interval_minutes
        BOOLEAN active
        TIMESTAMP created_at
    }

    priorities {
        UUID id PK
        UUID user_id FK
        VARCHAR description
        INT priority_order
        BOOLEAN is_completed
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    leisure_activities {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        TEXT description
        VARCHAR category
        TIMESTAMP created_at
    }

    rest_suggestions {
        UUID id PK
        UUID user_id FK
        TEXT suggestion_text
        BOOLEAN is_taken
        DATE suggestion_date
        TIMESTAMP created_at
    }

    leisure_sessions {
        UUID id PK
        UUID user_id FK
        UUID activity_id FK
        TIMESTAMP start_time
        TIMESTAMP end_time
        INT duration
        TEXT notes
        TIMESTAMP created_at
    }

    mood_entries {
        UUID id PK
        UUID user_id FK
        DATE entry_date
        INT mood_score
        TEXT notes
        TIMESTAMP created_at
    }

    medications {
        UUID id PK
        UUID user_id FK
        VARCHAR name
        VARCHAR dosage
        VARCHAR frequency
        TIMESTAMP created_at
    }

    mood_factors {
        UUID id PK
        UUID mood_entry_id FK
        VARCHAR factor_name
        TEXT factor_details
        KIND PK
    }

    sleep_entries {
        UUID id PK
        UUID user_id FK
        DATE sleep_date
        TIMESTAMP start_time
        TIMESTAMP end_time
        INT duration_minutes
        INT quality_score
        TEXT notes
        TIMESTAMP created_at
    }

    sleep_reminders {
        UUID id PK
        UUID user_id FK
        TIMESTAMP bedtime_reminder
        TIMESTAMP wake_up_reminder
        BOOLEAN active
        TIMESTAMP created_at
    }


    users ||--o{ recipes : "cria"
    recipes ||--o{ recipe_ingredients : "contém"
    ingredients ||--o{ recipe_ingredients : "usado_em"
    users ||--o{ expenses : "registra"
    users ||--o{ study_sessions : "realiza"
    users ||--o{ study_materials : "possui"
    users ||--o{ meals : "registra"
    users ||--o{ hydration_reminders : "configura"
    users ||--o{ meal_plans : "cria"
    users ||--o{ notes : "escreve"
    users ||--o{ competitions : "acompanha"
    competitions ||--o{ questions : "contém"
    users ||--o{ simulations : "realiza"
    simulations ||--o{ simulation_history : "detalha"
    questions ||--o{ simulation_history : "usada_em"
    users ||--o{ interests : "tem"
    users ||--o{ projects : "gerencia"
    projects ||--o{ focus_sessions : "associada_a"
    users ||--o{ focus_sessions : "realiza"
    users ||--o{ medication_checklist : "mantem"
    users ||--o{ pause_reminders : "configura"
    users ||--o{ priorities : "define"
    users ||--o{ leisure_activities : "registra"
    users ||--o{ rest_suggestions : "recebe"
    users ||--o{ leisure_sessions : "realiza"
    leisure_activities ||--o{ leisure_sessions : "associada_a"
    users ||--o{ mood_entries : "registra"
    users ||--o{ medications : "registra"
    mood_entries ||--o{ mood_factors : "influenciada_por"
    users ||--o{ sleep_entries : "registra"
    users ||--o{ sleep_reminders : "configura"
```

## 5. Estratégia de Autenticação e Autorização

*   **Estratégia:** Autenticação Baseada em Tokens (JWT)
    *   **Fluxo:**
        1.  Usuário envia credenciais (ou usa Google Auth) para o backend.
        2.  Backend verifica credenciais (ou valida resposta do Google).
        3.  Backend gera um JWT contendo `user_id`.
        4.  Frontend armazena o JWT (ex: em cookies HttpOnly).
        5.  Frontend inclui o JWT no cabeçalho `Authorization` para requisições protegidas.
        6.  Backend valida o JWT e usa o `user_id` para autorização (acesso a dados do próprio usuário).
*   **Integração Google Auth:**
    *   O backend iniciará o fluxo OAuth 2.0 com o Google.
    *   Após a autorização do usuário no Google, o Google redireciona para o backend.
    *   O backend obtém tokens do Google, verifica/cria o usuário na tabela `users` e gera o JWT da aplicação para o frontend.
    *   Tokens do Google (access/refresh) podem ser armazenados de forma segura no backend para acesso futuro ao Google Drive.

## 6. Próximos Passos

Com este plano de arquitetura de backend definido, o próximo passo seria iniciar a implementação.