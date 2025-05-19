'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

// Tipos
export type Gasto = {
  id: string
  user_id: string
  valor: number
  categoria: string
  descricao: string | null
  data: string
  created_at: string
}

export type Envelope = {
  id: string
  user_id: string
  nome: string
  orcamento: number
  saldo_atual: number
  created_at: string
  updated_at: string
}

export type Pagamento = {
  id: string
  user_id: string
  descricao: string
  valor: number
  data_vencimento: string
  recorrente: boolean
  pago: boolean
  created_at: string
}

// Hook principal
export function useFinancasSupabase() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [envelopes, setEnvelopes] = useState<Envelope[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Carregar todos os dados
  useEffect(() => {
    async function carregarDados() {
      setLoading(true)
      setError(null)
      
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          throw new Error('Usuário não autenticado')
        }
        
        const user_id = session.user.id
        
        // Carregar gastos
        const { data: gastosData, error: gastosError } = await supabase
          .from('gastos')
          .select('*')
          .eq('user_id', user_id)
          .order('data', { ascending: false })
        
        if (gastosError) throw new Error(gastosError.message)
        
        // Carregar envelopes
        const { data: envelopesData, error: envelopesError } = await supabase
          .from('envelopes')
          .select('*')
          .eq('user_id', user_id)
          .order('nome')
        
        if (envelopesError) throw new Error(envelopesError.message)
        
        // Carregar pagamentos
        const { data: pagamentosData, error: pagamentosError } = await supabase
          .from('pagamentos')
          .select('*')
          .eq('user_id', user_id)
          .order('data_vencimento')
        
        if (pagamentosError) throw new Error(pagamentosError.message)
        
        setGastos(gastosData || [])
        setEnvelopes(envelopesData || [])
        setPagamentos(pagamentosData || [])
      } catch (e) {
        console.error('Erro ao carregar dados financeiros:', e)
        setError(e instanceof Error ? e.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }
    
    carregarDados()
    
    // Configurar assinaturas em tempo real
    const gastosSubscription = supabase
      .channel('gastos-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'gastos' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setGastos(prev => [payload.new as Gasto, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setGastos(prev => prev.filter(g => g.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setGastos(prev => prev.map(g => g.id === payload.new.id ? payload.new as Gasto : g))
        }
      })
      .subscribe()
      
    const envelopesSubscription = supabase
      .channel('envelopes-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'envelopes' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEnvelopes(prev => [...prev, payload.new as Envelope])
        } else if (payload.eventType === 'DELETE') {
          setEnvelopes(prev => prev.filter(e => e.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setEnvelopes(prev => prev.map(e => e.id === payload.new.id ? payload.new as Envelope : e))
        }
      })
      .subscribe()
      
    const pagamentosSubscription = supabase
      .channel('pagamentos-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'pagamentos' 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPagamentos(prev => [...prev, payload.new as Pagamento])
        } else if (payload.eventType === 'DELETE') {
          setPagamentos(prev => prev.filter(p => p.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setPagamentos(prev => prev.map(p => p.id === payload.new.id ? payload.new as Pagamento : p))
        }
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(gastosSubscription)
      supabase.removeChannel(envelopesSubscription)
      supabase.removeChannel(pagamentosSubscription)
    }
  }, [supabase, router])
  
  // Funções para manipular gastos
  async function adicionarGasto(valor: number, categoria: string, descricao: string, data: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Usuário não autenticado')
      }
      
      const user_id = session.user.id
      const novoGasto = {
        id: uuidv4(),
        user_id,
        valor,
        categoria,
        descricao,
        data
      }
      
      const { error } = await supabase
        .from('gastos')
        .insert(novoGasto)
      
      if (error) throw new Error(error.message)
      
      // Atualizar saldo do envelope correspondente, se existir
      const { data: envelope } = await supabase
        .from('envelopes')
        .select('*')
        .eq('user_id', user_id)
        .eq('nome', categoria)
        .single()
        
      if (envelope) {
        await supabase
          .from('envelopes')
          .update({ 
            saldo_atual: envelope.saldo_atual + valor,
            updated_at: new Date().toISOString()
          })
          .eq('id', envelope.id)
      }
      
      return true
    } catch (e) {
      console.error('Erro ao adicionar gasto:', e)
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      return false
    }
  }
  
  async function removerGasto(id: string) {
    try {
      // Obter detalhes do gasto para atualizar o envelope
      const { data: gasto } = await supabase
        .from('gastos')
        .select('*')
        .eq('id', id)
        .single()
        
      if (!gasto) throw new Error('Gasto não encontrado')
      
      const { error } = await supabase
        .from('gastos')
        .delete()
        .eq('id', id)
      
      if (error) throw new Error(error.message)
      
      // Atualizar saldo do envelope correspondente, se existir
      const { data: envelope } = await supabase
        .from('envelopes')
        .select('*')
        .eq('user_id', gasto.user_id)
        .eq('nome', gasto.categoria)
        .single()
        
      if (envelope) {
        await supabase
          .from('envelopes')
          .update({ 
            saldo_atual: envelope.saldo_atual - gasto.valor,
            updated_at: new Date().toISOString()
          })
          .eq('id', envelope.id)
      }
      
      return true
    } catch (e) {
      console.error('Erro ao remover gasto:', e)
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      return false
    }
  }
  
  // Funções para manipular envelopes
  async function adicionarEnvelope(nome: string, orcamento: number) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Usuário não autenticado')
      }
      
      const user_id = session.user.id
      const novoEnvelope = {
        id: uuidv4(),
        user_id,
        nome,
        orcamento,
        saldo_atual: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('envelopes')
        .insert(novoEnvelope)
      
      if (error) throw new Error(error.message)
      
      return true
    } catch (e) {
      console.error('Erro ao adicionar envelope:', e)
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      return false
    }
  }
  
  async function atualizarEnvelope(id: string, nome: string, orcamento: number) {
    try {
      const { error } = await supabase
        .from('envelopes')
        .update({ 
          nome, 
          orcamento,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw new Error(error.message)
      
      return true
    } catch (e) {
      console.error('Erro ao atualizar envelope:', e)
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      return false
    }
  }
  
  async function removerEnvelope(id: string) {
    try {
      const { error } = await supabase
        .from('envelopes')
        .delete()
        .eq('id', id)
      
      if (error) throw new Error(error.message)
      
      return true
    } catch (e) {
      console.error('Erro ao remover envelope:', e)
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      return false
    }
  }
  
  // Funções para manipular pagamentos
  async function adicionarPagamento(descricao: string, valor: number, data_vencimento: string, recorrente: boolean) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('Usuário não autenticado')
      }
      
      const user_id = session.user.id
      const novoPagamento = {
        id: uuidv4(),
        user_id,
        descricao,
        valor,
        data_vencimento,
        recorrente,
        pago: false,
        created_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('pagamentos')
        .insert(novoPagamento)
      
      if (error) throw new Error(error.message)
      
      return true
    } catch (e) {
      console.error('Erro ao adicionar pagamento:', e)
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      return false
    }
  }
  
  async function atualizarPagamento(id: string, descricao: string, valor: number, data_vencimento: string, recorrente: boolean) {
    try {
      const { error } = await supabase
        .from('pagamentos')
        .update({ 
          descricao, 
          valor,
          data_vencimento,
          recorrente
        })
        .eq('id', id)
      
      if (error) throw new Error(error.message)
      
      return true
    } catch (e) {
      console.error('Erro ao atualizar pagamento:', e)
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      return false
    }
  }
  
  async function removerPagamento(id: string) {
    try {
      const { error } = await supabase
        .from('pagamentos')
        .delete()
        .eq('id', id)
      
      if (error) throw new Error(error.message)
      
      return true
    } catch (e) {
      console.error('Erro ao remover pagamento:', e)
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      return false
    }
  }
  
  async function marcarPagamentoComoPago(id: string, pago: boolean) {
    try {
      const { error } = await supabase
        .from('pagamentos')
        .update({ pago })
        .eq('id', id)
      
      if (error) throw new Error(error.message)
      
      // Se marcado como pago e é recorrente, gerar o próximo pagamento
      if (pago) {
        const { data: pagamento } = await supabase
          .from('pagamentos')
          .select('*')
          .eq('id', id)
          .single()
          
        if (pagamento && pagamento.recorrente) {
          // Calcular próxima data (mês seguinte)
          const dataOriginal = new Date(pagamento.data_vencimento)
          const proximaData = new Date(dataOriginal)
          proximaData.setMonth(proximaData.getMonth() + 1)
          
          // Criar novo pagamento
          const novoPagamento = {
            id: uuidv4(),
            user_id: pagamento.user_id,
            descricao: pagamento.descricao,
            valor: pagamento.valor,
            data_vencimento: proximaData.toISOString(),
            recorrente: true,
            pago: false,
            created_at: new Date().toISOString()
          }
          
          await supabase.from('pagamentos').insert(novoPagamento)
        }
      }
      
      return true
    } catch (e) {
      console.error('Erro ao atualizar status do pagamento:', e)
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
      return false
    }
  }
  
  // Calcular totais e estatísticas
  const totalGastos = gastos.reduce((total, gasto) => total + gasto.valor, 0)
  
  const gastosPorCategoria = gastos.reduce((acc, gasto) => {
    acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.valor
    return acc
  }, {} as Record<string, number>)
  
  // Retornar os dados e funções
  return {
    gastos,
    envelopes,
    pagamentos,
    loading,
    error,
    totalGastos,
    gastosPorCategoria,
    adicionarGasto,
    removerGasto,
    adicionarEnvelope,
    atualizarEnvelope,
    removerEnvelope,
    adicionarPagamento,
    atualizarPagamento,
    removerPagamento,
    marcarPagamentoComoPago
  }
} 