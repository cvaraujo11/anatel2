# Guia de Depuração para Migração Supabase

## Preparação do Ambiente

1. **Configurar Supabase Mock API**
   ```bash
   cd depurações/mock_supabase_api
   python -m pip install -r requirements.txt
   python main.py
   ```

2. **Configurar Variáveis de Ambiente**
   ```
   NEXT_PUBLIC_USE_MOCK_API=true
   ```

3. **Verificar Implementação do Cliente**
   ```javascript
   // lib/supabase.js deve incluir:
   const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     auth: {
       persistSession: true,
       autoRefreshToken: true,
     }
   });
   ```

## Checklist de Depuração

### 1. Autenticação e Sessão

- [ ] **Verificar Implementação de Middleware**
   ```javascript
   // middleware.js
   const res = NextResponse.next();
   const supabase = createMiddlewareClient({ req, res });
   await supabase.auth.getSession();
   ```

- [ ] **Testar AuthProvider**
   ```javascript
   // Executar este teste no console:
   const { user, loading } = window.__NEXT_DATA__.props.pageProps.authContext || {};
   console.log('Auth Status:', { user, loading, isAuthenticated: !!user });
   ```

- [ ] **Validar Token nos Headers**
   1. Abra DevTools > Network
   2. Procure requisições para `/rest/v1`
   3. Verifique se o header `Authorization: Bearer <token>` está presente

### 2. Migração de Dados

- [ ] **Verificar Função de Migração**
   ```javascript
   // Criar função para teste de migração
   async function testMigration() {
     console.log('Dados localStorage antes:', 
       JSON.parse(localStorage.getItem('key-to-migrate') || 'null'));
     
     // Executar migração
     await migrarDados('key-to-migrate', 'tabela_destino');
     
     // Verificar no Supabase
     const { data } = await supabase.from('tabela_destino').select('*');
     console.log('Dados migrados:', data);
   }
   ```

- [ ] **Testar Migração com Casos Extremos**
   - Dados grandes
   - Estruturas aninhadas
   - Dados malformados
   - Arrays e objetos complexos

### 3. Hooks de Sincronização

- [ ] **Validar useRealtimeData**
   ```javascript
   // Injetar isto para debug em hooks de realtime
   useEffect(() => {
     if (!realtimeEnabled) return;
     
     console.log(`[useRealtimeData] Subscrevendo a ${table}`);
     console.log(`[useRealtimeData] Filtro:`, channelFilter);
     
     // Retorno da subscription
     return () => {
       console.log(`[useRealtimeData] Removendo subscription de ${table}`);
     };
   }, [table, realtimeEnabled, channelFilter]);
   ```

- [ ] **Verificar Atualização da UI com Dados de Realtime**
   1. Abrir duas janelas da aplicação
   2. Fazer alteração em uma janela
   3. Verificar se outra janela atualiza em < 2 segundos

### 4. Tratamento de RLS e Permissões

- [ ] **Verificar Políticas RLS no Mock API**
   ```javascript
   // database.py deve conter algo como:
   RLS_POLICIES = {
     "tabela": lambda user_id, record: record.get("user_id") == user_id
   }
   ```

- [ ] **Testar Violações de Política**
   ```javascript
   // Teste de violação RLS
   const userActual = supabase.auth.getUser();
   const wrongUserId = 'outro-usuario-id';
   
   // Deve falhar com erro de RLS
   const { data, error } = await supabase
     .from('tabela')
     .insert({ 
       campo: 'valor', 
       user_id: wrongUserId  // ID diferente do usuário atual
     });
     
   console.log('Resultado esperado (com erro):', { data, error });
   ```

### 5. Resolução de Problemas Comuns

#### Erro: Dados não carregam

**Diagnóstico:**
```javascript
// No hook de dados
try {
  const { data, error } = await supabase.from('tabela').select('*');
  console.log('Tentativa de carregamento:', {
    data,
    error,
    userId: user?.id,
    tabela: 'tabela',
    query: 'SELECT *'
  });
  
  if (error) throw error;
} catch (err) {
  console.error('Erro detalhado:', {
    message: err.message,
    code: err.code,
    details: err.details,
    hint: err.hint
  });
}
```

**Soluções comuns:**
1. Verificar se usuário está autenticado
2. Confirmar que `user_id` correto está sendo usado na consulta
3. Validar políticas RLS no Supabase/mock
4. Verificar se a tabela existe e tem o schema correto

#### Erro: Atualizações em tempo real não funcionam

