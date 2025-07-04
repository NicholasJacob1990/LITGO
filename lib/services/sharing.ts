import { Share, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { CaseData } from './cases';

export interface ShareOptions {
  title?: string;
  message?: string;
  url?: string;
  files?: string[];
}

/**
 * Compartilha informações de um caso
 * @param caseData - Dados do caso
 * @param includeDocuments - Se deve incluir documentos
 */
export const shareCaseInfo = async (
  caseData: CaseData,
  includeDocuments: boolean = false
): Promise<void> => {
  try {
    const message = generateCaseShareMessage(caseData);
    
    const shareOptions: ShareOptions = {
      title: `Caso: ${caseData.title || 'Informações do Caso'}`,
      message
    };

    const result = await Share.share(shareOptions);
    
    if (result.action === Share.sharedAction) {
      console.log('Case info shared successfully');
    }
  } catch (error) {
    console.error('Error sharing case info:', error);
    Alert.alert('Erro', 'Não foi possível compartilhar as informações do caso');
  }
};

/**
 * Compartilha um documento específico
 * @param documentUrl - URL do documento
 * @param documentName - Nome do documento
 */
export const shareDocument = async (
  documentUrl: string,
  documentName: string
): Promise<void> => {
  try {
    // Verificar se o arquivo existe localmente
    const fileInfo = await FileSystem.getInfoAsync(documentUrl);
    
    if (fileInfo.exists) {
      const shareOptions: ShareOptions = {
        title: `Documento: ${documentName}`,
        url: documentUrl
      };
      
      const result = await Share.share(shareOptions);
      
      if (result.action === Share.sharedAction) {
        console.log('Document shared successfully');
      }
    } else {
      // Se não existe localmente, compartilhar apenas o link
      const shareOptions: ShareOptions = {
        title: `Documento: ${documentName}`,
        message: `Confira o documento: ${documentName}\n\nLink: ${documentUrl}`
      };
      
      await Share.share(shareOptions);
    }
  } catch (error) {
    console.error('Error sharing document:', error);
    Alert.alert('Erro', 'Não foi possível compartilhar o documento');
  }
};

/**
 * Compartilha o resumo da análise de IA
 * @param caseData - Dados do caso
 * @param aiAnalysis - Análise de IA
 */
export const shareAIAnalysis = async (
  caseData: CaseData,
  aiAnalysis: any
): Promise<void> => {
  try {
    const message = generateAIAnalysisShareMessage(caseData, aiAnalysis);
    
    const shareOptions: ShareOptions = {
      title: `Análise IA: ${caseData.title || 'Resumo do Caso'}`,
      message
    };

    const result = await Share.share(shareOptions);
    
    if (result.action === Share.sharedAction) {
      console.log('AI analysis shared successfully');
    }
  } catch (error) {
    console.error('Error sharing AI analysis:', error);
    Alert.alert('Erro', 'Não foi possível compartilhar a análise');
  }
};

/**
 * Compartilha informações de contato do advogado
 * @param lawyerInfo - Informações do advogado
 */
export const shareLawyerContact = async (lawyerInfo: {
  name: string;
  phone?: string;
  email?: string;
  specialty?: string;
}): Promise<void> => {
  try {
    const message = generateLawyerContactMessage(lawyerInfo);
    
    const shareOptions: ShareOptions = {
      title: `Contato: ${lawyerInfo.name}`,
      message
    };

    const result = await Share.share(shareOptions);
    
    if (result.action === Share.sharedAction) {
      console.log('Lawyer contact shared successfully');
    }
  } catch (error) {
    console.error('Error sharing lawyer contact:', error);
    Alert.alert('Erro', 'Não foi possível compartilhar o contato');
  }
};

/**
 * Gera mensagem de compartilhamento para informações do caso
 */
const generateCaseShareMessage = (caseData: CaseData): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pendente',
    'active': 'Ativo',
    'completed': 'Concluído',
    'summary_generated': 'Pré-análise'
  };

  const priorityMap: Record<string, string> = {
    'high': 'Alta',
    'medium': 'Média',
    'low': 'Baixa'
  };

  return `📋 *Informações do Caso*

*Título:* ${caseData.title || 'Não informado'}
*Descrição:* ${caseData.description || 'Não informado'}
*Status:* ${statusMap[caseData.status as string] || caseData.status}
*Prioridade:* ${priorityMap[caseData.priority as string] || caseData.priority}
*Data de Criação:* ${new Date(caseData.created_at).toLocaleDateString('pt-BR')}

${caseData.lawyer ? `*Advogado Responsável:* ${caseData.lawyer.name}
*Especialidade:* ${caseData.lawyer.specialty || 'Não informado'}` : ''}

---
Compartilhado via LITGO5 📱`;
};

