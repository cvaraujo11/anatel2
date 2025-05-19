'use client'

import { useState } from 'react'
import { AlertCircle, ArrowRight, CheckCircle } from 'lucide-react'
import { migrarFinancasParaSupabase } from '@/app/lib/migrations/migrarFinancasParaSupabase'

export function MigrarDadosFinanceiros() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{
    exibir: boolean
    sucesso: boolean
    mensagem: string
  }>({
    exibir: false,
    sucesso: false,
    mensagem: ''
  })
  
  const handleMigrarDados = async () => {
    if (loading) return
    
    setLoading(true)
    setResultado({
      exibir: false,
      sucesso: false,
      mensagem: ''
    })
    
    try {
      const res = await migrarFinancasParaSupabase()
      
      setResultado({
        exibir: true,
        sucesso: res.success,
        mensagem: res.message
      })
    } catch (error) {
      setResultado({
        exibir: true,
        sucesso: false,
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido durante a migração'
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
        Migração de Dados Financeiros
      </h3>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Esta ferramenta permite transferir seus dados financeiros do armazenamento local para o servidor.
        A migração é necessária para sincronização entre dispositivos e maior segurança dos dados.
      </p>
      
      {resultado.exibir && (
        <div className={`p-3 mb-4 rounded-lg ${
          resultado.sucesso 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
        }`}>
          <div className="flex items-start">
            {resultado.sucesso ? (
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            )}
            <p className="text-sm">{resultado.mensagem}</p>
          </div>
        </div>
      )}
      
      <button
        onClick={handleMigrarDados}
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white rounded-md flex items-center justify-center"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Migrando dados...
          </span>
        ) : (
          <span className="flex items-center">
            <ArrowRight className="h-5 w-5 mr-2" />
            Migrar Dados Financeiros
          </span>
        )}
      </button>
    </div>
  )
} 