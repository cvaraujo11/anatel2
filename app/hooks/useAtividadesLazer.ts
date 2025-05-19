import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRealtimeData } from './useRealtimeData';

export type AtividadeLazer = {
  id: string;
  nome: string;
  categoria: string | null;
  duracao_minutos: number | null;
  created_at: string;
};

export function useAtividadesLazer() {
  const [atividades, setAtividades] = useState<AtividadeLazer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const fetchAtividades = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('atividades_lazer')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAtividades(data || []);
    } catch (err) {
      console.error('Erro ao buscar atividades de lazer:', err);
      setError('Falha ao carregar suas atividades de lazer. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Configurar escuta em tempo real para atividades de lazer
  useRealtimeData('atividades_lazer', fetchAtividades);

  // Adicionar uma nova atividade de lazer
  const adicionarAtividade = async (atividade: Omit<AtividadeLazer, 'id' | 'created_at'>) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('atividades_lazer')
        .insert([atividade]);
      
      if (error) throw error;
      
      // A atualização será feita pelo listener em tempo real
    } catch (err) {
      console.error('Erro ao adicionar atividade de lazer:', err);
      setError('Falha ao adicionar a atividade. Tente novamente.');
      throw err;
    }
  };

  // Remover uma atividade de lazer
  const removerAtividade = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('atividades_lazer')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // A atualização será feita pelo listener em tempo real
    } catch (err) {
      console.error('Erro ao remover atividade de lazer:', err);
      setError('Falha ao remover a atividade. Tente novamente.');
      throw err;
    }
  };

  // Atualizar uma atividade de lazer
  const atualizarAtividade = async (id: string, dados: Partial<Omit<AtividadeLazer, 'id' | 'created_at'>>) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('atividades_lazer')
        .update(dados)
        .eq('id', id);
      
      if (error) throw error;
      
      // A atualização será feita pelo listener em tempo real
    } catch (err) {
      console.error('Erro ao atualizar atividade de lazer:', err);
      setError('Falha ao atualizar a atividade. Tente novamente.');
      throw err;
    }
  };

  return {
    atividades,
    isLoading,
    error,
    adicionarAtividade,
    removerAtividade,
    atualizarAtividade,
    recarregarAtividades: fetchAtividades
  };
} 