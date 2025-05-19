import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRealtimeData } from './useRealtimeData';

export type SugestaoDescanso = {
  id: string;
  descricao: string;
  favorita: boolean;
  created_at: string;
};

export function useSugestoesDescanso() {
  const [sugestoes, setSugestoes] = useState<SugestaoDescanso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchSugestoes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('sugestoes_descanso')
        .select('*')
        .order('favorita', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setSugestoes(data || []);
    } catch (err) {
      console.error('Erro ao buscar sugestões de descanso:', err);
      setError('Falha ao carregar suas sugestões de descanso. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar escuta em tempo real para sugestões de descanso
  useRealtimeData('sugestoes_descanso', fetchSugestoes);

  // Adicionar uma nova sugestão de descanso
  const adicionarSugestao = async (descricao: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('sugestoes_descanso')
        .insert([{
          descricao,
          favorita: false
        }]);
      
      if (error) throw error;
      
      // A atualização será feita pelo listener em tempo real
    } catch (err) {
      console.error('Erro ao adicionar sugestão de descanso:', err);
      setError('Falha ao adicionar a sugestão. Tente novamente.');
      throw err;
    }
  };

  // Remover uma sugestão de descanso
  const removerSugestao = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('sugestoes_descanso')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // A atualização será feita pelo listener em tempo real
    } catch (err) {
      console.error('Erro ao remover sugestão de descanso:', err);
      setError('Falha ao remover a sugestão. Tente novamente.');
      throw err;
    }
  };

  // Marcar ou desmarcar uma sugestão como favorita
  const toggleFavorita = async (id: string, isFavorita: boolean) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('sugestoes_descanso')
        .update({ favorita: isFavorita })
        .eq('id', id);
      
      if (error) throw error;
      
      // A atualização será feita pelo listener em tempo real
    } catch (err) {
      console.error('Erro ao atualizar sugestão de descanso:', err);
      setError('Falha ao atualizar a sugestão. Tente novamente.');
      throw err;
    }
  };

  return {
    sugestoes,
    isLoading,
    error,
    adicionarSugestao,
    removerSugestao,
    toggleFavorita,
    recarregarSugestoes: fetchSugestoes
  };
} 