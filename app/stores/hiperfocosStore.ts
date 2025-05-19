import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { HiperfocoProjetoType, HiperfocoTarefaType } from '../hooks/useHiperfocos'

// Tipos
export type Tarefa = {
  id: string
  texto: string
  concluida: boolean
  cor?: string
}

export type Hiperfoco = {
  id: string
  titulo: string
  descricao: string
  tarefas: Tarefa[]
  subTarefas: Record<string, Tarefa[]> // Id da tarefa pai -> lista de sub-tarefas
  cor: string
  dataCriacao: string
  tempoLimite?: number // em minutos, opcional
}

export type SessaoAlternancia = {
  id: string
  titulo: string
  hiperfocoAtual: string | null // ID do hiperfoco ativo
  hiperfocoAnterior: string | null // ID do hiperfoco anterior
  tempoInicio: string
  duracaoEstimada: number // em minutos
  concluida: boolean
}

interface HiperfocosState {
  // Estado
  loading: boolean
  error: string | null
  hiperfocoProjetos: HiperfocoProjetoType[]
  hiperfocoTarefas: HiperfocoTarefaType[]
  abaSelecionada: string
  estatisticas: any | null
  
  // Ações - Projetos
  carregarProjetos: () => Promise<void>
  adicionarHiperfocoProjetoSupabase: (projeto: Omit<HiperfocoProjetoType, 'id' | 'created_at'>) => Promise<HiperfocoProjetoType | null>
  atualizarHiperfocoProjetoSupabase: (id: string, updates: Partial<HiperfocoProjetoType>) => Promise<boolean>
  removerHiperfocoProjetoSupabase: (id: string) => Promise<boolean>
  
  // Ações - Tarefas
  carregarTarefas: () => Promise<void>
  adicionarHiperfocoTarefaSupabase: (tarefa: Omit<HiperfocoTarefaType, 'id' | 'created_at'>) => Promise<HiperfocoTarefaType | null>
  atualizarHiperfocoTarefaSupabase: (id: string, updates: Partial<HiperfocoTarefaType>) => Promise<boolean>
  removerHiperfocoTarefaSupabase: (id: string) => Promise<boolean>
  alternarConclusaoTarefa: (id: string) => Promise<boolean>
  
  // Ações - UI
  setAbaSelecionada: (aba: string) => Promise<void>
  carregarEstatisticas: () => Promise<void>
}

// Cores predefinidas para hiperfocos
export const CORES_HIPERFOCOS = [
  '#FF5252', // Vermelho
  '#4CAF50', // Verde
  '#2196F3', // Azul
  '#FF9800', // Laranja
  '#9C27B0', // Roxo
  '#795548', // Marrom
  '#607D8B'  // Azul acinzentado
]

