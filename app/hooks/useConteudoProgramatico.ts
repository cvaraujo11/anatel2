import { useCallback, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ConteudoProgramatico } from './useConcursos';

export function useConteudoProgramatico(concursoId?: string) {
  const [conteudos, setConteudos] = useState<ConteudoProgramatico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progresso, setProgresso] = useState(0);
  const supabase = createClientComponentClient();

  // Buscar conteúdo programático do concurso
  const fetchConteudos = useCallback(async () => {
    if (!concursoId) {
      setConteudos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('conteudo_programatico')
        .select('*')
        .eq('concurso_id', concursoId)
        .order('created_at', { ascending: true });
        
      if (error) {
        throw error;
      }
      
      setConteudos(data || []);
      
      // Calcular progresso
      if (data && data.length > 0) {
        const totalProgresso = data.reduce((acc, item) => acc + item.progresso, 0);
        const percentual = Math.round((totalProgresso / (data.length * 100)) * 100);
        setProgresso(percentual);
      } else {
        setProgresso(0);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [concursoId, supabase]);

  // Adicionar item ao conteúdo programático
  const adicionarItem = async (descricao: string) => {
    if (!concursoId) {
      throw new Error('ID do concurso não fornecido');
    }

    try {
      const novoItem = {
        concurso_id: concursoId,
        descricao,
        progresso: 0
      };
      
      const { data, error } = await supabase
        .from('conteudo_programatico')
        .insert([novoItem])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setConteudos(prev => [...prev, data]);
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  // Atualizar progresso de um item
  const atualizarProgresso = async (itemId: string, novoProgresso: number) => {
    try {
      const { data, error } = await supabase
        .from('conteudo_programatico')
        .update({ progresso: novoProgresso })
        .eq('id', itemId)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setConteudos(prev => 
        prev.map(item => item.id === itemId ? data : item)
      );
      
      // Recalcular progresso geral
      const novosConteudos = conteudos.map(item => 
        item.id === itemId ? { ...item, progresso: novoProgresso } : item
      );
      
      if (novosConteudos.length > 0) {
        const totalProgresso = novosConteudos.reduce((acc, item) => acc + item.progresso, 0);
        const percentual = Math.round((totalProgresso / (novosConteudos.length * 100)) * 100);
        setProgresso(percentual);
      }
      
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  // Remover item do conteúdo programático
  const removerItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('conteudo_programatico')
        .delete()
        .eq('id', itemId);
        
      if (error) {
        throw error;
      }
      
      const novosConteudos = conteudos.filter(item => item.id !== itemId);
      setConteudos(novosConteudos);
      
      // Recalcular progresso
      if (novosConteudos.length > 0) {
        const totalProgresso = novosConteudos.reduce((acc, item) => acc + item.progresso, 0);
        const percentual = Math.round((totalProgresso / (novosConteudos.length * 100)) * 100);
        setProgresso(percentual);
      } else {
        setProgresso(0);
      }
      
      return true;
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  // Carregar conteúdos ao inicializar ou quando o concursoId mudar
  useEffect(() => {
    fetchConteudos();
  }, [fetchConteudos]);

  // Configurar listener de tempo real para atualizações
  useEffect(() => {
    if (!concursoId) return;

    const channel = supabase
      .channel(`conteudo_${concursoId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'conteudo_programatico',
        filter: `concurso_id=eq.${concursoId}` 
      }, () => {
        fetchConteudos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [concursoId, fetchConteudos, supabase]);

  return {
    conteudos,
    loading,
    error,
    progresso,
    fetchConteudos,
    adicionarItem,
    atualizarProgresso,
    removerItem
  };
} 