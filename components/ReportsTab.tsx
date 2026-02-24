"use client";

import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { TrendingUp, Target, DollarSign, Clock, Gauge, Fuel } from "lucide-react";
import { AdvancedMetrics } from "./AdvancedMetrics";
import { EarningsChart } from "./EarningsChart";
import { InsightsCard } from "./InsightsCard";
import { PlatformAnalysis } from "./PlatformAnalysis";

interface WorkDay {
  id: string;
  date: string; // ISO string
  hoursWorked: number;
  kmDriven: number;
  tripsCount?: number | null;
  uberEarnings: number;
  ninetynineEarnings: number;
  inDriveEarnings: number;
}

interface Fueling {
  id: string;
  date: string; // ISO string
  amount: number;
  kmDriven: number;
}

interface ReportsTabProps {
  workDays: WorkDay[];
  fuelings: Fueling[];
  dailyGoal: number;
  costPerKm: number;
  period: "day" | "week" | "month";
}

export function ReportsTab({
  workDays,
  fuelings,
  dailyGoal,
  costPerKm,
  period,
}: ReportsTabProps) {
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
    (sum: number, day) => sum + day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings,
    0
  );

  const totalFuelCost = workDays.reduce(
    (sum: number, day) => sum + getDayFuelCost(day),
    0
  );

  const netProfit = totalEarnings - totalFuelCost;
  const totalHours = workDays.reduce((sum: number, day) => sum + day.hoursWorked, 0);
  const totalKm = workDays.reduce((sum: number, day) => sum + day.kmDriven, 0);
  const daysCount = workDays.length;

  const avgPerDay = daysCount > 0 ? totalEarnings / daysCount : 0;
  const daysGoalReached = workDays.filter(
    (day) => day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings >= dailyGoal
  ).length;

  const earningsPerHour = totalHours > 0 ? totalEarnings / totalHours : 0;
  const earningsPerKm = totalKm > 0 ? totalEarnings / totalKm : 0;

  const uberTotal = workDays.reduce((sum: number, day) => sum + day.uberEarnings, 0);
  const ninetynineTotal = workDays.reduce(
    (sum: number, day) => sum + day.ninetynineEarnings,
    0
  );
  const inDriveTotal = workDays.reduce(
    (sum: number, day) => sum + day.inDriveEarnings,
    0
  );

  const totalTrips = workDays.reduce(
    (sum: number, day) => sum + (day.tripsCount || 0),
    0
  );

  // Preparar dados para gráfico
  const chartData = workDays.map((day) => {
    const dayFuelCost = getDayFuelCost(day);
    return {
      date: day.date,
      totalEarnings: day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings,
      netProfit: day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings - dayFuelCost,
      kmDriven: day.kmDriven,
      hoursWorked: day.hoursWorked,
    };
  });

  // Calcular métricas para insights
  const avgDailyEarnings = daysCount > 0 ? totalEarnings / daysCount : 0;
  const profitabilityRate = totalEarnings > 0 ? (netProfit / totalEarnings) * 100 : 0;

  // Calcular total de combustível adicionado (valores reais informados no app)
  const totalFuelAdded = fuelings.reduce(
    (sum: number, fueling) => sum + fueling.amount,
    0
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">Total ganho</div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalEarnings)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Lucro líquido
            </div>
          </div>
          <div
            className={`text-xl font-bold ${
              netProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(netProfit)}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Fuel className="w-4 h-4 text-orange-500 dark:text-orange-400" />
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Combustível adicionado
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalFuelAdded)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {period === "day" && "Valor do dia"}
            {period === "week" && "Valor da semana"}
            {period === "month" && "Valor do mês"}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm space-y-3">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Estatísticas
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Média por dia
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(avgPerDay)}
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Dias com meta
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {daysGoalReached}/{daysCount}
            </div>
          </div>
        </div>
      </div>

      {/* Desempenho */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm space-y-3">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Desempenho
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Ganho por hora
              </span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(earningsPerHour)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Ganho por km
              </span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(earningsPerKm)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-orange-500 dark:text-orange-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Custo por km
              </span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatCurrency(costPerKm)}
            </span>
          </div>
        </div>
      </div>

      {/* Análise de plataformas melhorada */}
      {uberTotal > 0 || ninetynineTotal > 0 || inDriveTotal > 0 ? (
        <PlatformAnalysis
          uberTotal={uberTotal}
          ninetynineTotal={ninetynineTotal}
          inDriveTotal={inDriveTotal}
          totalEarnings={totalEarnings}
        />
      ) : null}

      {/* Lista de dias (se houver) */}
      {workDays.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Dias registrados
          </div>
          <div className="space-y-2">
            {workDays.map((day) => {
              const dayTotal = day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings;
              const isGoalReached = dayTotal >= dailyGoal;

              return (
                <div
                  key={day.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(new Date(day.date))}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {formatTime(day.hoursWorked)} • {day.kmDriven.toFixed(0)}{" "}
                      km
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(dayTotal)}
                    </div>
                    {isGoalReached && (
                      <div className="text-xs text-green-600">✓ Meta</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {workDays.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center border-2 border-gray-200 dark:border-gray-700 border-dashed">
          <div className="text-gray-700 dark:text-gray-300 font-medium">
            Nenhum registro para este período
          </div>
        </div>
      )}

      {/* Métricas avançadas inspiradas no CPMA */}
      {workDays.length > 0 && (
        <>
          <AdvancedMetrics
            totalEarnings={totalEarnings}
            netProfit={netProfit}
            totalHours={totalHours}
            totalKm={totalKm}
            tripsCount={totalTrips > 0 ? totalTrips : undefined}
            costPerKm={costPerKm}
            dailyGoal={dailyGoal}
            daysCount={daysCount}
          />

          {/* Gráfico de evolução */}
          <EarningsChart workDays={chartData} type="line" />

          {/* Insights */}
          <InsightsCard
            totalEarnings={totalEarnings}
            netProfit={netProfit}
            avgDailyEarnings={avgDailyEarnings}
            dailyGoal={dailyGoal}
            profitabilityRate={profitabilityRate}
            earningsPerHour={earningsPerHour}
            daysCount={daysCount}
          />
        </>
      )}
    </div>
  );
}
