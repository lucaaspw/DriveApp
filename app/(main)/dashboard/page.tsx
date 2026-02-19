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

  // Buscar metas semanais e determinar meta do dia atual
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
    // Se a tabela não existir, usar meta padrão
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.error('Tabela WeeklyGoal não existe. Execute: npx prisma db push');
      weeklyGoals = null;
    } else {
      throw error;
    }
  }

  // Determinar meta do dia atual baseado no dia da semana
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  let todayDailyGoal = user.dailyGoal; // Fallback para meta padrão
  
  if (weeklyGoals) {
    switch (dayOfWeek) {
      case 0: // Domingo
        todayDailyGoal = weeklyGoals.sunday || 0;
        break;
      case 1: // Segunda
        todayDailyGoal = weeklyGoals.monday;
        break;
      case 2: // Terça
        todayDailyGoal = weeklyGoals.tuesday;
        break;
      case 3: // Quarta
        todayDailyGoal = weeklyGoals.wednesday;
        break;
      case 4: // Quinta
        todayDailyGoal = weeklyGoals.thursday;
        break;
      case 5: // Sexta
        todayDailyGoal = weeklyGoals.friday;
        break;
      case 6: // Sábado
        todayDailyGoal = weeklyGoals.saturday;
        break;
    }

    // Se a meta do dia for 0, usar a meta padrão
    if (todayDailyGoal === 0) {
      todayDailyGoal = user.dailyGoal;
    }
  }

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
        dailyGoal={todayDailyGoal}
        costPerKm={costPerKm}
        todayFuelCost={todayFuelCost}
      />
      
      {/* Analytics inspirados no CPMA */}
      {last7Days.length > 0 && (
        <DashboardAnalytics
          workDays={serializedLast7Days}
          costPerKm={costPerKm}
          dailyGoal={todayDailyGoal}
        />
      )}
    </div>
  );
}
