"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Shield, Save, Upload, Loader2, ArrowLeft } from "lucide-react";
import { ChangePasswordDialog } from "@/components/profile/change-password-dialog";
import { Setup2FADialog } from "@/components/profile/setup-2fa-dialog";
import { AvatarUploadDialog } from "@/components/profile/avatar-upload-dialog";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    avatar: "",
  });

  // Estados para los dialogs
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [setup2FAOpen, setSetup2FAOpen] = useState(false);
  const [avatarUploadOpen, setAvatarUploadOpen] = useState(false);

  // Cargar datos del perfil desde el backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
        const token = localStorage.getItem('auth_token');

        if (!token) {
          throw new Error('No auth token found');
        }

        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load profile');
        }

        const result = await response.json();
        const userData = result.data || result;

        setProfileData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          role: userData.role === 'admin' ? 'Administrador' : 'Usuario',
          avatar: userData.avatar || "",
        });
      } catch (error) {
        console.error('Error loading profile:', error);

        // Si es error 401, redirigir al login
        if (error instanceof Error && error.message.includes('Failed to load profile')) {
          toast({
            title: "⚠️ Sesión expirada",
            description: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            variant: "destructive",
          });
          // Limpiar localStorage y redirigir
          setTimeout(() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            router.push('/login');
          }, 2000);
        } else {
          toast({
            title: "❌ Error",
            description: "No se pudo cargar el perfil. Usando datos del token.",
            variant: "destructive",
          });
          // Fallback a datos del useAuth
          const nameParts = user?.name?.split(' ') || [];
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(' ') || "";

          setProfileData({
            firstName: firstName,
            lastName: lastName,
            email: user?.email || "",
            phone: "",
            role: user?.role === 'admin' ? 'Administrador' : 'Usuario',
            avatar: "",
          });
        }
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user, toast]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
        }),
      });

      if (response.status === 401) {
        toast({
          title: "⚠️ Sesión expirada",
          description: "Tu sesión ha expirado. Redirigiendo al login...",
          variant: "destructive",
        });
        setTimeout(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          router.push('/login');
        }, 2000);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast({
        title: "✅ Perfil actualizado",
        description: "Tus cambios se han guardado correctamente",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el perfil. Verifica tu conexión.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = () => {
    setAvatarUploadOpen(true);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-dysa-purple" />
          <span className="ml-2">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            title="Volver al Dashboard"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
            <p className="text-muted-foreground">
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Tarjeta de Avatar y Info Básica */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Foto de Perfil</CardTitle>
            <CardDescription>Actualiza tu imagen de perfil</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              {profileData.avatar && (
                <AvatarImage
                  src={`http://localhost:8005${profileData.avatar}`}
                  alt={`${profileData.firstName} ${profileData.lastName}`}
                />
              )}
              <AvatarFallback className="text-3xl bg-dysa-purple text-white">
                {profileData.firstName && profileData.lastName
                  ? `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase()
                  : profileData.email
                  ? profileData.email.charAt(0).toUpperCase()
                  : 'U'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" className="w-full" onClick={handleAvatarChange}>
              <Upload className="mr-2 h-4 w-4" />
              Cambiar Foto
            </Button>
          </CardContent>
        </Card>

        {/* Tarjeta de Información Personal */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Tu información personal y de contacto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, firstName: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, lastName: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  El correo electrónico no se puede cambiar
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">📱</span>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="role">Rol</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Input id="role" value={profileData.role} disabled />
                </div>
                <p className="text-xs text-muted-foreground">
                  Solo los administradores pueden cambiar roles de usuario
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Editar Perfil
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta de Seguridad */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>
              Gestiona la seguridad de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Contraseña</p>
                <p className="text-sm text-muted-foreground">
                  Última actualización: Hace 30 días
                </p>
              </div>
              <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>
                Cambiar Contraseña
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Autenticación de dos factores</p>
                <p className="text-sm text-muted-foreground">
                  Añade una capa extra de seguridad a tu cuenta
                </p>
              </div>
              <Button variant="outline" onClick={() => setSetup2FAOpen(true)}>
                Configurar
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Sesiones Activas</p>
                <p className="text-sm text-muted-foreground">
                  Gestiona los dispositivos con acceso a tu cuenta
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push('/profile/sessions')}>
                Ver Sesiones
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />

      <Setup2FADialog
        open={setup2FAOpen}
        onOpenChange={setSetup2FAOpen}
      />

      <AvatarUploadDialog
        open={avatarUploadOpen}
        onOpenChange={setAvatarUploadOpen}
        currentInitials={
          profileData.firstName && profileData.lastName
            ? `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase()
            : profileData.email
            ? profileData.email.charAt(0).toUpperCase()
            : 'U'
        }
        onSuccess={() => {
          // Recargar perfil después de subir avatar
          window.location.reload();
        }}
      />
    </div>
  );
}
