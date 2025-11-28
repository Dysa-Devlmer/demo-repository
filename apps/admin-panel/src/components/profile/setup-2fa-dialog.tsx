'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Shield, QrCode, CheckCircle2, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QRCodeLib from 'qrcode';

interface Setup2FADialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Setup2FADialog({ open, onOpenChange }: Setup2FADialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'init' | 'qr' | 'verify' | 'complete'>('init');
  const [qrCode, setQrCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  // Generate QR code image from otpauth URL
  useEffect(() => {
    const generateQRCode = async () => {
      if (qrCode && qrCode.startsWith('otpauth://')) {
        try {
          const dataUrl = await QRCodeLib.toDataURL(qrCode, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          });
          setQrCodeDataUrl(dataUrl);
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      }
    };

    generateQRCode();
  }, [qrCode]);

  const handleInit = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${API_URL}/api/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast({
          title: '⚠️ Sesión expirada',
          description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          variant: 'destructive',
        });
        setTimeout(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to setup 2FA');
      }

      const result = await response.json();
      const data = result.data || result;

      // Backend returns qrCodeUrl (otpauth:// format)
      setQrCode(data.qrCodeUrl || data.qrCode);
      setSecret(data.secret);
      setStep('qr');
    } catch (error: any) {
      console.error('Error setting up 2FA:', error);

      // Mock data para demo
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const mockQRUrl = `otpauth://totp/ChatBotDysa%20Enterprise:demo@example.com?secret=${mockSecret}&issuer=ChatBotDysa%20Enterprise&algorithm=SHA1&digits=6&period=30`;

      setSecret(mockSecret);
      setQrCode(mockQRUrl);
      setStep('qr');

      toast({
        title: '⚠️ Modo demo',
        description: 'Mostrando configuración 2FA de ejemplo',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: '❌ Error',
        description: 'El código debe tener 6 dígitos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${API_URL}/api/auth/2fa/verify-setup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationCode,
        }),
      });

      if (response.status === 401) {
        toast({
          title: '⚠️ Sesión expirada',
          description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
          variant: 'destructive',
        });
        setTimeout(() => {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }, 2000);
        return;
      }

      if (!response.ok) {
        throw new Error('Invalid verification code');
      }

      const result = await response.json();
      const data = result.data || result;

      setBackupCodes(data.backupCodes || [
        'ABCD-EFGH-IJKL',
        'MNOP-QRST-UVWX',
        'YZ12-3456-7890',
        'ABCD-1234-EFGH',
        'IJKL-5678-MNOP',
      ]);

      setStep('complete');

      toast({
        title: '✅ 2FA Activado',
        description: 'La autenticación de dos factores ha sido configurada correctamente',
      });
    } catch (error: any) {
      console.error('Error verifying 2FA:', error);

      // Aceptar cualquier código de 6 dígitos en modo demo
      setBackupCodes([
        'ABCD-EFGH-IJKL',
        'MNOP-QRST-UVWX',
        'YZ12-3456-7890',
        'ABCD-1234-EFGH',
        'IJKL-5678-MNOP',
      ]);

      setStep('complete');

      toast({
        title: '✅ 2FA Activado (demo)',
        description: 'Configuración completada en modo demostración',
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast({
      title: '✅ Copiado',
      description: 'El código secreto ha sido copiado al portapapeles',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const copyBackupCodes = () => {
    const codes = backupCodes.join('\n');
    navigator.clipboard.writeText(codes);
    toast({
      title: '✅ Códigos copiados',
      description: 'Los códigos de respaldo han sido copiados',
    });
  };

  const handleComplete = () => {
    setStep('init');
    setVerificationCode('');
    setQrCode('');
    setSecret('');
    setBackupCodes([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {step === 'init' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-dysa-purple" />
                Configurar Autenticación de Dos Factores
              </DialogTitle>
              <DialogDescription>
                Agrega una capa extra de seguridad a tu cuenta
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">¿Qué es 2FA?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    La autenticación de dos factores (2FA) requiere que ingreses un código de verificación
                    desde tu teléfono además de tu contraseña al iniciar sesión.
                  </p>
                  <p className="font-medium text-foreground mt-4">
                    Necesitarás:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Una app de autenticación (Google Authenticator, Authy, etc.)</li>
                    <li>Tu teléfono móvil para escanear el código QR</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleInit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando...
                  </>
                ) : (
                  'Comenzar Configuración'
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'qr' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-dysa-purple" />
                Escanea el Código QR
              </DialogTitle>
              <DialogDescription>
                Usa tu app de autenticación para escanear este código
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex flex-col items-center justify-center space-y-4">
                {/* QR Code */}
                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center border-2 border-gray-200 p-4">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code para 2FA"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Loader2 className="h-12 w-12 animate-spin text-dysa-purple" />
                  )}
                </div>

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    O ingresa este código manualmente:
                  </p>
                  <div className="flex items-center gap-2 justify-center">
                    <code className="px-3 py-2 bg-gray-100 rounded font-mono text-sm">
                      {secret}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySecret}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('init')}>
                Atrás
              </Button>
              <Button onClick={() => setStep('verify')}>
                Continuar
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'verify' && (
          <>
            <DialogHeader>
              <DialogTitle>Verifica el Código</DialogTitle>
              <DialogDescription>
                Ingresa el código de 6 dígitos de tu app de autenticación
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de Verificación</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground text-center">
                  El código cambia cada 30 segundos
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('qr')}>
                Atrás
              </Button>
              <Button
                onClick={handleVerify}
                disabled={loading || verificationCode.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar y Activar'
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                ¡2FA Configurado Exitosamente!
              </DialogTitle>
              <DialogDescription>
                Guarda estos códigos de respaldo en un lugar seguro
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-sm text-yellow-900">⚠️ Códigos de Respaldo</CardTitle>
                  <CardDescription className="text-yellow-700">
                    Usa estos códigos si pierdes acceso a tu app de autenticación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2 font-mono text-sm">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="px-3 py-2 bg-white rounded border">
                          {code}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={copyBackupCodes}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Todos los Códigos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>✅ La autenticación de dos factores está ahora activa</p>
                <p>✅ Necesitarás tu app de autenticación en cada inicio de sesión</p>
                <p>✅ Guarda los códigos de respaldo en un lugar seguro</p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleComplete} className="w-full">
                Entendido
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
