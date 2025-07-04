import supabase from '@/lib/supabase';
import { api } from './api';

export interface Contract {
  id: string;
  case_id: string;
  lawyer_id: string;
  client_id: string;
  status: 'pending-signature' | 'active' | 'closed' | 'canceled';
  fee_model: {
    type: 'success' | 'fixed' | 'hourly';
    percent?: number;
    value?: number;
    rate?: number;
  };
  created_at: string;
  updated_at: string;
  signed_client?: string;
  signed_lawyer?: string;
  doc_url?: string;
  // Dados relacionados
  case_title?: string;
  case_area?: string;
  lawyer_name?: string;
  client_name?: string;
}

export interface CreateContractRequest {
  case_id: string;
  lawyer_id: string;
  fee_model: Contract['fee_model'];
}

export interface SignContractRequest {
  role: 'client' | 'lawyer';
  signature_data?: any;
}

export interface DocuSignStatus {
  envelope_id: string;
  status: string;
  created_date: string;
  completed_date?: string;
  recipients: Array<{
    name: string;
    email: string;
    status: string;
    signed_date?: string;
  }>;
}

export const contractsService = {
  /**
   * Cria um novo contrato
   */
  async createContract(data: CreateContractRequest): Promise<Contract> {
    const { data: contract } = await api.post('/contracts', data);
    return contract;
  },

  /**
   * Busca contrato por ID
   */
  async getContract(contractId: string): Promise<Contract> {
    const { data } = await api.get(`/contracts/${contractId}`);
    return data;
  },

  /**
   * Lista contratos do usuário
   */
  async getContracts(status?: string): Promise<Contract[]> {
    const params = status ? { status } : {};
    const { data } = await api.get('/contracts', { params });
    return data;
  },

  /**
   * Assina contrato
   */
  async signContract(contractId: string, signData: SignContractRequest): Promise<Contract> {
    const { data } = await api.patch(`/contracts/${contractId}/sign`, signData);
    return data;
  },

  /**
   * Cancela contrato
   */
  async cancelContract(contractId: string): Promise<Contract> {
    const { data } = await api.patch(`/contracts/${contractId}/cancel`);
    return data;
  },

  /**
   * Obtém URL do PDF do contrato
   */
  async getContractPdf(contractId: string): Promise<string> {
    const { data } = await api.get(`/contracts/${contractId}/pdf`);
    return data.doc_url;
  },

  /**
   * Consulta status do envelope DocuSign
   */
  async getDocuSignStatus(contractId: string): Promise<DocuSignStatus> {
    const { data } = await api.get(`/contracts/${contractId}/docusign-status`);
    return data;
  },

  /**
   * Baixa documento assinado do DocuSign
   */
  async downloadDocuSignDocument(contractId: string): Promise<Blob> {
    const response = await api.get(`/contracts/${contractId}/docusign-download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Sincroniza status do contrato com DocuSign
   */
  async syncDocuSignStatus(contractId: string): Promise<Contract> {
    const { data } = await api.post(`/contracts/${contractId}/sync-docusign`);
    return data;
  },

  /**
   * Verifica se contrato foi criado via DocuSign
   */
  isDocuSignContract(contract: Contract): boolean {
    return contract.doc_url?.startsWith('envelope_') || false;
  },

  /**
   * Formata status do DocuSign para exibição
   */
  formatDocuSignStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'sent': 'Enviado para assinatura',
      'delivered': 'Entregue aos signatários',
      'completed': 'Completamente assinado',
      'declined': 'Recusado',
      'voided': 'Cancelado',
      'created': 'Criado'
    };

    return statusMap[status] || status;
  },

  /**
   * Obtém informações do signatário DocuSign
   */
  getSignerInfo(recipients: any[], userEmail: string): any {
    return recipients?.find(r => r.email === userEmail) || null;
  },

  /**
   * Formata modelo de honorários para exibição
   */
  formatFeeModel(feeModel: Contract['fee_model']): string {
    switch (feeModel.type) {
      case 'success':
        return `Honorários de êxito: ${feeModel.percent}%`;
      case 'fixed':
        return `Honorários fixos: R$ ${feeModel.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      case 'hourly':
        return `Por hora: R$ ${feeModel.rate?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/h`;
      default:
        return 'Modelo não especificado';
    }
  },

  /**
   * Formata status do contrato para exibição
   */
  formatStatus(status: Contract['status']): string {
    const statusMap: Record<Contract['status'], string> = {
      'pending-signature': 'Aguardando assinatura',
      'active': 'Ativo',
      'closed': 'Finalizado',
      'canceled': 'Cancelado'
    };

    return statusMap[status] || status;
  },

  /**
   * Obtém cor do status para UI
   */
  getStatusColor(status: Contract['status']): string {
    const colorMap: Record<Contract['status'], string> = {
      'pending-signature': '#f59e0b', // amber
      'active': '#10b981', // green
      'closed': '#6b7280', // gray
      'canceled': '#ef4444' // red
    };

    return colorMap[status] || '#6b7280';
  },

  /**
   * Verifica se contrato pode ser assinado
   */
  canBeSigned(contract: Contract): boolean {
    return contract.status === 'pending-signature';
  },

  /**
   * Verifica se contrato está totalmente assinado
   */
  isFullySigned(contract: Contract): boolean {
    return !!(contract.signed_client && contract.signed_lawyer);
  },

  /**
   * Verifica se usuário já assinou o contrato
   */
  hasUserSigned(contract: Contract, userId: string): boolean {
    if (contract.client_id === userId) {
      return !!contract.signed_client;
    }
    if (contract.lawyer_id === userId) {
      return !!contract.signed_lawyer;
    }
    return false;
  }
}; 