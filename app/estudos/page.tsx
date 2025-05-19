'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/app/components/ui/button';
import { Calendar, Clock, Book } from 'lucide-react';
import Link from 'next/link';
import TemporizadorPomodoro from '@/app/components/estudos/TemporizadorPomodoro';
import RegistroEstudos from '@/app/components/estudos/RegistroEstudos';
import Modal from '@/app/components/ui/modal';
import VisualizadorMarkdown from '@/app/components/estudos/VisualizadorMarkdown';
import VisualizadorChecklist from '@/app/components/estudos/VisualizadorChecklist';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/app/components/ui/toast/use-toast';

export default function EstudosPage() {
  const router = useRouter();
  const [isFileListModalOpen, setIsFileListModalOpen] = useState(false);
  const [filesForSelection, setFilesForSelection] = useState<any[]>([]);
  const [selectedMaterialType, setSelectedMaterialType] = useState('');
  const [isVisualizationModalOpen, setIsVisualizationModalOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [proximoConcurso, setProximoConcurso] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // Material types for quick access
  const materialTypes = [
    'Resumos', 'Flashcards', 'Simulados', 'Tarefas',
    'Estratégias de Foco', 'Agendamento de Pausas',
    'Mapas Mentais', 'Outlines de Infográficos',
    'Checklists', 'Guias de Estudo'
  ];

  // Buscar próximo concurso
  useEffect(() => {
    const fetchProximoConcurso = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString();
        
        // Consulta ao Supabase para buscar o próximo concurso
        const { data, error } = await supabase
          .from('concursos')
          .select('*')
          .gte('data_prova', today)
          .order('data_prova', { ascending: true })
          .limit(1)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 = "não encontrado"
            console.error('Erro ao buscar próximo concurso:', error);
          }
          // Se não encontrou próximo concurso, não faz nada (continua com null)
        } else {
          setProximoConcurso(data);
        }
      } catch (error) {
        console.error('Erro ao carregar próximo concurso:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProximoConcurso();
  }, [supabase]);

  // Função para selecionar tipo de material
  const handleSelectMaterialType = async (materialType: string) => {
    // Armazenar o tipo selecionado
    setSelectedMaterialType(materialType);
    
    try {
      // Solicitar folderId (pode ser implementado com modal em vez de prompt)
      const folderId = prompt(`Informe o ID da pasta para ${materialType}:`);
      if (!folderId) return;

      // Buscar materiais do Drive via API
      const response = await fetch(`/api/drive/listar-materiais?folderId=${folderId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar materiais do Drive');
      }
      
      const data = await response.json();
      
      // Filtrar arquivos pelo tipo de material (case insensitive)
      const filteredFiles = data.filter((file: any) => 
        file.name.toLowerCase().includes(materialType.toLowerCase())
      );
      
      if (filteredFiles.length === 0) {
        toast({
          title: "Nenhum arquivo encontrado",
          description: `Não foram encontrados materiais do tipo ${materialType}`,
          variant: "warning"
        });
        return;
      } else if (filteredFiles.length === 1) {
        // Se só tem um arquivo, selecionar diretamente
        setSelectedFileId(filteredFiles[0].id);
        setModalTitle(`${materialType}: ${filteredFiles[0].name}`);
        setIsVisualizationModalOpen(true);
      } else {
        // Se tem múltiplos, abrir modal para escolha
        setFilesForSelection(filteredFiles);
        setIsFileListModalOpen(true);
      }
    } catch (error) {
      console.error("Erro ao buscar materiais:", error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar os materiais de estudo",
        variant: "destructive"
      });
    }
  };

  // Função para selecionar arquivo da lista
  const handleFileSelection = (file: any) => {
    setSelectedFileId(file.id);
    setModalTitle(`${selectedMaterialType}: ${file.name}`);
    setIsFileListModalOpen(false);
    setIsVisualizationModalOpen(true);
  };

  // Função para fechar modal de visualização
  const handleCloseVisualizationModal = () => {
    setIsVisualizationModalOpen(false);
    setSelectedFileId('');
    setModalTitle('');
  };

  // Calcular progresso do concurso
  const calcularProgressoConcurso = (concurso: any) => {
    if (!concurso || !concurso.conteudo_programatico || concurso.conteudo_programatico.length === 0) {
      return 0;
    }
    
    const concluidos = concurso.conteudo_programatico.filter((item: any) => item.progresso === 100).length;
    return Math.round((concluidos / concurso.conteudo_programatico.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temporizador Pomodoro */}
        <Card>
          <CardContent className="pt-6">
            <TemporizadorPomodoro />
          </CardContent>
        </Card>

        {/* Registro de Estudos */}
        <Card>
          <CardHeader>
            <CardTitle>Registro de Estudos</CardTitle>
          </CardHeader>
          <CardContent>
            <RegistroEstudos />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Próximo Concurso */}
        <Card className="border-l-4 border-l-estudos-primary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Próximo Concurso</span>
              <Link href="/concursos" className="text-sm text-blue-600 hover:underline">
                Ver Todos
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : proximoConcurso ? (
              <div>
                <h3 className="text-xl font-semibold mb-2">{proximoConcurso.titulo}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(proximoConcurso.data_prova), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {proximoConcurso.organizadora}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Progresso:</span> 
                      <span>{calcularProgressoConcurso(proximoConcurso)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-estudos-primary h-2.5 rounded-full" 
                        style={{ width: `${calcularProgressoConcurso(proximoConcurso)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/concursos/${proximoConcurso.id}`}>
                    <Button variant="outline" className="w-full">
                      Ver Detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="mb-4">Você não tem concursos planejados.</p>
                <Link href="/concursos">
                  <Button variant="default">
                    Adicionar Concurso
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Materiais de Estudo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Materiais de Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {materialTypes.map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  onClick={() => handleSelectMaterialType(type)}
                  className="h-20 flex flex-col justify-center text-center"
                >
                  <Book className="h-5 w-5 mb-1" />
                  <span className="text-xs">{type}</span>
                </Button>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link href="/estudos/simulado">
                <Button variant="default" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Simulado
                </Button>
              </Link>
              <Link href="/estudos/materiais">
                <Button variant="secondary" className="gap-2">
                  <Book className="h-4 w-4" />
                  Acesso a materiais de estudos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para seleção de arquivo */}
      {isFileListModalOpen && (
        <Modal
          isOpen={isFileListModalOpen}
          onClose={() => setIsFileListModalOpen(false)}
          title={`Selecione um material de ${selectedMaterialType}`}
        >
          <div className="space-y-2">
            {filesForSelection.map((file) => (
              <Button
                key={file.id}
                variant="outline"
                onClick={() => handleFileSelection(file)}
                className="w-full justify-start text-left"
              >
                {file.name}
              </Button>
            ))}
          </div>
        </Modal>
      )}

      {/* Modal para visualização do material */}
      {isVisualizationModalOpen && (
        <Modal
          isOpen={isVisualizationModalOpen}
          onClose={handleCloseVisualizationModal}
          title={modalTitle}
          maxWidth="max-w-4xl"
        >
          {selectedMaterialType === 'Checklists' ? (
            <VisualizadorChecklist fileId={selectedFileId} />
          ) : (
            <VisualizadorMarkdown fileId={selectedFileId} />
          )}
        </Modal>
      )}
    </div>
  );
}
