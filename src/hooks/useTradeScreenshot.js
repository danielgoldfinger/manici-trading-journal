import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useTradeScreenshot() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  async function uploadScreenshot(file, tradeId) {
    setUploading(true);
    setUploadError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${tradeId}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('trade-screenshots')
        .upload(path, file, { upsert: true });
      if (upErr) throw upErr;

      const { data } = supabase.storage
        .from('trade-screenshots')
        .getPublicUrl(path);
      // Bucket is private — use createSignedUrl instead
      const { data: signed, error: signErr } = await supabase.storage
        .from('trade-screenshots')
        .createSignedUrl(path, 60 * 60 * 24 * 365); // 1-year URL
      if (signErr) throw signErr;

      return signed.signedUrl;
    } catch (err) {
      setUploadError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function getScreenshotUrl(screenshotUrl) {
    // screenshotUrl stored in DB is the storage path, e.g. "{user_id}/{tradeId}.png"
    if (!screenshotUrl) return null;
    // If it's already a full signed URL (legacy), return as-is
    if (screenshotUrl.startsWith('http')) return screenshotUrl;
    const { data, error } = await supabase.storage
      .from('trade-screenshots')
      .createSignedUrl(screenshotUrl, 60 * 60); // 1-hour URL for viewing
    if (error) return null;
    return data.signedUrl;
  }

  async function deleteScreenshot(path) {
    if (!path) return;
    const storagePath = path.startsWith('http')
      ? new URL(path).pathname.split('/trade-screenshots/')[1]?.split('?')[0]
      : path;
    if (!storagePath) return;
    await supabase.storage.from('trade-screenshots').remove([storagePath]);
  }

  return { uploadScreenshot, getScreenshotUrl, deleteScreenshot, uploading, uploadError };
}
