# Guia de Refatoração Next.js: De localStorage para Supabase

Este guia fornece instruções completas para refatorar aplicações Next.js que utilizam localStorage como método de armazenamento de dados para o Supabase, seguindo as melhores práticas. O documento aborda refatoração de stores, componentes, hooks e pages.

## Contexto Inicial

Uma aplicação Next.js típica baseada em localStorage geralmente:

1. Armazena dados de sessão/usuário no localStorage
2. Gerencia estado global via Context API, Redux, Zustand, etc.
3. Carrega e persiste dados diretamente no navegador
4. Lida com autenticação via tokens armazenados localmente
5. Não possui sincronização entre dispositivos ou persistência de dados entre sessões

## Objetivos da Migração para Supabase

1. Substituir localStorage por autenticação e armazenamento baseados em servidor
2. Implementar sincronização em tempo real entre dispositivos
3. Melhorar a segurança com autenticação adequada
4. Implementar persistência de dados robusta
5. Utilizar recursos SSR/SSG do Next.js em conjunto com Supabase

## 1. Configuração Inicial do Supabase

### 1.1 Instalação de Dependências

```bash
npm install @supabase/supabase-js
# Para Auth UI (opcional)
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### 1.2 Configuração do Cliente Supabase

Crie um arquivo `lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 1.3 Configuração do Cliente de Servidor (para Server Components do Next.js)

Crie um arquivo `lib/supabase-server.js`:

```javascript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export function createServerClient() {
  return createServerComponentClient({ cookies });
}
```

### 1.4 Configuração do Middleware de Autenticação

Crie um arquivo `middleware.js` na raiz do projeto:

```javascript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Refresh session if needed
  await supabase.auth.getSession();
  
  // Exemplo: proteger rotas específicas
  // const {data: {session}} = await supabase.auth.getSession();
  // if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/login', req.url));
  // }
  
  return res;
}

export const config = {
  matcher: [
    // Especificar quais rotas o middleware deve processar
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
```

## 2. Refatoração de Autenticação

### 2.1 Criação de Hook de Autenticação

Substitua qualquer lógica de autenticação baseada em localStorage por este hook:

```javascript
// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão atual
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };
    
    getUser();
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return (
    <div>
      <h1>Perfil</h1>
      <form onSubmit={updateProfile}>
        <label>
          Nome:
          <input name="name" defaultValue={profile.name} />
        </label>
        <label>
          Bio:
          <textarea name="bio" defaultValue={profile.bio} />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
```

### 6.2 Página de Autenticação

Antes (com localStorage):

```jsx
// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
      // Simulação de API (em projetos reais seria uma chamada à API)
      if (email === 'usuario@exemplo.com' && password === 'senha123') {
        // Autenticação bem-sucedida
        localStorage.setItem('token', 'fake-jwt-token');
        localStorage.setItem('userData', JSON.stringify({
          id: '123',
          name: 'Usuário Exemplo',
          email: 'usuario@exemplo.com'
        }));
        router.push('/dashboard');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (err) {
      setError('Erro ao processar login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Login</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleLogin}>
        <div>
          <label>
            Email:
            <input type="email" name="email" required />
          </label>
        </div>
        <div>
          <label>
            Senha:
            <input type="password" name="password" required />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
```

Depois (com Supabase):

```jsx
// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Redirecionamento após login bem-sucedido
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Erro ao processar login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>Login</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <form onSubmit={handleLogin}>
        <div>
          <label>
            Email:
            <input type="email" name="email" required />
          </label>
        </div>
        <div>
          <label>
            Senha:
            <input type="password" name="password" required />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
```

### 6.3 Configuração do componente de App Router

