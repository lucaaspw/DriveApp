import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HomeToday } from "@/components/HomeToday";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { ExpenseAlerts } from "@/components/ExpenseAlerts";
import { Prisma } from "@prisma/client";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Buscar dia de trabalho de hoje
  const todayWorkDay = await prisma.workDay.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  // Buscar últimos 30 dias para calcular custo por km
  const last30Days = await prisma.workDay.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const last30DaysFuelings = await prisma.fueling.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Calcular custo por km
  const totalKm = last30Days.reduce((sum, day) => sum + day.kmDriven, 0);
  const totalFuelCost = last30DaysFuelings.reduce(
    (sum: number, f: Prisma.FuelingGetPayload<{}>) => sum + f.amount,
    0
  );
  const costPerKm = totalKm > 0 ? totalFuelCost / totalKm : 0;

  // Calcular gasto de hoje com combustível
  const todayFuelCost = todayWorkDay ? todayWorkDay.kmDriven * costPerKm : 0;

  // Buscar últimos 7 dias para analytics
  const last7Days = await prisma.workDay.findMany({
    where: {
      userId: user.id,
      date: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Serializar dados para passar ao componente client
  const serializedWorkDay = todayWorkDay
    ? {
        hoursWorked: todayWorkDay.hoursWorked,
        kmDriven: todayWorkDay.kmDriven,
        tripsCount: todayWorkDay.tripsCount,
        uberEarnings: todayWorkDay.uberEarnings,
        ninetynineEarnings: todayWorkDay.ninetynineEarnings,
        inDriveEarnings: todayWorkDay.inDriveEarnings,
      }
    : null;

  // Serializar últimos 7 dias para analytics
  const serializedLast7Days = last7Days.map((day) => {
    const date = day.date instanceof Date ? day.date : new Date(day.date);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dayNum = String(date.getUTCDate()).padStart(2, "0");
    return {
      date: `${year}-${month}-${dayNum}`,
      hoursWorked: day.hoursWorked,
      kmDriven: day.kmDriven,
      tripsCount: day.tripsCount,
      uberEarnings: day.uberEarnings,
      ninetynineEarnings: day.ninetynineEarnings,
      inDriveEarnings: day.inDriveEarnings,
    };
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        Olá, {user.name}
      </h1>
      
      {/* Alertas de despesas */}
      <ExpenseAlerts />
      
      <HomeToday
        workDay={serializedWorkDay}
        dailyGoal={user.dailyGoal}
        costPerKm={costPerKm}
        todayFuelCost={todayFuelCost}
      />
      
      {/* Analytics inspirados no CPMA */}
      {last7Days.length > 0 && (
        <DashboardAnalytics
          workDays={serializedLast7Days}
          costPerKm={costPerKm}
          dailyGoal={user.dailyGoal}
        />
      )}
    </div>
  );
}
