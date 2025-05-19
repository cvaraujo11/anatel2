'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRealtimeData } from '@/lib/hooks/useRealtimeData';

export function useRefeicoes() {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);
  
  // Usar o hook de dados em tempo real para refeições planejadas
  const { 
    data: refeicoesPlanejadas, 
    loading: loadingPlanejadas, 
    error: errorPlanejadas,
    addItem: adicionarRefeicaoPlanejada,
    updateItem: atualizarRefeicaoPlanejada,
    deleteItem: removerRefeicaoPlanejada
  } = useRealtimeData('refeicoes', 
    (query) => query.eq('tipo', 'planejada'),
    { realtimeEnabled: true }
  );
  
  // Usar o hook de dados em tempo real para registros de refeições realizadas
  const { 
    data: refeicoesRegistradas, 
    loading: loadingRegistradas, 
    error: errorRegistradas,
    addItem: adicionarRefeicaoRegistrada,
    deleteItem: removerRefeicaoRegistrada
  } = useRealtimeData('refeicoes', 
    (query) => query.eq('tipo', 'realizada'),
    { realtimeEnabled: true }
  );

  // Verificar se existem refeições planejadas padrão, senão criar
  useEffect(() => {
    const criarRefeicoesIniciais = async () => {
      if (!user || initialized || loadingPlanejadas || refeicoesPlanejadas.length > 0) return;
      
      setInitialized(true);

      const refeicoesIniciais = [
        { horario: '07:30', descricao: 'Café da manhã' },
        { horario: '12:00', descricao: 'Almoço' },
        { horario: '16:00', descricao: 'Lanche da tarde' },
        { horario: '19:30', descricao: 'Jantar' },
      ];

      // Adicionar as refeições iniciais
      for (const refeicao of refeicoesIniciais) {
        await adicionarRefeicaoPlanejada({
          tipo: 'planejada',
          data: new Date().toISOString(),
          horario: refeicao.horario,
          descricao: refeicao.descricao
        });
      }
    };

    criarRefeicoesIniciais();
  }, [user, initialized, loadingPlanejadas, refeicoesPlanejadas, adicionarRefeicaoPlanejada]);
  
  // Função para adicionar uma refeição planejada
  const adicionarRefeicao = async (horario, descricao) => {
    return await adicionarRefeicaoPlanejada({
      tipo: 'planejada',
      data: new Date().toISOString(),
      horario,
      descricao
    });
  };
  
  // Função para atualizar uma refeição planejada
  const atualizarRefeicao = async (id, horario, descricao) => {
    return await atualizarRefeicaoPlanejada(id, {
      horario,
      descricao
    });
  };
  
  // Função para remover uma refeição planejada
  const removerRefeicao = async (id) => {
    return await removerRefeicaoPlanejada(id);
  };
  
  // Função para adicionar um registro de refeição
  const adicionarRegistro = async (horario, descricao, tipoIcone, foto) => {
    return await adicionarRefeicaoRegistrada({
      tipo: 'realizada',
      data: new Date().toISOString(),
      horario,
      descricao,
      tipo_icone: tipoIcone,
      foto
    });
  };
  
  // Função para remover um registro de refeição
  const removerRegistro = async (id) => {
    return await removerRefeicaoRegistrada(id);
  };
  
  return {
    // Dados
    refeicoes: refeicoesPlanejadas,
    registros: refeicoesRegistradas,
    loading: loadingPlanejadas || loadingRegistradas,
    error: errorPlanejadas || errorRegistradas,
    
    // Funções para refeições planejadas
    adicionarRefeicao,
    atualizarRefeicao,
    removerRefeicao,
    
    // Funções para registros de refeições
    adicionarRegistro,
    removerRegistro
  };
} 