"use client";

import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { formatCurrency, formatDate } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WorkDay {
  date: string;
  totalEarnings: number;
  netProfit: number;
  kmDriven: number;
  hoursWorked: number;
}

interface EarningsChartProps {
  workDays: WorkDay[];
  type?: "line" | "bar";
}

export function EarningsChart({ workDays, type = "line" }: EarningsChartProps) {
  // Ordenar por data
  const sortedDays = [...workDays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const labels = sortedDays.map((day) => {
    const date = new Date(day.date);
    return formatDate(date);
  });

  const data = {
    labels,
    datasets: [
      {
        label: "Ganho Bruto",
        data: sortedDays.map((day) => day.totalEarnings),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Lucro Líquido",
        data: sortedDays.map((day) => day.netProfit),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const ChartComponent = type === "line" ? Line : Bar;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Evolução de Ganhos
      </h3>
      <div style={{ height: "300px" }}>
        <ChartComponent data={data} options={options} />
      </div>
    </div>
  );
}