```jsx
// app/layout.jsx (Next.js 13+ App Router)
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { AuthProvider } from '@/hooks/useAuth';

export default async function RootLayout({ children }) {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const initialUser = session?.user || null;

  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider initialUser={initialUser}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

```jsx
// hooks/useAuth.js (versão modificada para App Router)
'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export function AuthProvider({ children, initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    if (!initialUser) {
      // Verificar sessão atual apenas se não tiver usuário inicial
      const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        setLoading(false);
      };
      
      getUser();
    }
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, [initialUser]);

  // Restante do AuthProvider...
}
```

## 7. Sincronização de Dados em Tempo Real

### 7.1 Hook de Sincronização em Tempo Real para Coleções

```javascript
// hooks/useRealtimeData.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeData(table, queryBuilder = null, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { realtimeEnabled = true } = options;
  
  // Função para carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Criar consulta base
      let query = supabase.from(table).select('*');
      
      // Aplicar modificadores de consulta personalizados, se fornecidos
      if (queryBuilder) {
        query = queryBuilder(query);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setData(data || []);
      setError(null);
    } catch (error) {
      console.error(`Erro ao carregar dados da tabela ${table}:`, error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [table]);
  
  // Configurar sincronização em tempo real
  useEffect(() => {
    if (!realtimeEnabled) return;
    
    // Criar filtros de canal específicos, se necessário
    let channelFilter = {};
    if (options.filter) {
      channelFilter = { filter: options.filter };
    }
    
    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', 
        { 
          event: '*', // ou especificar: 'INSERT', 'UPDATE', 'DELETE'
          schema: 'public', 
          table: table,
          ...channelFilter
        },
        async (payload) => {
          // Otimização para evitar recarregar tudo: atualizar localmente
          if (payload.eventType === 'INSERT') {
            setData(currentData => [...currentData, payload.new]);
          } 
          else if (payload.eventType === 'UPDATE') {
            setData(currentData => 
              currentData.map(item => 
                item.id === payload.new.id ? payload.new : item
              )
            );
          } 
          else if (payload.eventType === 'DELETE') {
            setData(currentData => 
              currentData.filter(item => item.id !== payload.old.id)
            );
          }
          // Alternativamente, recarregar todos os dados se necessário
          // await loadData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, realtimeEnabled]);
  
  // Função para adicionar um item
  const addItem = async (item) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .insert([item])
        .select();
        
      if (error) throw error;

      // Se a sincronização em tempo real estiver desativada, atualizamos manualmente
      if (!realtimeEnabled && data) {
        setData(currentData => [...currentData, data[0]]);
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao adicionar item à tabela ${table}:`, error);
      return { data: null, error };
    }
  };
  
  // Função para atualizar um item
  const updateItem = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      // Se a sincronização em tempo real estiver desativada, atualizamos manualmente
      if (!realtimeEnabled && data) {
        setData(currentData => 
          currentData.map(item => item.id === id ? data[0] : item)
        );
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar item na tabela ${table}:`, error);
      return { data: null, error };
    }
  };
  
  // Função para excluir um item
  const deleteItem = async (id) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Se a sincronização em tempo real estiver desativada, atualizamos manualmente
      if (!realtimeEnabled) {
        setData(currentData => currentData.filter(item => item.id !== id));
      }
      
      return { error: null };
    } catch (error) {
      console.error(`Erro ao excluir item da tabela ${table}:`, error);
      return { error };
    }
  };
  
  return {
    data,
    loading,
    error,
    refresh: loadData,
    addItem,
    updateItem,
    deleteItem
  };
}
```

### 7.2 Hook para Dados de um Único Item

```javascript
// hooks/useRealtimeItem.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeItem(table, id, options = {}) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { realtimeEnabled = true, columns = '*' } = options;
  
  // Função para carregar dados
  const loadItem = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      setItem(data);
      setError(null);
    } catch (error) {
      console.error(`Erro ao carregar item da tabela ${table}:`, error);
      setError(error.message);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    loadItem();
  }, [table, id]);
  
  // Configurar sincronização em tempo real
  useEffect(() => {
    if (!realtimeEnabled || !id) return;
    
    const channel = supabase
      .channel(`${table}-item-${id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: `id=eq.${id}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setItem(payload.new);
          } else if (payload.eventType === 'DELETE') {
            setItem(null);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, id, realtimeEnabled]);
  
  // Função para atualizar o item
  const updateItem = async (updates) => {
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      // Se a sincronização em tempo real estiver desativada, atualizamos manualmente
      if (!realtimeEnabled && data) {
        setItem(data[0]);
      }
      
      return { data: data?.[0], error: null };
    } catch (error) {
      console.error(`Erro ao atualizar item na tabela ${table}:`, error);
      return { data: null, error };
    }
  };
  
  // Função para excluir o item
  const deleteItem = async () => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Se a sincronização em tempo real estiver desativada, atualizamos manualmente
      if (!realtimeEnabled) {
        setItem(null);
      }
      
      return { error: null };
    } catch (error) {
      console.error(`Erro ao excluir item da tabela ${table}:`, error);
      return { error };
    }
  };
  
  return {
    item,
    loading,
    error,
    refresh: loadItem,
    updateItem,
    deleteItem
  };
}
```

## 8. Substituição de Dados de Navegador por RLS e Políticas no Supabase

### 8.1 Configurações de Row Level Security (RLS)

Exemplo de políticas para configurar no Supabase:

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Política para perfis: usuários só podem ver e editar seus próprios perfis
CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Política para preferências: usuários só podem acessar suas próprias preferências
CREATE POLICY "Usuários podem ver suas próprias preferências"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias preferências"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias preferências"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 8.2 Esquema de Banco de Dados para Substituir localStorage

```sql
-- Tabela para perfis de usuários
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Trigger para criar um perfil automaticamente ao criar um usuário
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (new.id, new.email);
  RETURN new;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_profile_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE create_profile_for_user();

