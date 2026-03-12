"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, TrendingUp, Target, DollarSign } from "lucide-react";
import { ReportsTab } from "./ReportsTab";
import { MonthComparison } from "./MonthComparison";

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
  monthlyGoal?: number | null;
  costPerKm: number;
  selectedMonth?: string; // formato YYYY-MM
  selectedYear?: number;
  comparisonMonth1?: WorkDay[];
  comparisonMonth2?: WorkDay[];
  comparisonFuelings1?: Fueling[];
  comparisonFuelings2?: Fueling[];
  comparisonMonth1Label?: string;
  comparisonMonth2Label?: string;
}

export function ReportsView({
  dayData,
  weekData,
  monthData,
  dayFuelings,
  weekFuelings,
  monthFuelings,
  dailyGoal,
  monthlyGoal,
  costPerKm,
  selectedMonth: initialMonth,
  selectedYear: initialYear,
  comparisonMonth1,
  comparisonMonth2,
  comparisonFuelings1,
  comparisonFuelings2,
  comparisonMonth1Label,
  comparisonMonth2Label,
}: ReportsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Verificar se há parâmetros de mês na URL para definir a aba inicial
  const urlMonth = searchParams.get("month");
  const urlCompare = searchParams.get("compare");
  const initialTab = urlCompare ? "compare" : urlMonth ? "month" : "day";
  
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "compare">(initialTab);
  
  // Obter mês/ano atual ou do parâmetro da URL
  const currentDate = new Date();
  const currentYear = initialYear || currentDate.getFullYear();
  const currentMonth = initialMonth || (urlMonth || `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`);
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [isInitialMount, setIsInitialMount] = useState(true);
  
  // Estados para comparação de meses
  const urlMonth1 = searchParams.get("month1") || currentMonth;
  const urlMonth2 = searchParams.get("month2") || (() => {
    const prevMonth = new Date(currentYear, currentDate.getMonth() - 1, 1);
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;
  })();
  
  const [compareMonth1, setCompareMonth1] = useState(urlMonth1);
  const [compareMonth2, setCompareMonth2] = useState(urlMonth2);
  const [compareYear1, setCompareYear1] = useState(parseInt(urlMonth1.split("-")[0]));
  const [compareYear2, setCompareYear2] = useState(parseInt(urlMonth2.split("-")[0]));

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

  const handleTabChange = (tab: "day" | "week" | "month" | "compare") => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    
    if (tab === "month") {
      params.set("month", selectedMonth);
      params.delete("compare");
      params.delete("month1");
      params.delete("month2");
    } else if (tab === "compare") {
      params.set("compare", "true");
      params.set("month1", compareMonth1);
      params.set("month2", compareMonth2);
      params.delete("month");
    } else {
      params.delete("month");
      params.delete("compare");
      params.delete("month1");
      params.delete("month2");
    }
    
    const newParams = params.toString();
    if (newParams) {
      router.replace(`/relatorios?${newParams}`, { scroll: false });
    } else {
      router.replace("/relatorios", { scroll: false });
    }
  };

  const handleCompareMonth1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value;
    const newMonth = `${compareYear1}-${month}`;
    setCompareMonth1(newMonth);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month1", newMonth);
    router.replace(`/relatorios?${params.toString()}`, { scroll: false });
  };

  const handleCompareYear1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setCompareYear1(year);
    const month = compareMonth1.split("-")[1];
    const newMonth = `${year}-${month}`;
    setCompareMonth1(newMonth);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month1", newMonth);
    router.replace(`/relatorios?${params.toString()}`, { scroll: false });
  };

  const handleCompareMonth2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value;
    const newMonth = `${compareYear2}-${month}`;
    setCompareMonth2(newMonth);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month2", newMonth);
    router.replace(`/relatorios?${params.toString()}`, { scroll: false });
  };

  const handleCompareYear2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value);
    setCompareYear2(year);
    const month = compareMonth2.split("-")[1];
    const newMonth = `${year}-${month}`;
    setCompareMonth2(newMonth);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month2", newMonth);
    router.replace(`/relatorios?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm">
        <button
          onClick={() => handleTabChange("day")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
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
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
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
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
            activeTab === "month"
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Mês
        </button>
        <button
          onClick={() => handleTabChange("compare")}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all text-sm ${
            activeTab === "compare"
              ? "bg-blue-600 text-white"
              : "text-gray-700 dark:text-gray-300"
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-2" />
          Comparativo
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

      {/* Seletores para comparação de meses */}
      {activeTab === "compare" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Selecione os meses para comparar
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mês 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mês 1
              </label>
              <div className="flex gap-2">
                <select
                  value={compareMonth1.split("-")[1]}
                  onChange={handleCompareMonth1Change}
                  className="flex-1 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={compareYear1}
                  onChange={handleCompareYear1Change}
                  className="flex-1 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Mês 2 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mês 2
              </label>
              <div className="flex gap-2">
                <select
                  value={compareMonth2.split("-")[1]}
                  onChange={handleCompareMonth2Change}
                  className="flex-1 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={compareYear2}
                  onChange={handleCompareYear2Change}
                  className="flex-1 px-4 py-2 text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          monthlyGoal={monthlyGoal}
          costPerKm={costPerKm}
          period="month"
        />
      )}
      {activeTab === "compare" && comparisonMonth1 && comparisonMonth2 && (
        <MonthComparison
          month1={{
            workDays: comparisonMonth1,
            fuelings: comparisonFuelings1 || [],
            monthLabel: comparisonMonth1Label || compareMonth1,
          }}
          month2={{
            workDays: comparisonMonth2,
            fuelings: comparisonFuelings2 || [],
            monthLabel: comparisonMonth2Label || compareMonth2,
          }}
          dailyGoal={dailyGoal}
          costPerKm={costPerKm}
        />
      )}
    </div>
  );
}
