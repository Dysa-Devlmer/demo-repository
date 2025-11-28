import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { existsSync } from 'fs';
import { join } from 'path';

interface UploadMetadata {
  restaurantId?: string;
  fileId?: string;
}

export interface UploadResult {
  fileId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  path: string;
  uploadedAt: string;
  metadata?: {
    width?: number;
    height?: number;
    format?: string;
  };
}

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Procesar subida de imagen
   */
  async processImageUpload(
    file: Express.Multer.File,
    metadata: UploadMetadata
  ): Promise<UploadResult> {
    this.logger.log(`Processing image upload: ${file.originalname}`);

    try {
      // Obtener metadatos de la imagen usando sharp
      let imageMetadata;
      try {
        const image = sharp(file.path);
        imageMetadata = await image.metadata();
      } catch (error) {
        this.logger.warn(`Could not extract image metadata: ${error.message}`);
        imageMetadata = {};
      }

      // Generar URL pública
      const baseUrl = this.configService.get<string>('API_URL') || 'http://localhost:8005';
      const publicUrl = `${baseUrl}/uploads/${file.filename}`;

      const result: UploadResult = {
        fileId: metadata.fileId || `img_${Date.now()}`,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: publicUrl,
        path: file.path,
        uploadedAt: new Date().toISOString(),
        metadata: {
          width: imageMetadata.width,
          height: imageMetadata.height,
          format: imageMetadata.format,
        },
      };

      this.logger.log(`Image uploaded successfully: ${file.filename}`);

      return result;
    } catch (error) {
      this.logger.error(`Error processing image upload: ${error.message}`);
      throw error;
    }
  }

  /**
   * Procesar subida de archivo (documento)
   */
  async processFileUpload(
    file: Express.Multer.File,
    metadata: UploadMetadata
  ): Promise<UploadResult> {
    this.logger.log(`Processing file upload: ${file.originalname}`);

    try {
      // Generar URL pública
      const baseUrl = this.configService.get<string>('API_URL') || 'http://localhost:8005';
      const publicUrl = `${baseUrl}/uploads/${file.filename}`;

      const result: UploadResult = {
        fileId: metadata.fileId || `file_${Date.now()}`,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: publicUrl,
        path: file.path,
        uploadedAt: new Date().toISOString(),
      };

      this.logger.log(`File uploaded successfully: ${file.filename}`);

      return result;
    } catch (error) {
      this.logger.error(`Error processing file upload: ${error.message}`);
      throw error;
    }
  }

  /**
   * Optimizar imagen (opcional, para reducir tamaño)
   */
  async optimizeImage(
    filePath: string,
    options: {
      maxWidth?: number;
      maxHeight?: number;
      quality?: number;
    } = {}
  ): Promise<void> {
    const { maxWidth = 1920, maxHeight = 1920, quality = 85 } = options;

    try {
      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const image = sharp(filePath);
      const metadata = await image.metadata();

      // Solo redimensionar si la imagen es más grande que el máximo
      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        await image
          .resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({ quality })
          .toFile(filePath + '.optimized');

        // Aquí podrías reemplazar el archivo original si lo deseas
        // En producción, considera usar el archivo optimizado
      }

      this.logger.log(`Image optimized: ${filePath}`);
    } catch (error) {
      this.logger.error(`Error optimizing image: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener información de un archivo subido
   */
  async getFileInfo(filename: string): Promise<UploadResult | null> {
    const uploadPath = join(process.cwd(), 'uploads', filename);

    if (!existsSync(uploadPath)) {
      return null;
    }

    // Aquí podrías obtener más información del archivo si es necesario
    // Por ahora, retornamos la info básica

    const baseUrl = this.configService.get<string>('API_URL') || 'http://localhost:8005';

    return {
      fileId: filename,
      filename,
      originalName: filename,
      mimetype: 'unknown',
      size: 0,
      url: `${baseUrl}/uploads/${filename}`,
      path: uploadPath,
      uploadedAt: new Date().toISOString(),
    };
  }
}
