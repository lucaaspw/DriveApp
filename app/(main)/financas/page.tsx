"use client";

import { useState } from "react";
import { ExpenseList } from "@/components/ExpenseList";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Plus, X } from "lucide-react";

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

export default function FinancasPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<MonthlyExpense | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddClick = () => {
    setEditingExpense(null);
    setShowForm(true);
  };

  const handleEdit = (expense: MonthlyExpense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExpense(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Controle de Finanças
        </h1>
        {!showForm && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">Adicionar Despesa</span>
            <span className="md:hidden">Adicionar</span>
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingExpense ? "Editar Despesa" : "Nova Despesa"}
            </h2>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <ExpenseForm
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
            initialData={
              editingExpense
                ? {
                    id: editingExpense.id,
                    name: editingExpense.name,
                    amount: editingExpense.amount,
                    dueDate: editingExpense.isRecurring 
                      ? "" 
                      : editingExpense.dueDate.includes("T") 
                      ? editingExpense.dueDate.split("T")[0]
                      : editingExpense.dueDate.includes(" ")
                      ? editingExpense.dueDate.split(" ")[0]
                      : editingExpense.dueDate,
                    dueDay: editingExpense.isRecurring 
                      ? (editingExpense.dueDay ?? undefined)
                      : undefined,
                    category: editingExpense.category,
                    isRecurring: editingExpense.isRecurring || false,
                  }
                : undefined
            }
          />
        </div>
      ) : (
        <ExpenseList key={refreshKey} onEdit={handleEdit} onRefresh={() => setRefreshKey((prev) => prev + 1)} />
      )}
    </div>
  );
}
