import { useEffect, useState } from "react";
import useHiperfocosStore from "@/app/stores/hiperfocosStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Check, RefreshCw, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HiperfocoProjetoType, HiperfocoTarefaType } from "@/app/hooks/useHiperfocos";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export default function HiperfocosProjetos() {
  const { 
    hiperfocoProjetos, 
    hiperfocoTarefas, 
    loading, 
    error,
    carregarProjetos, 
    carregarTarefas,
    adicionarHiperfocoProjetoSupabase,
    atualizarHiperfocoProjetoSupabase,
    removerHiperfocoProjetoSupabase,
    adicionarHiperfocoTarefaSupabase,
    atualizarHiperfocoTarefaSupabase,
    removerHiperfocoTarefaSupabase,
    alternarConclusaoTarefa
  } = useHiperfocosStore();

  const [novoProjetoAberto, setNovoProjetoAberto] = useState(false);
  const [novaTarefaAberta, setNovaTarefaAberta] = useState(false);
  const [projetoSelecionado, setProjetoSelecionado] = useState<HiperfocoProjetoType | null>(null);
  const [novoProjeto, setNovoProjeto] = useState<Partial<HiperfocoProjetoType>>({
    titulo: "",
    descricao: "",
    cor: "#4CAF50",
    data_inicio: format(new Date(), "yyyy-MM-dd")
  });
  const [novaTarefa, setNovaTarefa] = useState<Partial<HiperfocoTarefaType>>({
    descricao: "",
    concluida: false
  });

  useEffect(() => {
    carregarProjetos();
    carregarTarefas();
  }, []);

  const handleAdicionarProjeto = async () => {
    if (!novoProjeto.titulo) return;

    await adicionarHiperfocoProjetoSupabase({
      titulo: novoProjeto.titulo,
      descricao: novoProjeto.descricao || "",
      cor: novoProjeto.cor || "#4CAF50",
      data_inicio: novoProjeto.data_inicio || format(new Date(), "yyyy-MM-dd")
    });

    setNovoProjeto({
      titulo: "",
      descricao: "",
      cor: "#4CAF50",
      data_inicio: format(new Date(), "yyyy-MM-dd")
    });
    setNovoProjetoAberto(false);
  };

  const handleAdicionarTarefa = async () => {
    if (!novaTarefa.descricao || !projetoSelecionado) return;

    await adicionarHiperfocoTarefaSupabase({
      projeto_id: projetoSelecionado.id,
      descricao: novaTarefa.descricao,
      concluida: novaTarefa.concluida || false
    });

    setNovaTarefa({
      descricao: "",
      concluida: false
    });
    setNovaTarefaAberta(false);
  };

  const handleRemoverProjeto = async (id: string) => {
    if (confirm("Tem certeza que deseja remover este projeto e todas as suas tarefas?")) {
      await removerHiperfocoProjetoSupabase(id);
    }
  };

  const handleRemoverTarefa = async (id: string) => {
    if (confirm("Tem certeza que deseja remover esta tarefa?")) {
      await removerHiperfocoTarefaSupabase(id);
    }
  };

  const getTarefasDoProjeto = (projetoId: string) => {
    return hiperfocoTarefas.filter(t => t.projeto_id === projetoId);
  };

  const calcularProgresso = (projetoId: string) => {
    const tarefas = getTarefasDoProjeto(projetoId);
    if (tarefas.length === 0) return 0;
    
    const concluidas = tarefas.filter(t => t.concluida).length;
    return Math.round((concluidas / tarefas.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="animate-spin h-8 w-8 text-primary" />
        <span className="ml-2">Carregando projetos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-destructive">
        <AlertCircle className="h-8 w-8 mr-2" />
        <span>Erro ao carregar projetos: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projetos de Hiperfoco</h2>
        <Dialog open={novoProjetoAberto} onOpenChange={setNovoProjetoAberto}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Projeto de Hiperfoco</DialogTitle>
              <DialogDescription>
                Adicione um novo projeto para organizar suas tarefas de hiperfoco.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={novoProjeto.titulo}
                  onChange={(e) => setNovoProjeto({ ...novoProjeto, titulo: e.target.value })}
                  placeholder="Ex: Projeto Final de Curso"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={novoProjeto.descricao}
                  onChange={(e) => setNovoProjeto({ ...novoProjeto, descricao: e.target.value })}
                  placeholder="Descreva o propósito deste projeto..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cor">Cor</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cor"
                    type="color"
                    value={novoProjeto.cor}
                    onChange={(e) => setNovoProjeto({ ...novoProjeto, cor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <span className="text-sm text-muted-foreground">Escolha uma cor para identificar este projeto</span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="data_inicio">Data de Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={novoProjeto.data_inicio}
                  onChange={(e) => setNovoProjeto({ ...novoProjeto, data_inicio: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNovoProjetoAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAdicionarProjeto}>
                Criar Projeto
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {hiperfocoProjetos.length === 0 ? (
        <div className="text-center p-12 border rounded-lg bg-muted/20">
          <p className="text-lg text-muted-foreground">
            Você ainda não tem projetos de hiperfoco.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Crie seu primeiro projeto clicando no botão acima.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hiperfocoProjetos.map((projeto) => {
            const tarefas = getTarefasDoProjeto(projeto.id);
            const progresso = calcularProgresso(projeto.id);
            const dataFormatada = format(new Date(projeto.data_inicio), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
            
            return (
              <Card key={projeto.id} className="overflow-hidden">
                <div 
                  className="h-2" 
                  style={{ backgroundColor: projeto.cor || '#4CAF50' }}
                />
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{projeto.titulo}</CardTitle>
                      <CardDescription>
                        Iniciado em {dataFormatada}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8" 
                              onClick={() => {
                                setNovoProjeto({
                                  ...projeto,
                                  data_inicio: projeto.data_inicio
                                });
                                // Abrir modal de edição
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar projeto</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRemoverProjeto(projeto.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remover projeto</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {projeto.descricao && (
                    <p className="text-sm text-muted-foreground mb-4">{projeto.descricao}</p>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm text-muted-foreground">{progresso}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300 ease-in-out"
                        style={{ width: `${progresso}%` }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-semibold">Tarefas ({tarefas.length})</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 p-0 px-2"
                        onClick={() => {
                          setProjetoSelecionado(projeto);
                          setNovaTarefaAberta(true);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        <span className="text-xs">Adicionar</span>
                      </Button>
                    </div>
                    
                    <ScrollArea className="h-[150px] pr-3">
                      <ul className="space-y-2">
                        {tarefas.length === 0 ? (
                          <li className="text-sm text-muted-foreground text-center py-4">
                            Nenhuma tarefa adicionada
                          </li>
                        ) : (
                          tarefas.map((tarefa) => (
                            <li 
                              key={tarefa.id} 
                              className="flex items-start gap-2 group"
                            >
                              <Checkbox
                                checked={tarefa.concluida}
                                onCheckedChange={() => alternarConclusaoTarefa(tarefa.id)}
                                className="mt-0.5"
                              />
                              <div className="flex-1">
                                <p className={cn(
                                  "text-sm transition-all",
                                  tarefa.concluida && "line-through text-muted-foreground"
                                )}>
                                  {tarefa.descricao}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoverTarefa(tarefa.id)}
                              >
                                <Trash2 className="h-3 w-3 text-muted-foreground" />
                              </Button>
                            </li>
                          ))
                        )}
                      </ul>
                    </ScrollArea>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full flex justify-between items-center">
                    <Badge variant={progresso === 100 ? "default" : "outline"}>
                      {tarefas.filter(t => t.concluida).length}/{tarefas.length} concluídas
                    </Badge>
                    
                    {progresso === 100 && (
                      <Badge className="bg-green-500">
                        <Check className="h-3 w-3 mr-1" />
                        Completo!
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog para adicionar nova tarefa */}
      <Dialog open={novaTarefaAberta} onOpenChange={setNovaTarefaAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Tarefa</DialogTitle>
            <DialogDescription>
              {projetoSelecionado && `Adicione uma nova tarefa ao projeto "${projetoSelecionado.titulo}"`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="descricao-tarefa">Descrição da Tarefa</Label>
              <Input
                id="descricao-tarefa"
                value={novaTarefa.descricao}
                onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
                placeholder="Ex: Implementar funcionalidade X"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="concluida"
                checked={novaTarefa.concluida}
                onCheckedChange={(checked) => 
                  setNovaTarefa({ ...novaTarefa, concluida: checked as boolean })
                }
              />
              <Label htmlFor="concluida">Marcar como concluída</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaTarefaAberta(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdicionarTarefa}>
              Adicionar Tarefa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 