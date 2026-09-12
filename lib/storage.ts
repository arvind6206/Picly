// Storage functions for cloud storage (Supabase Storage)
// This module is optional - the app works without it using dummy storage

export function isStorageConfigured(): boolean {
  return (
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_STORAGE_BUCKET
  ) ? true : false;
}

export async function uploadFileToSupabase(
  file: File,
  key: string
): Promise<{ url: string; key: string }> {
  if (!isStorageConfigured()) {
    throw new Error('Supabase Storage is not configured. Please set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_STORAGE_BUCKET environment variables.');
  }

  // Dynamic import to avoid requiring Supabase client when not configured
  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const bucketName = process.env.SUPABASE_STORAGE_BUCKET!;
  const buffer = await file.arrayBuffer();

  const { data, error } = await supabase
    .storage
    .from(bucketName)
    .upload(key, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload error: ${error.message}`);
  }

  // Get public URL for the uploaded file
  const { data: { publicUrl } } = supabase
    .storage
    .from(bucketName)
    .getPublicUrl(key);

  return { url: publicUrl, key };
}

export async function deleteFileFromSupabase(key: string): Promise<void> {
  if (!isStorageConfigured()) {
    throw new Error('Supabase Storage is not configured');
  }

  const { createClient } = await import('@supabase/supabase-js');

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const bucketName = process.env.SUPABASE_STORAGE_BUCKET!;

  const { error } = await supabase
    .storage
    .from(bucketName)
    .remove([key]);

  if (error) {
    throw new Error(`Supabase delete error: ${error.message}`);
  }
}

export function generateStorageKey(eventId: string, filename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop();
  const baseName = filename.replace(`.${extension}`, '').substring(0, 20);
  return `events/${eventId}/${timestamp}-${randomString}-${baseName}.${extension}`;
}