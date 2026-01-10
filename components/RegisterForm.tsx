"use client";

import { useRouter } from "next/navigation";
import { RegisterWorkDay } from "./RegisterWorkDay";

export function RegisterForm() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/");
    router.refresh();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <RegisterWorkDay onSuccess={handleSuccess} />
    </div>
  );
}
