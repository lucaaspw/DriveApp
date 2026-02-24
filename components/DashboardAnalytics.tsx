"use client";

import { formatCurrency } from "@/lib/utils";
import { AdvancedMetrics } from "./AdvancedMetrics";
import { EarningsChart } from "./EarningsChart";
import { InsightsCard } from "./InsightsCard";

interface WorkDay {
  date: string;
  hoursWorked: number;
  kmDriven: number;
  tripsCount?: number | null;
  uberEarnings: number;
  ninetynineEarnings: number;
  inDriveEarnings: number;
}

interface Fueling {
  id: string;
  date: string;
  amount: number;
  kmDriven: number;
}

interface DashboardAnalyticsProps {
  workDays: WorkDay[];
  fuelings?: Fueling[];
  costPerKm: number;
  dailyGoal: number;
}

export function DashboardAnalytics({
  workDays,
  fuelings = [],
  costPerKm,
  dailyGoal,
}: DashboardAnalyticsProps) {
  // Criar mapa de fuelings por data para usar valores reais
  const fuelingByDate = new Map<string, number>();
  fuelings.forEach((fueling) => {
    const dateKey = fueling.date.split('T')[0]; // YYYY-MM-DD
    // Se já existe fueling para essa data, soma os valores
    const existing = fuelingByDate.get(dateKey) || 0;
    fuelingByDate.set(dateKey, existing + fueling.amount);
  });

  // Função auxiliar para obter custo de combustível de um dia
  const getDayFuelCost = (day: WorkDay): number => {
    const dateKey = day.date.split('T')[0]; // YYYY-MM-DD
    const realFuelCost = fuelingByDate.get(dateKey);
    // Usar valor real se existir, senão usar estimativa
    return realFuelCost !== undefined ? realFuelCost : day.kmDriven * costPerKm;
  };

  // Calcular totais
  const totalEarnings = workDays.reduce(
    (sum, day) =>
      sum + day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings,
    0
  );

  const totalFuelCost = workDays.reduce(
    (sum, day) => sum + getDayFuelCost(day),
    0
  );

  const netProfit = totalEarnings - totalFuelCost;
  const totalHours = workDays.reduce((sum, day) => sum + day.hoursWorked, 0);
  const totalKm = workDays.reduce((sum, day) => sum + day.kmDriven, 0);
  const totalTrips = workDays.reduce(
    (sum, day) => sum + (day.tripsCount || 0),
    0
  );

  // Preparar dados para o gráfico
  const chartData = workDays.map((day) => {
    const dayFuelCost = getDayFuelCost(day);
    return {
      date: day.date,
      totalEarnings:
        day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings,
      netProfit:
        day.uberEarnings +
        day.ninetynineEarnings +
        day.inDriveEarnings -
        dayFuelCost,
      kmDriven: day.kmDriven,
      hoursWorked: day.hoursWorked,
    };
  });

  // Calcular métricas para insights
  const avgDailyEarnings = workDays.length > 0 ? totalEarnings / workDays.length : 0;
  const profitabilityRate = totalEarnings > 0 ? (netProfit / totalEarnings) * 100 : 0;
  const earningsPerHour = totalHours > 0 ? totalEarnings / totalHours : 0;

  return (
    <div className="space-y-6">
      {/* Gráfico de evolução */}
      {workDays.length > 0 && (
        <EarningsChart workDays={chartData} type="line" />
      )}

      {/* Métricas avançadas */}
      {workDays.length > 0 && (
        <AdvancedMetrics
          totalEarnings={totalEarnings}
          netProfit={netProfit}
          totalHours={totalHours}
          totalKm={totalKm}
          tripsCount={totalTrips > 0 ? totalTrips : undefined}
          costPerKm={costPerKm}
          dailyGoal={dailyGoal}
          daysCount={workDays.length}
        />
      )}

      {/* Insights e recomendações */}
      {workDays.length > 0 && (
        <InsightsCard
          totalEarnings={totalEarnings}
          netProfit={netProfit}
          avgDailyEarnings={avgDailyEarnings}
          dailyGoal={dailyGoal}
          profitabilityRate={profitabilityRate}
          earningsPerHour={earningsPerHour}
          daysCount={workDays.length}
        />
      )}
    </div>
  );
}
