import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DocumentItem from '../molecules/DocumentItem';
import { downloadFile } from '../../lib/downloadUtils';

interface FileDTO {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

interface DocumentsListProps {
  files: FileDTO[];
  onDownload?: (fileId: string) => void;
}

// Default download handler
const defaultDownloadHandler = async (fileId: string) => {
  await downloadFile(fileId);
};

export default function DocumentsList({ files, onDownload }: DocumentsListProps) {
  const handleDownload = (fileId: string) => {
    if (onDownload) {
      onDownload(fileId);
    } else {
      defaultDownloadHandler(fileId);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Documentos</Text>
      <View style={styles.filesList}>
        {files.map((file, index) => (
          <View key={file.id}>
            <DocumentItem
              name={file.name}
              size={file.size}
              uploadedAt={file.uploadedAt}
              onDownload={() => handleDownload(file.id)}
            />
            {index < files.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 12,
  },
  filesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 36, // Account for icon width + gap
  },
}); 