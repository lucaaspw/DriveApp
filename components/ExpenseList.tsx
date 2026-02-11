"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import {
  Calendar,
  DollarSign,
  Tag,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Edit,
  Trash2,
  X,
  Repeat,
} from "lucide-react";

interface MonthlyExpense {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isPaid: boolean;
  paidDate: string | null;
  isRecurring?: boolean;
  dueDay?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseListProps {
  onEdit: (expense: MonthlyExpense) => void;
  onRefresh: () => void;
}

export function ExpenseList({ onEdit, onRefresh }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<MonthlyExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const fetchExpenses = async () => {
    try {
      const url =
        filter === "pending"
          ? "/api/monthly-expenses?onlyPending=true"
          : "/api/monthly-expenses";
      const response = await fetch(url);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) {
      return;
    }

    try {
      const response = await fetch(`/api/monthly-expenses?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExpenses();
        onRefresh();
      } else {
        alert("Erro ao excluir despesa");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Erro ao excluir despesa");
    }
  };

  const handleTogglePaid = async (expense: MonthlyExpense) => {
    try {
      const updateData = {
        id: expense.id,
        isPaid: !expense.isPaid,
        paidDate: !expense.isPaid ? new Date().toISOString().split("T")[0] : null,
      };

      const response = await fetch("/api/monthly-expenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        fetchExpenses();
        onRefresh();
      } else {
        alert("Erro ao atualizar despesa");
      }
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Erro ao atualizar despesa");
    }
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return differenceInDays(due, today);
  };

  const getAlertColor = (daysUntilDue: number, isPaid: boolean): string => {
    if (isPaid) return "text-green-600 dark:text-green-400";
    if (daysUntilDue < 0) return "text-red-600 dark:text-red-400";
    if (daysUntilDue <= 3) return "text-orange-600 dark:text-orange-400";
    if (daysUntilDue <= 7) return "text-yellow-600 dark:text-yellow-400";
    return "text-gray-600 dark:text-gray-400";
  };

  const getAlertMessage = (daysUntilDue: number, isPaid: boolean): string => {
    if (isPaid) return "Pago";
    if (daysUntilDue < 0) return `Vencido há ${Math.abs(daysUntilDue)} dia(s)`;
    if (daysUntilDue === 0) return "Vence hoje!";
    if (daysUntilDue === 1) return "Vence amanhã";
    return `${daysUntilDue} dias até vencer`;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Carregando...
      </div>
    );
  }

  const filteredExpenses =
    filter === "paid"
      ? expenses.filter((e) => e.isPaid)
      : filter === "pending"
      ? expenses.filter((e) => !e.isPaid)
      : expenses;

  const pendingExpenses = expenses.filter((e) => !e.isPaid);
  const totalPending = pendingExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = expenses
    .filter((e) => e.isPaid)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Filtros e Resumo */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "pending"
                ? "bg-orange-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter("paid")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === "paid"
                ? "bg-green-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Pagas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">
              Total Pendente
            </div>
            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {formatCurrency(totalPending)}
            </div>
            <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {pendingExpenses.length} despesa(s)
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-600 dark:text-green-400 mb-1">
              Total Pago
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(totalPaid)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              {expenses.filter((e) => e.isPaid).length} despesa(s)
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Despesas */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === "pending"
              ? "Nenhuma despesa pendente"
              : filter === "paid"
              ? "Nenhuma despesa paga"
              : "Nenhuma despesa cadastrada"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => {
            const daysUntilDue = getDaysUntilDue(expense.dueDate);
            const alertColor = getAlertColor(daysUntilDue, expense.isPaid);
            const alertMessage = getAlertMessage(daysUntilDue, expense.isPaid);

            return (
              <div
                key={expense.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 ${
                  expense.isPaid
                    ? "border-green-500"
                    : daysUntilDue < 0
                    ? "border-red-500"
                    : daysUntilDue <= 3
                    ? "border-orange-500"
                    : daysUntilDue <= 7
                    ? "border-yellow-500"
                    : "border-blue-500"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {expense.name}
                      </h3>
                      {expense.isRecurring && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium">
                          <Repeat className="w-3 h-3 inline mr-1" />
                          Recorrente
                        </span>
                      )}
                      {expense.isPaid && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        <span>{expense.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(expense.dueDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {!expense.isPaid && daysUntilDue <= 7 && (
                        <AlertTriangle
                          className={`w-4 h-4 ${alertColor}`}
                        />
                      )}
                      <span className={`text-sm font-medium ${alertColor}`}>
                        {alertMessage}
                      </span>
                    </div>

                    {expense.isPaid && expense.paidDate && (
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                        Pago em:{" "}
                        {format(new Date(expense.paidDate), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePaid(expense)}
                      className={`p-2 rounded-lg transition-colors ${
                        expense.isPaid
                          ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                          : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                      title={expense.isPaid ? "Marcar como pendente" : "Marcar como pago"}
                    >
                      {expense.isPaid ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(expense)}
                      className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
