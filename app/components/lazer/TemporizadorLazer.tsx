'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { 
  Timer, 
  PlayCircle, 
  PauseCircle, 
  RefreshCw, 
  XCircle 
} from 'lucide-react'
import { useTemporizadorLazer } from '@/app/hooks/useTemporizadorLazer'
import { Input } from '../ui/input'
import { cn } from '@/app/lib/utils'

export function TemporizadorLazer() {
  const [duracaoEscolhida, setDuracaoEscolhida] = useState(15) // 15 minutos padrão
  const [atividadeInput, setAtividadeInput] = useState('')
  
  const {
    isActive,
    timeRemaining,
    minutosRestantes,
    segundosRestantes,
    porcentagemConcluida,
    atividade,
    iniciarTemporizador,
    pausarTemporizador,
    retomarTemporizador,
    reiniciarTemporizador,
    cancelarTemporizador
  } = useTemporizadorLazer()

  // Lidar com mudança na duração escolhida
  const handleDuracaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = parseInt(e.target.value)
    if (!isNaN(valor) && valor > 0 && valor <= 120) {
      setDuracaoEscolhida(valor)
    }
  }

  // Lidar com início do temporizador
  const handleIniciar = () => {
    iniciarTemporizador(duracaoEscolhida, atividadeInput || null)
    setAtividadeInput('')
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          <span>Temporizador de Lazer</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeRemaining > 0 ? (
          <div className="space-y-4">
            {atividade && (
              <div className="text-center text-lg font-medium">
                {atividade}
              </div>
            )}
            
            <div className="flex justify-center">
              <div className="text-4xl font-bold">
                {minutosRestantes.toString().padStart(2, '0')}:
                {segundosRestantes.toString().padStart(2, '0')}
              </div>
            </div>
            
            {/* Barra de progresso */}
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full" 
                style={{ width: `${porcentagemConcluida}%` }}
              ></div>
            </div>
            
            <div className="flex justify-center gap-2">
              {isActive ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={pausarTemporizador}
                  className="rounded-full"
                >
                  <PauseCircle className="h-8 w-8" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={retomarTemporizador}
                  className="rounded-full"
                >
                  <PlayCircle className="h-8 w-8" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={reiniciarTemporizador}
                className="rounded-full"
              >
                <RefreshCw className="h-8 w-8" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={cancelarTemporizador}
                className="rounded-full"
              >
                <XCircle className="h-8 w-8" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="duracao" className="block text-sm font-medium">
                Duração (minutos):
              </label>
              <Input
                id="duracao"
                type="number"
                min="1"
                max="120"
                value={duracaoEscolhida}
                onChange={handleDuracaoChange}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="atividade" className="block text-sm font-medium">
                Atividade (opcional):
              </label>
              <Input
                id="atividade"
                type="text"
                placeholder="Ex: Leitura, Meditação, Desenho..."
                value={atividadeInput}
                onChange={e => setAtividadeInput(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Button 
              onClick={handleIniciar}
              className="w-full"
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Iniciar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
