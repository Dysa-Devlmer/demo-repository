"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/main-layout";
import AuthGuard from "@/components/auth/auth-guard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  User,
  Shield,
  Check,
  X,
  ChevronRight,
  Mail,
  Phone,
  Calendar,
  Clock,
  MoreVertical,
  Trash2,
  UserX,
  UserCheck,
  Hash,
  Copy,
  CheckCircle2
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { formatUserId } from "@/lib/id-formatter";

interface Permission {
  id: number;
  name: string;
  displayName: string;
  description: string;
  module: string;
  action: string;
  isActive: boolean;
}

interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: "active" | "inactive";
  roles: Role[];
  createdAt: string;
  updatedAt: string;
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  // Form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    status: "active" as "active" | "inactive",
  });

  useEffect(() => {
    if (userId) {
      loadUserData();
      loadAllRoles();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const response = await apiService.users.getById(parseInt(userId));
      const user = response.data;

      setUserData(user);
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        status: user.status || "active",
      });

      // Set selected roles
      if (user.roles && user.roles.length > 0) {
        setSelectedRoleIds(user.roles.map((role: Role) => role.id));
      }
    } catch (error) {
      console.error("Error loading user:", error);
      toast.error("Error al cargar los datos del usuario");
    } finally {
      setLoading(false);
    }
  };

  const loadAllRoles = async () => {
    try {
      const response = await apiService.roles.getAll();
      setAllRoles(response.data || []);
    } catch (error) {
      console.error("Error loading roles:", error);
      toast.error("Error al cargar los roles");
    }
  };

  const handleSaveUserData = async () => {
    try {
      setSaving(true);

      await apiService.users.update(parseInt(userId), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        status: formData.status,
      });

      toast.success("Datos del usuario actualizados correctamente");
      await loadUserData();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error al actualizar los datos del usuario");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRoles = async () => {
    try {
      setSaving(true);

      await apiService.users.updateRoles(parseInt(userId), selectedRoleIds);

      toast.success("Roles actualizados correctamente");
      await loadUserData();
    } catch (error) {
      console.error("Error updating roles:", error);
      toast.error("Error al actualizar los roles");
    } finally {
      setSaving(false);
    }
  };

  const toggleRole = (roleId: number) => {
    setSelectedRoleIds(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const getRoleBadgeColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
        return "bg-red-500 text-white";
      case "manager":
        return "bg-orange-500 text-white";
      case "staff":
        return "bg-blue-500 text-white";
      case "user":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const groupPermissionsByModule = (permissions: Permission[]) => {
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach(permission => {
      if (!grouped[permission.module]) {
        grouped[permission.module] = [];
      }
      grouped[permission.module].push(permission);
    });
    return grouped;
  };

  const getUserInitials = () => {
    if (!userData) return "U";
    const firstInitial = userData.firstName?.charAt(0).toUpperCase() || "";
    const lastInitial = userData.lastName?.charAt(0).toUpperCase() || "";
    return firstInitial + lastInitial || userData.email?.charAt(0).toUpperCase() || "U";
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-CL", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return "N/A";
    }
  };

  const handleToggleStatus = async () => {
    if (!userData) return;

    const newStatus = userData.status === "active" ? "inactive" : "active";
    const action = newStatus === "inactive" ? "desactivar" : "activar";

    if (!confirm(`¿Estás seguro de ${action} este usuario?`)) {
      return;
    }

    try {
      setSaving(true);

      // Solo enviar los campos permitidos por el backend
      await apiService.users.update(parseInt(userId), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        status: newStatus,
      });

      toast.success(`Usuario ${action === "desactivar" ? "desactivado" : "activado"} correctamente`);
      await loadUserData();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error(`Error al ${action} el usuario`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userData) return;

    if (!confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      setSaving(true);

      await apiService.users.delete(parseInt(userId));

      toast.success("Usuario eliminado correctamente");
      router.push("/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error al eliminar el usuario");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-lg">Cargando datos del usuario...</div>
            </div>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  if (!userData) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-lg text-red-600">Usuario no encontrado</div>
              <Button onClick={() => router.back()} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </div>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <div className="space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/users")}
              className="h-7 px-2 hover:text-foreground"
            >
              Usuarios
            </Button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Editar Usuario</span>
          </div>

          {/* Professional Header Card */}
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                {/* Left Section - User Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userData.firstName} ${userData.lastName}`} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Details */}
                  <div className="flex-1 space-y-3">
                    {/* Name and ID */}
                    <div>
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight">
                          {userData.firstName} {userData.lastName}
                        </h1>
                        {/* Professional ID Badge */}
                        <div className="group relative">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950 dark:to-purple-950 dark:border-blue-800 hover:shadow-md transition-all cursor-pointer px-3 py-1"
                            onClick={() => {
                              const professionalId = formatUserId(userData.id);
                              navigator.clipboard.writeText(professionalId);
                              toast.success("ID copiado al portapapeles", {
                                description: professionalId,
                                icon: <CheckCircle2 className="h-4 w-4" />
                              });
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <Hash className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              <span className="text-blue-700 dark:text-blue-300 font-semibold">
                                {formatUserId(userData.id)}
                              </span>
                              <Copy className="h-3 w-3 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </Badge>
                          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Click para copiar
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{userData.email}</span>
                      </div>
                    </div>

                    {/* Contact and Status Info */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Phone */}
                      {userData.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{userData.phone}</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <Badge
                        variant={userData.status === "active" ? "default" : "secondary"}
                        className={`${
                          userData.status === "active"
                            ? "bg-green-500 hover:bg-green-600"
                            : "bg-gray-500 hover:bg-gray-600"
                        } text-white`}
                      >
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${
                            userData.status === "active" ? "bg-white" : "bg-gray-300"
                          } animate-pulse`} />
                          {userData.status === "active" ? "Activo" : "Inactivo"}
                        </div>
                      </Badge>

                      {/* Roles */}
                      {userData.roles && userData.roles.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div className="flex gap-1">
                            {userData.roles.map((role) => (
                              <Badge
                                key={role.id}
                                variant="secondary"
                                className={`${getRoleBadgeColor(role.name)} text-xs`}
                              >
                                {role.displayName}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Creado: {formatDate(userData.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Actualizado: {formatDate(userData.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-start gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          navigator.clipboard.writeText(userData.email);
                          toast.success("Email copiado al portapapeles");
                        }}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Copiar email
                      </DropdownMenuItem>
                      {userData.phone && (
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(userData.phone || "");
                            toast.success("Teléfono copiado al portapapeles");
                          }}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Copiar teléfono
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className={userData.status === "active" ? "text-orange-600" : "text-green-600"}
                        onClick={handleToggleStatus}
                        disabled={saving}
                      >
                        {userData.status === "active" ? (
                          <UserX className="mr-2 h-4 w-4" />
                        ) : (
                          <UserCheck className="mr-2 h-4 w-4" />
                        )}
                        {userData.status === "active" ? "Desactivar usuario" : "Activar usuario"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={handleDeleteUser}
                        disabled={saving}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar usuario
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4" />
                Datos del Usuario
              </TabsTrigger>
              <TabsTrigger value="roles">
                <Shield className="mr-2 h-4 w-4" />
                Roles y Permisos
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                  <CardDescription>
                    Edita los datos personales del usuario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* First Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nombre</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Juan"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Apellido</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Pérez"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+56 9 1234 5678"
                      />
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "active" | "inactive") =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="border-t pt-4 space-y-2">
                    <h3 className="text-sm font-medium">Información del Sistema</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Fecha de creación:</span>{" "}
                        {new Date(userData.createdAt).toLocaleString("es-CL")}
                      </div>
                      <div>
                        <span className="font-medium">Última actualización:</span>{" "}
                        {new Date(userData.updatedAt).toLocaleString("es-CL")}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => router.back()}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveUserData} disabled={saving}>
                      <Save className="mr-2 h-4 w-4" />
                      {saving ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles">
              <div className="space-y-4">
                {/* Current Roles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Roles Actuales</CardTitle>
                    <CardDescription>
                      Roles asignados al usuario
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {userData.roles && userData.roles.length > 0 ? (
                        userData.roles.map((role) => (
                          <Badge
                            key={role.id}
                            variant="secondary"
                            className={getRoleBadgeColor(role.name)}
                          >
                            {role.displayName}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No tiene roles asignados
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Manage Roles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gestionar Roles</CardTitle>
                    <CardDescription>
                      Selecciona los roles que quieres asignar al usuario
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allRoles.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hay roles disponibles</p>
                    ) : (
                      allRoles.map((role) => {
                        const isSelected = selectedRoleIds.includes(role.id);
                        const groupedPermissions = groupPermissionsByModule(role.permissions || []);

                        return (
                          <div
                            key={role.id}
                            className="border rounded-lg p-4 space-y-3"
                          >
                            {/* Role Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  id={`role-${role.id}`}
                                  checked={isSelected}
                                  onCheckedChange={() => toggleRole(role.id)}
                                />
                                <div className="space-y-1">
                                  <label
                                    htmlFor={`role-${role.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span>{role.displayName}</span>
                                      <Badge
                                        variant="outline"
                                        className={getRoleBadgeColor(role.name)}
                                      >
                                        {role.name}
                                      </Badge>
                                      {role.isSystem && (
                                        <Badge variant="outline" className="text-xs">
                                          Sistema
                                        </Badge>
                                      )}
                                    </div>
                                  </label>
                                  <p className="text-sm text-muted-foreground">
                                    {role.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Permissions */}
                            {isSelected && role.permissions && role.permissions.length > 0 && (
                              <div className="ml-7 space-y-3 border-l-2 border-muted pl-4">
                                <h4 className="text-sm font-medium">
                                  Permisos ({role.permissions.length})
                                </h4>
                                {Object.entries(groupedPermissions).map(([module, perms]) => (
                                  <div key={module} className="space-y-2">
                                    <h5 className="text-xs font-semibold text-muted-foreground uppercase">
                                      {module}
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                      {perms.map((permission) => (
                                        <div
                                          key={permission.id}
                                          className="flex items-start gap-2 text-xs"
                                        >
                                          <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                          <div className="space-y-0.5">
                                            <div className="font-medium">
                                              {permission.displayName}
                                            </div>
                                            <div className="text-muted-foreground">
                                              {permission.description}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => router.back()}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveRoles} disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? "Guardando..." : "Guardar Roles"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}
