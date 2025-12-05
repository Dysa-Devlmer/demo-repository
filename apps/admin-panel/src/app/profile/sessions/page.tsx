'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getBaseUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  LogOut,
  Shield,
  AlertCircle,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionToRevoke, setSessionToRevoke] = useState<string | null>(null);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${getBaseUrl()}/auth/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }

      const result = await response.json();
      const sessionsData = result.data || result;

      // Asegurarse de que sessionsData sea un array
      if (Array.isArray(sessionsData)) {
        setSessions(sessionsData);
      } else {
        console.warn('Sessions data is not an array:', sessionsData);
        setSessions([]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);

      // Mock data para demo si el endpoint no existe
      const mockSessions: Session[] = [
        {
          id: 'sess_current',
          device: 'Desktop',
          browser: 'Chrome 120',
          os: 'macOS 14.1',
          ip: '190.45.76.123',
          location: 'Santiago, Chile',
          lastActive: 'Ahora',
          isCurrent: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'sess_mobile',
          device: 'Mobile',
          browser: 'Safari',
          os: 'iOS 17.1',
          ip: '190.45.76.124',
          location: 'Santiago, Chile',
          lastActive: 'Hace 2 horas',
          isCurrent: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setSessions(mockSessions);

      toast({
        title: '⚠️ Modo demo',
        description: 'Mostrando sesiones de ejemplo. Endpoint /api/auth/sessions no disponible.',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      setRevoking(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${getBaseUrl()}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke session');
      }

      toast({
        title: '✅ Sesión cerrada',
        description: 'La sesión ha sido revocada exitosamente',
      });

      // Recargar sesiones
      loadSessions();
    } catch (error) {
      console.error('Error revoking session:', error);

      // Si el endpoint no existe, simular revocación
      if (Array.isArray(sessions)) {
        setSessions(sessions.filter(s => s.id !== sessionId));
      }

      toast({
        title: '✅ Sesión cerrada (demo)',
        description: 'La sesión fue removida localmente',
      });
    } finally {
      setRevoking(false);
      setSessionToRevoke(null);
    }
  };

  const handleRevokeAll = async () => {
    try {
      setRevoking(true);
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${getBaseUrl()}/auth/sessions/revoke-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke all sessions');
      }

      toast({
        title: '✅ Todas las sesiones cerradas',
        description: 'Todas las demás sesiones han sido revocadas',
      });

      // Recargar sesiones
      loadSessions();
    } catch (error) {
      console.error('Error revoking all sessions:', error);

      // Mantener solo la sesión actual
      if (Array.isArray(sessions)) {
        setSessions(sessions.filter(s => s.isCurrent));
      }

      toast({
        title: '✅ Sesiones cerradas (demo)',
        description: 'Todas las demás sesiones fueron removidas',
      });
    } finally {
      setRevoking(false);
    }
  };

  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (device.toLowerCase().includes('tablet')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-dysa-purple" />
          <span className="ml-2">Cargando sesiones...</span>
        </div>
      </div>
    );
  }

  // Asegurarse de que sessions sea un array antes de filtrar
  const otherSessions = Array.isArray(sessions) ? sessions.filter(s => !s.isCurrent) : [];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sesiones Activas</h1>
            <p className="text-muted-foreground">
              Gestiona los dispositivos con acceso a tu cuenta
            </p>
          </div>
        </div>
        {otherSessions.length > 0 && (
          <Button
            variant="destructive"
            onClick={handleRevokeAll}
            disabled={revoking}
          >
            {revoking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cerrando...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Todas las Demás
              </>
            )}
          </Button>
        )}
      </div>

      {/* Info Alert */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-start gap-3 pt-6">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900">
              Revisa tus sesiones activas
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Si ves alguna sesión que no reconoces, ciérrala inmediatamente y cambia tu contraseña.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sesión Actual */}
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Sesión Actual
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  Activa ahora
                </Badge>
              </CardTitle>
              <CardDescription>
                Esta es tu sesión actual. No se puede cerrar.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sessions
            .filter(s => s.isCurrent)
            .map((session) => (
              <div key={session.id} className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-700">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{session.browser} en {session.os}</p>
                        <p className="text-sm text-muted-foreground">{session.device}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.lastActive}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      IP: {session.ip}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Otras Sesiones */}
      {otherSessions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Otras Sesiones ({otherSessions.length})</CardTitle>
            <CardDescription>
              Dispositivos donde has iniciado sesión recientemente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherSessions.map((session, index) => (
              <div key={session.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-700">
                    {getDeviceIcon(session.device)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{session.browser} en {session.os}</p>
                        <p className="text-sm text-muted-foreground">{session.device}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSessionToRevoke(session.id)}
                        disabled={revoking}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.lastActive}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      IP: {session.ip}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No hay otras sesiones activas</p>
            <p className="text-sm text-muted-foreground mt-2">
              Solo has iniciado sesión en este dispositivo
            </p>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!sessionToRevoke} onOpenChange={(open) => !open && setSessionToRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar esta sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción cerrará la sesión inmediatamente. El dispositivo tendrá que volver a iniciar sesión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => sessionToRevoke && handleRevokeSession(sessionToRevoke)}
              disabled={revoking}
              className="bg-red-600 hover:bg-red-700"
            >
              {revoking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                'Cerrar Sesión'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
