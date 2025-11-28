"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/main-layout";
import { apiService } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import useDemoMode from "@/hooks/useDemoMode";
import {
  Settings as SettingsIcon,
  Bot,
  MessageSquare,
  Phone,
  Database,
  Save,
  TestTube,
  Loader2
} from "lucide-react";

interface SystemSettings {
  restaurant: {
    name: string;
    phone: string;
    address: string;
    email: string;
  };
  whatsapp: {
    phoneNumber: string;
    token: string;
    webhookUrl: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  ollama: {
    url: string;
    model: string;
    status: 'connected' | 'disconnected' | 'error';
  };
  database: {
    host: string;
    port: number;
    database: string;
    status: 'connected' | 'disconnected' | 'error';
  };
}

export default function SettingsPage() {
  const { isDemoMode } = useDemoMode();
  const [settings, setSettings] = useState<SystemSettings>({
    restaurant: {
      name: "",
      phone: "",
      address: "",
      email: "",
    },
    whatsapp: {
      phoneNumber: "",
      token: "",
      webhookUrl: "",
      status: "disconnected",
    },
    twilio: {
      accountSid: "",
      authToken: "",
      phoneNumber: "",
      status: "disconnected",
    },
    ollama: {
      url: "",
      model: "",
      status: "disconnected",
    },
    database: {
      host: "",
      port: 5432,
      database: "",
      status: "disconnected",
    },
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const transformSettingsData = (settingsArray: any[]) => {
    const defaultSettings = {
      restaurant: {
        name: "",
        phone: "",
        address: "",
        email: "",
      },
      whatsapp: {
        phoneNumber: "",
        token: "",
        webhookUrl: "",
        status: "disconnected" as const,
      },
      twilio: {
        accountSid: "",
        authToken: "",
        phoneNumber: "",
        status: "disconnected" as const,
      },
      ollama: {
        url: "",
        model: "",
        status: "disconnected" as const,
      },
      database: {
        host: "",
        port: 5432,
        database: "",
        status: "disconnected" as const,
      },
    };

    // Map the flat array to structured object
    settingsArray.forEach((setting: any) => {
      const { key, value } = setting;
      
      // Restaurant settings
      if (key === 'restaurant_name') defaultSettings.restaurant.name = value || "";
      if (key === 'restaurant_phone') defaultSettings.restaurant.phone = value || "";
      if (key === 'restaurant_address') defaultSettings.restaurant.address = value || "";
      if (key === 'restaurant_email') defaultSettings.restaurant.email = value || "";
      
      // WhatsApp settings
      if (key === 'whatsapp_phone_number') defaultSettings.whatsapp.phoneNumber = value || "";
      if (key === 'whatsapp_token') defaultSettings.whatsapp.token = value || "";
      
      // Twilio settings
      if (key === 'twilio_account_sid') defaultSettings.twilio.accountSid = value || "";
      if (key === 'twilio_auth_token') defaultSettings.twilio.authToken = value || "";
      
      // Ollama settings
      if (key === 'ollama_url') defaultSettings.ollama.url = value || "";
      if (key === 'ollama_model') defaultSettings.ollama.model = value || "";
    });

    return defaultSettings;
  };

  const loadSettings = async () => {
    if (isDemoMode) {
      console.log('🚀 Demo mode - using mock settings');
      setSettings({
        restaurant: {
          name: "Restaurante Demo",
          phone: "+56 9 1234 5678",
          address: "Av. Providencia 1234, Santiago",
          email: "contacto@restaurantedemo.cl",
        },
        whatsapp: {
          phoneNumber: "+56 9 1234 5678",
          token: "demo_token_***",
          webhookUrl: "https://demo.chatbotdysa.cl/webhook",
          status: "disconnected",
        },
        twilio: {
          accountSid: "ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
          authToken: "demo_auth_***",
          phoneNumber: "+56 9 8765 4321",
          status: "disconnected",
        },
        ollama: {
          url: "http://localhost:11434",
          model: "llama2",
          status: "disconnected",
        },
        database: {
          host: "localhost",
          port: 5432,
          database: "chatbotdysa_demo",
          status: "disconnected",
        },
      });
      setInitialLoading(false);
      return;
    }

    try {
      setInitialLoading(true);
      const response = await apiService.settings.get();
      if (response.data && Array.isArray(response.data)) {
        const transformedSettings = transformSettingsData(response.data);
        setSettings(transformedSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones. Usando valores por defecto.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSave = async () => {
    if (isDemoMode) {
      console.log('🚀 Demo mode - simulating settings save');
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
      toast({
        title: "✅ Demo Mode",
        description: "Configuraciones guardadas (simulación). En modo producción se guardarían en el backend.",
      });
      return;
    }

    setLoading(true);
    try {
      await apiService.settings.update(settings);
      toast({
        title: "Éxito",
        description: "Configuraciones guardadas correctamente",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Error al guardar las configuraciones. Verifica que el backend esté corriendo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (service: string) => {
    if (isDemoMode) {
      console.log(`🚀 Demo mode - simulating ${service} connection test`);
      toast({
        title: "ℹ️ Demo Mode",
        description: `Prueba de ${service} simulada. En producción, esto verificaría la conexión real con el servicio externo.`,
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:8005/api/settings/test/${service}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSettings(prev => ({
          ...prev,
          [service]: {
            ...prev[service as keyof SystemSettings] as any,
            status: (data.status || 'connected') as 'connected' | 'disconnected' | 'error',
          },
        }));
        toast({
          title: "✅ Prueba exitosa",
          description: data.message || `Conexión con ${service} exitosa`,
        });
      } else {
        throw new Error(data.message || 'Connection test failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch';
      const userFriendlyMessage = errorMessage.includes('fetch')
        ? `No se puede conectar al backend (puerto 8005). Asegúrate de que el servidor esté corriendo.`
        : errorMessage;

      setSettings(prev => ({
        ...prev,
        [service]: {
          ...prev[service as keyof SystemSettings] as any,
          status: 'error' as const,
        },
      }));
      toast({
        title: "❌ Error en la prueba",
        description: userFriendlyMessage,
        variant: "destructive",
      });
    }
  };

  const sendTestMessage = async (type: 'text' | 'menu') => {
    if (!testPhoneNumber) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de teléfono para la prueba",
        variant: "destructive",
      });
      return;
    }

    try {
      const endpoint = type === 'text' ? 'test-message' : 'test-menu';
      const response = await fetch(`http://localhost:8005/api/settings/whatsapp/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to: testPhoneNumber }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Mensaje enviado",
          description: data.message,
        });
      } else {
        throw new Error(data.message || 'Error al enviar mensaje');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al enviar mensaje de prueba",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500">✓ Conectado</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">○ No configurado (esperado en desarrollo)</Badge>;
      case 'error':
        return <Badge variant="destructive">✗ Error de conexión</Badge>;
      default:
        return <Badge variant="outline">? Desconocido</Badge>;
    }
  };

  if (initialLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando configuraciones...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Configuración del Sistema</h1>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Información del Restaurante
            </CardTitle>
            <CardDescription>
              Configuración básica de tu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Restaurante</label>
                <Input
                  value={settings.restaurant?.name || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    restaurant: { ...prev.restaurant, name: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teléfono</label>
                <Input
                  value={settings.restaurant?.phone || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    restaurant: { ...prev.restaurant, phone: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dirección</label>
              <Input
                value={settings.restaurant?.address || ""}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  restaurant: { ...prev.restaurant, address: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={settings.restaurant?.email || ""}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  restaurant: { ...prev.restaurant, email: e.target.value }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp Business API
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(settings.whatsapp?.status || 'disconnected')}
                <Button variant="outline" size="sm" onClick={() => testConnection('whatsapp')}>
                  <TestTube className="h-4 w-4 mr-1" />
                  Probar
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Configuración para la integración con WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Número de Teléfono</label>
                <Input
                  value={settings.whatsapp?.phoneNumber || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    whatsapp: { ...prev.whatsapp, phoneNumber: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Token de Acceso</label>
                <Input
                  type="password"
                  value={settings.whatsapp?.token || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    whatsapp: { ...prev.whatsapp, token: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-medium mb-3">Pruebas de WhatsApp</h4>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Número de prueba (con código de país)</label>
                  <Input
                    placeholder="+52 55 1234 5678"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => sendTestMessage('text')}
                    disabled={!testPhoneNumber}
                  >
                    Enviar mensaje de prueba
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => sendTestMessage('menu')}
                    disabled={!testPhoneNumber}
                  >
                    Enviar menú de prueba
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Twilio Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Twilio Voice API
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(settings.twilio?.status || 'disconnected')}
                <Button variant="outline" size="sm" onClick={() => testConnection('twilio')}>
                  <TestTube className="h-4 w-4 mr-1" />
                  Probar
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Configuración para llamadas telefónicas
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Account SID</label>
                <Input
                  type="password"
                  value={settings.twilio?.accountSid || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    twilio: { ...prev.twilio, accountSid: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Auth Token</label>
                <Input
                  type="password"
                  value={settings.twilio?.authToken || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    twilio: { ...prev.twilio, authToken: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ollama AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Ollama AI
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(settings.ollama?.status || 'disconnected')}
                <Button variant="outline" size="sm" onClick={() => testConnection('ollama')}>
                  <TestTube className="h-4 w-4 mr-1" />
                  Probar
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Configuración del sistema de inteligencia artificial
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL de Ollama</label>
                <Input
                  value={settings.ollama?.url || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ollama: { ...prev.ollama, url: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Modelo</label>
                <Input
                  value={settings.ollama?.model || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    ollama: { ...prev.ollama, model: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Base de Datos
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(settings.database?.status || 'disconnected')}
                <Button variant="outline" size="sm" onClick={() => testConnection('database')}>
                  <TestTube className="h-4 w-4 mr-1" />
                  Probar
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Configuración de la base de datos PostgreSQL
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Host</label>
                <Input
                  value={settings.database?.host || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    database: { ...prev.database, host: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Puerto</label>
                <Input
                  type="number"
                  value={settings.database?.port || 5432}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    database: { ...prev.database, port: parseInt(e.target.value) }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Base de Datos</label>
                <Input
                  value={settings.database?.database || ""}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    database: { ...prev.database, database: e.target.value }
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}