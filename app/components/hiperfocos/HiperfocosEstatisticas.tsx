import { useEffect, useState } from "react";
import useHiperfocosStore from "@/app/stores/hiperfocosStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, AlertCircle, PieChart, BarChart3, ListChecks, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

type Estatisticas = {
  total_projetos: number;
  total_tarefas: number;
  tarefas_concluidas: number;
  tarefas_pendentes: number;
  projetos_por_mes: Array<{
    mes: string;
    total: number;
  }>;
  tarefas_por_projeto: Array<{
    projeto_id: string;
    titulo: string;
    total_tarefas: number;
    concluidas: number;
    taxa_conclusao: number;
  }>;
};

export default function HiperfocosEstatisticas() {
  const { loading, error, estatisticas, carregarEstatisticas } = useHiperfocosStore();
  const [stats, setStats] = useState<Estatisticas | null>(null);

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  useEffect(() => {
    if (estatisticas) {
      setStats(estatisticas as Estatisticas);
    }
  }, [estatisticas]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Carregando estatísticas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        <AlertCircle className="h-8 w-8 mr-2" />
        <span>Erro ao carregar estatísticas: {error}</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-12 border rounded-lg bg-muted/20">
        <p className="text-lg text-muted-foreground">
          Nenhuma estatística disponível.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Crie projetos e tarefas para visualizar estatísticas.
        </p>
      </div>
    );
  }

  const taxaConclusaoGeral = stats.total_tarefas > 0 
    ? Math.round((stats.tarefas_concluidas / stats.total_tarefas) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Estatísticas de Hiperfoco</h2>
        <Button variant="outline" size="sm" onClick={() => carregarEstatisticas()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projetos Ativos
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_projetos}</div>
            <p className="text-xs text-muted-foreground">
              Total de projetos de hiperfoco
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Tarefas
            </CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_tarefas}</div>
            <p className="text-xs text-muted-foreground">
              Tarefas em todos os projetos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Concluídas
            </CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tarefas_concluidas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tarefas_pendentes} tarefas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conclusão
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taxaConclusaoGeral}%</div>
            <Progress value={taxaConclusaoGeral} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Projetos por mês */}
      {stats.projetos_por_mes && stats.projetos_por_mes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Projetos por Mês</CardTitle>
            <CardDescription>
              Histórico de criação de projetos nos últimos meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.projetos_por_mes.map((item) => (
                <div key={item.mes} className="flex items-center">
                  <div className="w-16 text-sm">{item.mes}</div>
                  <div className="w-full max-w-md">
                    <div className="flex items-center">
                      <div 
                        className="h-4 bg-primary rounded" 
                        style={{ 
                          width: `${Math.min(100, (item.total / Math.max(...stats.projetos_por_mes.map(i => i.total))) * 100)}%`
                        }}
                      />
                      <span className="ml-2 text-sm">{item.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso por projeto */}
      {stats.tarefas_por_projeto && stats.tarefas_por_projeto.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progresso por Projeto</CardTitle>
            <CardDescription>
              Taxa de conclusão de tarefas por projeto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.tarefas_por_projeto.map((projeto) => (
                <div key={projeto.projeto_id} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{projeto.titulo}</span>
                    <span className="text-sm text-muted-foreground">
                      {projeto.concluidas}/{projeto.total_tarefas} ({projeto.taxa_conclusao}%)
                    </span>
                  </div>
                  <Progress value={projeto.taxa_conclusao} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 