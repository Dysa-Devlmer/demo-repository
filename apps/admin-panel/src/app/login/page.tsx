"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Try direct login first (simplified for demo)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: credentials.username,
          password: credentials.password,
        }),
      }).catch(error => {
        throw new Error('❌ No se puede conectar al backend (puerto 8005).\n\n💡 Solución: Usa el botón "🚀 Probar Demo Gratuito" para explorar el sistema sin backend.');
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const loginData = await response.json();

      console.log('✅ Login successful:', loginData.success);
      console.log('🔑 Access token received:', loginData.data?.accessToken ? 'YES' : 'NO');

      // Store auth token and user data
      const accessToken = loginData.data?.accessToken || loginData.accessToken;
      const userData = loginData.data?.user || loginData.user;

      if (accessToken) {
        // Limpiar COMPLETAMENTE cualquier rastro de modo demo
        localStorage.removeItem('demo_mode');
        localStorage.removeItem('demo_token');

        // Guardar credenciales reales
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('user_data', JSON.stringify(userData));

        console.log('✅ Modo demo limpiado');
        console.log('💾 Token real guardado en localStorage');
        console.log('🚀 Redirigiendo a dashboard en modo PRODUCCIÓN...');

        // Force page reload to ensure AuthGuard picks up the token
        window.location.href = '/';
      } else {
        throw new Error('No access token received from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    console.log('🎯 Activando modo DEMO...');

    // Limpiar cualquier sesión de producción
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');

    // Activar modo demo
    localStorage.setItem('demo_token', 'demo-token-for-testing');
    localStorage.setItem('demo_mode', 'true');

    console.log('✅ Modo DEMO activado');
    console.log('🚀 Redirigiendo a dashboard en modo DEMO...');

    // Forzar navegación inmediata para experiencia fluida
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-2 sm:space-y-1">
          <CardTitle className="text-xl sm:text-2xl text-center">
            🤖 ChatBotDysa Admin
          </CardTitle>
          <p className="text-sm sm:text-base text-center text-muted-foreground">
            Panel de administración del restaurante
          </p>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                type="email"
                autoComplete="username"
                placeholder="admin@restaurante.com"
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Ingrese su contraseña"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <div className="text-center space-y-3">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 sm:p-4 rounded-lg border">
              <p className="text-xs sm:text-sm font-medium text-purple-700 mb-2">
                🎯 ¿Eres un cliente potencial?
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Prueba ChatBotDysa sin compromiso. Explora todas las funcionalidades de nuestro sistema Enterprise.
              </p>
              <Button
                variant="outline"
                onClick={handleDemoLogin}
                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                🚀 Probar Demo Gratuito
              </Button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground text-center space-y-1 px-2">
            <p className="font-semibold">ChatBotDysa Enterprise++++ Edition</p>
            <p className="text-xs">Certificación Fortune 10 Global Military: ✅ 100/100</p>
            <p className="text-purple-600">Disponible para arrendamiento empresarial</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}