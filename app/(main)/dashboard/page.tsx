import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatTime } from "@/lib/utils";
import { HomeToday } from "@/components/HomeToday";

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
  const totalKm = last30Days.reduce(
    (sum: number, day) => sum + day.kmDriven,
    0
  );
  const totalFuelCost = last30DaysFuelings.reduce(
    (sum: number, f) => sum + f.amount,
    0
  );
  const costPerKm = totalKm > 0 ? totalFuelCost / totalKm : 0;

  // Calcular gasto de hoje com combustível
  const todayFuelCost = todayWorkDay ? todayWorkDay.kmDriven * costPerKm : 0;

  // Serializar dados para passar ao componente client
  const serializedWorkDay = todayWorkDay
    ? {
        hoursWorked: todayWorkDay.hoursWorked,
        kmDriven: todayWorkDay.kmDriven,
        uberEarnings: todayWorkDay.uberEarnings,
        ninetynineEarnings: todayWorkDay.ninetynineEarnings,
      }
    : null;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Olá, {user.name}
      </h1>
      <HomeToday
        workDay={serializedWorkDay}
        dailyGoal={user.dailyGoal}
        costPerKm={costPerKm}
        todayFuelCost={todayFuelCost}
      />
    </div>
  );
}
