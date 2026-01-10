"use client";

import { SignOutButton } from "@clerk/nextjs";
import { User, Mail, LogOut } from "lucide-react";

interface ProfileViewProps {
  user: {
    id: string;
    name: string | null;
    email: string;
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
