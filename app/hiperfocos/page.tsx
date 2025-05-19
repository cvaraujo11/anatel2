import { Metadata } from "next";
import HiperfocosTabs from "@/app/components/hiperfocos/HiperfocosTabs";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Hiperfocos | SATI",
  description: "Gerencie seus projetos de hiperfoco e organize suas tarefas de forma eficiente",
};

export default async function HiperfocosPage() {
  // Verificação de autenticação do lado do servidor
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login?callbackUrl=/hiperfocos");
  }

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Hiperfocos</h1>
        <p className="text-muted-foreground">
          Gerencie seus projetos de hiperfoco e organize suas tarefas de forma eficiente
        </p>
      </div>

      <HiperfocosTabs />
    </div>
  );
}
