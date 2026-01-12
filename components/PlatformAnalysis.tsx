"use client";

import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Award, BarChart3 } from "lucide-react";

interface PlatformData {
  name: string;
  earnings: number;
  color: string;
  percentage: number;
}

interface PlatformAnalysisProps {
  uberTotal: number;
  ninetynineTotal: number;
  inDriveTotal: number;
  totalEarnings: number;
}

export function PlatformAnalysis({
  uberTotal,
  ninetynineTotal,
  inDriveTotal,
  totalEarnings,
}: PlatformAnalysisProps) {
  const platforms: PlatformData[] = [
    {
      name: "Uber",
      earnings: uberTotal,
      color: "bg-blue-600",
      percentage: totalEarnings > 0 ? (uberTotal / totalEarnings) * 100 : 0,
    },
    {
      name: "99",
      earnings: ninetynineTotal,
      color: "bg-green-600",
      percentage: totalEarnings > 0 ? (ninetynineTotal / totalEarnings) * 100 : 0,
    },
    {
      name: "inDrive",
      earnings: inDriveTotal,
      color: "bg-purple-600",
      percentage: totalEarnings > 0 ? (inDriveTotal / totalEarnings) * 100 : 0,
    },
  ].filter((p) => p.earnings > 0);

  // Encontrar melhor plataforma
  const bestPlatform = platforms.reduce(
    (best, current) => (current.earnings > best.earnings ? current : best),
    platforms[0]
  );

  if (platforms.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Análise de Plataformas
        </h3>
      </div>

      {/* Melhor plataforma */}
      {bestPlatform && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Melhor Plataforma
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {bestPlatform.name}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(bestPlatform.earnings)} (
            {bestPlatform.percentage.toFixed(1)}% do total)
          </div>
        </div>
      )}

      {/* Comparação detalhada */}
      <div className="space-y-3">
        {platforms
          .sort((a, b) => b.earnings - a.earnings)
          .map((platform) => (
            <div key={platform.name}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${platform.color}`}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {platform.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(platform.earnings)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {platform.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`${platform.color} h-2 rounded-full transition-all`}
                  style={{ width: `${platform.percentage}%` }}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Recomendação */}
      {bestPlatform && platforms.length > 1 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Dica:</strong> Considere focar mais em {bestPlatform.name} para
              maximizar seus ganhos, já que ela representa{" "}
              {bestPlatform.percentage.toFixed(1)}% do seu total.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
