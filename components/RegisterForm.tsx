"use client";

import { useRouter } from "next/navigation";
import { RegisterWorkDay } from "./RegisterWorkDay";

interface RegisterFormProps {
  dailyGoal: number;
}

export function RegisterForm({ dailyGoal }: RegisterFormProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <RegisterWorkDay onSuccess={handleSuccess} dailyGoal={dailyGoal} />
    </div>
  );
}
