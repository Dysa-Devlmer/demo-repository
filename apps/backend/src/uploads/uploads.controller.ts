import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Body,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UploadsService } from './uploads.service';

// Configuración de almacenamiento
const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads');

    // Crear directorio si no existe
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp_random_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = extname(file.originalname);
    const nameWithoutExt = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${nameWithoutExt}_${uniqueSuffix}${ext}`);
  },
});

// Filtro para validar tipos de archivo
const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
    return cb(new BadRequestException('Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)'), false);
  }
  cb(null, true);
};

const documentFileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new BadRequestException(
        'Tipo de archivo no permitido. Solo se aceptan: imágenes, PDF, Word, Excel'
      ),
      false
    );
  }
  cb(null, true);
};

@ApiTags('uploads')
@Controller('api/upload')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /**
   * Endpoint para subir imágenes
   * POST /api/upload/image
   */
  @Post('image')
  @ApiOperation({
    summary: 'Subir imagen',
    description: 'Endpoint para subir imágenes desde el widget de chat. Soporta JPG, PNG, GIF, WEBP. Tamaño máximo: 10 MB'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Imagen a subir',
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (JPG, PNG, GIF, WEBP)',
        },
        restaurantId: {
          type: 'string',
          description: 'ID del restaurante (opcional)',
        },
        fileId: {
          type: 'string',
          description: 'ID del archivo para tracking (opcional)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Imagen subida exitosamente',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Imagen subida exitosamente' },
        data: {
          type: 'object',
          properties: {
            fileId: { type: 'string' },
            filename: { type: 'string' },
            originalName: { type: 'string' },
            mimetype: { type: 'string' },
            size: { type: 'number' },
            url: { type: 'string' },
            uploadedAt: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Archivo inválido o no proporcionado' })
  @ApiResponse({ status: 500, description: 'Error al procesar la imagen' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
      fileFilter: imageFileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
      },
    })
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { restaurantId?: string; fileId?: string }
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo de imagen');
    }

    try {
      const result = await this.uploadsService.processImageUpload(file, {
        restaurantId: body.restaurantId,
        fileId: body.fileId,
      });

      return {
        success: true,
        message: 'Imagen subida exitosamente',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al procesar la imagen',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para subir archivos (documentos)
   * POST /api/upload/file
   */
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter: documentFileFilter,
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB
      },
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { restaurantId?: string; fileId?: string }
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    try {
      const result = await this.uploadsService.processFileUpload(file, {
        restaurantId: body.restaurantId,
        fileId: body.fileId,
      });

      return {
        success: true,
        message: 'Archivo subido exitosamente',
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al procesar el archivo',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Endpoint para subir múltiples archivos
   * POST /api/upload/files
   */
  @Post('files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage,
      fileFilter: documentFileFilter,
      limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB por archivo
      },
    })
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { restaurantId?: string }
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    try {
      const results = await Promise.all(
        files.map((file, index) =>
          this.uploadsService.processFileUpload(file, {
            restaurantId: body.restaurantId,
            fileId: `multi_${index}_${Date.now()}`,
          })
        )
      );

      return {
        success: true,
        message: `${files.length} archivo(s) subido(s) exitosamente`,
        data: results,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Error al procesar los archivos',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
