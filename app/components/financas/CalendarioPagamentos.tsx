'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Check, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { useFinancasSupabase } from '@/app/lib/hooks/useFinancasSupabase'

export function CalendarioPagamentos() {
  const { 
    pagamentos, 
    loading, 
    error,
    adicionarPagamento, 
    removerPagamento,
    marcarPagamentoComoPago
  } = useFinancasSupabase()
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [novoPagamento, setNovoPagamento] = useState({
    descricao: '',
    valor: 0,
    dataVencimento: new Date().toISOString().split('T')[0],
    recorrente: false
  })
  
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())
  
  // Formatador para valores monetários
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  
  // Obter os nomes dos meses em português
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  
  // Avançar para o próximo mês
  const avancarMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0)
      setAnoAtual(anoAtual + 1)
    } else {
      setMesAtual(mesAtual + 1)
    }
  }
  
  // Retroceder para o mês anterior
  const retrocederMes = () => {
    if (mesAtual === 0) {
      setMesAtual(11)
      setAnoAtual(anoAtual - 1)
    } else {
      setMesAtual(mesAtual - 1)
    }
  }
  
  // Verificar se um pagamento é do mês atual
  const isDoMesAtual = (data: string) => {
    const dataPagamento = new Date(data)
    return dataPagamento.getMonth() === mesAtual && dataPagamento.getFullYear() === anoAtual
  }
  
  // Filtrar pagamentos do mês atual
  const pagamentosDoMes = pagamentos.filter(p => isDoMesAtual(p.data_vencimento))
  
  // Organiza os dias do mês atual com seus pagamentos
  const diasComPagamentos = pagamentosDoMes.reduce((acc, pagamento) => {
    const data = new Date(pagamento.data_vencimento)
    const dia = data.getDate()
    
    if (!acc[dia]) {
      acc[dia] = []
    }
    
    acc[dia].push(pagamento)
    return acc
  }, {} as Record<number, typeof pagamentos>)
  
  // Adicionar novo pagamento
  const handleAdicionarPagamento = async () => {
    if (!novoPagamento.descricao || novoPagamento.valor <= 0) return
    
    await adicionarPagamento(
      novoPagamento.descricao,
      novoPagamento.valor,
      novoPagamento.dataVencimento,
      novoPagamento.recorrente
    )
    
    // Limpar formulário
    setNovoPagamento({
      descricao: '',
      valor: 0,
      dataVencimento: new Date().toISOString().split('T')[0],
      recorrente: false
    })
    setMostrarFormulario(false)
  }
  
  const handleMarcarPago = async (id: string, pago: boolean) => {
    await marcarPagamentoComoPago(id, pago)
  }
  
  // Calcular a soma total dos pagamentos do mês
  const totalPagamentosMes = pagamentosDoMes.reduce((total, pagamento) => {
    return total + pagamento.valor
  }, 0)
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Carregando pagamentos...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-8 w-8 mb-2" />
        <p>Erro ao carregar pagamentos: {error}</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Seletor de mês */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={retrocederMes}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
          {nomesMeses[mesAtual]} {anoAtual}
        </h3>
        
        <button
          onClick={avancarMes}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Total de pagamentos do mês */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Total do mês: <span className="font-bold">{formatadorMoeda.format(totalPagamentosMes)}</span>
        </p>
      </div>
      
      {/* Lista de pagamentos do mês */}
      <div className="space-y-2">
        {Object.entries(diasComPagamentos).length > 0 ? (
          Object.entries(diasComPagamentos).map(([dia, pagamentosNoDia]) => (
            <div key={dia} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 p-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-medium">{parseInt(dia)} de {nomesMeses[mesAtual]}</span>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pagamentosNoDia.map(pagamento => (
                  <div key={pagamento.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{pagamento.descricao}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatadorMoeda.format(pagamento.valor)}
                        {pagamento.recorrente && <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">Recorrente</span>}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleMarcarPago(pagamento.id, !pagamento.pago)}
                        className={`p-1 rounded-full ${
                          pagamento.pago 
                            ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                        aria-label={pagamento.pago ? 'Desmarcar como pago' : 'Marcar como pago'}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => removerPagamento(pagamento.id)}
                        className="p-1 rounded-full bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900 dark:hover:text-red-300"
                        aria-label={`Remover pagamento ${pagamento.descricao}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum pagamento em {nomesMeses[mesAtual]} {anoAtual}</p>
          </div>
        )}
      </div>
      
      {/* Formulário para adicionar pagamento */}
      {mostrarFormulario ? (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mt-3">
          <div className="space-y-3">
            <div>
              <label htmlFor="pagamentoDescricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descrição
              </label>
              <input
                id="pagamentoDescricao"
                type="text"
                value={novoPagamento.descricao}
                onChange={e => setNovoPagamento({ ...novoPagamento, descricao: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Ex: Aluguel"
              />
            </div>
            
            <div>
              <label htmlFor="pagamentoValor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Valor
              </label>
              <input
                id="pagamentoValor"
                type="number"
                value={novoPagamento.valor || ''}
                onChange={e => setNovoPagamento({ ...novoPagamento, valor: parseFloat(e.target.value) || 0 })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                placeholder="Valor"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <div>
              <label htmlFor="pagamentoData" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de Vencimento
              </label>
              <input
                id="pagamentoData"
                type="date"
                value={novoPagamento.dataVencimento}
                onChange={e => setNovoPagamento({ ...novoPagamento, dataVencimento: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="flex items-center">
              <input
                id="pagamentoRecorrente"
                type="checkbox"
                checked={novoPagamento.recorrente}
                onChange={e => setNovoPagamento({ ...novoPagamento, recorrente: e.target.checked })}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="pagamentoRecorrente" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Pagamento recorrente mensal
              </label>
            </div>
            
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setMostrarFormulario(false)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarPagamento}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="w-full px-4 py-2 flex items-center justify-center bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-gray-700 dark:text-gray-300 mt-3"
          aria-label="Adicionar novo pagamento"
        >
          <Plus className="h-5 w-5 mr-1" />
          Novo Pagamento
        </button>
      )}
    </div>
  )
}
