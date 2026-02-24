"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Verificar se está em iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isInStandaloneMode = (window.navigator as any).standalone === true;

    if (isIOS && !isInStandaloneMode) {
      // Mostrar prompt para iOS após um delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Para Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android/Chrome
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setShowPrompt(false);
        setIsInstalled(true);
      }
      
      setDeferredPrompt(null);
    } else {
      // iOS - apenas mostrar instruções
      setShowPrompt(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salvar no localStorage para não mostrar novamente por um tempo
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // Não mostrar se já está instalado ou se foi dispensado recentemente
  if (isInstalled || !showPrompt) {
    return null;
  }

  // Verificar se foi dispensado recentemente (últimas 24 horas)
  const dismissedTime = localStorage.getItem("pwa-install-dismissed");
  if (dismissedTime) {
    const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
    if (hoursSinceDismissed < 24) {
      return null;
    }
  }

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 md:px-6 pb-safe">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-blue-500 p-4 max-w-md mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
              Instalar DriveApp
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {isIOS
                ? "Toque no botão de compartilhar e selecione 'Adicionar à Tela de Início'"
                : "Instale o app para acesso rápido e uso offline"}
            </p>
            {isIOS ? (
              <div className="space-y-2 text-xs text-gray-500 dark:text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Toque no botão de compartilhar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Selecione "Adicionar à Tela de Início"</span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleInstallClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Instalar Agora
              </button>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
