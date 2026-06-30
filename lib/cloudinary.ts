import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadFile(
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'raw' | 'auto' = 'auto'
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) return reject(error)
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )
    stream.end(buffer)
  })
}

export async function deleteFile(publicId: string, resourceType: 'image' | 'raw' = 'raw') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

export function getSignedUrl(publicId: string, expiresIn = 3600): string {
  return cloudinary.utils.private_download_url(publicId, '', {
    resource_type: 'raw',
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    attachment: true,
  })
}
