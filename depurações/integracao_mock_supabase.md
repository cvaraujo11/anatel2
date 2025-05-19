# Guia de Integração do Mock Supabase no Frontend

Este guia explica como configurar o frontend para usar o backend de simulação do Supabase durante a fase de depuração da refatoração.

## 1. Arquivo de Configuração do Supabase

Modifique o arquivo `lib/supabase.js` para apontar para o mock Supabase durante o desenvolvimento:

```javascript
import { createClient } from '@supabase/supabase-js';

// Configuração para desenvolvimento com mock API
const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

let supabaseUrl;
let supabaseAnonKey;

if (useMockApi) {
  // Usar API de mock local
  supabaseUrl = 'http://localhost:8000';
  supabaseAnonKey = 'mock-key';
} else {
  // Usar Supabase real
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  // Para debug durante o desenvolvimento
  debug: process.env.NODE_ENV === 'development',
});

// Patch para simular funcionalidades específicas do Supabase no mock
if (useMockApi) {
  // Suporte para .single() no resultado da consulta
  const originalFrom = supabase.from;
  supabase.from = function (table) {
    const result = originalFrom.call(this, table);
    
    const originalSelect = result.select;
    result.select = function (...args) {
      const selectResult = originalSelect.apply(this, args);
      
      // Adicionar método .single() se não existir
      if (!selectResult.single) {
        selectResult.single = async function () {
          const { data, error } = await this;
          
          if (error) return { data: null, error };
          
          if (data && data.length === 1) {
            return { data: data[0], error: null };
          } else if (data && data.length > 1) {
            return {
              data: null,
              error: {
                message: "A consulta retornou mais de um resultado",
                code: "PGRST200"
              }
            };
          } else {
            return {
              data: null,
              error: {
                message: "Registro não encontrado",
                code: "PGRST116"
              }
            };
          }
        };
      }
      
      return selectResult;
    };
    
    return result;
  };
  
  // Simulação rudimentar do sistema de canais para realtime
  const originalChannel = supabase.channel;
  supabase.channel = function (name) {
    // Verificar se é canal de tabela
    const isTableChannel = name.includes('-changes');
    
    // Extrair nome da tabela se for um canal de tabela
    let tableName = null;
    if (isTableChannel) {
      // Formato comum: 'table-changes-userId'
      const parts = name.split('-changes-');
      if (parts.length > 0) {
        tableName = parts[0];
      }
    }
    
    return {
      on: function (event, config, callback) {
        if (event === 'postgres_changes' && tableName) {
          // Conectar ao WebSocket do mock
          const ws = new WebSocket(`ws://localhost:8000/realtime/${tableName}`);
          
          ws.onmessage = (event) => {
            const payload = JSON.parse(event.data);
            callback(payload);
          };
          
          // Armazenar referência para usar em .subscribe()
          this._ws = ws;
        }
        
        return this;
      },
      subscribe: function () {
        // No mock, não precisamos fazer nada especial aqui
        return {
          unsubscribe: () => {
            if (this._ws) {
              this._ws.close();
            }
          }
        };
      }
    };
  };
  
  // Simulação de removeChannel
  supabase.removeChannel = function (subscription) {
    if (subscription && subscription.unsubscribe) {
      subscription.unsubscribe();
    }
  };
}
```

## 2. Configuração dos Hooks

Modifique os hooks personalizados para facilitar o debug:

### 2.1 Atualização do useHidratacao.js

```javascript
// lib/hooks/useHidratacao.js
'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';

export function useHidratacao() {
  const { user } = useAuth();
  const [hidratacao, setHidratacao] = useState({
    coposBebidos: 0,
    metaDiaria: 8,
    ultimoRegistro: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Adicionar log para debug durante o desenvolvimento
  useEffect(() => {
    const isMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
    if (isMockApi) {
      console.log('[useHidratacao] Usando Mock API');
    }
  }, []);

  // Resto do hook permanece igual...
}
```

## 3. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_USE_MOCK_API=true
```

## 4. Iniciando os Serviços

### 4.1 Iniciar o Backend de Mock

```bash
# Na pasta do mock_supabase_api
cd depurações/mock_supabase_api
python -m pip install -r requirements.txt
python main.py
```

### 4.2 Iniciar o Frontend

```bash
# Na raiz do projeto
npm run dev
```

## 5. Depuração de Chamadas

Para facilitar a depuração, você pode modificar temporariamente os hooks para logar mais informações:

```javascript
// Exemplo para useRefeicoes.js
const adicionarRefeicao = async (horario, descricao) => {
  console.log('[useRefeicoes] Adicionando refeição:', { horario, descricao });
  
  const result = await adicionarRefeicaoPlanejada({
    tipo: 'planejada',
    data: new Date().toISOString(),
    horario,
    descricao
  });
  
  console.log('[useRefeicoes] Resultado:', result);
  return result;
};
```

## 6. Verificando Integridade das Respostas

Ao receber dados do backend de mock, verifique se o formato corresponde ao esperado:

```javascript
// No hook useRealtimeData
// Adicionar depois da chamada:
console.log('[useRealtimeData] Formato da resposta:', {
  data, 
  error,
  // Verificar se os campos esperados estão presentes
  hasExpectedFields: data ? data.every(item => 'id' in item && 'user_id' in item) : false
});
```

## 7. Simulando Múltiplos Dispositivos

Para testar a sincronização em tempo real:

1. Abra duas janelas do navegador diferentes
2. Faça login com o mesmo usuário em ambas (email: teste@email.com, senha: senha123)
3. Abra a página de alimentação nas duas janelas
4. Faça uma alteração em uma janela e observe se é refletida na outra

## 8. Alternando Entre Mock e Supabase Real

Para alternar entre o mock e o Supabase real:

1. Modifique o valor de `NEXT_PUBLIC_USE_MOCK_API` no arquivo `.env.local`
2. Reinicie o servidor de desenvolvimento do Next.js

## 9. Dicas de Resolução de Problemas

### 9.1 Problemas com Autenticação

Se o token de autenticação não estiver sendo processado corretamente:

1. Verifique os headers da requisição no DevTools > Network
2. Confirme se o header `Authorization: Bearer <token>` está sendo enviado
3. Verifique o console do servidor mock para erros de JWT

### 9.2 Problemas com WebSockets

Se as atualizações em tempo real não estiverem funcionando:

1. Verifique a aba Network > WS no DevTools
2. Confirme se a conexão WebSocket foi estabelecida com `/realtime/<table>`
3. Verifique o console do servidor mock para erros de WebSocket 