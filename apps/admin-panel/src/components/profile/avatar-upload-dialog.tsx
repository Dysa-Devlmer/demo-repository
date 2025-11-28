'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentInitials: string;
  onSuccess?: () => void;
}

export function AvatarUploadDialog({
  open,
  onOpenChange,
  currentInitials,
  onSuccess,
}: AvatarUploadDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: '❌ Error',
        description: 'Por favor selecciona un archivo de imagen',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: '❌ Error',
        description: 'La imagen no debe superar los 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005';
      const token = localStorage.getItem('auth_token');

      if (!token) {
        throw new Error('No auth token found');
      }

      // Crear FormData para subir archivo
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await fetch(`${API_URL}/api/users/me/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
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
        throw new Error('Failed to upload avatar');
      }

      toast({
        title: '✅ Foto actualizada',
        description: 'Tu foto de perfil ha sido actualizada exitosamente',
      });

      // Limpiar y cerrar
      handleClear();
      onOpenChange(false);

      // Callback para recargar perfil
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);

      toast({
        title: '❌ Error al subir foto',
        description: 'No se pudo subir la foto de perfil. Verifica tu conexión.',
        variant: 'destructive',
      });

      // Cerrar de todas formas en modo demo
      handleClear();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCancel = () => {
    handleClear();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-dysa-purple" />
            Cambiar Foto de Perfil
          </DialogTitle>
          <DialogDescription>
            Sube una nueva foto para tu perfil (máx. 5MB)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview Area */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Preview" />
              ) : (
                <AvatarFallback className="text-3xl bg-dysa-purple text-white">
                  {currentInitials}
                </AvatarFallback>
              )}
            </Avatar>

            {/* File Input */}
            <div className="w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  disabled={loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {selectedFile ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                </Button>
              </label>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Upload Guidelines */}
            <div className="w-full text-xs text-muted-foreground space-y-1 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-900">Recomendaciones:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2 text-blue-700">
                <li>Formato: JPG, PNG o GIF</li>
                <li>Tamaño: Máximo 5MB</li>
                <li>Dimensiones: Mínimo 200x200px (cuadrada preferible)</li>
                <li>Usa una imagen clara de tu rostro</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              'Guardar Foto'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
