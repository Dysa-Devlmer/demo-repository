'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Phone, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/useTranslation';
import MainLayout from '@/components/layout/main-layout';
import { apiService } from '@/lib/api';
import {
  validateChileanPhoneWithMessage,
  formatChileanPhone,
  normalizeChileanPhone,
} from '@/lib/phone-validation';

export default function NewConversationPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<string>('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    channel: 'whatsapp' as 'whatsapp' | 'phone' | 'web',
    initialMessage: '',
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, customerPhone: value });

    // Validar en tiempo real
    if (value.trim()) {
      const validation = validateChileanPhoneWithMessage(value);
      setPhoneError(validation.valid ? '' : validation.message || '');
    } else {
      setPhoneError('');
    }
  };

  const handlePhoneBlur = () => {
    // Formatear automáticamente cuando el usuario salga del campo
    if (formData.customerPhone.trim()) {
      const validation = validateChileanPhoneWithMessage(formData.customerPhone);
      if (validation.valid) {
        const formatted = formatChileanPhone(formData.customerPhone);
        setFormData({ ...formData, customerPhone: formatted });
        setPhoneError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar teléfono antes de enviar
    const phoneValidation = validateChileanPhoneWithMessage(formData.customerPhone);
    if (!phoneValidation.valid) {
      setPhoneError(phoneValidation.message || 'Número de teléfono inválido');
      return;
    }

    setLoading(true);

    try {
      // Normalizar el número al formato E.164 para el backend
      const normalizedPhone = normalizeChileanPhone(formData.customerPhone);

      // Create new conversation via API
      // Backend expects: customer_phone, customer_name, platform, status
      const backendPayload = {
        customer_phone: normalizedPhone,
        customer_name: formData.customerName,
        platform: formData.channel,
        status: 'active',
      };

      const response = await apiService.conversations.create(backendPayload);

      // Redirect to the new conversation
      router.push(`/conversations/${response.data.id}`);
    } catch (error) {
      console.error('Error creating conversation:', error);

      // Show error to user instead of silently redirecting to mock
      alert('Error al crear la conversación. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="h-5 w-5" />;
      case 'phone':
        return <Phone className="h-5 w-5" />;
      case 'web':
        return <Globe className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4 sm:p-6 max-w-2xl">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('conversations.newConversation')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('conversations.conversationDetails') || 'Detalles de la conversación'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName">
                  {t('conversations.customerName') || 'Nombre del cliente'}
                </Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="María González"
                  required
                />
              </div>

              {/* Customer Phone */}
              <div className="space-y-2">
                <Label htmlFor="customerPhone">
                  {t('conversations.customerPhone') || 'Teléfono del cliente (Chile)'}
                </Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  placeholder="+56 9 1234 5678"
                  required
                  className={phoneError ? 'border-red-500' : ''}
                />
                {phoneError && (
                  <p className="text-sm text-red-500">{phoneError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formato: +56 9 XXXX XXXX (celular) o +56 2 XXXX XXXX (fijo)
                </p>
              </div>

              {/* Channel Selection */}
              <div className="space-y-2">
                <Label htmlFor="channel">
                  {t('conversations.channel') || 'Canal de comunicación'}
                </Label>
                <Select
                  value={formData.channel}
                  onValueChange={(value: 'whatsapp' | 'phone' | 'web') =>
                    setFormData({ ...formData, channel: value })
                  }
                >
                  <SelectTrigger id="channel">
                    <div className="flex items-center gap-2">
                      {getChannelIcon(formData.channel)}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp
                      </div>
                    </SelectItem>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {t('conversations.phone') || 'Teléfono'}
                      </div>
                    </SelectItem>
                    <SelectItem value="web">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {t('conversations.web') || 'Web'}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Initial Message */}
              <div className="space-y-2">
                <Label htmlFor="initialMessage">
                  {t('conversations.initialMessage') || 'Mensaje inicial (opcional)'}
                </Label>
                <Input
                  id="initialMessage"
                  value={formData.initialMessage}
                  onChange={(e) => setFormData({ ...formData, initialMessage: e.target.value })}
                  placeholder="Hola, ¿cómo puedo ayudarte?"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  {t('common.cancel') || 'Cancelar'}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ?
                    (t('conversations.creating') || 'Creando...') :
                    (t('conversations.createConversation') || 'Crear conversación')
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
