import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class BucketClient {
  private client: S3Client;
  private bucketName: string;

  constructor(env: {
    DOLPHIN_BUCKET_ENDPOINT_DO_NOT_DELETE: string;
    DOLPHIN_BUCKET_ACCESS_KEY_ID_DO_NOT_DELETE: string;
    DOLPHIN_BUCKET_SECRET_ACCESS_KEY_DO_NOT_DELETE: string;
    DOLPHIN_BUCKET_NAME_DO_NOT_DELETE: string;
  }) {
    this.client = new S3Client({
      region: "auto",
      endpoint: env.DOLPHIN_BUCKET_ENDPOINT_DO_NOT_DELETE,
      credentials: {
        accessKeyId: env.DOLPHIN_BUCKET_ACCESS_KEY_ID_DO_NOT_DELETE,
        secretAccessKey: env.DOLPHIN_BUCKET_SECRET_ACCESS_KEY_DO_NOT_DELETE,
      },
    });
    this.bucketName = env.DOLPHIN_BUCKET_NAME_DO_NOT_DELETE;
  }

  async getUploadUrl(key: string, contentType: string, expiresIn = 300): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async getReadUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    return getSignedUrl(this.client, command, { expiresIn });
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.client.send(command);
  }
}
