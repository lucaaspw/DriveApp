import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReportsView } from "@/components/ReportsView";

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

  const totalKm = last30Days.reduce((sum, day) => sum + day.kmDriven, 0);
  const totalFuelCost = last30DaysFuelings.reduce(
    (sum, f) => sum + f.amount,
    0
  );
  const costPerKm = totalKm > 0 ? totalFuelCost / totalKm : 0;

  // Serializar dados para passar ao componente client
  const serializeWorkDay = (day: (typeof dayWorkDays)[0]) => ({
    id: day.id,
    date: day.date.toISOString(),
    hoursWorked: day.hoursWorked,
    kmDriven: day.kmDriven,
    uberEarnings: day.uberEarnings,
    ninetynineEarnings: day.ninetynineEarnings,
  });

  const serializeFueling = (fueling: (typeof weekFuelings)[0]) => ({
    id: fueling.id,
    date: fueling.date.toISOString(),
    amount: fueling.amount,
    kmDriven: fueling.kmDriven,
  });

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
