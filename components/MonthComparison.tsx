"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, DollarSign, Clock, Gauge, Fuel, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface WorkDay {
  id: string;
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

interface MonthData {
  workDays: WorkDay[];
  fuelings: Fueling[];
  monthLabel: string;
}

interface MonthComparisonProps {
  month1: MonthData;
  month2: MonthData;
  dailyGoal: number;
  costPerKm: number;
}

export function MonthComparison({
  month1,
  month2,
  dailyGoal,
  costPerKm,
}: MonthComparisonProps) {
  // Função auxiliar para calcular métricas de um mês
  const calculateMonthMetrics = (month: MonthData) => {
    const fuelingByDate = new Map<string, number>();
    month.fuelings.forEach((fueling) => {
      const dateKey = fueling.date.split('T')[0];
      const existing = fuelingByDate.get(dateKey) || 0;
      fuelingByDate.set(dateKey, existing + fueling.amount);
    });

    const getDayFuelCost = (day: WorkDay): number => {
      const dateKey = day.date.split('T')[0];
      const realFuelCost = fuelingByDate.get(dateKey);
      return realFuelCost !== undefined ? realFuelCost : day.kmDriven * costPerKm;
    };

    const totalEarnings = month.workDays.reduce(
      (sum, day) => sum + day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings,
      0
    );

    const totalFuelCost = month.workDays.reduce(
      (sum, day) => sum + getDayFuelCost(day),
      0
    );

    const netProfit = totalEarnings - totalFuelCost;
    const totalHours = month.workDays.reduce((sum, day) => sum + day.hoursWorked, 0);
    const totalKm = month.workDays.reduce((sum, day) => sum + day.kmDriven, 0);
    const daysCount = month.workDays.length;

    const avgPerDay = daysCount > 0 ? totalEarnings / daysCount : 0;
    const daysGoalReached = month.workDays.filter(
      (day) => day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings >= dailyGoal
    ).length;

    const earningsPerHour = totalHours > 0 ? totalEarnings / totalHours : 0;
    const earningsPerKm = totalKm > 0 ? totalEarnings / totalKm : 0;

    const uberTotal = month.workDays.reduce((sum, day) => sum + day.uberEarnings, 0);
    const ninetynineTotal = month.workDays.reduce((sum, day) => sum + day.ninetynineEarnings, 0);
    const inDriveTotal = month.workDays.reduce((sum, day) => sum + day.inDriveEarnings, 0);

    const totalTrips = month.workDays.reduce((sum, day) => sum + (day.tripsCount || 0), 0);

    return {
      totalEarnings,
      totalFuelCost,
      netProfit,
      totalHours,
      totalKm,
      daysCount,
      avgPerDay,
      daysGoalReached,
      earningsPerHour,
      earningsPerKm,
      uberTotal,
      ninetynineTotal,
      inDriveTotal,
      totalTrips,
    };
  };

  const metrics1 = calculateMonthMetrics(month1);
  const metrics2 = calculateMonthMetrics(month2);

  // Função para calcular diferença percentual
  const calculateDifference = (val1: number, val2: number): { value: number; percent: number; isPositive: boolean } => {
    const diff = val2 - val1;
    const percent = val1 !== 0 ? (diff / val1) * 100 : (val2 !== 0 ? 100 : 0);
    return {
      value: diff,
      percent: Math.abs(percent),
      isPositive: diff >= 0,
    };
  };

  // Componente para exibir métrica comparativa
  const ComparisonMetric = ({
    label,
    value1,
    value2,
    format = (v: number) => formatCurrency(v),
    showPercent = true,
  }: {
    label: string;
    value1: number;
    value2: number;
    format?: (v: number) => string;
    showPercent?: boolean;
  }) => {
    const diff = calculateDifference(value1, value2);
    const DiffIcon = diff.value === 0 ? Minus : diff.isPositive ? ArrowUp : ArrowDown;
    const diffColor = diff.value === 0 
      ? "text-gray-500" 
      : diff.isPositive 
      ? "text-green-600 dark:text-green-400" 
      : "text-red-600 dark:text-red-400";

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
        <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-3">{label}</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{month1.monthLabel}</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {format(value1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{month2.monthLabel}</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {format(value2)}
            </div>
          </div>
        </div>
        <div className={`mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 ${diffColor}`}>
          <DiffIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {diff.value === 0 
              ? "Sem alteração" 
              : `${diff.isPositive ? "+" : "-"}${format(Math.abs(diff.value))}${showPercent ? ` (${diff.percent.toFixed(1)}%)` : ""}`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ComparisonMetric
          label="Total Ganho"
          value1={metrics1.totalEarnings}
          value2={metrics2.totalEarnings}
        />
        <ComparisonMetric
          label="Lucro Líquido"
          value1={metrics1.netProfit}
          value2={metrics2.netProfit}
        />
        <ComparisonMetric
          label="Gasto com Combustível"
          value1={metrics1.totalFuelCost}
          value2={metrics2.totalFuelCost}
        />
      </div>

      {/* Métricas de desempenho */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ComparisonMetric
          label="Média por Dia"
          value1={metrics1.avgPerDay}
          value2={metrics2.avgPerDay}
        />
        <ComparisonMetric
          label="Ganho por Hora"
          value1={metrics1.earningsPerHour}
          value2={metrics2.earningsPerHour}
        />
        <ComparisonMetric
          label="Ganho por Km"
          value1={metrics1.earningsPerKm}
          value2={metrics2.earningsPerKm}
        />
      </div>

      {/* Métricas de atividade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ComparisonMetric
          label="Dias Trabalhados"
          value1={metrics1.daysCount}
          value2={metrics2.daysCount}
          format={(v) => `${Math.round(v)} dias`}
          showPercent={false}
        />
        <ComparisonMetric
          label="Horas Trabalhadas"
          value1={metrics1.totalHours}
          value2={metrics2.totalHours}
          format={(v) => `${v.toFixed(1)}h`}
        />
        <ComparisonMetric
          label="Km Rodados"
          value1={metrics1.totalKm}
          value2={metrics2.totalKm}
          format={(v) => `${v.toFixed(0)} km`}
        />
        <ComparisonMetric
          label="Dias que Bateram a Meta"
          value1={metrics1.daysGoalReached}
          value2={metrics2.daysGoalReached}
          format={(v) => `${Math.round(v)} dias`}
          showPercent={false}
        />
      </div>

      {/* Comparação por plataforma */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Comparação por Plataforma
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComparisonMetric
            label="Uber"
            value1={metrics1.uberTotal}
            value2={metrics2.uberTotal}
          />
          <ComparisonMetric
            label="99"
            value1={metrics1.ninetynineTotal}
            value2={metrics2.ninetynineTotal}
          />
          <ComparisonMetric
            label="InDrive"
            value1={metrics1.inDriveTotal}
            value2={metrics2.inDriveTotal}
          />
        </div>
      </div>
    </div>
  );
}
