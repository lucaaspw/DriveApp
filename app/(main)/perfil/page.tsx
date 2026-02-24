import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/ProfileView";
import { WeeklyGoals } from "@/components/WeeklyGoals";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function PerfilPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();

  // Buscar metas semanais
  let weeklyGoals = null;
  try {
    weeklyGoals = await prisma.weeklyGoal.findUnique({
      where: { userId: user.id },
    });

    // Se não existir, criar com valores padrão
    if (!weeklyGoals) {
      weeklyGoals = await prisma.weeklyGoal.create({
        data: {
          userId: user.id,
          monday: 400,
          tuesday: 470,
          wednesday: 470,
          thursday: 470,
          friday: 550,
          saturday: 390,
          sunday: 0,
          weeklyTotal: 2750,
        },
      });
    }
  } catch (error: any) {
    // Se a tabela não existir, mostrar erro amigável
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.error('Tabela WeeklyGoal não existe. Execute: npx prisma db push');
      // Retornar null para o componente lidar com isso
      weeklyGoals = null;
    } else {
      throw error;
    }
  }

  // Serializar dados do Clerk para passar ao componente client
  const serializedClerkUser = clerkUser ? {
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    emailAddresses: clerkUser.emailAddresses.map(e => ({ emailAddress: e.emailAddress })),
    imageUrl: clerkUser.imageUrl,
  } : null;

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Perfil</h1>
      <div className="max-w-2xl space-y-4 md:space-y-6">
        <ProfileView
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            dailyGoal: user.dailyGoal,
            monthlyGoal: user.monthlyGoal,
          }}
          clerkUser={serializedClerkUser}
        />
        <WeeklyGoals initialData={weeklyGoals} />
      </div>
    </div>
  );
}