-- Tabela para preferências de usuários (substitui localStorage para configurações)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'pt-BR',
  data JSONB DEFAULT '{}'::jsonb, -- Campo flexível para armazenar outras configurações
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Trigger para atualizar o campo updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
```

## 9. Considerações de Desempenho e Otimização

### 9.1 Otimização de Carrregamento Inicial

```jsx
// Exemplo de estratégia híbrida com localStorage + Supabase para otimização
// hooks/useHybridState.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useHybridState(table, column, key, initialValue) {
  const { user } = useAuth();
  const [state, setState] = useState(() => {
    // Carregar inicialmente do localStorage para UI responsiva imediata
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erro ao recuperar estado do localStorage:', error);
      return initialValue;
    }
  });
  
  const [loading, setLoading] = useState(true);
  
  // Carregar dados do Supabase para substituir localStorage
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    const loadFromSupabase = async () => {
      try {
        const { data, error } = await supabase
          .from(table)
          .select(column)
          .eq('user_id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 = Nenhum resultado encontrado
          console.error(`Erro ao carregar dados da tabela ${table}:`, error);
        } else if (data && data[column] !== undefined) {
          // Atualizar estado e localStorage com dados do servidor
          setState(data[column]);
          localStorage.setItem(key, JSON.stringify(data[column]));
        }
      } catch (error) {
        console.error(`Erro ao carregar dados da tabela ${table}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFromSupabase();
  }, [user, table, column, key]);
  
  // Salvar no Supabase e localStorage ao mudar o estado
  const setValue = async (newValue) => {
    // Atualizar estado e localStorage imediatamente para UI responsiva
    setState(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(newValue));
    }
    
    // Salvar no Supabase se o usuário estiver autenticado
    if (user) {
      // Verificar se o registro existe
      const { data, error: checkError } = await supabase
        .from(table)
        .select('id')
        .eq('user_id', user.id);
        
      if (checkError) {
        console.error(`Erro ao verificar existência na tabela ${table}:`, checkError);
        return;
      }
      
      const updateData = {
        [column]: newValue,
        user_id: user.id
      };
      
      if (data && data.length > 0) {
        // Atualizar registro existente
        const { error } = await supabase
          .from(table)
          .update(updateData)
          .eq('user_id', user.id);
          
        if (error) {
          console.error(`Erro ao atualizar dados na tabela ${table}:`, error);
        }
      } else {
        // Inserir novo registro
        const { error } = await supabase
          .from(table)
          .insert([updateData]);
          
        if (error) {
          console.error(`Erro ao inserir dados na tabela ${table}:`, error);
        }
      }
    }
  };
  
  return [state, setValue, loading];
}
```

### 9.2 Otimização de Next.js com Supabase

```jsx
// Exemplo de página otimizada com ISR e Client-side data fetching
// pages/products/[id].js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Função getStaticProps para ISR
export async function getStaticProps({ params }) {
  const { id } = params;
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  return {
    props: {
      initialProduct: product,
    },
    // Revalidar a cada hora
    revalidate: 3600
  };
}

// Função getStaticPaths para ISR
export async function getStaticPaths() {
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('id')
    .eq('featured', true);
    
  // Pré-renderizar apenas produtos em destaque
  const paths = featuredProducts.map((product) => ({
    params: { id: product.id.toString() }
  }));
  
  return {
    paths,
    fallback: 'blocking'
  };
}

export default function ProductPage({ initialProduct }) {
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Atualizar dados em tempo real
    const channel = supabase
      .channel(`product-${product.id}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'products',
          filter: `id=eq.${product.id}`
        },
        (payload) => {
          setProduct(payload.new);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [product.id]);
  
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Preço: {product.price}</p>
      {/* Resto do componente */}
    </div>
  );
}
```

## 10. Migração de Testes

### 10.1 Testes de Componentes com Mocks do Supabase

```javascript
// __tests__/components/Profile.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/hooks/useAuth';
import ProfileComponent from '@/components/Profile';

