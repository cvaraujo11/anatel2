import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type TemporizadorLazerState = {
  isActive: boolean;
  timeRemaining: number; // em segundos
  duration: number; // em segundos
  atividade: string | null;
  lastSyncTime: number; // timestamp em milissegundos
};

export function useTemporizadorLazer() {
  const [state, setState] = useState<TemporizadorLazerState>({
    isActive: false,
    timeRemaining: 0,
    duration: 15 * 60, // 15 minutos padrão
    atividade: null,
    lastSyncTime: Date.now()
  });
  
  const supabase = createClientComponentClient();
  
  // Carregar o estado do temporizador do Supabase ao inicializar
  useEffect(() => {
    const fetchTemporizadorState = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        const { data, error } = await supabase
          .from('user_preferences')
          .select('temporizador_lazer_state')
          .eq('user_id', user.id)
          .single();
        
        if (error || !data) return;
        
        // Se existir um estado salvo e o temporizador estava ativo
        if (data.temporizador_lazer_state && data.temporizador_lazer_state.isActive) {
          const savedState = data.temporizador_lazer_state as TemporizadorLazerState;
          const elapsedTime = Math.floor((Date.now() - savedState.lastSyncTime) / 1000);
          
          // Se o tempo já expirou, não restaurar o temporizador
          if (savedState.timeRemaining <= elapsedTime) {
            await syncTemporizadorState({
              isActive: false,
              timeRemaining: 0,
              duration: savedState.duration,
              atividade: savedState.atividade,
              lastSyncTime: Date.now()
            });
          } else {
            // Caso contrário, restaurar com o tempo ajustado
            setState({
              ...savedState,
              timeRemaining: savedState.timeRemaining - elapsedTime,
              lastSyncTime: Date.now()
            });
          }
        }
      } catch (err) {
        console.error('Erro ao carregar estado do temporizador:', err);
      }
    };
    
    fetchTemporizadorState();
  }, [supabase]);
  
  // Sincronizar o estado com o Supabase
  const syncTemporizadorState = async (newState: TemporizadorLazerState) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { error } = await supabase
        .from('user_preferences')
        .update({ temporizador_lazer_state: newState })
        .eq('user_id', user.id);
      
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao sincronizar temporizador:', err);
    }
  };
  
  // Efeito para decrementar o tempo a cada segundo se estiver ativo
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (state.isActive && state.timeRemaining > 0) {
      interval = setInterval(() => {
        setState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          
          // Se o temporizador chegou a zero, desativar
          if (newTimeRemaining <= 0) {
            // Sincronizar com o servidor quando finalizar
            syncTemporizadorState({
              ...prev,
              isActive: false,
              timeRemaining: 0,
              lastSyncTime: Date.now()
            });
            
            return {
              ...prev,
              isActive: false,
              timeRemaining: 0,
              lastSyncTime: Date.now()
            };
          }
          
          return {
            ...prev,
            timeRemaining: newTimeRemaining
          };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isActive, state.timeRemaining]);
  
  // Sincronizar com o servidor periodicamente (a cada 30 segundos)
  useEffect(() => {
    let syncInterval: NodeJS.Timeout | null = null;
    
    if (state.isActive) {
      syncInterval = setInterval(() => {
        syncTemporizadorState({
          ...state,
          lastSyncTime: Date.now()
        });
      }, 30000); // 30 segundos
    }
    
    return () => {
      if (syncInterval) clearInterval(syncInterval);
    };
  }, [state]);
  
  // Iniciar o temporizador com uma duração específica
  const iniciarTemporizador = (minutos: number, atividade: string | null = null) => {
    const newState = {
      isActive: true,
      timeRemaining: minutos * 60,
      duration: minutos * 60,
      atividade,
      lastSyncTime: Date.now()
    };
    
    setState(newState);
    syncTemporizadorState(newState);
  };
  
  // Pausar o temporizador
  const pausarTemporizador = () => {
    setState(prev => {
      const newState = {
        ...prev,
        isActive: false,
        lastSyncTime: Date.now()
      };
      
      syncTemporizadorState(newState);
      return newState;
    });
  };
  
  // Retomar o temporizador
  const retomarTemporizador = () => {
    setState(prev => {
      const newState = {
        ...prev,
        isActive: true,
        lastSyncTime: Date.now()
      };
      
      syncTemporizadorState(newState);
      return newState;
    });
  };
  
  // Reiniciar o temporizador com a mesma duração
  const reiniciarTemporizador = () => {
    setState(prev => {
      const newState = {
        ...prev,
        isActive: true,
        timeRemaining: prev.duration,
        lastSyncTime: Date.now()
      };
      
      syncTemporizadorState(newState);
      return newState;
    });
  };
  
  // Cancelar o temporizador
  const cancelarTemporizador = () => {
    setState(prev => {
      const newState = {
        ...prev,
        isActive: false,
        timeRemaining: 0,
        lastSyncTime: Date.now()
      };
      
      syncTemporizadorState(newState);
      return newState;
    });
  };
  
  return {
    isActive: state.isActive,
    timeRemaining: state.timeRemaining,
    duration: state.duration,
    atividade: state.atividade,
    minutosRestantes: Math.floor(state.timeRemaining / 60),
    segundosRestantes: state.timeRemaining % 60,
    porcentagemConcluida: (1 - state.timeRemaining / state.duration) * 100,
    iniciarTemporizador,
    pausarTemporizador,
    retomarTemporizador,
    reiniciarTemporizador,
    cancelarTemporizador
  };
} 