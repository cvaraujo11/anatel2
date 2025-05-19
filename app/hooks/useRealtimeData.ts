import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Hook para configurar assinaturas em tempo real para tabelas do Supabase
 * 
 * @param table Nome da tabela para assinar mudanças
 * @param callback Função a ser chamada quando houver mudanças na tabela
 */
export function useRealtimeData(table: string, callback: () => void | Promise<void>) {
  const supabase = createClientComponentClient();
  
  useEffect(() => {
    // Obter o usuário atual
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      
      let channel: RealtimeChannel;
      
      const setupSubscription = async () => {
        // Cancelar qualquer assinatura anterior
        if (channel) {
          await supabase.removeChannel(channel);
        }
        
        // Configurar nova assinatura para a tabela especificada,
        // filtrando apenas para registros do usuário atual
        channel = supabase
          .channel(`${table}-changes`)
          .on(
            'postgres_changes',
            {
              event: '*', // Inscreve para todos os eventos (INSERT, UPDATE, DELETE)
              schema: 'public',
              table,
              filter: `user_id=eq.${user.id}`
            },
            () => {
              // Quando qualquer mudança ocorrer, chame o callback
              callback();
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`Assinatura ativa para a tabela ${table}`);
            }
          });
      };
      
      setupSubscription();
      
      // Executar o callback inicial para carregar os dados
      callback();
      
      // Limpar assinatura quando o componente for desmontado
      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    });
  }, [supabase, table, callback]);
} 