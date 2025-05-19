import { useState, useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { toast } from 'react-hot-toast';

export interface NotaAutoconhecimento {
  id: string;
  categoria: string;
  titulo: string;
  conteudo: string;
  created_at?: string;
  updated_at?: string;
}

export const useNotasAutoconhecimento = () => {
  const [notas, setNotas] = useState<NotaAutoconhecimento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const supabase = useSupabaseClient();
  const user = useUser();

  // Buscar todas as notas do usuário
  const fetchNotas = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setIsError(false);
    
    try {
      const { data, error } = await supabase
        .from('notas_autoconhecimento')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setNotas(data || []);
    } catch (error) {
      console.error('Erro ao buscar notas:', error);
      setIsError(true);
      toast.error('Não foi possível carregar suas notas');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar notas por categoria
  const fetchNotasPorCategoria = async (categoria: string) => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('notas_autoconhecimento')
        .select('*')
        .eq('user_id', user.id)
        .eq('categoria', categoria)
        .order('updated_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar notas da categoria ${categoria}:`, error);
      toast.error(`Não foi possível carregar suas notas de ${categoria}`);
      return [];
    }
  };

  // Adicionar nova nota
  const adicionarNota = async (nota: Omit<NotaAutoconhecimento, 'id'>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('notas_autoconhecimento')
        .insert([{ ...nota, user_id: user.id }])
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setNotas(prev => [data, ...prev]);
      toast.success('Nota adicionada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      toast.error('Não foi possível adicionar a nota');
      return null;
    }
  };

  // Atualizar nota existente
  const atualizarNota = async (id: string, dadosAtualizados: Partial<NotaAutoconhecimento>) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('notas_autoconhecimento')
        .update({ ...dadosAtualizados, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setNotas(prev => prev.map(nota => nota.id === id ? data : nota));
      toast.success('Nota atualizada com sucesso');
      return data;
    } catch (error) {
      console.error('Erro ao atualizar nota:', error);
      toast.error('Não foi possível atualizar a nota');
      return null;
    }
  };

  // Excluir nota
  const excluirNota = async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('notas_autoconhecimento')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      }
      
      setNotas(prev => prev.filter(nota => nota.id !== id));
      toast.success('Nota excluída com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      toast.error('Não foi possível excluir a nota');
      return false;
    }
  };

  // Carregar notas quando o componente for montado
  useEffect(() => {
    if (user) {
      fetchNotas();
    }
  }, [user]);

  return {
    notas,
    isLoading,
    isError,
    fetchNotas,
    fetchNotasPorCategoria,
    adicionarNota,
    atualizarNota,
    excluirNota
  };
}; 