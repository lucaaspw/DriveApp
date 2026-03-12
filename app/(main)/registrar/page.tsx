import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";
import { prisma } from "@/lib/prisma";

interface RegistrarPageProps {
  searchParams: {
    edit?: string;
  };
}

export default async function RegistrarPage({ searchParams }: RegistrarPageProps) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  let initialData = undefined;
  if (searchParams.edit) {
    const workDay = await prisma.workDay.findFirst({
      where: {
        id: searchParams.edit,
        userId: user.id,
      },
    });

    if (workDay) {
      // Formatar data para YYYY-MM-DD
      const date = workDay.date instanceof Date ? workDay.date : new Date(workDay.date);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      
      initialData = {
        id: workDay.id,
        date: `${year}-${month}-${day}`,
        hoursWorked: workDay.hoursWorked,
        kmDriven: workDay.kmDriven,
        tripsCount: workDay.tripsCount,
        uberEarnings: workDay.uberEarnings,
        ninetynineEarnings: workDay.ninetynineEarnings,
        inDriveEarnings: workDay.inDriveEarnings,
      };
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        {initialData ? "Editar Registro" : "Registrar"}
      </h1>
      <RegisterForm dailyGoal={user.dailyGoal} initialData={initialData} />
    </div>
  );
}
