import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload an image File to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export async function uploadImage(
  file: File,
  folder: string = "karyakata/articles",
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, height: 630, crop: "fill", gravity: "auto" },
          { quality: "auto:good", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export type ProofUploadResult = {
  url: string;
  publicId: string;
  thumbnailUrl: string;
  format: string;
  width: number;
  height: number;
  fileSize: number;
};

/**
 * Upload an avatar image to Cloudinary.
 * Returns all metadata fields needed for user profile.
 */
export async function uploadAvatarImage(
  file: File,
  folder: string = "karyakata/avatars",
): Promise<ProofUploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        eager: [{ width: 200, height: 200, crop: "fill", gravity: "auto" }],
        eager_async: false,
      },
      (error, result) => {
        if (error || !result) return reject(error);
        const thumbnail = result.eager?.[0];
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          thumbnailUrl: thumbnail?.secure_url ?? result.secure_url,
          format: result.format,
          width: result.width,
          height: result.height,
          fileSize: result.bytes,
        });
      },
    );
    stream.end(buffer);
  });
}

/**
 * Delete an image from Cloudinary by its public ID.
 * The public ID is the part of the URL after the folder name, before the extension.
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}
