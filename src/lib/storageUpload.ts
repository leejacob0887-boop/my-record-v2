import { supabase } from './supabase';

const BUCKET = 'post-images';
const BASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

export async function uploadImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) {
    console.error('[uploadImage] Supabase Storage error:', error);
    throw error;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// Storage URL이면 파일 삭제, base64면 무시
export async function deleteImage(imageUrl: string | undefined): Promise<void> {
  if (!imageUrl || !imageUrl.startsWith(BASE_URL)) return;
  const path = imageUrl.slice(BASE_URL.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
