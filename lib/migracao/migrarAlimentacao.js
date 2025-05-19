'use client'

import { supabase } from '@/lib/supabase';

/**
 * Migra os dados de alimentação do localStorage para o Supabase
 * @param {Object} user - Usuário autenticado no Supabase
 * @returns {Promise<{success: boolean, message: string}>} - Resultado da migração
 */
export async function migrarDadosAlimentacao(user) {
  if (!user) {
    return { success: false, message: 'Usuário não autenticado' };
  }

  try {
    // Obter dados do localStorage
    const alimentacaoData = localStorage.getItem('alimentacao-storage');
    
    if (!alimentacaoData) {
      return { success: true, message: 'Nenhum dado de alimentação encontrado para migrar' };
    }
    
    const { state } = JSON.parse(alimentacaoData);
    
    if (!state) {
      return { success: true, message: 'Formato de dados inválido no localStorage' };
    }
    
    // Migrar refeições planejadas
    if (state.refeicoes && Array.isArray(state.refeicoes)) {
      const hoje = new Date().toISOString();
      
      for (const refeicao of state.refeicoes) {
        const { data, error } = await supabase
          .from('refeicoes')
          .insert({
            user_id: user.id,
            tipo: 'planejada',
            data: hoje,
            horario: refeicao.horario,
            descricao: refeicao.descricao,
          });
          
        if (error) {
          console.error('Erro ao migrar refeição planejada:', error);
        }
      }
    }
    
    // Migrar registros de refeições
    if (state.registros && Array.isArray(state.registros)) {
      for (const registro of state.registros) {
        const { data, error } = await supabase
          .from('refeicoes')
          .insert({
            user_id: user.id,
            tipo: 'realizada',
            data: registro.data ? new Date(registro.data).toISOString() : new Date().toISOString(),
            horario: registro.horario,
            descricao: registro.descricao,
            tipo_icone: registro.tipoIcone,
            foto: registro.foto
          });
          
        if (error) {
          console.error('Erro ao migrar registro de refeição:', error);
        }
      }
    }
    
    // Migrar dados de hidratação
    if (state.coposBebidos !== undefined || state.metaDiaria !== undefined) {
      const hoje = new Date().toISOString().split('T')[0];
      const coposMl = 250; // Aproximadamente
      
      const { data, error } = await supabase
        .from('hidratacao')
        .insert({
          user_id: user.id,
          data: hoje,
          quantidade_ml: (state.coposBebidos || 0) * coposMl,
          meta_diaria_ml: (state.metaDiaria || 8) * coposMl,
          ultimo_registro: state.ultimoRegistro || null
        });
        
      if (error) {
        console.error('Erro ao migrar dados de hidratação:', error);
      }
    }
    
    return { 
      success: true, 
      message: 'Dados de alimentação migrados com sucesso' 
    };
    
  } catch (error) {
    console.error('Erro ao migrar dados de alimentação:', error);
    return { 
      success: false, 
      message: `Erro ao migrar dados: ${error.message}` 
    };
  }
} 