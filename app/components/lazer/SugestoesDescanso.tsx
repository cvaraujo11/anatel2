'use client'

import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/app/components/ui/card"
import { 
  Coffee, 
  Plus, 
  Trash2, 
  Heart, 
  Star 
} from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { useSugestoesDescanso, SugestaoDescanso } from '@/app/hooks/useSugestoesDescanso'
import { cn } from '@/app/lib/utils'
import { Skeleton } from '../ui/skeleton'

// Lista de atividades de descanso por categoria
const atividadesDescanso = {
  rapidas: [
    "Faça uma pausa para respirar profundamente por 2 minutos",
    "Tome um copo de água e observe o ambiente ao redor",
    "Realize alongamentos simples para o pescoço e ombros",
    "Olhe pela janela e observe 5 coisas diferentes",
    "Faça uma pequena caminhada dentro de casa",
    "Pratique a técnica 5-4-3-2-1 (observe 5 coisas que você vê, 4 que você sente, etc)",
    "Faça um pequeno desenho abstrato em um papel",
    "Escute uma música que você goste",
  ],
  criativas: [
    "Colorir um pequeno desenho ou mandala",
    "Fazer um origami simples",
    "Escrever um haiku (poema de 3 linhas)",
    "Fazer um esboço rápido do que você vê",
    "Criar uma pequena colagem com materiais disponíveis",
    "Inventar uma história curta sobre um objeto aleatório",
    "Escrever três coisas pelas quais você é grato hoje",
    "Tocar um instrumento musical por alguns minutos (se disponível)",
  ],
  físicas: [
    "Dançar ao som de uma música animada",
    "Fazer 10 agachamentos",
    "Caminhar ao ar livre por 10 minutos",
    "Praticar yoga por 5-10 minutos",
    "Fazer um jogo rápido de arremesso com uma bolinha",
    "Pular corda por 2 minutos",
    "Subir e descer escadas algumas vezes",
    "Fazer alongamentos para todas as partes do corpo",
  ],
  relaxantes: [
    "Praticar meditação guiada de 5 minutos",
    "Fazer uma massagem nas próprias mãos",
    "Preparar e desfrutar de uma xícara de chá",
    "Observar a natureza pela janela ou ao ar livre",
    "Ouvir sons da natureza (chuva, pássaros, ondas)",
    "Fazer exercícios de respiração profunda",
    "Aplicar aromaterapia com óleos essenciais",
    "Deitar-se e relaxar todos os músculos por 5 minutos",
  ]
}

export function SugestoesDescanso() {
  const { 
    sugestoes, 
    isLoading, 
    error, 
    adicionarSugestao, 
    removerSugestao, 
    toggleFavorita 
  } = useSugestoesDescanso();

  const [novaSugestao, setNovaSugestao] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Adicionar nova sugestão
  const handleAdicionarSugestao = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novaSugestao.trim()) return;
    
    try {
      setEnviando(true);
      await adicionarSugestao(novaSugestao);
      setNovaSugestao('');
    } catch (err) {
      console.error('Erro ao adicionar sugestão:', err);
    } finally {
      setEnviando(false);
    }
  };

  // Alternar status de favorita
  const handleToggleFavorita = async (id: string, favorita: boolean) => {
    try {
      await toggleFavorita(id, !favorita);
    } catch (err) {
      console.error('Erro ao marcar favorita:', err);
    }
  };

  // Remover sugestão
  const handleRemoverSugestao = async (id: string) => {
    try {
      await removerSugestao(id);
    } catch (err) {
      console.error('Erro ao remover sugestão:', err);
    }
  };

  // Organizar sugestões em favoritas e não favoritas
  const sugestoesFavoritas = sugestoes.filter(s => s.favorita);
  const sugestoesNormais = sugestoes.filter(s => !s.favorita);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="h-5 w-5" />
          <span>Sugestões de Descanso</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Formulário para adicionar nova sugestão */}
        <form onSubmit={handleAdicionarSugestao} className="flex gap-2 mb-4">
          <Input
            placeholder="Adicionar nova sugestão de descanso..."
            value={novaSugestao}
            onChange={(e) => setNovaSugestao(e.target.value)}
            className="flex-1"
            disabled={enviando || isLoading}
          />
          <Button type="submit" disabled={enviando || isLoading || !novaSugestao.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            <span>Adicionar</span>
          </Button>
        </form>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        ) : sugestoes.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            Nenhuma sugestão de descanso registrada. Adicione uma para começar!
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sugestões favoritas */}
            {sugestoesFavoritas.length > 0 && (
              <div className="space-y-2">
                <h3 className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Favoritas</span>
                </h3>
                <ul className="space-y-2">
                  {sugestoesFavoritas.map((sugestao) => (
                    <SugestaoItem
                      key={sugestao.id}
                      sugestao={sugestao}
                      onToggleFavorita={handleToggleFavorita}
                      onRemover={handleRemoverSugestao}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* Outras sugestões */}
            {sugestoesNormais.length > 0 && (
              <div className="space-y-2">
                {sugestoesFavoritas.length > 0 && (
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Outras sugestões
                  </h3>
                )}
                <ul className="space-y-2">
                  {sugestoesNormais.map((sugestao) => (
                    <SugestaoItem
                      key={sugestao.id}
                      sugestao={sugestao}
                      onToggleFavorita={handleToggleFavorita}
                      onRemover={handleRemoverSugestao}
                    />
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para cada item de sugestão
function SugestaoItem({
  sugestao,
  onToggleFavorita,
  onRemover
}: {
  sugestao: SugestaoDescanso;
  onToggleFavorita: (id: string, favorita: boolean) => void;
  onRemover: (id: string) => void;
}) {
  return (
    <li className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted transition-colors">
      <span className="flex-1 ml-2">{sugestao.descricao}</span>
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleFavorita(sugestao.id, sugestao.favorita)}
          className={cn("h-8 w-8", sugestao.favorita && "text-yellow-500")}
          title={sugestao.favorita ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart className="h-4 w-4" fill={sugestao.favorita ? "currentColor" : "none"} />
          <span className="sr-only">
            {sugestao.favorita ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemover(sugestao.id)}
          className="h-8 w-8 text-destructive/80 hover:text-destructive"
          title="Excluir sugestão"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Excluir</span>
        </Button>
      </div>
    </li>
  );
}
