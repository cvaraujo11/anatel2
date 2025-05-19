# Estratégias de Depuração para Migração Supabase

## Técnicas de Diagnóstico

### 1. Logs Estruturados
```javascript
// Padrão de logging consistente
console.log('[useRealtimeData] Iniciando conexão com tabela:', table);
console.log('[useRealtimeData] Resposta:', { data, error, count: data?.length });

// Agrupar logs relacionados
console.group('Operação Supabase');
console.log('Requisição:', params);
console.log('Resposta:', result);
console.error('Erros:', error);
console.groupEnd();
```

### 2. Monitoramento de Rede
- Filtrar requisições por `rest`, `postgrest` ou `realtime` no DevTools
- Verificar headers `Authorization` em cada requisição
- Comparar formatos de resposta entre mock e Supabase real

### 3. Diagnóstico de Estado
```javascript
// Hook para depuração de estado
function useDiagnostics(name, data) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${name}] Estado:`, data);
    }
  }, [name, data]);
}

// Uso
useDiagnostics('useHidratacao', { hidratacao, loading, error });
```

## Pontos Críticos de Migração

### 1. Autenticação
- Verificar ciclo completo de `Auth Provider`:
  ```javascript
  // Deve ser implementado em _app.js ou layout.js
  <AuthProvider>
    <Component {...pageProps} />
  </AuthProvider>
  ```
- Monitorar fluxo de token JWT:
  ```javascript
  // Middleware deve renovar sessão
  await supabase.auth.getSession();
  ```

### 2. Tratamento de Row Level Security (RLS)
- Verificar políticas no backend mock:
  ```javascript
  // Exemplo de política RLS simulada
  (user_id, record) => record.get("user_id") === user_id
  ```
- Certificar inserção de `user_id` em todas operações:
  ```javascript
  // Exemplo correto
  await supabase.from('refeicoes').insert({
    ...dados,
    user_id: user.id
  });
  ```

### 3. Sincronização em Tempo Real
- Verificar implementação de `useRealtimeData`:
  ```javascript
  // Padrão recomendado de canal
  supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table },
      handleChange
    )
  ```
- Testar com múltiplas instâncias:
  - Abrir navegador em modo anônimo
  - Verificar tempo de propagação entre dispositivos

## Padrões Avançados

### 1. Estado Híbrido (LocalStorage + Supabase)
```javascript
// Implementação do useHybridState conforme guia
const [state, setState] = useState(() => {
  // Carregar inicialmente do localStorage para UI responsiva
  if (typeof window === 'undefined') return initialValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    return initialValue;
  }
});

// Efeito para sobrescrever do Supabase quando disponível
useEffect(() => {
  if (!user) return;
  
  const loadFromSupabase = async () => {
    const { data } = await supabase
      .from(table)
      .select(column)
      .eq('user_id', user.id)
      .single();
      
    if (data && data[column] !== undefined) {
      setState(data[column]);
      localStorage.setItem(key, JSON.stringify(data[column]));
    }
  };
  
  loadFromSupabase();
}, [user, table, column, key]);
```

### 2. Estratégia de Otimização de Carregamento
- Implementar carregamento por etapas:
  1. Mostrar UI com dados de localStorage
  2. Carregar dados do Supabase em background
  3. Atualizar UI quando dados estiverem disponíveis

### 3. Detecção de Conflitos
```javascript
// Estratégia para detectar conflitos de dados
const [localTimestamp, setLocalTimestamp] = useState(Date.now());

// Ao salvar localmente
const saveLocal = (data) => {
  const timestamp = Date.now();
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp
  }));
  setLocalTimestamp(timestamp);
};

// Ao carregar do servidor, verificar conflitos
const loadRemote = async () => {
  const { data } = await supabase.from(table).select('*');
  const remoteTimestamp = new Date(data.updated_at).getTime();
  
  if (remoteTimestamp > localTimestamp) {
    // Dados remotos mais recentes
    setState(data);
    saveLocal(data);
  }
};
```

## Estratégias de Depuração por Componente

### 1. Autenticação
- Verificar fluxo completo: signup → login → session → logout
- Testar renovação automática de token
- Validar rotas protegidas no middleware

### 2. Hooks de Dados
- Verificar ciclo de vida:
  1. Estado inicial (null, loading: true)
  2. Carregamento de dados (dados reais, loading: false)
  3. Atualizações via realtime (eventos processados)
- Testar casos extremos: sem internet, usuário sem dados

### 3. Migração de Dados
- Verificar integridade durante transferência localStorage → Supabase
- Testar com volumes grandes de dados
- Verificar tratamento de erros durante migração

## Simulação de Casos de Erro

### 1. Erros de Autenticação
- Testar expiração de token
- Simular credenciais inválidas
- Verificar tratamento de logout forçado

### 2. Erros de Operação
- Simular violações de RLS
- Testar com dados malformados
- Verificar recuperação após erro de rede

## Ferramentas de Verificação

### Verificador de Estrutura de Resposta
```javascript
// Função para validar formato de resposta Supabase
function validateSupabaseResponse(response) {
  const hasCorrectStructure = 
    response && 
    ('data' in response || 'error' in response);
    
  if (!hasCorrectStructure) {
    console.error('Resposta Supabase inválida:', response);
    return false;
  }
  
  if (response.error) {
    console.warn('Erro Supabase:', response.error);
  }
  
  return hasCorrectStructure;
}
```

### Monitoramento de Performance
```javascript
// Verificar tempo de operações
console.time('supabase:query');
const result = await supabase.from('refeicoes').select('*');
console.timeEnd('supabase:query');
``` 