import { S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../error/ApiError.js';

export class AwsService {
  constructor() {
    if (!this.client) {
      try {
        this.client = new S3Client({
          region: process.env.AWS_REGION,
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  }

  async getUploadUrl(contentType) {
    const EXPIRATION_TIME_IN_SECONDS = 3600;
    const { url, fields } = await createPresignedPost(this.client, {
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Key: uuidv4(),
      Conditions: [
        ['content-length-range', 0, 10485760], // up to 10 MB
        ['starts-with', '$Content-Type', contentType],
      ],
      Fields: {
        acl: 'public-read',
        'Content-Type': contentType,
      },
      Expires: EXPIRATION_TIME_IN_SECONDS, // Seconds before the presigned post expires. 3600 by default.
    });
    return { url, fields };
  }
  async uploadImage(image, contentType) {
    const { url, fields } = await this.getUploadUrl(contentType);
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const file = new File([image], new Date().toString());
    formData.append('file', file);

    const uploadResponse = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (uploadResponse.ok) {
      return {
        imageUrl: url + fields.key,
      };
    } else throw ApiError.internal('Error uploading image to s3');
  }
  async deleteImages(keys) {
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_BUCKET_NAME || '',
      Delete: {
        Objects: keys.map((id) => ({ Key: id })),
      },
    });

    const { Deleted } = await this.client.send(command);
    return { data: Deleted };
  }
}
