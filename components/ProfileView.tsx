"use client";

import { useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import { User, Mail, LogOut, Target, Save } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProfileViewProps {
  user: {
    id: string;
    name: string | null;
    email: string;
    dailyGoal: number;
  };
  clerkUser: {
    firstName: string | null;
    lastName: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
    imageUrl?: string | null;
  } | null;
}

function getDisplayName(
  user: ProfileViewProps["user"],
  clerkUser: ProfileViewProps["clerkUser"]
): string {
  if (user.name) return user.name;
  if (clerkUser?.firstName && clerkUser?.lastName) {
    return `${clerkUser.firstName} ${clerkUser.lastName}`;
  }
  if (clerkUser?.firstName) return clerkUser.firstName;
  return "Usuário";
}

export function ProfileView({ user, clerkUser }: ProfileViewProps) {
  const displayName = getDisplayName(user, clerkUser);
  const imageUrl = clerkUser?.imageUrl || null;
  const [dailyGoal, setDailyGoal] = useState(user.dailyGoal);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (dailyGoal <= 0) {
      alert("A meta deve ser maior que zero");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/user/daily-goal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyGoal }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar meta");
      }

      setIsEditing(false);
      // Atualizar a página para refletir a mudança
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Informações do usuário */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col items-center gap-4">
          {/* Foto */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          )}

          {/* Nome */}
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {displayName}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Meta diária */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Meta Diária
          </span>
        </div>
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Valor da meta (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="500.00"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={() => {
                  setDailyGoal(user.dailyGoal);
                  setIsEditing(false);
                }}
                disabled={isSaving}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(dailyGoal)}
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 py-2 px-4 rounded-lg font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              Editar Meta
            </button>
          </div>
        )}
      </div>

      {/* Botão de Logout */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <SignOutButton>
          <button className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
