'use client'

import { useState, useEffect } from 'react'
import { useNotasAutoconhecimento } from '@/app/hooks/useNotasAutoconhecimento'
import { usePerfilStore } from '@/app/stores/perfilStore'

export default function TesteAutoconhecimento() {
  const {
    notas,
    isLoading,
    isError,
    fetchNotas,
    fetchNotasPorCategoria,
    adicionarNota,
    atualizarNota,
    excluirNota
  } = useNotasAutoconhecimento()
  
  const { atualizarPreferenciasVisuais, perfil } = usePerfilStore()
  
  const [categoria, setCategoria] = useState('quem_sou')
  const [notasCategoria, setNotasCategoria] = useState([])
  const [notaSelecionada, setNotaSelecionada] = useState(null)
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [logs, setLogs] = useState([])
  
  // Função para adicionar logs para debug
  const adicionarLog = (mensagem, tipo = 'info') => {
    const timestamp = new Date().toISOString().substring(11, 19)
    setLogs(logs => [{timestamp, mensagem, tipo}, ...logs.slice(0, 19)])
  }
  
  // Carregar notas iniciais
  useEffect(() => {
    const carregarNotas = async () => {
      try {
        await fetchNotas()
        adicionarLog('Notas carregadas com sucesso')
      } catch (error) {
        adicionarLog(`Erro ao carregar notas: ${error.message}`, 'error')
      }
    }
    
    carregarNotas()
  }, [fetchNotas])
  
  // Carregar notas por categoria quando mudar
  useEffect(() => {
    const carregarNotasCategoria = async () => {
      try {
        const notas = await fetchNotasPorCategoria(categoria)
        setNotasCategoria(notas)
        adicionarLog(`Carregadas ${notas.length} notas da categoria ${categoria}`)
      } catch (error) {
        adicionarLog(`Erro ao carregar notas da categoria: ${error.message}`, 'error')
      }
    }
    
    carregarNotasCategoria()
  }, [categoria, fetchNotasPorCategoria])
  
  // Manipuladores de eventos
  const handleAdicionarNota = async () => {
    if (!titulo.trim() || !conteudo.trim()) {
      adicionarLog('Título e conteúdo são obrigatórios', 'error')
      return
    }
    
    try {
      const novaNota = await adicionarNota({
        categoria,
        titulo,
        conteudo
      })
      
      adicionarLog(`Nota "${titulo}" adicionada com sucesso`)
      setTitulo('')
      setConteudo('')
      
      // Recarregar notas da categoria
      const notas = await fetchNotasPorCategoria(categoria)
      setNotasCategoria(notas)
    } catch (error) {
      adicionarLog(`Erro ao adicionar nota: ${error.message}`, 'error')
    }
  }
  
  const handleAtualizarNota = async () => {
    if (!notaSelecionada) {
      adicionarLog('Nenhuma nota selecionada para atualizar', 'error')
      return
    }
    
    if (!titulo.trim() || !conteudo.trim()) {
      adicionarLog('Título e conteúdo são obrigatórios', 'error')
      return
    }
    
    try {
      await atualizarNota(notaSelecionada.id, {
        titulo,
        conteudo
      })
      
      adicionarLog(`Nota "${titulo}" atualizada com sucesso`)
      setNotaSelecionada(null)
      setTitulo('')
      setConteudo('')
      
      // Recarregar notas da categoria
      const notas = await fetchNotasPorCategoria(categoria)
      setNotasCategoria(notas)
    } catch (error) {
      adicionarLog(`Erro ao atualizar nota: ${error.message}`, 'error')
    }
  }
  
  const handleExcluirNota = async (id) => {
    try {
      await excluirNota(id)
      adicionarLog('Nota excluída com sucesso')
      
      // Recarregar notas da categoria
      const notas = await fetchNotasPorCategoria(categoria)
      setNotasCategoria(notas)
      
      // Se a nota excluída era a selecionada, limpar seleção
      if (notaSelecionada && notaSelecionada.id === id) {
        setNotaSelecionada(null)
        setTitulo('')
        setConteudo('')
      }
    } catch (error) {
      adicionarLog(`Erro ao excluir nota: ${error.message}`, 'error')
    }
  }
  
  const handleSelecionarNota = (nota) => {
    setNotaSelecionada(nota)
    setTitulo(nota.titulo)
    setConteudo(nota.conteudo)
    adicionarLog(`Nota "${nota.titulo}" selecionada para edição`)
  }
  
  const handleAlternarModoRefugio = () => {
    const novoEstado = !perfil?.preferenciasVisuais?.modoRefugio
    atualizarPreferenciasVisuais({
      modoRefugio: novoEstado
    })
    adicionarLog(`Modo refúgio ${novoEstado ? 'ativado' : 'desativado'}`)
  }
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Teste de Autoconhecimento</h1>
      
      {/* Painel de status */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-medium mb-2">Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Carregando:</strong> {isLoading ? 'Sim' : 'Não'}</p>
            <p><strong>Erro:</strong> {isError ? 'Sim' : 'Não'}</p>
            <p><strong>Total de notas:</strong> {notas.length}</p>
            <p><strong>Categoria atual:</strong> {categoria}</p>
            <p><strong>Notas na categoria:</strong> {notasCategoria.length}</p>
          </div>
          <div>
            <p><strong>Modo Refúgio:</strong> {perfil?.preferenciasVisuais?.modoRefugio ? 'Ativado' : 'Desativado'}</p>
            <button 
              onClick={handleAlternarModoRefugio}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Alternar Modo Refúgio
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Painel de seleção de categoria */}
        <div>
          <h2 className="text-lg font-medium mb-3">Categorias</h2>
          <div className="flex space-x-2 mb-4">
            <button 
              onClick={() => setCategoria('quem_sou')}
              className={`px-3 py-2 rounded ${categoria === 'quem_sou' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Quem Sou
            </button>
            <button 
              onClick={() => setCategoria('meus_porques')}
              className={`px-3 py-2 rounded ${categoria === 'meus_porques' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Meus Porquês
            </button>
            <button 
              onClick={() => setCategoria('meus_padroes')}
              className={`px-3 py-2 rounded ${categoria === 'meus_padroes' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              Meus Padrões
            </button>
          </div>
          
          {/* Lista de notas */}
          <h2 className="text-lg font-medium mb-3">Notas na Categoria</h2>
          {notasCategoria.length === 0 ? (
            <p className="text-gray-500">Nenhuma nota encontrada nesta categoria</p>
          ) : (
            <div className="space-y-2">
              {notasCategoria.map(nota => (
                <div 
                  key={nota.id} 
                  className="p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSelecionarNota(nota)}
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{nota.titulo}</h3>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExcluirNota(nota.id);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{nota.conteudo}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Formulário de edição/criação */}
        <div>
          <h2 className="text-lg font-medium mb-3">
            {notaSelecionada ? 'Editar Nota' : 'Nova Nota'}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Título da nota"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Conteúdo</label>
              <textarea
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                className="w-full p-2 border rounded min-h-[150px]"
                placeholder="Conteúdo da nota"
              />
            </div>
            <div className="flex space-x-2">
              {notaSelecionada ? (
                <>
                  <button 
                    onClick={handleAtualizarNota}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                  >
                    Atualizar Nota
                  </button>
                  <button 
                    onClick={() => {
                      setNotaSelecionada(null);
                      setTitulo('');
                      setConteudo('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleAdicionarNota}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  Adicionar Nota
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Logs para debug */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-3">Logs de Depuração</h2>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">Nenhum log disponível</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`mb-1 ${log.tipo === 'error' ? 'text-red-400' : ''}`}>
                <span className="text-gray-500">[{log.timestamp}]</span> {log.mensagem}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 