/**
 * Gera mensagem de compartilhamento para análise de IA
 */
const generateAIAnalysisShareMessage = (caseData: CaseData, aiAnalysis: any): string => {
  return `🤖 *Análise Inteligente do Caso*

*Caso:* ${caseData.title || 'Não informado'}
*Confiança da Análise:* ${aiAnalysis.confidence || 'N/A'}%
*Área Jurídica:* ${aiAnalysis.legal_area || 'Não classificado'}
*Nível de Risco:* ${aiAnalysis.risk_level || 'Não avaliado'}
${aiAnalysis.estimated_cost ? `*Custo Estimado:* R$ ${aiAnalysis.estimated_cost.toLocaleString('pt-BR')}` : ''}

*Pontos Principais:*
${aiAnalysis.key_points ? aiAnalysis.key_points.map((point: string, index: number) => `${index + 1}. ${point}`).join('\n') : 'Não disponível'}

*Recomendações:*
${aiAnalysis.recommendations ? aiAnalysis.recommendations.map((rec: string, index: number) => `• ${rec}`).join('\n') : 'Não disponível'}

⚠️ *Aviso:* Esta análise é gerada por IA e tem caráter orientativo.

---
Compartilhado via LITGO5 📱`;
};

/**
 * Gera mensagem de compartilhamento para contato do advogado
 */
const generateLawyerContactMessage = (lawyerInfo: {
  name: string;
  phone?: string;
  email?: string;
  specialty?: string;
}): string => {
  return `👨‍💼 *Contato do Advogado*

*Nome:* ${lawyerInfo.name}
${lawyerInfo.specialty ? `*Especialidade:* ${lawyerInfo.specialty}` : ''}
${lawyerInfo.phone ? `*Telefone:* ${lawyerInfo.phone}` : ''}
${lawyerInfo.email ? `*E-mail:* ${lawyerInfo.email}` : ''}

---
Compartilhado via LITGO5 📱`;
};

/**
 * Copia texto para a área de transferência
 * @param text - Texto para copiar
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    // Em React Native, podemos usar o Clipboard API
    // import { Clipboard } from 'react-native';
    // await Clipboard.setString(text);
    
    // Por enquanto, vamos usar o Share para simular a cópia
    await Share.share({
      message: text
    });
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    Alert.alert('Erro', 'Não foi possível copiar o texto');
  }
};

/**
 * Gera um relatório completo do caso para compartilhamento
 * @param caseData - Dados do caso
 * @param aiAnalysis - Análise de IA (opcional)
 * @param documents - Lista de documentos (opcional)
 */
export const generateCaseReport = async (
  caseData: CaseData,
  aiAnalysis?: any,
  documents?: any[]
): Promise<string> => {
  const report = `📊 *RELATÓRIO COMPLETO DO CASO*

${generateCaseShareMessage(caseData)}

${aiAnalysis ? `\n🤖 *ANÁLISE INTELIGENTE*\n\n${generateAIAnalysisShareMessage(caseData, aiAnalysis).split('---')[0]}` : ''}

${documents && documents.length > 0 ? `\n📁 *DOCUMENTOS ANEXADOS*\n\n${documents.map((doc, index) => `${index + 1}. ${doc.name} (${doc.file_type})`).join('\n')}` : ''}

\n---
*Relatório gerado em:* ${new Date().toLocaleString('pt-BR')}
Compartilhado via LITGO5 📱`;

  return report;
};

/**
 * Compartilha relatório completo do caso
 * @param caseData - Dados do caso
 * @param aiAnalysis - Análise de IA (opcional)
 * @param documents - Lista de documentos (opcional)
 */
export const shareCaseReport = async (
  caseData: CaseData,
  aiAnalysis?: any,
  documents?: any[]
): Promise<void> => {
  try {
    const report = await generateCaseReport(caseData, aiAnalysis, documents);
    
    const shareOptions: ShareOptions = {
      title: `Relatório Completo: ${caseData.title || 'Caso'}`,
      message: report
    };

    const result = await Share.share(shareOptions);
    
    if (result.action === Share.sharedAction) {
      console.log('Case report shared successfully');
    }
  } catch (error) {
    console.error('Error sharing case report:', error);
    Alert.alert('Erro', 'Não foi possível compartilhar o relatório');
  }
};