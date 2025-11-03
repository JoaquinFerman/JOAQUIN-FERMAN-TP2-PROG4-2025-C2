import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY;
    if (!url || !key) {
      throw new InternalServerErrorException('Supabase credentials (SUPABASE_URL, SUPABASE_KEY) are not set');
    }
    // Server-side usage: create a Supabase client with the service key.
    // Do not enable client-side auth/session persistence here.
    this.supabase = createClient(url, key);
  }

  async uploadFile(bucket: string, path: string, buffer: Buffer, contentType?: string) {
    try {
      const { data, error } = await this.supabase.storage.from(bucket).upload(path, buffer, {
        contentType,
        upsert: false,
      });
      if (error) {
        // Log the error for server-side debugging (do not log secrets)
        console.error('[SupabaseService] upload error:', error.message || error);
        throw error;
      }
      const { data: urlData } = await this.supabase.storage.from(bucket).getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (err) {
      console.error('[SupabaseService] unexpected error uploading file:', err?.message || err);
      throw new InternalServerErrorException('Error uploading file to Supabase: ' + (err?.message || err));
    }
  }
}
