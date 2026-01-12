"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Target, Zap, BarChart3, Clock, Gauge } from "lucide-react";

interface AdvancedMetricsProps {
  totalEarnings: number;
  netProfit: number;
  totalHours: number;
  totalKm: number;
  tripsCount?: number;
  costPerKm: number;
  dailyGoal: number;
  daysCount: number;
}

export function AdvancedMetrics({
  totalEarnings,
  netProfit,
  totalHours,
  totalKm,
  tripsCount,
  costPerKm,
  dailyGoal,
  daysCount,
}: AdvancedMetricsProps) {
  // Métricas inspiradas no CPMA
  const earningsPerHour = totalHours > 0 ? totalEarnings / totalHours : 0;
  const earningsPerKm = totalKm > 0 ? totalEarnings / totalKm : 0;
  const earningsPerTrip = tripsCount && tripsCount > 0 ? totalEarnings / tripsCount : 0;
  
  // Taxa de rentabilidade (lucro líquido / ganho bruto)
  const profitabilityRate = totalEarnings > 0 ? (netProfit / totalEarnings) * 100 : 0;
  
  // Eficiência de combustível (km por litro estimado - assumindo 10km/L como média)
  const avgKmPerLiter = 10;
  const fuelEfficiency = totalKm > 0 ? (totalKm / (totalKm * costPerKm / 5.5)) : 0; // 5.5 é preço médio do litro
  
  // Margem de lucro
  const profitMargin = totalEarnings > 0 ? (netProfit / totalEarnings) * 100 : 0;
  
  // Meta média diária vs meta configurada
  const avgDailyEarnings = daysCount > 0 ? totalEarnings / daysCount : 0;
  const goalCompletionRate = dailyGoal > 0 ? (avgDailyEarnings / dailyGoal) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Métricas Avançadas
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Ganho por hora */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Ganho por hora
            </div>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(earningsPerHour)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totalHours.toFixed(1)}h trabalhadas
          </div>
        </div>

        {/* Ganho por km */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Ganho por km
            </div>
            <Gauge className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(earningsPerKm)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totalKm.toFixed(0)} km rodados
          </div>
        </div>

        {/* Ganho por viagem */}
        {tripsCount && tripsCount > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                Ganho por viagem
              </div>
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(earningsPerTrip)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {tripsCount} viagens
            </div>
          </div>
        )}

        {/* Taxa de rentabilidade */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Taxa de rentabilidade
            </div>
            {profitabilityRate >= 70 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : profitabilityRate >= 50 ? (
              <TrendingUp className="w-4 h-4 text-yellow-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div
            className={`text-xl font-bold ${
              profitabilityRate >= 70
                ? "text-green-600"
                : profitabilityRate >= 50
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {profitabilityRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Lucro líquido / Ganho bruto
          </div>
        </div>

        {/* Margem de lucro */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Margem de lucro
            </div>
            {profitMargin >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
          </div>
          <div
            className={`text-xl font-bold ${
              profitMargin >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {profitMargin.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatCurrency(netProfit)} líquido
          </div>
        </div>

        {/* Taxa de conclusão de meta */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Taxa de conclusão de meta
            </div>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <div
            className={`text-xl font-bold ${
              goalCompletionRate >= 100
                ? "text-green-600"
                : goalCompletionRate >= 80
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {goalCompletionRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Média: {formatCurrency(avgDailyEarnings)} / Meta: {formatCurrency(dailyGoal)}
          </div>
        </div>
      </div>
    </div>
  );
}
