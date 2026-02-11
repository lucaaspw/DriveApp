"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  X,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface MonthlyExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
}

export function ExpenseAlerts() {
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("/api/monthly-expenses?onlyPending=true");
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return differenceInDays(due, today);
  };

  const handleDismiss = (id: string) => {
    setDismissed((prev) => [...prev, id]);
  };

  if (loading) {
    return null;
  }

  // Filtrar apenas despesas vencidas ou que vencem em até 7 dias
  const urgentExpenses = expenses
    .filter((expense) => {
      const daysUntilDue = getDaysUntilDue(expense.dueDate);
      return daysUntilDue <= 7 && !expense.isPaid;
    })
    .filter((expense) => !dismissed.includes(expense.id))
    .sort((a, b) => {
      const daysA = getDaysUntilDue(a.dueDate);
      const daysB = getDaysUntilDue(b.dueDate);
      return daysA - daysB; // Ordenar por mais urgente primeiro
    });

  if (urgentExpenses.length === 0) {
    return null;
  }

  const totalUrgent = urgentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const overdueCount = urgentExpenses.filter(
    (e) => getDaysUntilDue(e.dueDate) < 0
  ).length;

  return (
    <div className="space-y-3">
      {/* Alerta principal com resumo */}
      <div
        className={`rounded-xl p-4 md:p-6 shadow-lg border-l-4 ${
          overdueCount > 0
            ? "bg-red-50 dark:bg-red-900/20 border-red-500 ring-2 ring-red-200 dark:ring-red-800"
            : "bg-orange-50 dark:bg-orange-900/20 border-orange-500 ring-2 ring-orange-200 dark:ring-orange-800"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle
              className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                overdueCount > 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-orange-600 dark:text-orange-400"
              }`}
            />
            <div className="flex-1">
              <h3
                className={`font-bold text-lg mb-2 ${
                  overdueCount > 0
                    ? "text-red-800 dark:text-red-300"
                    : "text-orange-800 dark:text-orange-300"
                }`}
              >
                {overdueCount > 0
                  ? `⚠️ ${overdueCount} despesa(s) vencida(s)!`
                  : "⚠️ Despesas próximas ao vencimento"}
              </h3>
              <p
                className={`text-sm mb-3 ${
                  overdueCount > 0
                    ? "text-red-700 dark:text-red-400"
                    : "text-orange-700 dark:text-orange-400"
                }`}
              >
                Você tem {urgentExpenses.length} despesa(s) pendente(s) que{" "}
                {overdueCount > 0
                  ? "já venceram"
                  : "vencem nos próximos 7 dias"}
                . Total:{" "}
                <span className="font-bold">{formatCurrency(totalUrgent)}</span>
              </p>

              {/* Lista de despesas urgentes */}
              <div className="space-y-2 mt-4">
                {urgentExpenses.slice(0, 3).map((expense) => {
                  const daysUntilDue = getDaysUntilDue(expense.dueDate);
                  const isOverdue = daysUntilDue < 0;

                  return (
                    <div
                      key={expense.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isOverdue
                          ? "bg-red-100 dark:bg-red-900/30"
                          : "bg-orange-100 dark:bg-orange-900/30"
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {expense.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {expense.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(expense.dueDate), "dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <DollarSign className="w-4 h-4" />
                            {formatCurrency(expense.amount)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            isOverdue
                              ? "bg-red-500 text-white"
                              : daysUntilDue === 0
                              ? "bg-orange-500 text-white"
                              : "bg-yellow-500 text-white"
                          }`}
                        >
                          {isOverdue
                            ? `Vencido há ${Math.abs(daysUntilDue)} dia(s)`
                            : daysUntilDue === 0
                            ? "Vence hoje!"
                            : `${daysUntilDue} dia(s)`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDismiss(expense.id)}
                        className="ml-2 p-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                        title="Ocultar alerta"
                      >
                        <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {urgentExpenses.length > 3 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  +{urgentExpenses.length - 3} despesa(s) adicional(is)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botão para ir para a página de finanças */}
        <Link
          href="/financas"
          className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            overdueCount > 0
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-orange-600 hover:bg-orange-700 text-white"
          }`}
        >
          Ver todas as despesas
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
