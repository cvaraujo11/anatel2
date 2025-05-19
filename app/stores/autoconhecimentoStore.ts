import { create } from 'zustand'
import { NotaAutoconhecimento } from '../hooks/useNotasAutoconhecimento'

// Mapeamento entre tipos de seção e categorias no banco
export const secaoParaCategoria = {
  'quem-sou': 'quem_sou',
  'meus-porques': 'meus_porques',
  'meus-padroes': 'meus_padroes'
} as const;

export const categoriaParaSecao = {
  'quem_sou': 'quem-sou',
  'meus_porques': 'meus-porques',
  'meus_padroes': 'meus-padroes'
} as const;

// Tipo para o estado da store
export type AutoconhecimentoState = {
  abaSelecionada: 'quem-sou' | 'meus-porques' | 'meus-padroes'
  notaSelecionadaId: string | null
  editandoNota: boolean
  criandoNota: boolean
  buscarTermo: string
  // Ações
  selecionarAba: (aba: 'quem-sou' | 'meus-porques' | 'meus-padroes') => void
  selecionarNota: (id: string | null) => void
  iniciarCriacaoNota: () => void
  cancelarCriacaoNota: () => void
  iniciarEdicaoNota: () => void
  cancelarEdicaoNota: () => void
  definirBuscarTermo: (termo: string) => void
}

// Estado inicial
const estadoInicial = {
  abaSelecionada: 'quem-sou' as const,
  notaSelecionadaId: null,
  editandoNota: false,
  criandoNota: false,
  buscarTermo: ''
}

// Conversores entre tipos da UI e tipos do banco
export const converterParaNota = (dbNota: NotaAutoconhecimento) => {
  return {
    id: dbNota.id,
    titulo: dbNota.titulo,
    conteudo: dbNota.conteudo,
    secao: categoriaParaSecao[dbNota.categoria as keyof typeof categoriaParaSecao] as 'quem-sou' | 'meus-porques' | 'meus-padroes',
    dataCriacao: dbNota.created_at || new Date().toISOString(),
    dataAtualizacao: dbNota.updated_at || new Date().toISOString()
  }
}

// Criação da store sem persistência (dados vêm do Supabase)
export const useAutoconhecimentoStore = create<AutoconhecimentoState>()((set) => ({
  ...estadoInicial,
  
  selecionarAba: (aba) => set({ abaSelecionada: aba }),
  
  selecionarNota: (id) => set({ 
    notaSelecionadaId: id,
    editandoNota: false,
    criandoNota: false
  }),
  
  iniciarCriacaoNota: () => set({ 
    criandoNota: true, 
    editandoNota: false,
    notaSelecionadaId: null
  }),
  
  cancelarCriacaoNota: () => set({ 
    criandoNota: false
  }),
  
  iniciarEdicaoNota: () => set({ 
    editandoNota: true,
    criandoNota: false
  }),
  
  cancelarEdicaoNota: () => set({ 
    editandoNota: false
  }),
  
  definirBuscarTermo: (termo) => set({
    buscarTermo: termo
  })
}))
