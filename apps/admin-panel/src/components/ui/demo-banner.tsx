"use client";

import { AlertTriangle, Crown, MessageSquare } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DemoBannerProps {
  isDemoMode: boolean;
}

export function DemoBanner({ isDemoMode }: DemoBannerProps) {
  if (!isDemoMode) return null;

  const handleContactSales = () => {
    // Simulate contact action - in real app this would open contact form
    alert('📞 Contacto de Ventas: ventas@chatbotdysa.com\n\n¡Solicite una demostración personalizada de ChatBotDysa Enterprise++++ Edition!');
  };

  const handleSwitchToEnterprise = () => {
    console.log('🚀 Saliendo de modo DEMO...');

    // Limpiar completamente el modo demo
    localStorage.removeItem('demo_mode');
    localStorage.removeItem('demo_token');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');

    console.log('✅ Modo DEMO limpiado - Redirigiendo a login...');
    window.location.href = '/login';
  };

  return (
    <Alert className="mb-6 border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-purple-600" />
        <AlertTriangle className="h-4 w-4 text-amber-500" />
      </div>
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-purple-700">
              🎯 MODO DEMOSTRACIÓN - ChatBotDysa Enterprise++++ Edition
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              DEMO
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Está explorando una demostración completa del sistema.
            <span className="font-medium text-purple-700"> Todos los datos son simulados</span> para mostrar las capacidades empresariales.
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleContactSales}
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Contactar Ventas
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleSwitchToEnterprise}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Crown className="w-4 h-4 mr-1" />
            Acceso Enterprise
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default DemoBanner;