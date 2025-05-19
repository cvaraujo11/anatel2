import { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export type Concurso = {
  id: string;
  titulo: string;
  organizadora?: string;
  data_prova?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type ConteudoProgramatico = {
  id: string;
  concurso_id: string;
  descricao: string;
  progresso: number;
  created_at?: string;
};

export function useConcursos() {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  // Buscar todos os concursos do usuário
  const fetchConcursos = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('concursos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setConcursos(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Adicionar novo concurso
  const adicionarConcurso = async (concurso: Omit<Concurso, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const { data, error } = await supabase
        .from('concursos')
        .insert([
          { ...concurso, user_id: user.id }
        ])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setConcursos(prev => [data, ...prev]);
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  // Importar concurso a partir de JSON
  const importarConcursoJSON = async (concursoData: any, conteudoData: any[] = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Primeiro inserir o concurso
      const { data: concurso, error: concursoError } = await supabase
        .from('concursos')
        .insert([
          { 
            titulo: concursoData.titulo, 
            organizadora: concursoData.organizadora,
            data_prova: concursoData.data_prova,
            status: concursoData.status || 'Planejado',
            user_id: user.id 
          }
        ])
        .select()
        .single();
        
      if (concursoError) {
        throw concursoError;
      }
      
      // Se tiver conteúdo programático, inserir também
      if (conteudoData && conteudoData.length > 0) {
        const conteudosComId = conteudoData.map(c => ({
          ...c,
          concurso_id: concurso.id
        }));
        
        const { error: conteudoError } = await supabase
          .from('conteudo_programatico')
          .insert(conteudosComId);
          
        if (conteudoError) {
          throw conteudoError;
        }
      }
      
      // Atualizar o estado local
      setConcursos(prev => [concurso, ...prev]);
      
      // Retornar o ID do concurso criado para redirecionamento
      return concurso.id;
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  // Calcular progresso do concurso
  const calcularProgresso = async (concursoId: string) => {
    try {
      const { data, error } = await supabase
        .from('conteudo_programatico')
        .select('progresso')
        .eq('concurso_id', concursoId);
        
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        return 0;
      }
      
      const total = data.length;
      const progresso = data.reduce((acc, item) => acc + item.progresso, 0);
      
      return Math.round((progresso / (total * 100)) * 100);
    } catch (e: any) {
      setError(e.message);
      return 0;
    }
  };

  // Carregar concursos ao inicializar
  useEffect(() => {
    fetchConcursos();
  }, [fetchConcursos]);

  return {
    concursos,
    loading,
    error,
    fetchConcursos,
    adicionarConcurso,
    importarConcursoJSON,
    calcularProgresso,
  };
} 