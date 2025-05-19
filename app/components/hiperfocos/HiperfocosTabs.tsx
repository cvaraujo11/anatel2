import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect } from "react";
import useHiperfocosStore from "@/app/stores/hiperfocosStore";
import HiperfocosProjetos from "./HiperfocosProjetos";
import HiperfocosEstatisticas from "./HiperfocosEstatisticas";
import ConversorTarefas from "./ConversorTarefas";

export default function HiperfocosTabs() {
  const { abaSelecionada, setAbaSelecionada } = useHiperfocosStore();

  useEffect(() => {
    // Carregar preferência de aba do usuário
    const savedTab = localStorage.getItem("hiperfocoAba");
    if (savedTab) {
      setAbaSelecionada(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    setAbaSelecionada(value);
    localStorage.setItem("hiperfocoAba", value);
  };

  return (
    <Tabs
      defaultValue={abaSelecionada}
      value={abaSelecionada}
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="conversor" className="text-sm">
          Conversor de Tarefas
        </TabsTrigger>
        <TabsTrigger value="projetos" className="text-sm">
          Projetos
        </TabsTrigger>
        <TabsTrigger value="estatisticas" className="text-sm">
          Estatísticas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="conversor" className="mt-4">
        <ConversorTarefas />
      </TabsContent>

      <TabsContent value="projetos" className="mt-4">
        <HiperfocosProjetos />
      </TabsContent>

      <TabsContent value="estatisticas" className="mt-4">
        <HiperfocosEstatisticas />
      </TabsContent>
    </Tabs>
  );
} 