// Mock do módulo Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    update: jest.fn().mockReturnThis(),
    channel: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn()
          }
        }
      })
    }
  }
}));

// Mock do hook de autenticação
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: 'test-user-id' },
    loading: false
  })
}));

describe('Profile Component', () => {
  beforeEach(() => {
    // Configurar mock do Supabase para cada teste
    const { supabase } = require('@/lib/supabase');
    
    // Mock de retorno do perfil
    supabase.single.mockResolvedValue({
      data: {
        id: 'test-user-id',
        name: 'Teste da Silva',
        bio: 'Bio de teste'
      },
      error: null
    });
    
    // Mock de atualização
    supabase.update.mockResolvedValue({
      data: null,
      error: null
    });
  });
  
  it('renderiza perfil do usuário', async () => {
    render(<ProfileComponent />);
    
    // Verificar se o componente está em estado de carregamento
    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    
    // Esperar pelo carregamento dos dados
    await waitFor(() => {
      expect(screen.getByDisplayValue('Teste da Silva')).toBeInTheDocument();
    });
    
    expect(screen.getByDisplayValue('Bio de teste')).toBeInTheDocument();
  });
  
  it('atualiza perfil após submissão do formulário', async () => {
    const { supabase } = require('@/lib/supabase');
    
    render(<ProfileComponent />);
    
    // Esperar pelo carregamento dos dados
    await waitFor(() => {
      expect(screen.getByDisplayValue('Teste da Silva')).toBeInTheDocument();
    });
    
    // Alterar campos do formulário
    fireEvent.change(screen.getByLabelText(/nome/i), {
      target: { value: 'Nome Atualizado' }
    });
    
    // Submeter formulário
    fireEvent.click(screen.getByText('Salvar'));
    
    // Verificar se a função de atualização foi chamada com os parâmetros corretos
    await waitFor(() => {
      expect(supabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Nome Atualizado'
        })
      );
    });
  });
});
```

### 10.2 Mock de Autenticação para Testes

```javascript
// __tests__/utils/supabaseMock.js
export const createSupabaseMock = (customMocks = {}) => {
  const defaultAuthUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  };

  const defaultMocks = {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { user: defaultAuthUser } },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { user: defaultAuthUser },
        error: null,
      }),
      signUp: jest.fn().mockResolvedValue({
        data: { user: defaultAuthUser },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({
        error: null,
      }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: jest.fn(),
          },
        },
      }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    update: jest.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    insert: jest.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    delete: jest.fn().mockResolvedValue({
      data: null,
      error: null,
    }),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({
        unsubscribe: jest.fn(),
      }),
    }),
    removeChannel: jest.fn(),
  };

  // Mesclar mocks personalizados com os padrões
  const mocks = { ...defaultMocks, ...customMocks };

  // Criar) => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
```

### 2.2 Implementação no _app.js ou layout.js

```javascript
// app/layout.js (App Router)
import { AuthProvider } from '@/hooks/useAuth';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// OU para pages/_app.js (Pages Router)
import { AuthProvider } from '@/hooks/useAuth';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

