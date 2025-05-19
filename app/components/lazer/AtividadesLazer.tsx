'use client'

import { useState } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/app/components/ui/card"
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  Clock, 
  Tag 
} from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/app/components/ui/dialog"
import { Label } from "@/app/components/ui/label"
import { useAtividadesLazer, AtividadeLazer } from '@/app/hooks/useAtividadesLazer'
import { Badge } from '../ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Skeleton } from '../ui/skeleton'

// Categorias de atividades de lazer
const CATEGORIAS = [
  'Leitura',
  'Exercício',
  'Arte',
  'Música',
  'Meditação',
  'Jogos',
  'Social',
  'Natureza',
  'Culinária',
  'Outros'
]

export function AtividadesLazer() {
  const { 
    atividades, 
    isLoading, 
    error, 
    adicionarAtividade, 
    removerAtividade, 
    atualizarAtividade 
  } = useAtividadesLazer()

  const [dialogAberto, setDialogAberto] = useState(false)
  const [modoEdicao, setModoEdicao] = useState(false)
  const [atividadeAtual, setAtividadeAtual] = useState<AtividadeLazer | null>(null)
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState<string>('')
  const [duracao, setDuracao] = useState<number | ''>('')

  // Resetar o formulário
  const resetarFormulario = () => {
    setNome('')
    setCategoria('')
    setDuracao('')
    setAtividadeAtual(null)
    setModoEdicao(false)
  }

  // Abrir diálogo para adicionar nova atividade
  const abrirDialogAdicionar = () => {
    resetarFormulario()
    setDialogAberto(true)
  }

  // Abrir diálogo para editar atividade existente
  const abrirDialogEditar = (atividade: AtividadeLazer) => {
    setAtividadeAtual(atividade)
    setNome(atividade.nome)
    setCategoria(atividade.categoria || '')
    setDuracao(atividade.duracao_minutos || '')
    setModoEdicao(true)
    setDialogAberto(true)
  }

  // Salvar atividade (nova ou editada)
  const salvarAtividade = async () => {
    if (!nome.trim()) return

    try {
      if (modoEdicao && atividadeAtual) {
        await atualizarAtividade(atividadeAtual.id, {
          nome,
          categoria: categoria || null,
          duracao_minutos: duracao === '' ? null : Number(duracao)
        })
      } else {
        await adicionarAtividade({
          nome,
          categoria: categoria || null,
          duracao_minutos: duracao === '' ? null : Number(duracao)
        })
      }
      
      setDialogAberto(false)
      resetarFormulario()
    } catch (err) {
      console.error('Erro ao salvar atividade:', err)
    }
  }

  // Excluir atividade
  const excluirAtividade = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      try {
        await removerAtividade(id)
      } catch (err) {
        console.error('Erro ao excluir atividade:', err)
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          <span>Atividades de Lazer</span>
        </CardTitle>
        <Button onClick={abrirDialogAdicionar} size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1" />
          <span className="sr-only sm:not-sr-only">Adicionar</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            {error}
          </div>
        ) : atividades.length === 0 ? (
          <div className="text-center text-muted-foreground p-4">
            Nenhuma atividade de lazer registrada. Adicione uma para começar!
          </div>
        ) : (
          <ul className="space-y-3">
            {atividades.map((atividade) => (
              <li 
                key={atividade.id} 
                className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
              >
                <div className="flex-1 mr-4">
                  <h4 className="font-medium">{atividade.nome}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {atividade.categoria && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {atividade.categoria}
                      </Badge>
                    )}
                    {atividade.duracao_minutos && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {atividade.duracao_minutos} min
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => abrirDialogEditar(atividade)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => excluirAtividade(atividade.id)}
                    className="h-8 w-8 text-destructive/80 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Diálogo para adicionar/editar atividade */}
        <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {modoEdicao ? 'Editar Atividade' : 'Nova Atividade de Lazer'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Atividade</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Leitura, Caminhada, Pintura..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={categoria} 
                  onValueChange={setCategoria}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos)</Label>
                <Input
                  id="duracao"
                  type="number"
                  min="1"
                  max="1440"
                  value={duracao}
                  onChange={(e) => {
                    const val = e.target.value
                    setDuracao(val === '' ? '' : parseInt(val))
                  }}
                  placeholder="Opcional"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={salvarAtividade}>
                {modoEdicao ? 'Salvar Alterações' : 'Adicionar Atividade'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
