"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Clock, Gauge, DollarSign, Fuel } from "lucide-react";

const workDaySchema = z.object({
  date: z.string(),
  hoursWorked: z.number().min(0.5).max(24),
  kmDriven: z.number().min(1),
  uberEarnings: z.number().min(0),
  ninetynineEarnings: z.number().min(0),
  // Campo opcional de combustível
  fuelAmount: z.number().min(0).optional(),
});

type WorkDayFormData = z.infer<typeof workDaySchema>;

interface RegisterWorkDayProps {
  onSuccess: () => void;
  dailyGoal: number;
}

export function RegisterWorkDay({
  onSuccess,
  dailyGoal,
}: RegisterWorkDayProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WorkDayFormData>({
    resolver: zodResolver(workDaySchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      hoursWorked: 8,
      kmDriven: 100,
      uberEarnings: 0,
      ninetynineEarnings: 0,
      fuelAmount: undefined,
    },
  });

  const uberEarnings = watch("uberEarnings");
  const ninetynineEarnings = watch("ninetynineEarnings");

  // Calcular total
  const currentTotal = (uberEarnings || 0) + (ninetynineEarnings || 0);
  if (currentTotal !== total) {
    setTotal(currentTotal);
  }

  const onSubmit = async (data: WorkDayFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/work-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao registrar dia de trabalho");
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Erro ao registrar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar className="w-4 h-4" />
          Data
        </label>
        <input
          type="date"
          {...register("date")}
          className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {errors.date && (
          <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Clock className="w-4 h-4" />
          Horas trabalhadas
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0.5"
            max="24"
            step="0.5"
            {...register("hoursWorked", { valueAsNumber: true })}
            className="flex-1"
          />
          <span className="text-lg font-semibold w-16 text-right text-gray-900 dark:text-white">
            {watch("hoursWorked")}h
          </span>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Gauge className="w-4 h-4" />
          Km rodados no dia
        </label>
        <input
          type="number"
          step="1"
          min="1"
          {...register("kmDriven", { valueAsNumber: true })}
          className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="100"
        />
        {errors.kmDriven && (
          <p className="text-red-500 text-sm mt-1">{errors.kmDriven.message}</p>
        )}
      </div>

      {/* Seção de Combustível */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Fuel className="w-5 h-5 text-orange-500 dark:text-orange-400" />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Abastecimento (Opcional)
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <DollarSign className="w-4 h-4" />
              Valor abastecido (R$)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("fuelAmount", { valueAsNumber: true })}
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
            />
            {errors.fuelAmount && (
              <p className="text-red-500 text-sm mt-1">
                {errors.fuelAmount.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <DollarSign className="w-4 h-4" />
          Ganhos Uber
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register("uberEarnings", { valueAsNumber: true })}
          className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
        {errors.uberEarnings && (
          <p className="text-red-500 text-sm mt-1">
            {errors.uberEarnings.message}
          </p>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <DollarSign className="w-4 h-4" />
          Ganhos 99
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          {...register("ninetynineEarnings", { valueAsNumber: true })}
          className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="0.00"
        />
        {errors.ninetynineEarnings && (
          <p className="text-red-500 text-sm mt-1">
            {errors.ninetynineEarnings.message}
          </p>
        )}
      </div>

      {/* Feedback imediato */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          Total do dia
        </div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {formatCurrency(total)}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
          Meta: {formatCurrency(dailyGoal)} •{" "}
          {total >= dailyGoal ? (
            <span className="text-green-600 font-semibold">
              Meta atingida! 🎉
            </span>
          ) : (
            <span className="font-medium">
              Faltam {formatCurrency(dailyGoal - total)}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Salvando..." : "Registrar Dia"}
      </button>
    </form>
  );
}
