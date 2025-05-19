'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

type ImportarConcursoJsonModalProps = {
  onClose: () => void;
  onImport: (concurso: any) => void;
};

export default function ImportarConcursoJsonModal({ 
  onClose, 
  onImport 
}: ImportarConcursoJsonModalProps) {
  const [json, setJson] = useState('');
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setJsonFile(file);
    
    // Ler o conteúdo do arquivo
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setJson(e.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    try {
      setCarregando(true);
      setErro('');
      
      // Validar se o JSON é válido
      if (!json.trim()) {
        setErro('Por favor, insira ou faça upload de um arquivo JSON válido');
        return;
      }
      
      // Converter o JSON para objeto
      const concursoData = JSON.parse(json);
      
      // Validar campos obrigatórios mínimos
      if (!concursoData.titulo) {
        setErro('O JSON deve conter pelo menos o campo "titulo"');
        return;
      }
      
      // Chamar a função de importação
      onImport(concursoData);
    } catch (error: any) {
      setErro(`Erro ao processar o JSON: ${error.message}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Importar Concurso via JSON</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {erro && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {erro}
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Faça upload de um arquivo JSON com os dados do concurso ou cole o conteúdo diretamente no campo abaixo.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center mb-4">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
              id="json-file-input"
            />
            <label htmlFor="json-file-input" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <span className="mt-2 block text-sm font-medium text-gray-700">
                {jsonFile ? jsonFile.name : 'Clique para selecionar um arquivo JSON'}
              </span>
            </label>
          </div>
          
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Conteúdo JSON
          </label>
          <textarea
            value={json}
            onChange={(e) => setJson(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-40"
            placeholder='{"titulo": "Concurso INSS", "organizadora": "CESPE", "data_prova": "2023-12-25", "conteudoProgramatico": [{"descricao": "Português", "progresso": 0}, {"descricao": "Matemática", "progresso": 0}]}'
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={onClose}
            disabled={carregando}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleImport}
            disabled={carregando}
          >
            {carregando ? 'Processando...' : 'Importar'}
          </Button>
        </div>
      </div>
    </div>
  );
}