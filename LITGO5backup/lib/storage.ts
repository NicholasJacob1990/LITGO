import supabase from './supabase';
import * as FileSystem from 'expo-file-system';
import { randomUUID } from 'expo-crypto';

// Pequeno utilitário para decodificar base64 em Uint8Array sem depender de módulos nativos
const decodeBase64 = (data: string): Uint8Array => {
  const cleaned = data.replace(/^data:.*;base64,/, '');
  const binary = globalThis.atob ? globalThis.atob(cleaned) : Buffer.from(cleaned, 'base64').toString('binary');
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

class StorageService {
  async uploadBase64Image(base64: string, bucket: string, userId: string): Promise<string> {
    try {
      const fileExt = this.getFileExtension(base64);
      if (!fileExt) {
        throw new Error('Não foi possível determinar o tipo do arquivo.');
      }

      const fileName = `${userId}/${randomUUID()}.${fileExt}`;
      const contentType = `image/${fileExt}`;
      
      const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, decodeBase64(base64), { contentType });

      if (error) {
        throw error;
      }
      
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return data.publicUrl;

    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      if (error instanceof Error) {
        throw new Error(`Falha no upload da imagem: ${error.message}`);
      }
      throw new Error('Falha no upload da imagem devido a um erro desconhecido.');
    }
  }

  private getFileExtension(base64: string): string | null {
    if (base64.startsWith('data:image/jpeg')) return 'jpg';
    if (base64.startsWith('data:image/png')) return 'png';
    // Adicione outros tipos se necessário
    return 'jpg'; // fallback
  }
}

const storageService = new StorageService();
export default storageService; 