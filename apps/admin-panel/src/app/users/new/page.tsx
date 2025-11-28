"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import AuthGuard from "@/components/auth/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Save, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

const AVAILABLE_ROLES = [
  { id: "admin", label: "Administrador", description: "Acceso completo al sistema" },
  { id: "staff", label: "Staff", description: "Acceso a gestión operativa" },
  { id: "viewer", label: "Visualizador", description: "Solo lectura" },
];

const AVAILABLE_PERMISSIONS = [
  { id: "dashboard.read", label: "Ver Dashboard", category: "Dashboard" },
  { id: "dashboard.manage", label: "Gestionar Dashboard", category: "Dashboard" },
  { id: "customers.read", label: "Ver Clientes", category: "Clientes" },
  { id: "customers.write", label: "Gestionar Clientes", category: "Clientes" },
  { id: "orders.read", label: "Ver Órdenes", category: "Órdenes" },
  { id: "orders.write", label: "Gestionar Órdenes", category: "Órdenes" },
  { id: "menu.read", label: "Ver Menú", category: "Menú" },
  { id: "menu.write", label: "Gestionar Menú", category: "Menú" },
  { id: "users.read", label: "Ver Usuarios", category: "Usuarios" },
  { id: "users.write", label: "Gestionar Usuarios", category: "Usuarios" },
  { id: "system.admin", label: "Administración Sistema", category: "Sistema" },
];

export default function NewUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    status: "active" as "active" | "inactive",
    roles: [] as string[],
    permissions: [] as string[],
  });
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });

  // Validar email en tiempo real
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(email.length === 0 ? null : emailRegex.test(email));
  };

  // Calcular fortaleza de contraseña
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const labels = [
      { label: "Muy débil", color: "bg-red-500" },
      { label: "Débil", color: "bg-orange-500" },
      { label: "Aceptable", color: "bg-yellow-500" },
      { label: "Fuerte", color: "bg-blue-500" },
      { label: "Muy fuerte", color: "bg-green-500" },
    ];

    setPasswordStrength({
      score: (score / 5) * 100,
      label: password.length === 0 ? "" : labels[score]?.label || "",
      color: password.length === 0 ? "" : labels[score]?.color || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error("Email y contraseña son obligatorios");
      return;
    }

    if (emailValid === false) {
      toast.error("Por favor ingresa un email válido");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Creando usuario...");

    try {
      const { confirmPassword, ...dataToSend } = formData;
      await apiService.users.create(dataToSend);
      toast.success("Usuario creado exitosamente", { id: toastId });
      router.push("/users");
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Error al crear el usuario", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter((r) => r !== roleId)
        : [...prev.roles, roleId],
    }));
  };

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>);

  return (
    <AuthGuard>
      <MainLayout>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/users")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-lg font-semibold md:text-2xl">Crear Nuevo Usuario</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Completa los datos del nuevo usuario del sistema
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos personales y credenciales del usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Nombre</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    placeholder="Juan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Apellido</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    placeholder="Pérez"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      validateEmail(e.target.value);
                    }}
                    placeholder="usuario@ejemplo.com"
                    className={emailValid === false ? "border-red-500" : emailValid === true ? "border-green-500" : ""}
                  />
                  {emailValid !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {emailValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {emailValid === false && (
                  <p className="text-sm text-red-500">Email inválido</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      calculatePasswordStrength(e.target.value);
                    }}
                    placeholder="Mínimo 8 caracteres"
                  />
                  {passwordStrength.label && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Fortaleza:</span>
                        <span className={`font-medium ${
                          passwordStrength.label === "Muy fuerte" || passwordStrength.label === "Fuerte"
                            ? "text-green-600"
                            : passwordStrength.label === "Aceptable"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress value={passwordStrength.score} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Usa mayúsculas, minúsculas, números y caracteres especiales para una contraseña más segura
                      </p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    placeholder="Repetir contraseña"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Las contraseñas no coinciden
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader>
              <CardTitle>Roles del Usuario</CardTitle>
              <CardDescription>Selecciona los roles que tendrá este usuario</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {AVAILABLE_ROLES.map((role) => (
                  <div key={role.id} className="flex items-start space-x-3">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={formData.roles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {role.label}
                      </label>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permisos */}
          <Card>
            <CardHeader>
              <CardTitle>Permisos Específicos</CardTitle>
              <CardDescription>
                Define permisos granulares adicionales (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category}>
                    <h3 className="font-medium mb-3">{category}</h3>
                    <div className="space-y-2 pl-4">
                      {perms.map((perm) => (
                        <div key={perm.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`perm-${perm.id}`}
                            checked={formData.permissions.includes(perm.id)}
                            onCheckedChange={() => togglePermission(perm.id)}
                          />
                          <label
                            htmlFor={`perm-${perm.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {perm.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/users")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </MainLayout>
    </AuthGuard>
  );
}
