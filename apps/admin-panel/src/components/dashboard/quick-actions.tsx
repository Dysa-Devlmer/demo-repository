'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Settings, FileText, Phone, ExternalLink } from 'lucide-react'

export function QuickActions() {
  const router = useRouter();

  const handleSupportClick = () => {
    // Abrir enlace de soporte (puede ser email, página de soporte, etc.)
    window.open('mailto:soporte@chatbotdysa.com?subject=Solicitud de Soporte&body=Describe tu problema aquí...', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>
          Accesos directos a funciones importantes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => router.push('/conversations')}
          >
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs">Ver Chats</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => router.push('/settings')}
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs">Configurar</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={() => router.push('/reports')}
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs">Reportes</span>
          </Button>
          <Button
            variant="outline"
            className="h-20 flex-col gap-2"
            onClick={handleSupportClick}
          >
            <Phone className="h-6 w-6" />
            <span className="text-xs">Soporte</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}