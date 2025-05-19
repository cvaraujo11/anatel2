# Backend de Simulação do Supabase com FastAPI

Este backend simula as funcionalidades do Supabase para facilitar a depuração da refatoração do frontend sem depender de uma instância do Supabase em produção.

## Estrutura

```
mock_supabase_api/
├── requirements.txt     # Dependências do projeto
├── main.py              # Ponto de entrada da aplicação FastAPI
├── schemas/            # Definições de modelos de dados (Pydantic)
├── database.py         # Configuração da base de dados em memória
├── routes/             # Rotas da API
│   ├── auth.py         # Rotas de autenticação
│   ├── refeicoes.py    # Rotas para refeições
│   └── hidratacao.py   # Rotas para hidratação
└── utils/              # Utilitários para simulação
    ├── realtime.py     # Simulação de subscriptions em tempo real
    └── rls.py          # Simulação de políticas RLS
```

## Instruções para Desenvolvimento

1. Implementar uma API que simule o cliente Supabase
2. Incluir recursos para simular autenticação, RLS e atualizações em tempo real
3. Estruturar o código para facilitar a adição de novas tabelas conforme necessário

## Especificações Técnicas

### Rotas a Implementar

#### Autenticação
- `POST /auth/login` - Simular login 
- `POST /auth/signup` - Simular registro
- `POST /auth/logout` - Simular logout
- `GET /auth/session` - Obter sessão atual

#### Tabela refeicoes
- `GET /refeicoes` - Listar todas (com filtros)
- `POST /refeicoes` - Adicionar nova
- `PATCH /refeicoes/{id}` - Atualizar
- `DELETE /refeicoes/{id}` - Excluir
- `WS /realtime/refeicoes` - Canal para atualizações em tempo real

#### Tabela hidratacao
- `GET /hidratacao` - Obter registro
- `POST /hidratacao` - Adicionar/atualizar
- `WS /realtime/hidratacao` - Canal para atualizações

### Funcionalidades a Implementar

1. **Banco de Dados em Memória**
   - Implementar usando dicionários ou SQLite em memória
   - Estruturar conforme o esquema definido no arquivo SQL

2. **Simulação de RLS**
   - Filtrar automaticamente dados por user_id
   - Implementar verificação de permissões

3. **Simulação de Tempo Real**
   - WebSockets para enviar atualizações ao frontend
   - Implementar canais com filtros semelhantes ao Supabase

4. **Autenticação Simulada**
   - JWT para tokens de sessão
   - Armazenamento de usuários em memória

5. **Simular Comportamento de Erros**
   - Reproduzir códigos de erro específicos do Supabase
   - Incluir casos como PGRST116 (registro não encontrado)

## Comportamento para Simular

O backend deve replicar a mesma estrutura de resposta do Supabase:

```javascript
// Exemplo de resposta para select
{
  data: [...registros],
  error: null
}

// Exemplo de resposta para erro
{
  data: null,
  error: {
    message: "Registro não encontrado",
    code: "PGRST116"
  }
}
```

## Interação com o Frontend

O backend deve ser configurado para responder em `http://localhost:8000`, e o cliente Supabase no frontend deve ser atualizado para apontar para esta URL durante o desenvolvimento. 