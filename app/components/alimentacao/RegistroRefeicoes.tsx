'use client'

import { useState } from 'react'
import { Camera, Plus, X } from 'lucide-react'
import { useRefeicoes } from '@/lib/hooks/useRefeicoes'

// Ícones simples para tipos de refeição
const tiposRefeicao = [
  { id: 'cafe', emoji: '☕', nome: 'Café' },
  { id: 'fruta', emoji: '🍎', nome: 'Fruta' },
  { id: 'salada', emoji: '🥗', nome: 'Salada' },
  { id: 'proteina', emoji: '🍗', nome: 'Proteína' },
  { id: 'carboidrato', emoji: '🍚', nome: 'Carboidrato' },
  { id: 'sobremesa', emoji: '🍰', nome: 'Sobremesa' },
  { id: 'agua', emoji: '💧', nome: 'Água' },
]

export function RegistroRefeicoes() {
  const { registros, loading, adicionarRegistro, removerRegistro } = useRefeicoes()
  const [novoRegistro, setNovoRegistro] = useState({
    horario: '',
    descricao: '',
    tipoIcone: null as string | null,
    foto: null as string | null,
  })
  const [mostrarForm, setMostrarForm] = useState(false)

  // Verificar se está carregando dados
  if (loading) {
    return <div className="p-4 text-center">Carregando registros de refeições...</div>
  }

  // Ordenar registros por horário (mais recentes primeiro)
  const registrosOrdenados = [...registros].sort((a, b) => {
    return b.horario.localeCompare(a.horario)
  })

  const handleAdicionarRegistro = async () => {
    if (!novoRegistro.horario || !novoRegistro.descricao) return
    
    await adicionarRegistro(
      novoRegistro.horario,
      novoRegistro.descricao,
      novoRegistro.tipoIcone,
      novoRegistro.foto
    )
    
    setNovoRegistro({
      horario: '',
      descricao: '',
      tipoIcone: null,
      foto: null,
    })
    
    setMostrarForm(false)
  }

  const selecionarTipoIcone = (tipo: string) => {
    setNovoRegistro({
      ...novoRegistro,
      tipoIcone: novoRegistro.tipoIcone === tipo ? null : tipo,
    })
  }

  const handleCapturarFoto = () => {
    // Esta função seria implementada para capturar fotos
    // Como exemplo simplificado, vamos apenas simular uma URL de imagem
    const fotoSimulada = `https://source.unsplash.com/random/300x200?food&t=${Date.now()}`;
    setNovoRegistro({
      ...novoRegistro,
      foto: fotoSimulada,
    })
  }

  const handleRemoverFoto = () => {
    setNovoRegistro({
      ...novoRegistro,
      foto: null,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {registrosOrdenados.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Nenhum registro de refeição ainda. Adicione sua primeira refeição!
          </p>
        ) : (
          registrosOrdenados.map((registro) => (
            <div 
              key={registro.id}
              className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300 mr-2">
                      {registro.horario}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {registro.descricao}
                    </span>
                  </div>
                  
                  {registro.tipo_icone && (
                    <div className="mb-2">
                      <span className="text-2xl" aria-label={`Tipo: ${tiposRefeicao.find(t => t.id === registro.tipo_icone)?.nome || ''}`}>
                        {tiposRefeicao.find(t => t.id === registro.tipo_icone)?.emoji}
                      </span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => removerRegistro(registro.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Remover registro"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {registro.foto && (
                <div className="mt-2">
                  <img
                    src={registro.foto}
                    alt="Foto da refeição"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {mostrarForm ? (
        <div className="p-4 bg-alimentacao-light dark:bg-gray-800 rounded-lg border border-alimentacao-primary">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Adicionar Registro
          </h3>
          
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={novoRegistro.horario}
                  onChange={(e) => setNovoRegistro({...novoRegistro, horario: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  aria-label="Horário da refeição"
                />
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={novoRegistro.descricao}
                  onChange={(e) => setNovoRegistro({...novoRegistro, descricao: e.target.value})}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Ex: Salada com frango grelhado"
                  aria-label="Descrição da refeição"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Refeição
              </label>
              <div className="flex flex-wrap gap-2">
                {tiposRefeicao.map((tipo) => (
                  <button
                    key={tipo.id}
                    onClick={() => selecionarTipoIcone(tipo.id)}
                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      novoRegistro.tipoIcone === tipo.id
                        ? 'bg-alimentacao-light border-2 border-alimentacao-primary'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600'
                    }`}
                    aria-label={tipo.nome}
                    aria-pressed={novoRegistro.tipoIcone === tipo.id}
                  >
                    {tipo.emoji}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Foto (Opcional)
              </label>
              
              {novoRegistro.foto ? (
                <div className="relative">
                  <img
                    src={novoRegistro.foto}
                    alt="Prévia da foto da refeição"
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <button
                    onClick={handleRemoverFoto}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                    aria-label="Remover foto"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCapturarFoto}
                  className="w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-center text-gray-600 dark:text-gray-400"
                  aria-label="Capturar foto da refeição"
                >
                  <Camera className="h-6 w-6 mr-2" />
                  <span>Capturar Foto</span>
                </button>
              )}
            </div>
            
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setMostrarForm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              
              <button
                onClick={handleAdicionarRegistro}
                disabled={!novoRegistro.horario || !novoRegistro.descricao}
                className="px-4 py-2 bg-alimentacao-primary text-white rounded-md hover:bg-alimentacao-secondary focus:outline-none focus:ring-2 focus:ring-alimentacao-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center justify-center w-full p-3 bg-alimentacao-primary text-white rounded-lg hover:bg-alimentacao-secondary"
          aria-label="Adicionar novo registro de refeição"
        >
          <Plus className="h-5 w-5 mr-1" />
          <span>Adicionar Registro</span>
        </button>
      )}
      
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <strong>Dica:</strong> Registrar suas refeições ajuda a manter um padrão alimentar saudável e consciente.
        </p>
      </div>
    </div>
  )
}
