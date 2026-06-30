import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadFile } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = (formData.get('type') as string) || 'image'

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const folder = type === 'image' ? 'devshop/images' : 'devshop/files'
  const resourceType = type === 'image' ? 'image' : 'raw'

  try {
    const result = await uploadFile(buffer, folder, resourceType)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Cloudinary upload failed:', err)
    return NextResponse.json({ error: 'Upload failed, please try again' }, { status: 500 })
  }
}
