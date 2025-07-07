import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { API_URL, getAuthHeaders } from './api';

/**
 * Baixa o relatório de um caso em PDF e o disponibiliza para o usuário.
 * @param caseId O ID do caso para gerar o relatório.
 */
export const downloadCaseReport = async (caseId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await fetch(`${API_URL}/reports/case/${caseId}`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao baixar o relatório.');
    }

    const blob = await response.blob();
    const fileName = `relatorio_caso_${caseId}.pdf`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    // A conversão de Blob para base64 é necessária no React Native
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log(`Relatório salvo em: ${fileUri}`);

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Compartilhar relatório do caso',
            });
          } else {
            alert('Não é possível compartilhar arquivos neste dispositivo.');
          }
          resolve();
        } catch (error) {
          console.error('Erro ao salvar ou compartilhar o arquivo:', error);
          reject(new Error('Não foi possível processar o relatório.'));
        }
      };
      reader.onerror = (error) => {
        console.error('Erro ao ler o blob:', error);
        reject(new Error('Falha ao ler os dados do relatório.'));
      };
    });

  } catch (error) {
    console.error('Erro ao baixar o relatório de caso:', error);
    // Em um app real, usaríamos um sistema de toast/alert mais robusto
    alert(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.');
    throw error;
  }
};

/**
 * Baixa o relatório de performance de um advogado em PDF.
 * @param lawyerId O ID do advogado para gerar o relatório.
 */
export const downloadLawyerPerformanceReport = async (lawyerId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/reports/lawyer/${lawyerId}/performance`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao baixar o relatório de performance.');
    }

    const blob = await response.blob();
    const fileName = `relatorio_performance_${lawyerId}.pdf`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Compartilhar relatório de performance',
            });
          } else {
            alert('Não é possível compartilhar arquivos neste dispositivo.');
          }
          resolve();
        } catch (error) {
          reject(new Error('Não foi possível processar o relatório.'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Falha ao ler os dados do relatório.'));
      };
    });

  } catch (error) {
    alert(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.');
    throw error;
  }
};

/**
 * Baixa o relatório de casos de um cliente em PDF.
 * @param clientId O ID do cliente para gerar o relatório.
 */
export const downloadClientCasesReport = async (clientId: string): Promise<void> => {
  try {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/reports/client/${clientId}/cases`, {
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Falha ao baixar o relatório de casos.');
    }

    const blob = await response.blob();
    const fileName = `relatorio_casos_${clientId}.pdf`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          await FileSystem.writeAsStringAsync(fileUri, base64data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Compartilhar relatório de casos',
            });
          } else {
            alert('Não é possível compartilhar arquivos neste dispositivo.');
          }
          resolve();
        } catch (error) {
          reject(new Error('Não foi possível processar o relatório.'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Falha ao ler os dados do relatório.'));
      };
    });

  } catch (error) {
    alert(error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.');
    throw error;
  }
}; 