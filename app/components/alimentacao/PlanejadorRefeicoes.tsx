'use client'

import { useState } from 'react'
import { Clock, Plus, Save, Trash2 } from 'lucide-react'
import { useRefeicoes } from '@/lib/hooks/useRefeicoes'

export function PlanejadorRefeicoes() {
  const { refeicoes, loading, adicionarRefeicao, atualizarRefeicao, removerRefeicao } = useRefeicoes()
  
  const [editando, setEditando] = useState<string | null>(null)
  const [novaRefeicao, setNovaRefeicao] = useState({
    horario: '',
    descricao: '',
  })
  const [mostrarFormNovo, setMostrarFormNovo] = useState(false)
  
  // Se estiver carregando os dados
  if (loading) {
    return <div className="p-4 text-center">Carregando planejador de refeições...</div>
  }

  // Ordenar refeições por horário
  const refeicoesOrdenadas = [...refeicoes].sort((a, b) => {
    return a.horario.localeCompare(b.horario)
  })

  const handleSalvarRefeicao = async (id: string) => {
    // Buscar a refeição sendo editada
    const refeicao = refeicoes.find(r => r.id === id)
    if (!refeicao) return
    
    await atualizarRefeicao(id, refeicao.horario, refeicao.descricao)
    setEditando(null)
  }

  const handleAdicionarRefeicao = async () => {
    if (novaRefeicao.horario && novaRefeicao.descricao) {
      await adicionarRefeicao(novaRefeicao.horario, novaRefeicao.descricao)
      setNovaRefeicao({ horario: '', descricao: '' })
      setMostrarFormNovo(false)
    }
  }

  const handleRemoverRefeicao = async (id: string) => {
    await removerRefeicao(id)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {refeicoesOrdenadas.map((refeicao) => (
          <div 
            key={refeicao.id}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            {editando === refeicao.id ? (
              // Modo de edição
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-alimentacao-primary mr-2" />
                  <input
                    type="time"
                    value={refeicao.horario}
                    onChange={(e) => atualizarRefeicao(refeicao.id, e.target.value, refeicao.descricao)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md p-1 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                    aria-label="Horário da refeição"
                  />
                </div>
                
                <input
                  type="text"
                  value={refeicao.descricao}
                  onChange={(e) => atualizarRefeicao(refeicao.id, refeicao.horario, e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Descrição da refeição"
                  aria-label="Descrição da refeição"
                />
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleSalvarRefeicao(refeicao.id)}
                    className="flex items-center text-sm text-white bg-alimentacao-primary hover:bg-alimentacao-secondary px-3 py-1 rounded-md"
                    aria-label="Salvar alterações"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              // Modo de visualização
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center mb-1">
                    <Clock className="h-5 w-5 text-alimentacao-primary mr-2" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{refeicao.horario}</span>
                  </div>
                  <div className="text-gray-900 dark:text-white pl-7">{refeicao.descricao}</div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditando(refeicao.id)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                    aria-label="Editar refeição"
                  >
                    Editar
                  </button>
                  
                  <button
                    onClick={() => handleRemoverRefeicao(refeicao.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                    aria-label="Remover refeição"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {mostrarFormNovo ? (
        <div className="p-3 bg-alimentacao-light dark:bg-gray-800 rounded-lg border border-alimentacao-primary">
          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-alimentacao-primary mr-2" />
              <input
                type="time"
                value={novaRefeicao.horario}
                onChange={(e) => setNovaRefeicao({...novaRefeicao, horario: e.target.value})}
                className="border border-gray-300 dark:border-gray-600 rounded-md p-1 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                aria-label="Horário da nova refeição"
              />
            </div>
            
            <input
              type="text"
              value={novaRefeicao.descricao}
              onChange={(e) => setNovaRefeicao({...novaRefeicao, descricao: e.target.value})}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              placeholder="Descrição da refeição"
              aria-label="Descrição da nova refeição"
            />
            
            <div className="flex justify-between">
              <button
                onClick={() => setMostrarFormNovo(false)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-3 py-1 rounded-md"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleAdicionarRefeicao}
                className="flex items-center text-sm text-white bg-alimentacao-primary hover:bg-alimentacao-secondary px-3 py-1 rounded-md"
                disabled={!novaRefeicao.horario || !novaRefeicao.descricao}
              >
                <Save className="h-4 w-4 mr-1" />
                Adicionar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarFormNovo(true)}
          className="flex items-center justify-center w-full p-2 text-alimentacao-primary hover:text-alimentacao-secondary border border-dashed border-alimentacao-primary hover:border-alimentacao-secondary rounded-lg"
          aria-label="Adicionar nova refeição"
        >
          <Plus className="h-5 w-5 mr-1" />
          <span>Adicionar Refeição</span>
        </button>
      )}
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Dica:</strong> Manter um horário regular para refeições pode ajudar a estabilizar os níveis de energia.
        </p>
      </div>
    </div>
  )
}
