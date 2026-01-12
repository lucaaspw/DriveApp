"use client";

import { formatCurrency, formatTime } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Fuel,
  Clock,
  Gauge,
  Zap,
} from "lucide-react";

interface HomeTodayProps {
  workDay: {
    hoursWorked: number;
    kmDriven: number;
    tripsCount?: number | null;
    uberEarnings: number;
    ninetynineEarnings: number;
    inDriveEarnings: number;
  } | null;
  dailyGoal: number;
  costPerKm: number;
  todayFuelCost: number;
}

export function HomeToday({
  workDay,
  dailyGoal,
  costPerKm,
  todayFuelCost,
}: HomeTodayProps) {
  const totalEarnings = workDay
    ? workDay.uberEarnings + workDay.ninetynineEarnings + workDay.inDriveEarnings
    : 0;
  const netProfit = totalEarnings - todayFuelCost;
  const goalProgress = dailyGoal > 0 ? (totalEarnings / dailyGoal) * 100 : 0;
  const isGoalReached = totalEarnings >= dailyGoal;
  const remaining = Math.max(0, dailyGoal - totalEarnings);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cards principais em grid responsivo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card: Ganho do dia */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Ganho do dia
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(totalEarnings)}
          </div>
        </div>

        {/* Card: Lucro líquido */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Lucro líquido
            </div>
            {netProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <div
            className={`text-2xl md:text-3xl font-bold ${
              netProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(netProfit)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Ganhos - Combustível
          </div>
        </div>

        {/* Card: Meta diária */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Meta diária
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatCurrency(dailyGoal)}
            </span>
          </div>

          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              className={`h-3 rounded-full transition-all ${
                isGoalReached ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(100, goalProgress)}%` }}
            />
          </div>

          <div className="text-sm">
            {isGoalReached ? (
              <span className="text-green-600 font-semibold">
                Meta atingida 🎉
              </span>
            ) : (
              <span className="text-gray-600 dark:text-gray-400">
                Faltam{" "}
                <span className="font-semibold">{formatCurrency(remaining)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Card: Gasto com combustível */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Gasto com combustível
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(todayFuelCost)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Custo por km: {formatCurrency(costPerKm)}
          </div>
        </div>
      </div>

      {/* Destaques rápidos */}
      {workDay && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Destaques
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 md:gap-6">
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Uber
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(workDay.uberEarnings)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                99
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(workDay.ninetynineEarnings)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                inDrive
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(workDay.inDriveEarnings)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                <Clock className="w-4 h-4" />
                Horas trabalhadas
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {formatTime(workDay.hoursWorked)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                <Gauge className="w-4 h-4" />
                Km rodados
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {workDay.kmDriven.toFixed(0)} km
              </div>
            </div>
          </div>
          
          {/* Informações adicionais se houver número de viagens */}
          {workDay.tripsCount && workDay.tripsCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Viagens realizadas
                  </span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {workDay.tripsCount} viagens
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Média de {formatCurrency(totalEarnings / workDay.tripsCount)} por viagem
              </div>
            </div>
          )}
        </div>
      )}

      {!workDay && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center border-2 border-blue-200 dark:border-blue-800 border-dashed">
          <div className="text-gray-700 dark:text-gray-300 font-medium mb-2">
            Nenhum registro para hoje
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Registre seu dia de trabalho para começar
          </div>
        </div>
      )}
    </div>
  );
}
