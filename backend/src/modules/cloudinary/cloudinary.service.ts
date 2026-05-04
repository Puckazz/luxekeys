import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  uploadBuffer(
    buffer: Buffer,
    folder: string,
    filename: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename,
          overwrite: true,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              error instanceof Error
                ? error
                : new Error(error?.message || 'Upload failed'),
            );
          }
          resolve(result);
        },
      );

      Readable.from(buffer).pipe(upload);
    });
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