## 3. Refatoração de Stores/Estado Global

### 3.1 Migrando de localStorage para Supabase (exemplo com Zustand)

Antes (com localStorage):

```javascript
// stores/userStore.js
import create from 'zustand';

export const useUserStore = create((set) => ({
  userData: JSON.parse(localStorage.getItem('userData') || 'null'),
  preferences: JSON.parse(localStorage.getItem('userPreferences') || '{}'),
  
  setUserData: (data) => {
    localStorage.setItem('userData', JSON.stringify(data));
    set({ userData: data });
  },
  
  setPreferences: (prefs) => {
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
    set({ preferences: prefs });
  }
}));
```

Depois (com Supabase):

```javascript
// stores/userStore.js
import create from 'zustand';
import { supabase } from '@/lib/supabase';

export const useUserStore = create((set, get) => ({
  userData: null,
  preferences: {},
  isLoading: false,
  
  // Carregar dados do usuário
  loadUserData: async (userId) => {
    if (!userId) return;
    
    set({ isLoading: true });
    
    // Buscar perfil do usuário
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (userError) console.error('Erro ao carregar dados do usuário:', userError);
    
    // Buscar preferências
    const { data: prefData, error: prefError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (prefError) console.error('Erro ao carregar preferências:', prefError);
    
    set({ 
      userData: userData || null,
      preferences: prefData || {},
      isLoading: false 
    });
  },
  
  // Atualizar dados do usuário
  updateUserData: async (data) => {
    const { userData } = get();
    if (!userData?.id) return;
    
    set({ isLoading: true });
    
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userData.id);
      
    if (!error) {
      set({ userData: { ...get().userData, ...data }, isLoading: false });
    } else {
      console.error('Erro ao atualizar dados:', error);
      set({ isLoading: false });
    }
  },
  
  // Atualizar preferências
  updatePreferences: async (prefs) => {
    const { userData } = get();
    if (!userData?.id) return;
    
    set({ isLoading: true });
    
    const { error } = await supabase
      .from('user_preferences')
      .update(prefs)
      .eq('user_id', userData.id);
      
    if (!error) {
      set({ preferences: { ...get().preferences, ...prefs }, isLoading: false });
    } else {
      console.error('Erro ao atualizar preferências:', error);
      set({ isLoading: false });
    }
  },
  
  // Configurar listeners de tempo real (chamar no componente principal)
  setupRealtimeSubscriptions: (userId) => {
    if (!userId) return null;
    
    // Inscrever-se para atualizações no perfil
    const profileSubscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          set({ userData: payload.new });
        }
      )
      .subscribe();
      
    // Inscrever-se para atualizações nas preferências
    const prefsSubscription = supabase
      .channel('prefs-changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'user_preferences', filter: `user_id=eq.${userId}` },
        (payload) => {
          set({ preferences: payload.new });
        }
      )
      .subscribe();
      
    // Retorna função para limpar as inscrições
    return () => {
      profileSubscription.unsubscribe();
      prefsSubscription.unsubscribe();
    };
  }
}));
```

### 3.2 Para Redux, use o mesmo padrão com reducers

```javascript
// Redux - refatoração de actions
export const loadUserData = (userId) => async (dispatch) => {
  dispatch({ type: 'USER_DATA_LOADING' });
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) {
    dispatch({ type: 'USER_DATA_ERROR', payload: error });
  } else {
    dispatch({ type: 'USER_DATA_SUCCESS', payload: data });
  }
};

// Semelhante para outras actions
```

## 4. Refatoração de Componentes

### 4.1 Componente que usava localStorage

Antes:

```jsx
// components/UserProfile.jsx
import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    setProfile(userData);
  }, []);
  
  const updateProfile = (newData) => {
    const updated = { ...profile, ...newData };
    localStorage.setItem('userData', JSON.stringify(updated));
    setProfile(updated);
  };
  
  if (!profile) return <div>Carregando...</div>;
  
  return (
    <div>
      <h1>{profile.name}</h1>
      <button onClick={() => updateProfile({ visits: (profile.visits || 0) + 1 })}>
        Incrementar visitas
      </button>
      <p>Visitas: {profile.visits || 0}</p>
    </div>
  );
}
```

