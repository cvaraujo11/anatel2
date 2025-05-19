'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Home, ShoppingCart, Utensils, Car, Heart, Music } from 'lucide-react'
import { useFinancasSupabase } from '@/app/lib/hooks/useFinancasSupabase'

// Mapeamento de nomes de ícones para componentes Lucide
const iconesMapeados: Record<string, React.ReactNode> = {
  'home': <Home className="h-5 w-5" />,
  'shopping-cart': <ShoppingCart className="h-5 w-5" />,
  'utensils': <Utensils className="h-5 w-5" />,
  'car': <Car className="h-5 w-5" />,
  'heart': <Heart className="h-5 w-5" />,
  'music': <Music className="h-5 w-5" />,
}

// Usando default export conforme solicitado pelo dynamic import
export default function RastreadorGastos() { 
  const { gastos, gastosPorCategoria, totalGastos, loading } = useFinancasSupabase()
  const [dadosGrafico, setDadosGrafico] = useState<Array<{ name: string; value: number; cor: string }>>([])
  
  // Cores padrão para categorias
  const coresPadrao: Record<string, string> = {
    'Moradia': '#3498db',
    'Alimentação': '#e74c3c',
    'Transporte': '#2ecc71',
    'Saúde': '#9b59b6',
    'Educação': '#f39c12',
    'Lazer': '#1abc9c',
    'Outros': '#95a5a6'
  }
  
  // Calcular os dados do gráfico quando os gastos mudarem
  useEffect(() => {
    if (loading) return
    
    // Preparar os dados para o gráfico
    const dados = Object.entries(gastosPorCategoria).map(([categoria, valor]) => {
      return {
        name: categoria,
        value: valor,
        cor: coresPadrao[categoria] || '#CCCCCC'
      }
    })
    
    setDadosGrafico(dados)
  }, [gastosPorCategoria, loading])
  
  // Formatador para valores monetários
  const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
  
  // Formatador para porcentagens
  const formatadorPorcentagem = new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  
  // Custom tooltip para o gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentual = data.value / totalGastos
      
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatadorMoeda.format(data.value)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatadorPorcentagem.format(percentual)}
          </p>
        </div>
      )
    }
    
    return null
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Carregando dados financeiros...</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Exibir o gráfico apenas se houver dados */}
      {dadosGrafico.length > 0 ? (
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosGrafico}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
          <p>Sem despesas registradas</p>
          <p className="text-sm">Adicione despesas para visualizar o gráfico</p>
        </div>
      )}
      
      {/* Lista de categorias com valores */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Total de Gastos: {formatadorMoeda.format(totalGastos)}
        </h3>
        
        {Object.entries(gastosPorCategoria).map(([categoria, valor]) => {
          const corCategoria = coresPadrao[categoria] || '#CCCCCC'
          const percentual = totalGastos > 0 ? valor / totalGastos : 0
          
          return (
            <div 
              key={categoria}
              className="flex items-center justify-between p-2 rounded-lg mb-2"
              style={{ backgroundColor: `${corCategoria}20` }}
            >
              <div className="flex items-center">
                <div className="p-1 rounded-full mr-2" style={{ backgroundColor: corCategoria }}>
                  <span className="text-white">
                    {iconesMapeados[categoria.toLowerCase()] || <ShoppingCart className="h-5 w-5" />}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {categoria}
                </span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">
                  {formatadorMoeda.format(valor)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatadorPorcentagem.format(percentual)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
