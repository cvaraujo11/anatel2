-- Função para calcular estatísticas dos hiperfocos
CREATE OR REPLACE FUNCTION calcular_estatisticas_hiperfocos()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    resultado json;
    user_id uuid;
BEGIN
    -- Obter o ID do usuário atual
    user_id := auth.uid();
    
    -- Calcular estatísticas e retornar como JSON
    SELECT json_build_object(
        'total_projetos', (SELECT COUNT(*) FROM hiperfoco_projetos WHERE user_id = auth.uid()),
        'total_tarefas', (SELECT COUNT(*) FROM hiperfoco_tarefas WHERE projeto_id IN (SELECT id FROM hiperfoco_projetos WHERE user_id = auth.uid())),
        'tarefas_concluidas', (SELECT COUNT(*) FROM hiperfoco_tarefas WHERE concluida = true AND projeto_id IN (SELECT id FROM hiperfoco_projetos WHERE user_id = auth.uid())),
        'tarefas_pendentes', (SELECT COUNT(*) FROM hiperfoco_tarefas WHERE concluida = false AND projeto_id IN (SELECT id FROM hiperfoco_projetos WHERE user_id = auth.uid())),
        'projetos_por_mes', (
            SELECT json_agg(
                json_build_object(
                    'mes', TO_CHAR(DATE_TRUNC('month', data_inicio::date), 'MM/YYYY'),
                    'total', COUNT(*)
                )
            )
            FROM hiperfoco_projetos
            WHERE user_id = auth.uid() 
            GROUP BY DATE_TRUNC('month', data_inicio::date)
            ORDER BY DATE_TRUNC('month', data_inicio::date) DESC
            LIMIT 12
        ),
        'tarefas_por_projeto', (
            SELECT json_agg(
                json_build_object(
                    'projeto_id', p.id,
                    'titulo', p.titulo,
                    'total_tarefas', COUNT(t.id),
                    'concluidas', SUM(CASE WHEN t.concluida THEN 1 ELSE 0 END),
                    'taxa_conclusao', CASE 
                        WHEN COUNT(t.id) > 0 THEN 
                            ROUND((SUM(CASE WHEN t.concluida THEN 1 ELSE 0 END)::numeric / COUNT(t.id)) * 100, 2)
                        ELSE 0
                    END
                )
            )
            FROM hiperfoco_projetos p
            LEFT JOIN hiperfoco_tarefas t ON p.id = t.projeto_id
            WHERE p.user_id = auth.uid()
            GROUP BY p.id, p.titulo
            ORDER BY p.data_inicio DESC
        )
    ) INTO resultado;

    RETURN resultado;
END;
$$; 