Depois (com Supabase e hooks customizados):

```jsx
// components/UserProfile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;
    
    // Carregar perfil
    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Erro ao carregar perfil:', error);
      } else {
        setProfile(data);
      }
      
      setLoading(false);
    };
    
    loadProfile();
    
    // Configurar listener para atualizações em tempo real
    const subscription = supabase
      .channel('profile-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [user]);
  
  const updateProfile = async (newData) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('profiles')
      .update(newData)
      .eq('id', user.id);
      
    if (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };
  
  if (loading) return <div>Carregando...</div>;
  if (!profile) return <div>Perfil não encontrado</div>;
  
  return (
    <div>
      <h1>{profile.name}</h1>
      <button onClick={() => updateProfile({ visits: (profile.visits || 0) + 1 })}>
        Incrementar visitas
      </button>
      <p>Visitas: {profile.visits || 0}</p>
    </div>
  );
}
```

### 4.2 Server Component (Next.js 13+ App Router)

```jsx
// app/profile/page.jsx
import { createServerClient } from '@/lib/supabase-server';
import ProfileClient from './client-component';

export default async function ProfilePage() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    // Tratamento para usuário não autenticado
    return <div>Por favor, faça login para ver esta página</div>;
  }
  
  // Buscar dados no servidor
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  
  // Passar dados iniciais para o componente client
  return <ProfileClient initialProfile={profile} />;
}
```

```jsx
// app/profile/client-component.jsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function ProfileClient({ initialProfile }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(initialProfile);
  
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel('profile-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [user]);
  
  // Resto do componente...
}
```

## 5. Refatoração de Hooks Customizados

### 5.1 Hook de Dados Persistentes

Antes (com localStorage):

```javascript
// hooks/usePersistentState.js
import { useState, useEffect } from 'react';

export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erro ao recuperar estado do localStorage:', error);
      return initialValue;
    }
  });
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);
  
  return [state, setState];
}
```

Depois (com Supabase):

```javascript
// hooks/useSupabaseState.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useSupabaseState(table, column, initialValue, whereClause = {}) {
  const { user } = useAuth();
  const [state, setState] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  
  // Função para carregar dados do Supabase
  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Adicione o ID do usuário às condições de consulta
    const query = supabase
      .from(table)
      .select(column)
      .eq('user_id', user.id);
    
    // Adicione quaisquer cláusulas where adicionais
    Object.entries(whereClause).forEach(([key, value]) => {
      query.eq(key, value);
    });
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error(`Erro ao carregar dados da tabela ${table}:`, error);
      setLoading(false);
      return;
    }
    
    setState(data?.[column] || initialValue);
    setLoading(false);
  };
  
  // Função para salvar dados no Supabase
  const saveData = async (newValue) => {
    if (!user) return;
    
    setState(newValue); // Atualiza o estado localmente imediatamente
    
    // Construir objeto para atualização
    const updateData = {
      [column]: newValue,
      user_id: user.id,
      ...whereClause
    };
    
    // Verificar se o registro existe
    const { data, error: checkError } = await supabase
      .from(table)
      .select('id')
      .eq('user_id', user.id);
      
    if (checkError) {
      console.error(`Erro ao verificar existência na tabela ${table}:`, checkError);
      return;
    }
    
    if (data && data.length > 0) {
      // Atualizar registro existente
      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('user_id', user.id);
        
      if (error) {
        console.error(`Erro ao atualizar dados na tabela ${table}:`, error);
      }
    } else {
      // Inserir novo registro
      const { error } = await supabase
        .from(table)
        .insert([updateData]);
        
      if (error) {
        console.error(`Erro ao inserir dados na tabela ${table}:`, error);
      }
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [user]);
  
  // Configurar listener para atualizações em tempo real
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: table,
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          if (payload.new && payload.new[column] !== undefined) {
            setState(payload.new[column]);
          }
        }
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [user, table, column]);
  
  return [state, saveData, loading];
}
```

### 5.2 Hook de Tema/Preferências

Antes:

```javascript
// hooks/useTheme.js
import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    return localStorage.getItem('theme') || 'light';
  });
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);
  
  return { theme, toggleTheme };
}
```

