"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DollarSign } from "lucide-react";

const fuelingSchema = z.object({
  amount: z.number().min(0.01),
});

type FuelingFormData = z.infer<typeof fuelingSchema>;

interface RegisterFuelingProps {
  onSuccess: () => void;
}

export function RegisterFueling({ onSuccess }: RegisterFuelingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FuelingFormData>({
    resolver: zodResolver(fuelingSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const onSubmit = async (data: FuelingFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/fuelings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao registrar abastecimento");
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
          <DollarSign className="w-4 h-4" />
          Valor abastecido (R$)
        </label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          {...register("amount", { valueAsNumber: true })}
          className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Salvando..." : "Registrar Abastecimento"}
      </button>
    </form>
  );
}
