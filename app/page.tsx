import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  ArrowRight,
  TrendingUp,
  DollarSign,
  BarChart3,
  Clock,
  Shield,
} from "lucide-react";

export default async function LandingPage() {
  // Se usuário já estiver autenticado, redirecionar para relatórios
  const user = await getCurrentUser();
  if (user) {
    redirect("/relatorios");
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            DriveApp
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-2">
            Controle Financeiro para Motoristas
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            Gerencie seus ganhos e gastos de forma simples e rápida
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Controle de Ganhos
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Registre seus ganhos do Uber e 99 de forma rápida e
                  organizada. Acompanhe seu lucro líquido em tempo real.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Metas Diárias
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Defina e acompanhe suas metas diárias de ganho. Visualize seu
                  progresso com gráficos intuitivos.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-lg p-3">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Relatórios Detalhados
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Análise completa dos seus ganhos e gastos por dia, semana e
                  mês. Tome decisões baseadas em dados.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-orange-100 dark:bg-orange-900 rounded-lg p-3">
                <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Registro Rápido
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Interface otimizada para uso com uma mão. Registre seus dados
                  em menos de 60 segundos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Por que usar o DriveApp?
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Mobile First:</strong> Interface otimizada para uso no
                celular
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Seguro:</strong> Seus dados protegidos com autenticação
                Google
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Gratuito:</strong> Use todas as funcionalidades sem
                custo
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Simples:</strong> Navegação intuitiva, sem complicações
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg transition-all transform hover:scale-105"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Faça login com sua conta Google e comece a usar agora mesmo
          </p>
        </div>
      </div>
    </div>
  );
}
