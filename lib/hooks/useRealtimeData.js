'use client'

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/hooks/useAuth';

export function useRealtimeData(table, queryBuilder = null, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  
  const { realtimeEnabled = true } = options;
  
  // Função para carregar dados
  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Criar consulta base
      let query = supabase.from(table).select('*').eq('user_id', user.id);
      
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
    if (user) {
      loadData();
    }
  }, [user, table]);
  
  // Configurar sincronização em tempo real
  useEffect(() => {
    if (!realtimeEnabled || !user) return;
    
    // Criar filtros de canal específicos para o usuário atual
    const channelFilter = `user_id=eq.${user.id}`;
    
    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel(`${table}-changes-${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', // ou especificar: 'INSERT', 'UPDATE', 'DELETE'
          schema: 'public', 
          table: table,
          filter: channelFilter
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
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, table, realtimeEnabled]);
  
  // Função para adicionar um item
  const addItem = async (item) => {
    if (!user) return { data: null, error: new Error('Usuário não autenticado') };
    
    try {
      const itemWithUserId = {
        ...item,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from(table)
        .insert([itemWithUserId])
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
    if (!user) return { data: null, error: new Error('Usuário não autenticado') };
    
    try {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
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
    if (!user) return { error: new Error('Usuário não autenticado') };
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
        
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