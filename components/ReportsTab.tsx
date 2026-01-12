"use client";

import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { TrendingUp, Target, DollarSign, Clock, Gauge } from "lucide-react";

interface WorkDay {
  id: string;
  date: string; // ISO string
  hoursWorked: number;
  kmDriven: number;
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
  // Calcular totais
  const totalEarnings = workDays.reduce(
    (sum: number, day) => sum + day.uberEarnings + day.ninetynineEarnings + day.inDriveEarnings,
    0
  );

  const totalFuelCost = workDays.reduce(
    (sum: number, day) => sum + day.kmDriven * costPerKm,
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

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
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

      {/* Comparação Uber vs 99 vs inDrive */}
      {uberTotal > 0 || ninetynineTotal > 0 || inDriveTotal > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Uber vs 99 vs inDrive
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Uber</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(uberTotal)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      totalEarnings > 0 ? (uberTotal / totalEarnings) * 100 : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">99</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(ninetynineTotal)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${
                      totalEarnings > 0
                        ? (ninetynineTotal / totalEarnings) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">inDrive</span>
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(inDriveTotal)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${
                      totalEarnings > 0
                        ? (inDriveTotal / totalEarnings) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
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
    </div>
  );
}
