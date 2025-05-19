import { TemporizadorLazer } from "@/app/components/lazer/TemporizadorLazer";
import { AtividadesLazer } from "@/app/components/lazer/AtividadesLazer";
import { SugestoesDescanso } from "@/app/components/lazer/SugestoesDescanso";
import { Card } from '@/app/components/ui/card';

export const metadata = {
  title: 'Lazer - StayFocus',
  description: 'Gerencie seu tempo de lazer e encontre sugestões para momentos de descanso',
};

export default function LazerPage() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Lazer e Descanso</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TemporizadorLazer />
        
        <div className="space-y-6">
          <AtividadesLazer />
          <SugestoesDescanso />
        </div>
      </div>
    </div>
  );
}
