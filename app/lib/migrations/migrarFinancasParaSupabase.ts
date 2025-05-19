'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { v4 as uuidv4 } from 'uuid'

/**
 * Utilitário para migrar dados financeiros do localStorage para o Supabase
 * 
 * Esta função deve ser executada uma única vez por usuário quando ocorrer a migração
 * da aplicação para o Supabase.
 */
export async function migrarFinancasParaSupabase() {
  // Obter dados do localStorage
  try {
    const supabase = createClientComponentClient()
    
    // Verificar se o usuário está autenticado
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Usuário não autenticado')
    }
    
    const user_id = session.user.id
    
    // Obter os dados financeiros do localStorage
    const financasDataStr = localStorage.getItem('financas-state')
    
    if (!financasDataStr) {
      console.log('Nenhum dado financeiro encontrado no localStorage')
      return { success: true, message: 'Nenhum dado para migrar' }
    }
    
    const financasData = JSON.parse(financasDataStr)
    
    // Migrar categorias de gastos para uma estrutura mais simples no Supabase
    // No Supabase, usamos apenas o nome da categoria em vez de um ID separado
    const mapearCategorias = new Map()
    
    // 1. Migrar transações (gastos)
    if (financasData.transacoes && financasData.transacoes.length > 0) {
      const gastos = financasData.transacoes
        .filter((t: any) => t.tipo === 'despesa')
        .map((transacao: any) => {
          // Encontrar o nome da categoria
          const categoria = financasData.categorias.find((c: any) => c.id === transacao.categoriaId)
          const nomeCategoria = categoria ? categoria.nome : 'Outros'
          
          // Mapear a categoria para referência futura
          mapearCategorias.set(transacao.categoriaId, nomeCategoria)
          
          return {
            id: uuidv4(),
            user_id,
            valor: transacao.valor,
            categoria: nomeCategoria,
            descricao: transacao.descricao,
            data: new Date(transacao.data).toISOString(),
            created_at: new Date().toISOString()
          }
        })
      
      if (gastos.length > 0) {
        const { error } = await supabase.from('gastos').insert(gastos)
        if (error) {
          console.error('Erro ao migrar gastos:', error)
          return { success: false, message: `Erro ao migrar gastos: ${error.message}` }
        }
        console.log(`${gastos.length} gastos migrados com sucesso`)
      }
    }
    
    // 2. Migrar envelopes
    if (financasData.envelopes && financasData.envelopes.length > 0) {
      const envelopes = financasData.envelopes.map((envelope: any) => {
        return {
          id: uuidv4(),
          user_id,
          nome: envelope.nome,
          orcamento: envelope.valorAlocado,
          saldo_atual: envelope.valorUtilizado,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      })
      
      if (envelopes.length > 0) {
        const { error } = await supabase.from('envelopes').insert(envelopes)
        if (error) {
          console.error('Erro ao migrar envelopes:', error)
          return { success: false, message: `Erro ao migrar envelopes: ${error.message}` }
        }
        console.log(`${envelopes.length} envelopes migrados com sucesso`)
      }
    }
    
    // 3. Migrar pagamentos recorrentes
    if (financasData.pagamentosRecorrentes && financasData.pagamentosRecorrentes.length > 0) {
      const pagamentos = financasData.pagamentosRecorrentes.map((pagamento: any) => {
        // Converter o dia do mês para uma data completa
        const hoje = new Date()
        const dia = parseInt(pagamento.dataVencimento)
        let dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth(), dia)
        
        // Se o dia já passou neste mês, programar para o próximo mês
        if (dataVencimento < hoje && !pagamento.pago) {
          dataVencimento = new Date(hoje.getFullYear(), hoje.getMonth() + 1, dia)
        }
        
        return {
          id: uuidv4(),
          user_id,
          descricao: pagamento.descricao,
          valor: pagamento.valor,
          data_vencimento: dataVencimento.toISOString(),
          recorrente: true,
          pago: pagamento.pago,
          created_at: new Date().toISOString()
        }
      })
      
      if (pagamentos.length > 0) {
        const { error } = await supabase.from('pagamentos').insert(pagamentos)
        if (error) {
          console.error('Erro ao migrar pagamentos:', error)
          return { success: false, message: `Erro ao migrar pagamentos: ${error.message}` }
        }
        console.log(`${pagamentos.length} pagamentos migrados com sucesso`)
      }
    }
    
    return { 
      success: true, 
      message: 'Migração de dados financeiros concluída com sucesso' 
    }
    
  } catch (error) {
    console.error('Erro durante a migração:', error)
    return { 
      success: false, 
      message: `Erro durante a migração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
} 