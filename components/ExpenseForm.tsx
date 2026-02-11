"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, DollarSign, Tag, X, Repeat } from "lucide-react";

const expenseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  dueDate: z.string().optional(),
  dueDay: z.number().min(1).max(31).optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  isRecurring: z.boolean().default(false),
}).refine((data) => {
  // Se for recorrente, dueDay é obrigatório. Se não for, dueDate é obrigatório
  if (data.isRecurring) {
    return data.dueDay !== undefined && data.dueDay >= 1 && data.dueDay <= 31;
  } else {
    return data.dueDate !== undefined && data.dueDate.length > 0;
  }
}, {
  message: "Data de vencimento ou dia do mês é obrigatório",
  path: ["dueDate"],
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  initialData?: {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    category: string;
    isRecurring?: boolean;
    dueDay?: number;
  };
}

const categories = [
  "Parcela da casa",
  "Água",
  "Luz",
  "Internet",
  "Celular",
  "Móveis",
  "Cartão",
  "Aluguel",
  "Supermercado",
  "Transporte",
  "Outros",
];

export function ExpenseForm({ onSuccess, onCancel, initialData }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          amount: initialData.amount,
          dueDate: initialData.dueDate,
          dueDay: initialData.dueDay,
          category: initialData.category,
          isRecurring: initialData.isRecurring || false,
        }
      : {
          name: "",
          amount: 0,
          dueDate: "",
          dueDay: undefined,
          category: "",
          isRecurring: false,
        },
  });

  const handleRecurringChange = (checked: boolean) => {
    setIsRecurring(checked);
    setValue("isRecurring", checked);
    if (checked) {
      setValue("dueDate", "");
    } else {
      setValue("dueDay", undefined);
    }
  };

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      const url = "/api/monthly-expenses";
      const method = initialData ? "PATCH" : "POST";
      
      // Preparar body: se for recorrente, não enviar dueDate, se não for, não enviar dueDay
      const body: any = initialData
        ? { id: initialData.id, ...data }
        : { ...data };
      
      if (data.isRecurring) {
        delete body.dueDate;
      } else {
        delete body.dueDay;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar despesa");
      }

      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Tag className="w-4 h-4" />
          Nome da Despesa
        </label>
        <input
          type="text"
          {...register("name")}
          className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={isRecurring ? "Ex: Conta de luz" : "Ex: Conta de luz de janeiro"}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Checkbox para despesa recorrente */}
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <input
          type="checkbox"
          id="isRecurring"
          checked={isRecurring}
          onChange={(e) => handleRecurringChange(e.target.checked)}
          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
        />
        <label htmlFor="isRecurring" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          <Repeat className="w-4 h-4" />
          Despesa recorrente (se repete todo mês)
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign className="w-4 h-4" />
            Valor (R$)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            {...register("amount", { valueAsNumber: true })}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        {isRecurring ? (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              Dia do Vencimento (todo mês)
            </label>
            <input
              type="number"
              min="1"
              max="31"
              {...register("dueDay", { valueAsNumber: true })}
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 5 (vence todo dia 5)"
            />
            {errors.dueDay && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDay.message}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              A despesa será criada automaticamente para cada mês
            </p>
          </div>
        ) : (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4" />
              Data de Vencimento
            </label>
            <input
              type="date"
              {...register("dueDate")}
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.dueDate && (
              <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Tag className="w-4 h-4" />
          Categoria
        </label>
        <select
          {...register("category")}
          className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Salvando..." : initialData ? "Atualizar" : "Adicionar"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </form>
  );
}
