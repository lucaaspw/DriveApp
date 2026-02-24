import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HomeToday } from "@/components/HomeToday";
import { DashboardAnalytics } from "@/components/DashboardAnalytics";
import { ExpenseAlerts } from "@/components/ExpenseAlerts";

// Cache seletivo: revalidar a cada 60 segundos para dados recentes
export const revalidate = 60;

// Função para buscar dados históricos com cache (dados com mais de 1 dia)
function getCachedHistoricalData(userId: string, thirtyDaysAgo: Date) {
  return unstable_cache(
    async () => {
      const [workDays, fuelings] = await Promise.all([
        prisma.workDay.findMany({
          where: {
            userId,
            date: {
              gte: thirtyDaysAgo,
            },
          },
          select: {
            kmDriven: true,
            date: true,
            hoursWorked: true,
            tripsCount: true,
            uberEarnings: true,
            ninetynineEarnings: true,
            inDriveEarnings: true,
          },
          orderBy: {
            date: "desc",
          },
        }),
        prisma.fueling.findMany({
          where: {
            userId,
            date: {
              gte: thirtyDaysAgo,
            },
          },
          select: {
            id: true,
            amount: true,
            date: true,
          },
        }),
      ]);
      return { workDays, fuelings };
    },
    [`historical-data-${userId}`],
    {
      revalidate: 300, // Cache de 5 minutos para dados históricos
      tags: [`user-${userId}-historical`],
    }
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Buscar dados históricos com cache (dados com mais de 1 dia)
  const { workDays: cachedHistoricalWorkDays, fuelings: cachedHistoricalFuelings } = 
    await getCachedHistoricalData(user.id, thirtyDaysAgo)();

  // Executar queries para dados atuais (sem cache - sempre frescos)
  const [
    todayWorkDay,
    todayFuelings,
    weeklyGoals,
  ] = await Promise.all([
    // Buscar dia de trabalho de hoje - SEM CACHE (sempre fresco)
    prisma.workDay.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
      select: {
        hoursWorked: true,
        kmDriven: true,
        tripsCount: true,
        uberEarnings: true,
        ninetynineEarnings: true,
        inDriveEarnings: true,
        date: true,
      },
    }),
    // Buscar fuelings de hoje - SEM CACHE (sempre fresco)
    prisma.fueling.findMany({
      where: {
        userId: user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        id: true,
        amount: true,
        date: true,
      },
    }),
    // Buscar metas semanais com cache (mudam raramente)
    unstable_cache(
      async () => {
        return prisma.weeklyGoal.findUnique({
          where: { userId: user.id },
          select: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
        });
      },
      [`weekly-goals-${user.id}`],
      {
        revalidate: 3600, // Cache de 1 hora (metas mudam raramente)
        tags: [`user-${user.id}-goals`],
      }
    )().catch(() => null),
  ]);

  // Combinar dados históricos em cache com dados atuais frescos
  const last30Days = [
    ...(todayWorkDay ? [{
      kmDriven: todayWorkDay.kmDriven,
      date: todayWorkDay.date,
      hoursWorked: todayWorkDay.hoursWorked,
      tripsCount: todayWorkDay.tripsCount,
      uberEarnings: todayWorkDay.uberEarnings,
      ninetynineEarnings: todayWorkDay.ninetynineEarnings,
      inDriveEarnings: todayWorkDay.inDriveEarnings,
    }] : []),
    ...cachedHistoricalWorkDays.filter((day) => {
      const dayDate = day.date instanceof Date ? day.date : new Date(day.date);
      return dayDate < today;
    }),
  ].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : new Date(a.date);
    const dateB = b.date instanceof Date ? b.date : new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const last30DaysFuelings = [
    ...todayFuelings,
    ...cachedHistoricalFuelings.filter((f) => {
      const fuelingDate = f.date instanceof Date ? f.date : new Date(f.date);
      return fuelingDate < today;
    }),
  ];

  // Filtrar últimos 7 dias em memória (mais rápido que query separada)
  const last7Days = last30Days
    .filter((day) => {
      const dayDate = day.date instanceof Date ? day.date : new Date(day.date);
      return dayDate >= sevenDaysAgo;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  // Filtrar fuelings dos últimos 7 dias em memória
  const last7DaysFuelings = last30DaysFuelings
    .filter((f) => {
      const fuelingDate = f.date instanceof Date ? f.date : new Date(f.date);
      return fuelingDate >= sevenDaysAgo;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  // Calcular custo por km (otimizado com loop único)
  let totalKm = 0;
  let totalFuelCost = 0;
  for (const day of last30Days) {
    totalKm += day.kmDriven;
  }
  for (const f of last30DaysFuelings) {
    totalFuelCost += f.amount;
  }
  const costPerKm = totalKm > 0 ? totalFuelCost / totalKm : 0;

  // Somar abastecimentos de hoje (já filtrados)
  const todayRealFuelCost = todayFuelings.reduce(
    (sum, f) => sum + f.amount,
    0
  );

  // Usar valor real do abastecimento se existir, senão usar estimativa
  const todayFuelCost = todayRealFuelCost > 0
    ? todayRealFuelCost
    : (todayWorkDay ? todayWorkDay.kmDriven * costPerKm : 0);

  // Se não existir weeklyGoals, criar com valores padrão
  let finalWeeklyGoals = weeklyGoals;
  if (!weeklyGoals) {
    try {
      finalWeeklyGoals = await prisma.weeklyGoal.create({
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
    } catch (error: any) {
      // Se a tabela não existir, usar meta padrão
      if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
        console.error('Tabela WeeklyGoal não existe. Execute: npx prisma db push');
        finalWeeklyGoals = null;
      } else {
        throw error;
      }
    }
  }

  // Determinar meta do dia atual baseado no dia da semana
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  let todayDailyGoal = user.dailyGoal; // Fallback para meta padrão
  
  if (finalWeeklyGoals) {
    switch (dayOfWeek) {
      case 0: // Domingo
        todayDailyGoal = finalWeeklyGoals.sunday || 0;
        break;
      case 1: // Segunda
        todayDailyGoal = finalWeeklyGoals.monday;
        break;
      case 2: // Terça
        todayDailyGoal = finalWeeklyGoals.tuesday;
        break;
      case 3: // Quarta
        todayDailyGoal = finalWeeklyGoals.wednesday;
        break;
      case 4: // Quinta
        todayDailyGoal = finalWeeklyGoals.thursday;
        break;
      case 5: // Sexta
        todayDailyGoal = finalWeeklyGoals.friday;
        break;
      case 6: // Sábado
        todayDailyGoal = finalWeeklyGoals.saturday;
        break;
    }

    // Se a meta do dia for 0, usar a meta padrão
    if (todayDailyGoal === 0) {
      todayDailyGoal = user.dailyGoal;
    }
  }

  // Função auxiliar para formatar data (reutilizável e otimizada)
  const formatDate = (date: Date | string): string => {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${dayNum}`;
  };

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

  // Serializar últimos 7 dias para analytics (otimizado)
  const serializedLast7Days = last7Days.map((day) => ({
    date: formatDate(day.date),
    hoursWorked: day.hoursWorked,
    kmDriven: day.kmDriven,
    tripsCount: day.tripsCount,
    uberEarnings: day.uberEarnings,
    ninetynineEarnings: day.ninetynineEarnings,
    inDriveEarnings: day.inDriveEarnings,
  }));

  // Serializar fuelings dos últimos 7 dias (otimizado)
  const serializedLast7DaysFuelings = last7DaysFuelings.map((fueling) => ({
    id: fueling.id,
    date: formatDate(fueling.date),
    amount: fueling.amount,
    kmDriven: 0, // Campo não usado, mas mantido para compatibilidade
  }));

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
        totalFuelAdded={totalFuelCost}
      />
      
      {/* Analytics inspirados no CPMA */}
      {last7Days.length > 0 && (
        <DashboardAnalytics
          workDays={serializedLast7Days}
          fuelings={serializedLast7DaysFuelings}
          costPerKm={costPerKm}
          dailyGoal={todayDailyGoal}
        />
      )}
    </div>
  );
}
