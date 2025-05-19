# Ferramentas de Depuração para Migração para Supabase

Esta pasta contém recursos e ferramentas para auxiliar na depuração da refatoração do StayFocus de localStorage para Supabase.

## Estrutura da Pasta

```
depurações/
├── estrategias_depuracao_supabase.md     # Estratégias gerais de depuração
├── instrucoes_depuracao.md               # Guia passo a passo para depuração
├── integracao_mock_supabase.md           # Guia para integrar o mock Supabase no frontend
├── mock_supabase_api/                    # Backend de simulação do Supabase em FastAPI
│   ├── requirements.txt                  # Dependências do projeto
│   ├── main.py                           # Ponto de entrada da API
│   ├── database.py                       # Simulação de banco de dados
│   └── schemas/                          # Modelos de dados para a API
│       └── models.py                     # 
├── teste_autoconhecimento.jsx            # Componente de teste para página de autoconhecimento
```

## Recursos Disponíveis

### 1. Documentação e Guias

- **estrategias_depuracao_supabase.md**: Estratégias gerais para depurar a integração com Supabase
- **instrucoes_depuracao.md**: Guia passo a passo para diagnosticar e resolver problemas
- **integracao_mock_supabase.md**: Como configurar o frontend para usar o mock Supabase

### 2. Backend de Simulação (Mock Supabase API)

Um servidor FastAPI que simula o comportamento do Supabase para desenvolvimento e testes:

- Simula a API RESTful do Supabase PostgreSQL
- Implementa autenticação com JWT
- Simula Row Level Security (RLS)
- Oferece WebSockets para simulação de eventos em tempo real
- Inclui endpoints para refeições, hidratação, notas de autoconhecimento e preferências do usuário

### 3. Componentes de Teste

- **teste_hidratacao.jsx**: Componente React para testar funcionalidades de hidratação
- **teste_refeicoes.jsx**: Componente React para testar o gerenciamento de refeições
- **teste_migracao.jsx**: Componente para testar a migração de dados do localStorage para Supabase
- **teste_autoconhecimento.jsx**: Componente para testar as funcionalidades da página de autoconhecimento e o modo refúgio

## Como Usar

### Para Iniciar o Backend de Simulação

```bash
# Instalar dependências
cd depurações/mock_supabase_api
python -m pip install -r requirements.txt

# Iniciar o servidor
python main.py
```

O servidor estará disponível em `http://localhost:8000`

### Para Configurar o Frontend

1. Siga as instruções em `integracao_mock_supabase.md` para configurar o cliente Supabase
2. Adicione a variável de ambiente `NEXT_PUBLIC_USE_MOCK_API=true` em `.env.local`
3. Inicie o servidor de desenvolvimento do Next.js

### Para Testar Componentes Individuais

Importe os componentes de teste em uma página temporária:

```jsx
// app/teste/page.tsx
'use client'

import TesteHidratacao from '@/depurações/teste_hidratacao';
import TesteRefeicoes from '@/depurações/teste_refeicoes';
import TesteAutoconhecimento from '@/depurações/teste_autoconhecimento';

export default function TestePage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Página de Testes</h1>
      <TesteHidratacao />
      <hr className="my-4" />
      <TesteRefeicoes />
      <hr className="my-4" />
      <TesteAutoconhecimento />
    </div>
  );
}
```

## Testes Específicos para Autoconhecimento

Para testar especificamente a página de autoconhecimento:

1. Inicie o servidor mock do Supabase
2. Configure o frontend para usar o mock (conforme instruções acima)
3. Importe o componente `TesteAutoconhecimento` para uma página de teste
4. Verifique as seguintes funcionalidades:
   - Listagem de notas por categoria
   - Criação, edição e exclusão de notas
   - Modo Refúgio (ativação/desativação)
   - Recebimento de atualizações em tempo real
5. Consulte os logs de depuração disponíveis no componente para diagnóstico

## Estratégia de Depuração Recomendada

1. **Configuração**:
   - Configure o frontend para usar o mock Supabase
   - Inicie o servidor de mock e o frontend

2. **Verificação Isolada**:
   - Teste os hooks (useHidratacao, useRefeicoes, useNotasAutoconhecimento, etc.) isoladamente
   - Use os componentes de teste para validar o comportamento esperado

3. **Integração com Componentes Reais**:
   - Após validar os hooks, integre-os nos componentes reais da aplicação
   - Verifique o comportamento em múltiplas janelas/dispositivos

4. **Validação com Supabase Real**:
   - Alterne para o Supabase real (mude a variável de ambiente)
   - Execute os mesmos testes para garantir compatibilidade

## Dicas para Troubleshooting

- Use o console do navegador para monitorar chamadas da API
- Verifique a aba Network do DevTools para analisar requisições
- Compare a estrutura de resposta do mock com a resposta real do Supabase
- Para problemas de WebSocket, use a aba Network > WS no DevTools 