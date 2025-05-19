'use client'

import { useState } from 'react'
import { Check, CreditCard, PlusCircle } from 'lucide-react'
import { useFinancasSupabase } from '@/app/lib/hooks/useFinancasSupabase'

export function AdicionarDespesa() {
  const { adicionarGasto, loading } = useFinancasSupabase()
  
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState('Outros')
  const [mostrarFeedback, setMostrarFeedback] = useState(false)
  
  // Categorias padrão
  const categoriasPadrao = [
    'Moradia',
    'Alimentação',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Outros'
  ]
  
  const handleAdicionarDespesa = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!descricao || !valor || parseFloat(valor) <= 0 || !categoria) return
    
    const hoje = new Date().toISOString()
    
    const sucesso = await adicionarGasto(
      parseFloat(valor),
      categoria,
      descricao,
      hoje
    )
    
    if (sucesso) {
      // Mostrar feedback visual
      setMostrarFeedback(true)
      
      // Limpar formulário
      setDescricao('')
      setValor('')
      
      // Esconder feedback após 1.5 segundos
      setTimeout(() => {
        setMostrarFeedback(false)
      }, 1500)
    }
  }
  
  return (
    <div className="space-y-4">
      {mostrarFeedback ? (
        <div className="flex flex-col items-center justify-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-300">
          <Check className="h-12 w-12 mb-2" />
          <p className="text-lg font-medium">Despesa registrada!</p>
        </div>
      ) : (
        <form onSubmit={handleAdicionarDespesa} className="space-y-3">
          <div>
            <label htmlFor="despesaDescricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Descrição
            </label>
            <input
              id="despesaDescricao"
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Compras do mercado"
              required
            />
          </div>
          
          <div>
            <label htmlFor="despesaValor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">R$</span>
              </div>
              <input
                id="despesaValor"
                type="number"
                value={valor}
                onChange={e => setValor(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="0,00"
                min="0.01"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="despesaCategoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoria
            </label>
            <select
              id="despesaCategoria"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              required
            >
              {categoriasPadrao.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white rounded-md"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            {loading ? 'Registrando...' : 'Registrar Despesa'}
          </button>
        </form>
      )}
    </div>
  )
}
