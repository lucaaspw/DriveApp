"use client";

import { useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, TrendingUp, Target, DollarSign } from "lucide-react";
import { ReportsTab } from "./ReportsTab";

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

interface ReportsViewProps {
  dayData: WorkDay[];
  weekData: WorkDay[];
  monthData: WorkDay[];
  weekFuelings: Fueling[];
  monthFuelings: Fueling[];
  dailyGoal: number;
  costPerKm: number;
}

export function ReportsView({
  dayData,
  weekData,
  monthData,
  weekFuelings,
  monthFuelings,
  dailyGoal,
  costPerKm,
}: ReportsViewProps) {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month">("day");

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setActiveTab("day")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === "day"
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Dia
        </button>
        <button
          onClick={() => setActiveTab("week")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === "week"
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Semana
        </button>
        <button
          onClick={() => setActiveTab("month")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
            activeTab === "month"
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Mês
        </button>
      </div>

      {/* Conteúdo da aba ativa */}
      {activeTab === "day" && (
        <ReportsTab
          workDays={dayData}
          fuelings={[]}
          dailyGoal={dailyGoal}
          costPerKm={costPerKm}
          period="day"
        />
      )}
      {activeTab === "week" && (
        <ReportsTab
          workDays={weekData}
          fuelings={weekFuelings}
          dailyGoal={dailyGoal}
          costPerKm={costPerKm}
          period="week"
        />
      )}
      {activeTab === "month" && (
        <ReportsTab
          workDays={monthData}
          fuelings={monthFuelings}
          dailyGoal={dailyGoal}
          costPerKm={costPerKm}
          period="month"
        />
      )}
    </div>
  );
}
