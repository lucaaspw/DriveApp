import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ReportsView } from "@/components/ReportsView";
import { Suspense } from "react";

// Cache para relatórios: revalidar a cada 2 minutos
// Dados históricos podem ter cache mais longo
export const revalidate = 120;

interface RelatoriosPageProps {
  searchParams: {
    month?: string; // formato YYYY-MM
    compare?: string;
    month1?: string; // formato YYYY-MM
    month2?: string; // formato YYYY-MM
  };
}

export default async function RelatoriosPage({ searchParams }: RelatoriosPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Buscar dados para relatórios
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  // Determinar mês selecionado ou usar mês atual
  let selectedYear = today.getFullYear();
  let selectedMonth = today.getMonth();
  
  if (searchParams.month) {
    const monthParam = searchParams.month; // formato YYYY-MM
    const [year, month] = monthParam.split("-").map(Number);
    if (year && month >= 1 && month <= 12) {
      selectedYear = year;
      selectedMonth = month - 1; // JavaScript usa 0-11 para meses
    }
  }

  const startOfMonth = new Date(selectedYear, selectedMonth, 1);
  const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  // Determinar meses para comparação
  let compareMonth1Year = today.getFullYear();
  let compareMonth1Month = today.getMonth();
  let compareMonth2Year = today.getFullYear();
  let compareMonth2Month = today.getMonth() - 1;
  
  if (compareMonth2Month < 0) {
    compareMonth2Month = 11;
    compareMonth2Year--;
  }

  if (searchParams.month1) {
    const [year, month] = searchParams.month1.split("-").map(Number);
    if (year && month >= 1 && month <= 12) {
      compareMonth1Year = year;
      compareMonth1Month = month - 1;
    }
  }

  if (searchParams.month2) {
    const [year, month] = searchParams.month2.split("-").map(Number);
    if (year && month >= 1 && month <= 12) {
      compareMonth2Year = year;
      compareMonth2Month = month - 1;
    }
  }

  const startOfCompareMonth1 = new Date(compareMonth1Year, compareMonth1Month, 1);
  const endOfCompareMonth1 = new Date(compareMonth1Year, compareMonth1Month + 1, 0, 23, 59, 59, 999);
  const startOfCompareMonth2 = new Date(compareMonth2Year, compareMonth2Month, 1);
  const endOfCompareMonth2 = new Date(compareMonth2Year, compareMonth2Month + 1, 0, 23, 59, 59, 999);

  // Determinar período mínimo necessário para buscar todos os dados
  const minDate = new Date(Math.min(
    startOfWeek.getTime(),
    startOfMonth.getTime(),
    startOfCompareMonth1.getTime(),
    startOfCompareMonth2.getTime(),
    thirtyDaysAgo.getTime()
  ));

  // Executar todas as queries em paralelo com select otimizado
  const [
    allWorkDays,
    allFuelings,
    last30Days,
    last30DaysFuelings,
  ] = await Promise.all([
    // Buscar todos os workDays necessários de uma vez
    prisma.workDay.findMany({
      where: {
        userId: user.id,
        date: {
          gte: minDate,
        },
      },
      select: {
        id: true,
        date: true,
        hoursWorked: true,
        kmDriven: true,
        tripsCount: true,
        uberEarnings: true,
        ninetynineEarnings: true,
        inDriveEarnings: true,
      },
      orderBy: {
        date: "asc",
      },
    }),
    // Buscar todos os fuelings necessários de uma vez
    prisma.fueling.findMany({
      where: {
        userId: user.id,
        date: {
          gte: minDate,
        },
      },
      select: {
        id: true,
        date: true,
        amount: true,
        kmDriven: true,
      },
    }),
    // Calcular custo por km (últimos 30 dias) - apenas kmDriven
    prisma.workDay.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        kmDriven: true,
      },
    }),
    // Calcular custo por km - apenas amount
    prisma.fueling.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        amount: true,
      },
    }),
  ]);

  // Filtrar workDays por período em memória (muito mais rápido)
  const dayWorkDays = allWorkDays.filter((day) => {
    const dayDate = day.date instanceof Date ? day.date : new Date(day.date);
    return dayDate >= today && dayDate < tomorrow;
  });

  const weekWorkDays = allWorkDays
    .filter((day) => {
      const dayDate = day.date instanceof Date ? day.date : new Date(day.date);
      return dayDate >= startOfWeek;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  const monthWorkDays = allWorkDays
    .filter((day) => {
      const dayDate = day.date instanceof Date ? day.date : new Date(day.date);
      return dayDate >= startOfMonth && dayDate <= endOfMonth;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  // Filtrar fuelings por período em memória (otimizado)
  const dayFuelings = allFuelings.filter((f) => {
    const fuelingDate = f.date instanceof Date ? f.date : new Date(f.date);
    return fuelingDate >= today && fuelingDate < tomorrow;
  });

  const weekFuelings = allFuelings.filter((f) => {
    const fuelingDate = f.date instanceof Date ? f.date : new Date(f.date);
    return fuelingDate >= startOfWeek;
  });

  const monthFuelings = allFuelings.filter((f) => {
    const fuelingDate = f.date instanceof Date ? f.date : new Date(f.date);
    return fuelingDate >= startOfMonth && fuelingDate <= endOfMonth;
  });

  // Filtrar dados para comparação de meses
  const compareMonth1WorkDays = allWorkDays
    .filter((day) => {
      const dayDate = day.date instanceof Date ? day.date : new Date(day.date);
      return dayDate >= startOfCompareMonth1 && dayDate <= endOfCompareMonth1;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  const compareMonth2WorkDays = allWorkDays
    .filter((day) => {
      const dayDate = day.date instanceof Date ? day.date : new Date(day.date);
      return dayDate >= startOfCompareMonth2 && dayDate <= endOfCompareMonth2;
    })
    .sort((a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  const compareMonth1Fuelings = allFuelings.filter((f) => {
    const fuelingDate = f.date instanceof Date ? f.date : new Date(f.date);
    return fuelingDate >= startOfCompareMonth1 && fuelingDate <= endOfCompareMonth1;
  });

  const compareMonth2Fuelings = allFuelings.filter((f) => {
    const fuelingDate = f.date instanceof Date ? f.date : new Date(f.date);
    return fuelingDate >= startOfCompareMonth2 && fuelingDate <= endOfCompareMonth2;
  });

  // Calcular custo por km (otimizado com loop único)
  let totalKm = 0;
  for (const day of last30Days) {
    totalKm += day.kmDriven;
  }
  let totalFuelCost = 0;
  for (const f of last30DaysFuelings) {
    totalFuelCost += f.amount;
  }
  const costPerKm = totalKm > 0 ? totalFuelCost / totalKm : 0;

  // Função auxiliar para formatar data (reutilizável e otimizada)
  const formatDate = (date: Date | string): string => {
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dayNum = String(d.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${dayNum}`;
  };

  // Serializar dados para passar ao componente client (otimizado)
  const serializeWorkDay = (day: typeof allWorkDays[0]) => ({
    id: day.id,
    date: formatDate(day.date),
    hoursWorked: day.hoursWorked,
    kmDriven: day.kmDriven,
    tripsCount: day.tripsCount,
    uberEarnings: day.uberEarnings,
    ninetynineEarnings: day.ninetynineEarnings,
    inDriveEarnings: day.inDriveEarnings,
  });

  const serializeFueling = (fueling: typeof allFuelings[0]) => ({
    id: fueling.id,
    date: formatDate(fueling.date),
    amount: fueling.amount,
    kmDriven: fueling.kmDriven,
  });

  // Formatar mês selecionado para passar ao componente
  const selectedMonthString = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`;
  
  // Formatar labels dos meses para comparação
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const compareMonth1Label = `${monthNames[compareMonth1Month]} ${compareMonth1Year}`;
  const compareMonth2Label = `${monthNames[compareMonth2Month]} ${compareMonth2Year}`;

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
        Relatórios
      </h1>
      <Suspense fallback={<div className="text-center py-8 text-gray-600 dark:text-gray-400">Carregando...</div>}>
        <ReportsView
          dayData={dayWorkDays.map(serializeWorkDay)}
          weekData={weekWorkDays.map(serializeWorkDay)}
          monthData={monthWorkDays.map(serializeWorkDay)}
          dayFuelings={dayFuelings.map(serializeFueling)}
          weekFuelings={weekFuelings.map(serializeFueling)}
          monthFuelings={monthFuelings.map(serializeFueling)}
          dailyGoal={user.dailyGoal}
          monthlyGoal={user.monthlyGoal}
          costPerKm={costPerKm}
          selectedMonth={selectedMonthString}
          selectedYear={selectedYear}
          comparisonMonth1={compareMonth1WorkDays.map(serializeWorkDay)}
          comparisonMonth2={compareMonth2WorkDays.map(serializeWorkDay)}
          comparisonFuelings1={compareMonth1Fuelings.map(serializeFueling)}
          comparisonFuelings2={compareMonth2Fuelings.map(serializeFueling)}
          comparisonMonth1Label={compareMonth1Label}
          comparisonMonth2Label={compareMonth2Label}
        />
      </Suspense>
    </div>
  );
}
