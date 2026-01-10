import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReportsView } from "@/components/ReportsView";
import { Prisma } from "@prisma/client";

export default async function RelatoriosPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Buscar dados para relatórios
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // Dia
  const dayWorkDays = await prisma.workDay.findMany({
    where: {
      userId: user.id,
      date: today,
    },
  });

  // Semana
  const weekWorkDays = await prisma.workDay.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfWeek,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Mês
  const monthWorkDays = await prisma.workDay.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfMonth,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Abastecimentos
  const weekFuelings = await prisma.fueling.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfWeek,
      },
    },
  });

  const monthFuelings = await prisma.fueling.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startOfMonth,
      },
    },
  });

  // Calcular custo por km (últimos 30 dias)
  const last30Days = await prisma.workDay.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const last30DaysFuelings = await prisma.fueling.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const totalKm = last30Days.reduce(
    (sum: number, day: Prisma.WorkDayGetPayload<{}>) => sum + day.kmDriven,
    0
  );
  const totalFuelCost = last30DaysFuelings.reduce(
    (sum: number, f: Prisma.FuelingGetPayload<{}>) => sum + f.amount,
    0
  );
  const costPerKm = totalKm > 0 ? totalFuelCost / totalKm : 0;

  // Serializar dados para passar ao componente client
  // Formatar data preservando o dia correto usando UTC (evita problemas de timezone)
  const serializeWorkDay = (day: (typeof dayWorkDays)[0]) => {
    const date = day.date instanceof Date ? day.date : new Date(day.date);
    // Usar métodos UTC para garantir que o dia não mude
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dayNum = String(date.getUTCDate()).padStart(2, "0");
    return {
      id: day.id,
      date: `${year}-${month}-${dayNum}`,
      hoursWorked: day.hoursWorked,
      kmDriven: day.kmDriven,
      uberEarnings: day.uberEarnings,
      ninetynineEarnings: day.ninetynineEarnings,
    };
  };

  const serializeFueling = (fueling: (typeof weekFuelings)[0]) => {
    const date =
      fueling.date instanceof Date ? fueling.date : new Date(fueling.date);
    // Usar métodos UTC para garantir que o dia não mude
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dayNum = String(date.getUTCDate()).padStart(2, "0");
    return {
      id: fueling.id,
      date: `${year}-${month}-${dayNum}`,
      amount: fueling.amount,
      kmDriven: fueling.kmDriven,
    };
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Relatórios
      </h1>
      <ReportsView
        dayData={dayWorkDays.map(serializeWorkDay)}
        weekData={weekWorkDays.map(serializeWorkDay)}
        monthData={monthWorkDays.map(serializeWorkDay)}
        weekFuelings={weekFuelings.map(serializeFueling)}
        monthFuelings={monthFuelings.map(serializeFueling)}
        dailyGoal={user.dailyGoal}
        costPerKm={costPerKm}
      />
    </div>
  );
}
