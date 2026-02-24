"use client";

import { formatCurrency } from "@/lib/utils";
import { Target, Calendar } from "lucide-react";

interface MonthlyGoalProgressProps {
  monthlyGoal: number | null;
  currentMonthEarnings: number;
  daysInMonth: number;
  currentDay: number;
}

export function MonthlyGoalProgress({
  monthlyGoal,
  currentMonthEarnings,
  daysInMonth,
  currentDay,
}: MonthlyGoalProgressProps) {
  if (!monthlyGoal || monthlyGoal <= 0) {
    return null;
  }

  const progress = (currentMonthEarnings / monthlyGoal) * 100;
  const isGoalReached = currentMonthEarnings >= monthlyGoal;
  const remaining = Math.max(0, monthlyGoal - currentMonthEarnings);
  const averagePerDay = currentDay > 0 ? currentMonthEarnings / currentDay : 0;
  const projectedMonthly = averagePerDay * daysInMonth;
  const daysRemaining = daysInMonth - currentDay;
  const neededPerDay = daysRemaining > 0 ? remaining / daysRemaining : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Meta Mensal
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Dia {currentDay} de {daysInMonth}</span>
        </div>
      </div>

      {/* Valor e progresso */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(currentMonthEarnings)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              de {formatCurrency(monthlyGoal)}
            </div>
          </div>
          <div className={`text-lg font-bold ${isGoalReached ? "text-green-600" : "text-purple-600"}`}>
            {progress.toFixed(1)}%
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              isGoalReached ? "bg-green-500" : "bg-purple-500"
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>

        {/* Status e informações */}
        <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {isGoalReached ? (
            <div className="text-sm font-semibold text-green-600">
              🎉 Meta mensal atingida!
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Faltam
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(remaining)}
                </span>
              </div>
              {daysRemaining > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Média necessária por dia
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {formatCurrency(neededPerDay)}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Projeção */}
          {currentDay > 0 && !isGoalReached && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  Projeção mensal (média atual)
                </span>
                <span className={`font-semibold ${
                  projectedMonthly >= monthlyGoal
                    ? "text-green-600"
                    : "text-orange-600"
                }`}>
                  {formatCurrency(projectedMonthly)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
