import { Linking } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';

/**
 * Downloads a file by opening the download URL in the browser
 * @param fileId - The ID of the file to download
 */
export const downloadFile = async (fileId: string) => {
  try {
    const url = `${API_URL}/files/${fileId}/download`;
    
    // For mobile, we'll open the URL in the browser
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      console.warn('Cannot open URL:', url);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

/**
 * Formats file size in bytes to human readable format
 * @param bytes - Size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Gets file extension from filename
 * @param filename - The filename
 * @returns File extension (e.g., "pdf", "jpg")
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

/**
 * Determines if a file is an image based on its extension
 * @param filename - The filename
 * @returns True if the file is an image
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
};

/**
 * Determines if a file is a document based on its extension
 * @param filename - The filename
 * @returns True if the file is a document
 */
export const isDocumentFile = (filename: string): boolean => {
  const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
  const extension = getFileExtension(filename);
  return docExtensions.includes(extension);
}; 