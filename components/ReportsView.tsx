"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  dayFuelings: Fueling[];
  weekFuelings: Fueling[];
  monthFuelings: Fueling[];
  dailyGoal: number;
  costPerKm: number;
  selectedMonth?: string; // formato YYYY-MM
  selectedYear?: number;
}

export function ReportsView({
  dayData,
  weekData,
  monthData,
  dayFuelings,
  weekFuelings,
  monthFuelings,
  dailyGoal,
  costPerKm,
  selectedMonth: initialMonth,
  selectedYear: initialYear,
}: ReportsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Verificar se há parâmetros de mês na URL para definir a aba inicial
  const urlMonth = searchParams.get("month");
  const initialTab = urlMonth ? "month" : "day";
  
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month">(initialTab);
  
  // Obter mês/ano atual ou do parâmetro da URL
  const currentDate = new Date();
  const currentYear = initialYear || currentDate.getFullYear();
  const currentMonth = initialMonth || (urlMonth || `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`);
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Sincronizar estado quando props mudarem (após recarregamento da página)
  useEffect(() => {
    if (initialMonth && initialYear) {
      setSelectedMonth(initialMonth);
      setSelectedYear(initialYear);
    }
    setIsInitialMount(false);
  }, [initialMonth, initialYear]);

  // Atualizar URL quando mês/ano mudar (mas não no mount inicial)
  useEffect(() => {
    if (isInitialMount) return;
    
    if (activeTab === "month") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", selectedMonth);
      router.replace(`/relatorios?${params.toString()}`, { scroll: false });
    }
  }, [activeTab, selectedMonth, router, searchParams, isInitialMount]);

  // Gerar lista de meses e anos disponíveis
  const months = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  // Gerar lista de anos (últimos 5 anos + próximos 2 anos)
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYearNum - 5 + i);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value;
    const newMonth = `${selectedYear}-${month}`;
    setSelectedMonth(newMonth);
    // Atualizar URL imediatamente para recarregar dados
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth);
    router.replace(`/relatorios?${params.toString()}`, { scroll: false });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    const month = selectedMonth.split("-")[1];
    const newMonth = `${year}-${month}`;
    setSelectedMonth(newMonth);
    // Atualizar URL imediatamente para recarregar dados
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth);
    router.replace(`/relatorios?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (tab: "day" | "week" | "month") => {
    setActiveTab(tab);
    if (tab === "month") {
      // Garantir que os parâmetros de mês estejam na URL quando mudar para aba mês
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", selectedMonth);
      router.replace(`/relatorios?${params.toString()}`, { scroll: false });
    } else {
      // Remover parâmetros quando sair da aba mês
      const params = new URLSearchParams(searchParams.toString());
      params.delete("month");
      const newParams = params.toString();
      if (newParams) {
        router.replace(`/relatorios?${newParams}`, { scroll: false });
      } else {
        router.replace("/relatorios", { scroll: false });
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm">
        <button
          onClick={() => handleTabChange("day")}
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
          onClick={() => handleTabChange("week")}
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
          onClick={() => handleTabChange("month")}
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

      {/* Seletor de mês/ano (apenas quando aba Mês estiver ativa) */}
      {activeTab === "month" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mês
              </label>
              <select
                value={selectedMonth.split("-")[1]}
                onChange={handleMonthChange}
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ano
              </label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="w-full px-4 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo da aba ativa */}
      {activeTab === "day" && (
        <ReportsTab
          workDays={dayData}
          fuelings={dayFuelings}
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
