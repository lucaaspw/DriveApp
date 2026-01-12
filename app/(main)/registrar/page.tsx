import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/RegisterForm";

export default async function RegistrarPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Registrar</h1>
      <RegisterForm dailyGoal={user.dailyGoal} />
    </div>
  );
}
