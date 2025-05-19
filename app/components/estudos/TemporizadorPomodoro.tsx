'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RefreshCw, Settings, X, Award, Coffee, BookOpen, AlertCircle } from 'lucide-react';
import { usePomodoroStore } from '@/app/stores/pomodoroStore';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/app/components/ui/toast/use-toast';
import { useEstudosData } from '@/app/hooks/useEstudosData';

// Adicionar props para tipo e título opcional
interface TemporizadorPomodoroProps {
  tipo?: 'geral' | 'concurso';
  titulo?: string; // Para personalizar o título se necessário
}

type PomodoroSettings = {
  focusDuration: number;
  breakDuration: number;
  cycles: number;
  sound: boolean;
};

type PomodoroState = {
  isRunning: boolean;
  mode: 'focus' | 'break';
  timeLeft: number;
  currentCycle: number;
  settings: PomodoroSettings;
};

export function TemporizadorPomodoro({ tipo = 'geral', titulo }: TemporizadorPomodoroProps) {
  const { configuracao, atualizarConfiguracao, ciclosCompletos, incrementarCiclosCompletos, resetarCiclosCompletos } = usePomodoroStore();
  const [state, setState] = useState<PomodoroState>({
    isRunning: false,
    mode: 'focus',
    timeLeft: 25 * 60, // 25 minutos em segundos
    currentCycle: 1,
    settings: {
      focusDuration: 25, // minutos
      breakDuration: 5, // minutos
      cycles: 4,
      sound: true
    }
  });
  
  const [syncedWithDb, setSyncedWithDb] = useState(false);
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const { sessaoAtiva, iniciarSessao, finalizarSessao } = useEstudosData();

  const [showSettings, setShowSettings] = useState(false)
  const [configTemp, setConfigTemp] = useState(configuracao)

  useEffect(() => {
    // Reset timer quando a configuração mudar e o timer estiver parado
    if (!state.isRunning) {
      if (state.mode === 'focus') {
        setState(prev => ({
          ...prev,
          timeLeft: state.settings.focusDuration * 60
        }));
      } else if (state.mode === 'break') {
        setState(prev => ({
          ...prev,
          timeLeft: state.settings.breakDuration * 60
        }));
      }
    }
  }, [state.isRunning]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (state.isRunning) {
      interval = setInterval(() => {
        setState(prevState => {
          if (prevState.timeLeft <= 1) {
            // Tocar som de notificação
            if (typeof window !== 'undefined') {
              const audio = new Audio(
                prevState.mode === 'focus' 
                  ? '/sounds/break-start.mp3' 
                  : '/sounds/focus-start.mp3'
              )
              audio.play().catch(() => {
                // Falha silenciosa se o navegador bloquear o áudio
                console.log('Notificação de áudio bloqueada pelo navegador')
              })
            }

            // Alternar entre ciclos
            if (prevState.mode === 'focus') {
              incrementarCiclosCompletos()
              
              // Verificar se deve ser uma pausa longa
              if ((ciclosCompletos + 1) % configuracao.ciclosAntesLongapausa === 0) {
                return {
                  ...prevState,
                  mode: 'break',
                  timeLeft: prevState.settings.breakDuration * 60
                }
              } else {
                return {
                  ...prevState,
                  mode: 'break',
                  timeLeft: prevState.settings.breakDuration * 60
                }
              }
            } else {
              const nextCycle = prevState.currentCycle + 1;
              
              // Se alcançou o número máximo de ciclos
              if (nextCycle > prevState.settings.cycles) {
                return {
                  ...prevState,
                  isRunning: false,
                  mode: 'focus',
                  timeLeft: prevState.settings.focusDuration * 60,
                  currentCycle: 1
                }
              }
              
              // Iniciar uma nova sessão de estudo para o próximo ciclo de foco
              iniciarSessao('Sessão Pomodoro');
              
              return {
                ...prevState,
                mode: 'focus',
                timeLeft: prevState.settings.focusDuration * 60,
                currentCycle: nextCycle
              }
            }
          }
          return {
            ...prevState,
            timeLeft: prevState.timeLeft - 1
          }
        })
      }, 1000)
    } else {
      interval && clearInterval(interval)
    }

    return () => {
      interval && clearInterval(interval)
    }
  }, [state.isRunning, ciclosCompletos, configuracao, incrementarCiclosCompletos, iniciarSessao])

  // Carregar estado do Pomodoro do Supabase
  const loadPomodoroState = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('pomodoro_state')
        .single();
      
      if (error) {
        // Se o erro for 'não encontrado', é normal para usuários novos
        if (error.code !== 'PGRST116') {
          console.error('Erro ao carregar estado do Pomodoro:', error);
        }
        return;
      }
      
      if (data?.pomodoro_state) {
        // Garantir que o timeLeft não seja inválido
        const savedState = data.pomodoro_state as PomodoroState;
        
        // Se estava rodando, verificar quanto tempo se passou desde o último salvamento
        if (savedState.isRunning) {
          // Não continuar rodando automaticamente entre sessões
          savedState.isRunning = false;
        }
        
        setState(savedState);
        setSyncedWithDb(true);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do Pomodoro:', error);
    }
  }, [supabase]);

  // Salvar estado do Pomodoro no Supabase
  const savePomodoroState = useCallback(async (stateToSave: PomodoroState) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ 
          pomodoro_state: stateToSave,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      setSyncedWithDb(true);
    } catch (error) {
      console.error('Erro ao salvar estado do Pomodoro:', error);
      toast({
        title: 'Erro ao sincronizar',
        description: 'Não foi possível salvar o estado do Pomodoro',
        variant: 'destructive',
      });
    }
  }, [supabase, toast]);

  // Carregar dados iniciais
  useEffect(() => {
    loadPomodoroState();
  }, [loadPomodoroState]);

  // Sincronizar mudanças de estado com o Supabase (com debounce)
  useEffect(() => {
    if (!syncedWithDb) return;
    
    const timer = setTimeout(() => {
      savePomodoroState(state);
    }, 3000); // Debounce de 3 segundos
    
    return () => clearTimeout(timer);
  }, [state, syncedWithDb, savePomodoroState]);

  const formatTime = () => {
    const minutes = Math.floor(state.timeLeft / 60)
    const seconds = state.timeLeft % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    setState(prev => {
      const newIsRunning = !prev.isRunning;
      
      // Se estiver iniciando e for modo focus, iniciar sessão de estudo
      if (newIsRunning && prev.mode === 'focus' && !sessaoAtiva) {
        iniciarSessao('Sessão Pomodoro');
      }
      
      // Se estiver pausando e for modo focus, não finalizar a sessão
      
      return { ...prev, isRunning: newIsRunning };
    });
  }

  const handleReset = () => {
    const newMode = state.mode;
    const newTime = newMode === 'focus' 
      ? state.settings.focusDuration * 60 
      : state.settings.breakDuration * 60;
    
    setState(prev => ({
      ...prev,
      isRunning: false,
      timeLeft: newTime
    }));
    
    // Se estiver em uma sessão de estudo, finalizá-la
    if (sessaoAtiva && newMode === 'focus') {
      finalizarSessao();
    }
  }

  const handleSkipToNextMode = () => {
    if (state.mode === 'focus') {
      // Pular para pausa
      if (sessaoAtiva) {
        finalizarSessao();
      }
      
      setState(prev => ({
        ...prev,
        mode: 'break',
        timeLeft: prev.settings.breakDuration * 60,
        isRunning: false
      }));
    } else {
      // Pular para foco
      iniciarSessao('Sessão Pomodoro');
      
      setState(prev => {
        const nextCycle = prev.currentCycle + 1 > prev.settings.cycles 
          ? 1 
          : prev.currentCycle + 1;
        
        return {
          ...prev,
          mode: 'focus',
          timeLeft: prev.settings.focusDuration * 60,
          currentCycle: nextCycle,
          isRunning: false
        };
      });
    }
  }

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setConfigTemp({
      ...configTemp,
      [name]: parseInt(value),
    })
  }

  const saveSettings = () => {
    atualizarConfiguracao(configTemp)
    setShowSettings(false)
  }

  // Determinar a cor com base no ciclo atual
  const cicloColor = 
    state.mode === 'focus' 
      ? 'text-estudos-primary dark:text-estudos-secondary' 
      : 'text-green-600 dark:text-green-400'

  // Determinar a mensagem com base no ciclo atual
  const cicloMensagem = 
    state.mode === 'focus'
        ? tipo === 'concurso' ? 'Foco (Concurso)' : 'Tempo de foco'
        : 'Pausa'

  // Determinar a cor de fundo com base no ciclo atual
  const cicloBgColor = 
    state.mode === 'focus' 
      ? 'bg-estudos-light dark:bg-estudos-dark/30' 
      : 'bg-green-100 dark:bg-green-900/30'

  return (
    <Card className={`shadow-md ${state.mode === 'focus' ? 'border-blue-400' : 'border-green-400'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>
            Pomodoro - Ciclo {state.currentCycle}/{state.settings.cycles}
          </span>
          <span className={`text-sm px-2 py-1 rounded-full ${
            state.mode === 'focus' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {state.mode === 'focus' ? (
              <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1" /> Foco</span>
            ) : (
              <span className="flex items-center"><Coffee className="w-4 h-4 mr-1" /> Pausa</span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="text-5xl font-bold mb-4">
            {formatTime()}
          </div>
          
          <Progress value={calculateProgress()} className="h-2 mb-4 w-full" />
          
          <div className="flex space-x-4">
            <Button
              onClick={handlePlayPause}
              variant="default"
              className={state.mode === 'focus' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {state.isRunning ? <Pause className="mr-1" /> : <Play className="mr-1" />}
              {state.isRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            
            <Button
              onClick={handleReset}
              variant="outline"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Reiniciar
            </Button>
            
            <Button
              onClick={handleSkipToNextMode}
              variant="ghost"
            >
              {state.mode === 'focus' ? (
                <>
                  <Coffee className="mr-1 h-4 w-4" />
                  Ir para Pausa
                </>
              ) : (
                <>
                  <BookOpen className="mr-1 h-4 w-4" />
                  Ir para Foco
                </>
              )}
            </Button>
          </div>
          
          {!syncedWithDb && (
            <div className="mt-3 text-amber-600 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              Sincronizando com o servidor...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