Depois:

```javascript
// hooks/useTheme.js
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export function useTheme() {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);
  
  // Carregar tema das preferências do usuário
  useEffect(() => {
    const loadTheme = async () => {
      // Para usuários não autenticados, usar localStorage como fallback
      if (!user) {
        if (typeof window !== 'undefined') {
          const savedTheme = localStorage.getItem('theme') || 'light';
          setTheme(savedTheme);
          document.documentElement.setAttribute('data-theme', savedTheme);
        }
        setLoading(false);
        return;
      }
      
      // Para usuários autenticados, buscar do Supabase
      const { data, error } = await supabase
        .from('user_preferences')
        .select('theme')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('Erro ao carregar tema:', error);
        // Fallback para localStorage
        if (typeof window !== 'undefined') {
          const savedTheme = localStorage.getItem('theme') || 'light';
          setTheme(savedTheme);
          document.documentElement.setAttribute('data-theme', savedTheme);
        }
      } else {
        const savedTheme = data?.theme || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
      
      setLoading(false);
    };
    
    loadTheme();
  }, [user]);
  
  // Configurar listener para mudanças em tempo real
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel('theme-changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'user_preferences',
          filter: `user_id=eq.${user.id}` 
        },
        (payload) => {
          if (payload.new && payload.new.theme) {
            setTheme(payload.new.theme);
            document.documentElement.setAttribute('data-theme', payload.new.theme);
          }
        }
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [user]);
  
  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Atualizar localmente primeiro para UI responsiva
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Persistir para usuários não autenticados
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    
    // Persistir para usuários autenticados
    if (user) {
      const { error: checkError, data } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id);
        
      if (checkError) {
        console.error('Erro ao verificar preferências existentes:', checkError);
        return;
      }
      
      if (data && data.length > 0) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('user_preferences')
          .update({ theme: newTheme })
          .eq('user_id', user.id);
          
        if (error) console.error('Erro ao atualizar tema:', error);
      } else {
        // Inserir novo registro
        const { error } = await supabase
          .from('user_preferences')
          .insert([{ user_id: user.id, theme: newTheme }]);
          
        if (error) console.error('Erro ao salvar tema:', error);
      }
    }
  };
  
  return { theme, toggleTheme, loading };
}
```

## 6. Refatoração de Pages

### 6.1 Página de Perfil

Antes (com localStorage):

```jsx
// pages/profile.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem('userData') || 'null');
    setProfile(userData);
  }, [router]);
  
  const updateProfile = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const bio = formData.get('bio');
    
    const updatedProfile = { ...profile, name, bio };
    localStorage.setItem('userData', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  };
  
  if (!profile) return <div>Carregando...</div>;
  
  return (
    <div>
      <h1>Perfil</h1>
      <form onSubmit={updateProfile}>
        <label>
          Nome:
          <input name="name" defaultValue={profile.name} />
        </label>
        <label>
          Bio:
          <textarea name="bio" defaultValue={profile.bio} />
        </label>
        <button type="submit">Salvar</button>
      </form>
    </div>
  );
}
```

Depois (com Supabase):

```jsx
// pages/profile.js (Pages Router)
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Redirecionar se não estiver autenticado
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    // Carregar perfil
    const loadProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Erro ao carregar perfil:', error);
      } else {
        setProfile(data);
      }
      
      setLoading(false);
    };
    
    if (user) {
      loadProfile();
    }
  }, [user, authLoading, router]);
  
  // Configurar listener para atualizações em tempo real
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel('profile-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();
      
    return () => subscription.unsubscribe();
  }, [user]);
  
  const updateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const bio = formData.get('bio');
    
    const { error } = await supabase
      .from('profiles')
      .update({ name, bio })
      .eq('id', user.id);
      
    if (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao salvar perfil. Tente novamente.');
    } else {
      // O setProfile não é necessário aqui se o listener estiver funcionando
      // mas é útil para atualizações imediatas na UI
      setProfile({ ...profile, name, bio });
    }
    
    setSaving(false);
  };
  
  if (authLoading || loading) return <div>Carregando...</div>;
  if (!profile) return <div>Perfil não encontrado</div>;
  
  return (