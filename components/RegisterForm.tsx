"use client";

import { useRouter } from "next/navigation";
import { RegisterWorkDay } from "./RegisterWorkDay";

interface RegisterFormProps {
  dailyGoal: number;
  initialData?: {
    id: string;
    date: string;
    hoursWorked: number;
    kmDriven: number;
    tripsCount?: number | null;
    uberEarnings: number;
    ninetynineEarnings: number;
    inDriveEarnings: number;
  };
}

export function RegisterForm({ dailyGoal, initialData }: RegisterFormProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/relatorios");
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 md:p-8 shadow-sm">
      <RegisterWorkDay 
        onSuccess={handleSuccess} 
        dailyGoal={dailyGoal}
        initialData={initialData}
        isEditing={!!initialData}
      />
    </div>
  );
}
