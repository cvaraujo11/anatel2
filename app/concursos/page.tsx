'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { Award, Calendar, Plus, Upload } from 'lucide-react';

import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import ConcursoForm from '@/app/components/concursos/ConcursoForm';
import ImportarConcursoJsonModal from '@/app/components/concursos/ImportarConcursoJsonModal';
import { useConcursos } from '@/app/hooks/useConcursos';

export default function ConcursosPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const { concursos, loading, error, adicionarConcurso, importarConcursoJSON, calcularProgresso } = useConcursos();
  const [progressos, setProgressos] = useState<Record<string, number>>({});
  const router = useRouter();

  // Mapeamento de status para labels em português
  const statusLabel = {
    'Planejado': 'Planejado',
    'Inscrito': 'Inscrito',
    'Estudando': 'Estudando',
    'Realizado': 'Realizado',
    'AguardandoResultado': 'Aguardando Resultado'
  };

  // Mapeamento de status para cores
  const statusColors = {
    'Planejado': 'bg-blue-100 text-blue-800',
    'Inscrito': 'bg-purple-100 text-purple-800',
    'Estudando': 'bg-green-100 text-green-800',
    'Realizado': 'bg-orange-100 text-orange-800',
    'AguardandoResultado': 'bg-yellow-100 text-yellow-800'
  };

  // Carregar progressos para todos os concursos
  useEffect(() => {
    const carregarProgressos = async () => {
      const resultados: Record<string, number> = {};
      
      for (const concurso of concursos) {
        const progresso = await calcularProgresso(concurso.id);
        resultados[concurso.id] = progresso;
      }
      
      setProgressos(resultados);
    };
    
    if (concursos.length > 0) {
      carregarProgressos();
    }
  }, [concursos, calcularProgresso]);

  const handleImportConcurso = async (concursoData: any) => {
    try {
      // Extrair conteúdo programático do objeto importado, se existir
      const conteudoProgramatico = concursoData.conteudoProgramatico || [];
      
      // Processar o concurso e seu conteúdo programático
      const concursoId = await importarConcursoJSON(concursoData, conteudoProgramatico);
      
      // Fechar o modal e redirecionar para a página de detalhes
      setShowImportModal(false);
      router.push(`/concursos/${concursoId}`);
    } catch (error) {
      console.error('Erro ao importar concurso:', error);
      alert('Erro ao importar concurso. Verifique o formato do arquivo.');
    }
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Concursos</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            Adicionar Manualmente
          </Button>
          <Button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2"
          >
            <Upload size={18} />
            Importar JSON
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">Carregando concursos...</div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">Erro ao carregar concursos: {error}</div>
      ) : concursos.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Award size={48} className="mx-auto mb-4 opacity-50" />
          <p>Você ainda não tem concursos cadastrados.</p>
          <p>Adicione seu primeiro concurso clicando em um dos botões acima.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {concursos.map((concurso) => (
            <Card key={concurso.id} className="overflow-hidden">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{concurso.titulo}</h2>
                <p className="text-gray-600 mb-2">{concurso.organizadora}</p>
                
                {/* Status do concurso */}
                {concurso.status && (
                  <div className="mb-2">
                    <span className={`rounded-full px-3 py-1 text-xs ${statusColors[concurso.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                      {statusLabel[concurso.status as keyof typeof statusLabel] || concurso.status}
                    </span>
                  </div>
                )}
                
                {/* Data da prova */}
                {concurso.data_prova && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar size={14} />
                    <span>
                      {format(new Date(concurso.data_prova), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                )}
                
                {/* Barra de progresso */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${progressos[concurso.id] || 0}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  Progresso: {progressos[concurso.id] || 0}%
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/concursos/${concurso.id}`)}
                >
                  Ver detalhes
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Adicionar Concurso */}
      {showAddModal && (
        <ConcursoForm 
          onClose={() => setShowAddModal(false)}
          onSave={async (concursoData) => {
            try {
              await adicionarConcurso(concursoData);
              setShowAddModal(false);
            } catch (error) {
              console.error('Erro ao adicionar concurso:', error);
              alert('Erro ao adicionar concurso. Tente novamente.');
            }
          }}
        />
      )}

      {/* Modal de Importação JSON */}
      {showImportModal && (
        <ImportarConcursoJsonModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportConcurso}
        />
      )}
    </div>
  );
}
