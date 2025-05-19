import { useState } from "react";
import useHiperfocosStore from "@/app/stores/hiperfocosStore";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowDownToLine, Sparkles } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ConversorTarefas() {
  const { hiperfocoProjetos, adicionarHiperfocoTarefaSupabase } = useHiperfocosStore();
  const { toast } = useToast();
  const [textoEntrada, setTextoEntrada] = useState("");
  const [projetoSelecionadoId, setProjetoSelecionadoId] = useState("");
  const [processando, setProcessando] = useState(false);
  const [tarefasConvertidas, setTarefasConvertidas] = useState<string[]>([]);

  const converterTexto = () => {
    if (!textoEntrada.trim()) {
      toast({
        title: "Texto vazio",
        description: "Digite algum texto para converter em tarefas.",
        variant: "destructive"
      });
      return;
    }

    // Lógica de conversão básica: dividir por linhas, pontos, traços ou números
    const linhas = textoEntrada
      .split(/[\n.;:•-]\s*/) // Dividir por quebras de linha, pontos, dois pontos, pontos e vírgulas, marcadores ou traços
      .filter(linha => 
        linha.trim().length > 3 && // Pelo menos 3 caracteres
        !/^\d+$/.test(linha.trim()) // Não é apenas um número
      )
      .map(linha => linha.trim())
      .filter(Boolean); // Remover linhas vazias

    setTarefasConvertidas(linhas);
  };

  const salvarTarefas = async () => {
    if (!projetoSelecionadoId) {
      toast({
        title: "Projeto não selecionado",
        description: "Selecione um projeto para salvar as tarefas.",
        variant: "destructive"
      });
      return;
    }

    if (tarefasConvertidas.length === 0) {
      toast({
        title: "Nenhuma tarefa",
        description: "Não há tarefas para salvar. Faça a conversão primeiro.",
        variant: "destructive"
      });
      return;
    }

    setProcessando(true);

    try {
      // Salvar todas as tarefas convertidas
      for (const descricao of tarefasConvertidas) {
        await adicionarHiperfocoTarefaSupabase({
          projeto_id: projetoSelecionadoId,
          descricao,
          concluida: false
        });
      }

      toast({
        title: "Tarefas salvas",
        description: `${tarefasConvertidas.length} tarefas foram adicionadas ao projeto.`,
      });

      // Limpar o formulário
      setTextoEntrada("");
      setTarefasConvertidas([]);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar as tarefas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setProcessando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Conversor de Tarefas</h2>
        <p className="text-muted-foreground">
          Converta texto livre em tarefas estruturadas para seus projetos de hiperfoco.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Painel de entrada */}
        <Card>
          <CardHeader>
            <CardTitle>Texto de Entrada</CardTitle>
            <CardDescription>
              Cole qualquer texto com tarefas, pontos ou lista de itens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Cole seu texto aqui... Cada linha, ponto, marcador ou item numerado será convertido em uma tarefa."
              className="min-h-[200px]"
              value={textoEntrada}
              onChange={(e) => setTextoEntrada(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button 
              onClick={converterTexto} 
              disabled={!textoEntrada.trim() || processando}
              className="w-full"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Converter em Tarefas
            </Button>
          </CardFooter>
        </Card>

        {/* Painel de saída */}
        <Card>
          <CardHeader>
            <CardTitle>Tarefas Convertidas</CardTitle>
            <CardDescription>
              {tarefasConvertidas.length 
                ? `${tarefasConvertidas.length} tarefas identificadas` 
                : "As tarefas convertidas aparecerão aqui"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tarefasConvertidas.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <ArrowDownToLine className="h-12 w-12 mb-2 opacity-20" />
                <p>Converta seu texto para visualizar as tarefas aqui</p>
              </div>
            ) : (
              <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {tarefasConvertidas.map((tarefa, index) => (
                  <li 
                    key={index} 
                    className="p-2 border rounded-md text-sm bg-muted/30"
                  >
                    {tarefa}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            {tarefasConvertidas.length > 0 && (
              <>
                <div className="w-full">
                  <Label htmlFor="projeto" className="mb-2 block">
                    Selecione o projeto destino
                  </Label>
                  <Select 
                    value={projetoSelecionadoId} 
                    onValueChange={setProjetoSelecionadoId}
                  >
                    <SelectTrigger id="projeto">
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {hiperfocoProjetos.length === 0 ? (
                        <SelectItem value="nenhum" disabled>
                          Nenhum projeto disponível
                        </SelectItem>
                      ) : (
                        hiperfocoProjetos.map((projeto) => (
                          <SelectItem key={projeto.id} value={projeto.id}>
                            {projeto.titulo}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={salvarTarefas} 
                  disabled={!projetoSelecionadoId || processando}
                  className="w-full"
                >
                  {processando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Tarefas no Projeto"
                  )}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>

      {hiperfocoProjetos.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Você precisa criar ao menos um projeto de hiperfoco para poder salvar tarefas convertidas.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground space-y-2">
        <h3 className="font-medium">Dicas para conversão:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Cole texto de e-mails, documentos ou notas</li>
          <li>Itens marcados com pontos, números ou traços são reconhecidos automaticamente</li>
          <li>O conversor também identifica tarefas por quebras de linha</li>
          <li>Edite manualmente a lista convertida antes de salvar se necessário</li>
        </ul>
      </div>
    </div>
  );
} 