**Diagnóstico:**
```javascript
// Em um componente temporário
useEffect(() => {
  // Subscription direta para teste
  const channel = supabase
    .channel('test-channel')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tabela' },
      (payload) => {
        console.log('Evento recebido:', payload);
      }
    )
    .subscribe(status => {
      console.log('Status da subscription:', status);
    });
    
  // Testar enviando dados
  const testUpdate = async () => {
    const { data, error } = await supabase
      .from('tabela')
      .insert({ campo: 'teste-realtime', user_id: user.id });
      
    console.log('Teste de insert para realtime:', { data, error });
  };
  
  // Executar após 2s
  setTimeout(testUpdate, 2000);
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

**Soluções comuns:**
1. Verificar aba WS no DevTools para conexão WebSocket
2. Confirmar formato correto do canal e filtros
3. Validar se eventos estão sendo enviados pelo servidor

#### Erro: Conflitos entre localStorage e Supabase

**Diagnóstico:**
```javascript
// Adicionar isto em um componente temporário
useEffect(() => {
  // Capturar estado atual
  const localData = JSON.parse(localStorage.getItem('chave') || 'null');
  
  // Buscar do Supabase
  const fetchServerData = async () => {
    const { data } = await supabase.from('tabela').select('*').single();
    
    console.log('Comparação de dados:', {
      localStorage: localData,
      supabase: data,
      differences: localData ? 
        Object.keys(localData).filter(k => 
          JSON.stringify(localData[k]) !== JSON.stringify(data?.[k])
        ) : []
    });
  };
  
  fetchServerData();
}, []);
```

**Soluções comuns:**
1. Implementar estratégia de timestamp para detectar versão mais recente
2. Usar useHybridState conforme guia Supabase
3. Implementar mecanismo de reconciliação

## Ferramentas Avançadas de Depuração

### 1. Depuração Avançada com React DevTools

1. Instalar React DevTools
2. Ir para aba "Components"
3. Localizar componentes com hooks Supabase
4. Verificar estado e props

### 2. Analisador de Desempenho

```javascript
// Adicionar em um hook para medir performance
const trackPerformance = (operation) => {
  const start = performance.now();
  return () => {
    const duration = performance.now() - start;
    console.log(`[Performance] ${operation}: ${duration.toFixed(2)}ms`);
    
    // Alerta para operações lentas (> 500ms)
    if (duration > 500) {
      console.warn(`Operação lenta detectada: ${operation}`);
    }
  };
};

// Uso
const fetchData = async () => {
  const end = trackPerformance('select_refeicoes');
  const { data } = await supabase.from('refeicoes').select('*');
  end();
  return data;
};
```

### 3. Depurador de Estado Híbrido

```javascript
// Função para depurar useHybridState
function debugHybridState(key, value, source) {
  console.log(`[HybridState] '${key}' atualizado:`, {
    value,
    source, // 'localStorage', 'supabase', 'setState'
    timestamp: new Date().toISOString()
  });
}

// Exemplo de uso em useHybridState
const [state, setState] = useHybridState('chave', tabela, defaultValue, {
  onLocalLoad: (value) => debugHybridState('chave', value, 'localStorage'),
  onRemoteLoad: (value) => debugHybridState('chave', value, 'supabase'),
  onStateChange: (value) => debugHybridState('chave', value, 'setState')
});
```

## Testes Específicos para Migração

### 1. Teste de Integridade de Dados

```javascript
// Função para validar integridade de dados migrados
async function validateDataIntegrity(localStorageKey, supabaseTable) {
  // Dados do localStorage
  const localData = JSON.parse(localStorage.getItem(localStorageKey) || 'null');
  
  if (!localData) {
    console.log(`Sem dados locais para '${localStorageKey}'`);
    return false;
  }
  
  // Dados do Supabase
  const { data: supabaseData, error } = await supabase
    .from(supabaseTable)
    .select('*');
    
  if (error || !supabaseData) {
    console.error(`Erro ao buscar dados do Supabase: ${error?.message}`);
    return false;
  }
  
  // Comparação de campos essenciais
  const missingFields = [];
  
  // Verificar se todos os campos essenciais foram migrados
  Object.keys(localData).forEach(key => {
    const hasEquivalent = supabaseData.some(item => 
      JSON.stringify(item[key]) === JSON.stringify(localData[key])
    );
    
    if (!hasEquivalent) {
      missingFields.push(key);
    }
  });
  
  console.log('Resultado da validação:', {
    localFields: Object.keys(localData).length,
    supabaseRecords: supabaseData.length,
    missingFields,
    integrityStatus: missingFields.length === 0 ? 'OK' : 'FALHA'
  });
  
  return missingFields.length === 0;
}
```

### 2. Teste de Autenticação e Persistência de Sessão

```javascript
// Função para verificar persistência de autenticação
async function testAuthPersistence() {
  const initialAuth = supabase.auth.getSession();
  console.log('Sessão inicial:', initialAuth);
  
  // Simular reload
  console.log('Simulando reload...');
  
  // Recriar cliente Supabase (simula reload)
  const newClient = createClient(supabaseUrl, supabaseAnonKey);
  const persistedAuth = await newClient.auth.getSession();
  
  console.log('Sessão persistida:', persistedAuth);
  console.log('Teste de persistência: ', 
    persistedAuth?.data?.session?.user?.id === initialAuth?.data?.session?.user?.id
      ? 'SUCESSO' : 'FALHA'
  );
}
```

### 3. Ferramenta de Validação de Schema

```javascript
// Função para validar schema de dados
function validateSchema(table, record, requiredFields) {
  const errors = [];
  const warnings = [];
  
  // Verificar campos obrigatórios
  requiredFields.forEach(field => {
    if (!(field in record)) {
      errors.push(`Campo obrigatório '${field}' ausente`);
    } else if (record[field] === null || record[field] === undefined) {
      warnings.push(`Campo '${field}' possui valor nulo`);
    }
  });
  
  // Verificar campos extras (não esperados)
  Object.keys(record).forEach(field => {
    if (!requiredFields.includes(field) && 
        !['id', 'created_at', 'updated_at'].includes(field)) {
      warnings.push(`Campo extra não esperado: '${field}'`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    record
  };
}
``` 