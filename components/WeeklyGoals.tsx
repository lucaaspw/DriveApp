"use client";

import { useState, useEffect } from "react";
import { Target, Edit2, Save, X, Calendar, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WeeklyGoal {
  id: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  weeklyTotal: number;
}

interface WeeklyGoalsProps {
  initialData?: WeeklyGoal | null;
}

const DAYS = [
  { key: "monday", label: "Segunda", short: "Seg" },
  { key: "tuesday", label: "Terça", short: "Ter" },
  { key: "wednesday", label: "Quarta", short: "Qua" },
  { key: "thursday", label: "Quinta", short: "Qui" },
  { key: "friday", label: "Sexta", short: "Sex" },
  { key: "saturday", label: "Sábado", short: "Sáb" },
  { key: "sunday", label: "Domingo", short: "Dom" },
] as const;

export function WeeklyGoals({ initialData }: WeeklyGoalsProps) {
  const [goals, setGoals] = useState<WeeklyGoal | null>(initialData || null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValues, setEditValues] = useState<Partial<WeeklyGoal>>({});

  useEffect(() => {
    if (!goals) {
      loadGoals();
    }
  }, []);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/weekly-goals");
      if (response.ok) {
        const data = await response.json();
        setGoals(data);
      }
    } catch (error) {
      console.error("Error loading weekly goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (goals) {
      setEditValues({
        monday: goals.monday,
        tuesday: goals.tuesday,
        wednesday: goals.wednesday,
        thursday: goals.thursday,
        friday: goals.friday,
        saturday: goals.saturday,
        sunday: goals.sunday,
        weeklyTotal: goals.weeklyTotal,
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({});
  };

  const handleSave = async () => {
    if (!goals) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/user/weekly-goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editValues),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar metas");
      }

      const updated = await response.json();
      setGoals(updated);
      setIsEditing(false);
      setEditValues({});
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleValueChange = (day: string, value: number) => {
    setEditValues((prev) => {
      const updated = { ...prev, [day]: value };
      // Calcular total automaticamente
      const total =
        (updated.monday || 0) +
        (updated.tuesday || 0) +
        (updated.wednesday || 0) +
        (updated.thursday || 0) +
        (updated.friday || 0) +
        (updated.saturday || 0) +
        (updated.sunday || 0);
      updated.weeklyTotal = total;
      return updated;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Carregando metas...
        </div>
      </div>
    );
  }

  if (!goals) {
    return null;
  }

  const currentValues = isEditing ? editValues : goals;
  const calculatedTotal =
    (currentValues.monday || 0) +
    (currentValues.tuesday || 0) +
    (currentValues.wednesday || 0) +
    (currentValues.thursday || 0) +
    (currentValues.friday || 0) +
    (currentValues.saturday || 0) +
    (currentValues.sunday || 0);

  // Determinar qual dia da semana é hoje
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  const getDayIndex = (dayKey: string) => {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    return dayMap[dayKey] ?? -1;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Metas Semanais
          </span>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Grid de dias da semana */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {DAYS.map((day) => {
            const value = currentValues[day.key as keyof WeeklyGoal] as number;
            const isToday = getDayIndex(day.key) === dayOfWeek;
            return (
              <div
                key={day.key}
                className={`rounded-lg p-4 border-2 transition-all ${
                  isToday
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 shadow-md"
                    : "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`text-xs font-medium ${
                      isToday
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {day.label}
                  </div>
                  {isToday && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      Hoje
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={value || 0}
                    onChange={(e) =>
                      handleValueChange(day.key, parseFloat(e.target.value) || 0)
                    }
                    className={`w-full px-3 py-2 text-lg font-bold border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isToday
                        ? "border-blue-300 dark:border-blue-600 dark:bg-blue-900/20 dark:text-white"
                        : "border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    }`}
                  />
                ) : (
                  <div
                    className={`text-lg font-bold ${
                      isToday
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-900 dark:text-white"
                    }`}
                  >
                    {formatCurrency(value || 0)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Total semanal */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-base font-semibold text-gray-700 dark:text-gray-300">
                Total Semanal
              </span>
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentValues.weeklyTotal || calculatedTotal}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      weeklyTotal: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="px-4 py-2 text-xl font-bold border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-32 text-right"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (Calculado: {formatCurrency(calculatedTotal)})
                </span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(goals.weeklyTotal)}
              </div>
            )}
          </div>
          {isEditing && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              O total é calculado automaticamente, mas você pode ajustá-lo manualmente
            </div>
          )}
        </div>

        {/* Botões de ação */}
        {isEditing && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Salvando..." : "Salvar Metas"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
