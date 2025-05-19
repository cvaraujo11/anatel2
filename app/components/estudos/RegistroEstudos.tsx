'use client'

import { useState, useEffect } from 'react'
import { BookOpen, Plus, X, Edit, Trash, Check, Clock, Play, Square, Trash2 } from 'lucide-react'
import { useRegistroEstudosStore, SessaoEstudo } from '@/app/stores/registroEstudosStore'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent } from '@/app/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useEstudosData } from '@/app/hooks/useEstudosData'
import { Skeleton } from '@/app/components/ui/skeleton'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function RegistroEstudos() {
  const { 
    sessoes, 
    sessaoAtiva, 
    isLoading, 
    iniciarSessao, 
    finalizarSessao, 
    excluirSessao,
    getEstatisticas 
  } = useEstudosData();
  
  const [assunto, setAssunto] = useState('');
  const [concursoId, setConcursoId] = useState('');
  const [concursos, setConcursos] = useState<any[]>([]);
  const [loadingConcursos, setLoadingConcursos] = useState(true);
  const supabase = createClientComponentClient();
  
  // Buscar lista de concursos
  useEffect(() => {
    const fetchConcursos = async () => {
      try {
        setLoadingConcursos(true);
        const { data, error } = await supabase
          .from('concursos')
          .select('id, titulo')
          .order('data_prova', { ascending: true });
        
        if (error) throw error;
        setConcursos(data || []);
      } catch (error) {
        console.error('Erro ao buscar concursos:', error);
      } finally {
        setLoadingConcursos(false);
      }
    };
    
    fetchConcursos();
  }, [supabase]);
  
  // Formatar duração
  const formatarDuracao = (minutos?: number) => {
    if (!minutos) return '0m';
    
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutosRestantes}m`;
    }
    return `${minutosRestantes}m`;
  };
  
  // Obter estatísticas
  const estatisticas = getEstatisticas(7); // últimos 7 dias
  
  // Iniciar sessão
  const handleIniciarSessao = async () => {
    await iniciarSessao(assunto, concursoId || undefined);
    setAssunto('');
    setConcursoId('');
  };
  
  // Formatar data
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };
  
  // Obter tempo desde o início (para sessão ativa)
  const getTempoDecorrido = (inicio: string) => {
    const dataInicio = new Date(inicio);
    return formatDistanceToNow(dataInicio, { locale: ptBR, addSuffix: true });
  };

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Total Estudado (7d)</h4>
          {isLoading ? (
            <Skeleton className="h-6 w-20" />
          ) : (
            <p className="text-xl font-bold">
              {estatisticas.horasEstudadas}h {estatisticas.minutosRestantes}m
            </p>
          )}
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">Sessões (7d)</h4>
          {isLoading ? (
            <Skeleton className="h-6 w-10" />
          ) : (
            <p className="text-xl font-bold">{estatisticas.sessoesRecentes}</p>
          )}
        </div>
      </div>
      
      {/* Formulário para iniciar sessão */}
      <div className="space-y-3 mb-4">
        <Input
          placeholder="Assunto de estudo"
          value={assunto}
          onChange={(e) => setAssunto(e.target.value)}
          disabled={!!sessaoAtiva}
        />
        
        <Select 
          value={concursoId} 
          onValueChange={setConcursoId}
          disabled={!!sessaoAtiva || loadingConcursos}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um concurso (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {concursos.map(concurso => (
              <SelectItem key={concurso.id} value={concurso.id}>
                {concurso.titulo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {sessaoAtiva ? (
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => finalizarSessao()}
          >
            <Square className="mr-2 h-4 w-4" />
            Finalizar Sessão
          </Button>
        ) : (
          <Button 
            variant="default" 
            className="w-full"
            onClick={handleIniciarSessao}
          >
            <Play className="mr-2 h-4 w-4" />
            Iniciar Sessão
          </Button>
        )}
      </div>
      
      {/* Sessão ativa */}
      {sessaoAtiva && (
        <Card className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-green-800 dark:text-green-300">Sessão em andamento</h4>
              <span className="text-sm text-green-700 dark:text-green-400 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {getTempoDecorrido(sessaoAtiva.inicio)}
              </span>
            </div>
            <p className="text-sm">{sessaoAtiva.assunto || "Sem assunto específico"}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Início: {formatarData(sessaoAtiva.inicio)}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Lista de sessões recentes */}
      <div>
        <h3 className="font-medium mb-2">Sessões Recentes</h3>
        
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : sessoes.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            Nenhuma sessão registrada ainda
          </p>
        ) : (
          <div className="space-y-2">
            {sessoes.slice(0, 5).map(sessao => (
              <Card key={sessao.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">
                        {sessao.assunto || "Sem assunto específico"}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatarData(sessao.inicio)}
                      </p>
                      {sessao.fim && (
                        <div className="flex items-center text-xs text-green-600 dark:text-green-400 mt-1">
                          <Check className="h-3 w-3 mr-1" />
                          Duração: {formatarDuracao(sessao.duracao_minutos)}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => excluirSessao(sessao.id)}
                      disabled={sessao.id === sessaoAtiva?.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
