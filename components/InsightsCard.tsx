"use client";

import { formatCurrency } from "@/lib/utils";
import { Lightbulb, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

interface Insight {
  type: "success" | "warning" | "info";
  message: string;
  icon: React.ReactNode;
}

interface InsightsCardProps {
  totalEarnings: number;
  netProfit: number;
  avgDailyEarnings: number;
  dailyGoal: number;
  profitabilityRate: number;
  earningsPerHour: number;
  daysCount: number;
}

export function InsightsCard({
  totalEarnings,
  netProfit,
  avgDailyEarnings,
  dailyGoal,
  profitabilityRate,
  earningsPerHour,
  daysCount,
}: InsightsCardProps) {
  const insights: Insight[] = [];

  // Insight sobre meta
  if (avgDailyEarnings >= dailyGoal) {
    insights.push({
      type: "success",
      message: `Excelente! Você está superando sua meta diária em ${formatCurrency(avgDailyEarnings - dailyGoal)} por dia.`,
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    });
  } else if (avgDailyEarnings >= dailyGoal * 0.8) {
    insights.push({
      type: "warning",
      message: `Você está próximo da meta. Faltam ${formatCurrency(dailyGoal - avgDailyEarnings)} em média por dia.`,
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    });
  } else {
    insights.push({
      type: "warning",
      message: `Sua média diária está ${formatCurrency(dailyGoal - avgDailyEarnings)} abaixo da meta. Considere ajustar sua estratégia.`,
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    });
  }

  // Insight sobre rentabilidade
  if (profitabilityRate >= 70) {
    insights.push({
      type: "success",
      message: `Ótima rentabilidade! ${profitabilityRate.toFixed(1)}% do seu ganho vira lucro líquido.`,
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
    });
  } else if (profitabilityRate < 50) {
    insights.push({
      type: "warning",
      message: `Sua rentabilidade está baixa (${profitabilityRate.toFixed(1)}%). Considere reduzir custos ou aumentar ganhos.`,
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    });
  }

  // Insight sobre ganho por hora
  if (earningsPerHour >= 50) {
    insights.push({
      type: "success",
      message: `Bom desempenho! Você está ganhando ${formatCurrency(earningsPerHour)} por hora trabalhada.`,
      icon: <TrendingUp className="w-5 h-5 text-green-500" />,
    });
  } else if (earningsPerHour < 30) {
    insights.push({
      type: "info",
      message: `Seu ganho por hora está em ${formatCurrency(earningsPerHour)}. Considere trabalhar em horários de maior demanda.`,
      icon: <Lightbulb className="w-5 h-5 text-blue-500" />,
    });
  }

  // Insight sobre lucro líquido
  if (netProfit < 0) {
    insights.push({
      type: "warning",
      message: `Atenção! Você está com prejuízo líquido de ${formatCurrency(Math.abs(netProfit))}. Revise seus custos.`,
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    });
  }

  if (insights.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Insights e Recomendações
        </h3>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg ${
              insight.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : insight.type === "warning"
                ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
            }`}
          >
            {insight.icon}
            <p
              className={`text-sm flex-1 ${
                insight.type === "success"
                  ? "text-green-800 dark:text-green-200"
                  : insight.type === "warning"
                  ? "text-yellow-800 dark:text-yellow-200"
                  : "text-blue-800 dark:text-blue-200"
              }`}
            >
              {insight.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