const useHiperfocosStore = create<HiperfocosState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      loading: false,
      error: null,
      hiperfocoProjetos: [],
      hiperfocoTarefas: [],
      abaSelecionada: 'conversor',
      estatisticas: null,
      
      // Ações - Projetos
      carregarProjetos: async () => {
        const supabase = createClientComponentClient()
        set({ loading: true, error: null })
        
        try {
          // Buscar projetos do Supabase
          const { data, error } = await supabase
            .from('hiperfoco_projetos')
            .select('*')
            .order('data_inicio', { ascending: false })
          
          if (error) throw new Error(error.message)
          
          set({ hiperfocoProjetos: data || [] })
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Erro ao carregar projetos' })
          console.error('Erro ao carregar projetos:', err)
        } finally {
          set({ loading: false })
        }
      },
      
      adicionarHiperfocoProjetoSupabase: async (projeto) => {
        const supabase = createClientComponentClient()
        
        try {
          const { data, error } = await supabase
            .from('hiperfoco_projetos')
            .insert([projeto])
            .select()
            .single()
          
          if (error) throw new Error(error.message)
          
          set(state => ({
            hiperfocoProjetos: [...state.hiperfocoProjetos, data]
          }))
          
          return data
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Erro ao adicionar projeto' })
          console.error('Erro ao adicionar projeto:', err)
          return null
        }
      },
      
      atualizarHiperfocoProjetoSupabase: async (id, updates) => {
        const supabase = createClientComponentClient()
        
        try {
          const { error } = await supabase
            .from('hiperfoco_projetos')
            .update(updates)
            .eq('id', id)
          
          if (error) throw new Error(error.message)
          
          set(state => ({
            hiperfocoProjetos: state.hiperfocoProjetos.map(p => 
              p.id === id ? { ...p, ...updates } : p
            )
          }))
          
          return true
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Erro ao atualizar projeto' })
          console.error('Erro ao atualizar projeto:', err)
          return false
        }
      },
      
      removerHiperfocoProjetoSupabase: async (id) => {
        const supabase = createClientComponentClient()
        
        try {
          const { error } = await supabase
            .from('hiperfoco_projetos')
            .delete()
            .eq('id', id)
          
          if (error) throw new Error(error.message)
          
          // Atualizar estado local removendo o projeto e suas tarefas
          set(state => ({
            hiperfocoProjetos: state.hiperfocoProjetos.filter(p => p.id !== id),
            hiperfocoTarefas: state.hiperfocoTarefas.filter(t => t.projeto_id !== id)
          }))
          
          return true
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Erro ao remover projeto' })
          console.error('Erro ao remover projeto:', err)
          return false
        }
      },
      
      // Ações - Tarefas
      carregarTarefas: async () => {
        const supabase = createClientComponentClient()
        set({ loading: true, error: null })
        
        try {
          // Buscar tarefas do Supabase
          const { data, error } = await supabase
            .from('hiperfoco_tarefas')
            .select('*')
            .order('created_at', { ascending: true })
          
          if (error) throw new Error(error.message)
          
          set({ hiperfocoTarefas: data || [] })
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Erro ao carregar tarefas' })
          console.error('Erro ao carregar tarefas:', err)
        } finally {
          set({ loading: false })
        }
      },
      
      adicionarHiperfocoTarefaSupabase: async (tarefa) => {
        const supabase = createClientComponentClient()
        
        try {
          const { data, error } = await supabase
            .from('hiperfoco_tarefas')
            .insert([tarefa])
            .select()
            .single()
          
          if (error) throw new Error(error.message)
          
          set(state => ({
            hiperfocoTarefas: [...state.hiperfocoTarefas, data]
          }))
          
          return data
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Erro ao adicionar tarefa' })
          console.error('Erro ao adicionar tarefa:', err)
          return null
        }
      },
      
      atualizarHiperfocoTarefaSupabase: async (id, updates) => {
        const supabase = createClientComponentClient()
        
        try {
          const { error } = await supabase
            .from('hiperfoco_tarefas')
            .update(updates)
            .eq('id', id)
          
          if (error) throw new Error(error.message)
          
          set(state => ({
            hiperfocoTarefas: state.hiperfocoTarefas.map(t => 
              t.id === id ? { ...t, ...updates } : t
            )
          }))
          
          return true
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Erro ao atualizar tarefa' })
          console.error('Erro ao atualizar tarefa:', err)
          return false
        }
      },
      
      removerHiperfocoTarefaSupabase: async (id) => {
        const supabase = createClientComponentClient()
        
        try {
          const { error } = await supabase
            .from('hiperfoco_tarefas')
            .delete()
            .eq('id', id)
          
          if (error) throw new Error(error.message)
          
          set(state => ({
            hiperfocoTarefas: state.hiperfocoTarefas.filter(t => t.id !== id)
          }))
          
          return true
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Erro ao remover tarefa' })
          console.error('Erro ao remover tarefa:', err)
          return false
        }
      },
      
      alternarConclusaoTarefa: async (id) => {
        const { hiperfocoTarefas, atualizarHiperfocoTarefaSupabase } = get()
        const tarefa = hiperfocoTarefas.find(t => t.id === id)
        
        if (!tarefa) return false
        
        return await atualizarHiperfocoTarefaSupabase(id, { 
          concluida: !tarefa.concluida 
        })
      },
      
      // Ações - UI
      setAbaSelecionada: async (aba) => {
        const supabase = createClientComponentClient()
        
        // Armazenar a preferência do usuário
        try {
          await supabase
            .from('user_preferences')
            .upsert({ 
              user_id: (await supabase.auth.getUser()).data.user?.id,
              hiperfoco_aba_selecionada: aba
            }, { 
              onConflict: 'user_id' 
            })
        } catch (err) {
          console.error('Erro ao salvar preferência de aba:', err)
        }
        
        set({ abaSelecionada: aba })
      },
      
      carregarEstatisticas: async () => {
        const supabase = createClientComponentClient()
        
        try {
          // Chamar função RPC para cálculos estatísticos
          const { data, error } = await supabase.rpc('calcular_estatisticas_hiperfocos')
          
          if (error) throw new Error(error.message)
          
          set({ estatisticas: data })
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Erro ao carregar estatísticas' })
          console.error('Erro ao carregar estatísticas:', err)
        }
      }
    }),
    {
      name: 'hiperfocos-storage' // nome para o localStorage
    }
  )
)

export default useHiperfocosStore
