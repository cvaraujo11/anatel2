'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';

export function useHidratacao() {
  const { user } = useAuth();
  const [hidratacao, setHidratacao] = useState({
    coposBebidos: 0,
    metaDiaria: 8,
    ultimoRegistro: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    const loadHidratacao = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Buscar registro do dia atual
        const hoje = new Date().toISOString().split('T')[0];
        
        const { data, error } = await supabase
          .from('hidratacao')
          .select('*')
          .eq('user_id', user.id)
          .eq('data', hoje)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            // Registro não encontrado, criar novo
            const novoRegistro = {
              user_id: user.id,
              data: hoje,
              quantidade_ml: 0,
              meta_diaria_ml: 2000, // 8 copos de ~250ml
              copos_bebidos: 0,
              ultimo_registro: null
            };
            
            const { data: novoData, error: novoError } = await supabase
              .from('hidratacao')
              .insert([novoRegistro])
              .select()
              .single();
              
            if (novoError) throw novoError;
            
            setHidratacao({
              coposBebidos: 0,
              metaDiaria: 8,
              ultimoRegistro: null
            });
          } else {
            throw error;
          }
        } else {
          // Converter ml para copos (aproximadamente)
          const coposMl = 250;
          setHidratacao({
            coposBebidos: Math.floor(data.quantidade_ml / coposMl),
            metaDiaria: Math.floor(data.meta_diaria_ml / coposMl),
            ultimoRegistro: data.ultimo_registro
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dados de hidratação:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHidratacao();
  }, [user]);

  // Configurar listener para atualizações em tempo real
  useEffect(() => {
    if (!user) return;
    
    const hoje = new Date().toISOString().split('T')[0];
    
    const channel = supabase
      .channel(`hidratacao-changes-${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*',
          schema: 'public', 
          table: 'hidratacao',
          filter: `user_id=eq.${user.id} AND data=eq.${hoje}`
        },
        (payload) => {
          if (payload.new) {
            const coposMl = 250;
            setHidratacao({
              coposBebidos: Math.floor(payload.new.quantidade_ml / coposMl),
              metaDiaria: Math.floor(payload.new.meta_diaria_ml / coposMl),
              ultimoRegistro: payload.new.ultimo_registro
            });
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Função para adicionar um copo de água
  const adicionarCopo = async () => {
    if (!user) return;
    if (hidratacao.coposBebidos >= hidratacao.metaDiaria) return;
    
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const ultimoRegistro = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const novoValorCopos = hidratacao.coposBebidos + 1;
      const coposMl = 250;
      
      // Atualizar estado local imediatamente para feedback visual rápido
      setHidratacao({
        ...hidratacao,
        coposBebidos: novoValorCopos,
        ultimoRegistro
      });
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('hidratacao')
        .update({
          quantidade_ml: novoValorCopos * coposMl,
          ultimo_registro: ultimoRegistro
        })
        .eq('user_id', user.id)
        .eq('data', hoje);
        
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao adicionar copo:', err);
      // Reverter estado local em caso de erro
      setHidratacao({
        ...hidratacao,
        coposBebidos: hidratacao.coposBebidos
      });
      setError(err.message);
    }
  };

  // Função para remover um copo de água
  const removerCopo = async () => {
    if (!user) return;
    if (hidratacao.coposBebidos <= 0) return;
    
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const novoValorCopos = Math.max(0, hidratacao.coposBebidos - 1);
      const coposMl = 250;
      
      // Atualizar estado local imediatamente para feedback visual rápido
      setHidratacao({
        ...hidratacao,
        coposBebidos: novoValorCopos
      });
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('hidratacao')
        .update({
          quantidade_ml: novoValorCopos * coposMl
        })
        .eq('user_id', user.id)
        .eq('data', hoje);
        
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao remover copo:', err);
      // Reverter estado local em caso de erro
      setHidratacao({
        ...hidratacao,
        coposBebidos: hidratacao.coposBebidos
      });
      setError(err.message);
    }
  };

  // Função para ajustar a meta diária
  const ajustarMeta = async (valor) => {
    if (!user) return;
    const novaMeta = hidratacao.metaDiaria + valor;
    
    if (novaMeta < 1 || novaMeta > 15) return;
    
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const coposMl = 250;
      
      // Atualizar estado local imediatamente para feedback visual rápido
      setHidratacao({
        ...hidratacao,
        metaDiaria: novaMeta
      });
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('hidratacao')
        .update({
          meta_diaria_ml: novaMeta * coposMl
        })
        .eq('user_id', user.id)
        .eq('data', hoje);
        
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao ajustar meta:', err);
      // Reverter estado local em caso de erro
      setHidratacao({
        ...hidratacao,
        metaDiaria: hidratacao.metaDiaria
      });
      setError(err.message);
    }
  };

  return {
    hidratacao,
    loading,
    error,
    adicionarCopo,
    removerCopo,
    ajustarMeta
  };
} 