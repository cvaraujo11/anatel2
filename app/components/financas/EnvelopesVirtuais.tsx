'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, AlertCircle } from 'lucide-react'
import { useFinancasSupabase } from '@/app/lib/hooks/useFinancasSupabase'

export function EnvelopesVirtuais() {
  const { 
    envelopes, 
    loading, 
    error,
    adicionarEnvelope, 
    atualizarEnvelope, 
    removerEnvelope
  } = useFinancasSupabase()
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editando, setEditando] = useState<string | null>(null)
  const [novoEnvelope, setNovoEnvelope] = useState({ 
    nome: '', 
    cor: '#2196F3', 
    orcamento: 0 
  })
  const [valorGasto, setValorGasto] = useState<{ id: string; valor: number } | null>(null)
  
  // Formatador para valores monetários
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  
  const handleAdicionarEnvelope = async () => {
    if (!novoEnvelope.nome || novoEnvelope.orcamento <= 0) return
    
    await adicionarEnvelope(
      novoEnvelope.nome,
      novoEnvelope.orcamento
    )
    
    setNovoEnvelope({ nome: '', cor: '#2196F3', orcamento: 0 })
    setMostrarFormulario(false)
  }
  
  const iniciarEdicao = (id: string) => {
    const envelope = envelopes.find(e => e.id === id)
    if (!envelope) return
    
    setEditando(id)
    setNovoEnvelope({ 
      nome: envelope.nome, 
      cor: '#2196F3', // Cor padrão já que não armazenamos mais isso
      orcamento: envelope.orcamento 
    })
    setMostrarFormulario(true)
  }
  
  const salvarEdicao = async () => {
    if (!editando || !novoEnvelope.nome || novoEnvelope.orcamento <= 0) return
    
    await atualizarEnvelope(
      editando,
      novoEnvelope.nome,
      novoEnvelope.orcamento
    )
    
    setNovoEnvelope({ nome: '', cor: '#2196F3', orcamento: 0 })
    setEditando(null)
    setMostrarFormulario(false)
  }
  
  const cancelarForm = () => {
    setNovoEnvelope({ nome: '', cor: '#2196F3', orcamento: 0 })
    setEditando(null)
    setMostrarFormulario(false)
  }
  
  // Cores padrão para envelopes
  const coresEnvelopes = [
    '#3498db', // Azul
    '#e74c3c', // Vermelho
    '#2ecc71', // Verde
    '#9b59b6', // Roxo
    '#f39c12', // Laranja
    '#1abc9c', // Turquesa
    '#34495e'  // Azul escuro
  ]
  
  // Obter uma cor baseada no nome do envelope (pseudo-aleatória mas consistente)
  const obterCorPorNome = (nome: string) => {
    let hash = 0
    for (let i = 0; i < nome.length; i++) {
      hash = nome.charCodeAt(i) + ((hash << 5) - hash)
    }
    return coresEnvelopes[Math.abs(hash) % coresEnvelopes.length]
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Carregando envelopes...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Erro ao carregar envelopes: {error}</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Visualização dos envelopes */}
      <div className="space-y-3">
        {envelopes.map(envelope => {
          const percentualUtilizado = envelope.orcamento > 0 
            ? (envelope.saldo_atual / envelope.orcamento) * 100 
            : 0
          
          const cor = obterCorPorNome(envelope.nome)
          
          return (
            <div 
              key={envelope.id} 
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <div className="flex items-center justify-between p-3" style={{ backgroundColor: `${cor}20` }}>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 mr-2 rounded-full" 
                    style={{ backgroundColor: cor }} 
                  />
                  <span className="font-medium text-gray-900 dark:text-white">
                    {envelope.nome}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => iniciarEdicao(envelope.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={`Editar envelope ${envelope.nome}`}
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removerEnvelope(envelope.id)}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={`Remover envelope ${envelope.nome}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-3">
                <div className="flex justify-between mb-1 text-sm">
                  <span>Utilizado: {formatadorMoeda.format(envelope.saldo_atual)}</span>
                  <span>Total: {formatadorMoeda.format(envelope.orcamento)}</span>
                </div>
                
                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(percentualUtilizado, 100)}%`, 
                      backgroundColor: cor 
                    }} 
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Formulário para adicionar ou editar envelope */}
      {mostrarFormulario ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="space-y-3">
            <div>
              <label htmlFor="envelopeNome" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nome do Envelope
              </label>
              <input
                id="envelopeNome"
                type="text"
                value={novoEnvelope.nome}
                onChange={e => setNovoEnvelope({ ...novoEnvelope, nome: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Emergências"
              />
            </div>
            
            <div>
              <label htmlFor="envelopeValor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor Alocado
              </label>
              <input
                id="envelopeValor"
                type="number"
                value={novoEnvelope.orcamento || ''}
                onChange={e => setNovoEnvelope({ ...novoEnvelope, orcamento: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Valor"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={cancelarForm}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md"
              >
                Cancelar
              </button>
              
              {editando ? (
                <button
                  onClick={salvarEdicao}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  Atualizar
                </button>
              ) : (
                <button
                  onClick={handleAdicionarEnvelope}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                >
                  Adicionar
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="w-full px-4 py-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300"
          aria-label="Adicionar novo envelope"
        >
          <Plus className="h-5 w-5 mr-1" />
          Novo Envelope
        </button>
      )}
    </div>
  )
}
