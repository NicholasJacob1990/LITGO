import Constants from 'expo-constants';
import supabase from '../supabase'; // Importar o cliente supabase

// A URL da API é pega das variáveis de ambiente do Expo
const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Função auxiliar para obter os cabeçalhos de autenticação.
 */
export async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: { [key: string]: string } = {
        'Content-Type': 'application/json',
    };
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    return headers;
}

interface TriageTaskResponse {
    task_id: string;
    status: string;
    message: string;
}

/**
 * Representa o payload para criar um novo caso, espelhando o DTO do backend.
 */
interface CasePayload {
    texto_cliente: string;
    area: string;
    subarea: string;
    urgency_h: number;
    summary_embedding: number[];
    coords: [number, number];
}

/**
 * Representa a estrutura de um advogado retornado pelo endpoint de match.
 */
export interface Match {
    lawyer_id: string;
    nome: string;
    fair: number;
    equity: number;
    features: { [key: string]: number };
    avatar_url?: string;
    is_available: boolean;
    primary_area: string;
    rating?: number;
    distance_km?: number;
}

/**
 * Representa o payload para criar um novo caso, espelhando o DTO do backend.
 */
interface TriagePayload {
    texto_cliente: string;
    coords?: [number, number];
}

/**
 * Envia os dados de um novo caso para o backend para iniciar a triagem.
 * A triagem é processada de forma assíncrona.
 *
 * @param payload - Os dados do caso a serem criados.
 * @returns Um objeto com o ID da tarefa de triagem.
 */
export async function startTriage(payload: TriagePayload): Promise<TriageTaskResponse> {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/triage`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (response.status === 401) {
            // TODO: Tratar o caso de token expirado (ex: redirecionar para login)
            throw new Error('Não autorizado. Faça login novamente.');
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Falha ao iniciar a triagem.');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro em startTriage:', error);
        throw error;
    }
}

/**
 * Envia os dados de um novo caso para o backend.
 *
 * @param payload - Os dados do caso a serem criados.
 * @returns O ID do caso criado.
 */
export async function createCase(payload: CasePayload): Promise<{ case_id: string }> {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/cases`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload),
        });

        if (response.status === 401) {
            // TODO: Tratar o caso de token expirado (ex: redirecionar para login)
            throw new Error('Não autorizado. Faça login novamente.');
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Falha ao criar o caso.');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro em createCase:', error);
        throw error;
    }
}

/**
 * Solicita ao backend uma lista de advogados compatíveis para um caso.
 *
 * @param caseId - O ID do caso para o qual encontrar matches.
 * @param k - O número de matches a serem retornados (opcional).
 * @returns Uma lista de advogados.
 */
export async function getMatches(caseId: string, k: number = 5): Promise<Match[]> {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/match`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ case_id: caseId, k }),
        });

        if (response.status === 401) {
            throw new Error('Não autorizado. Faça login novamente.');
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Falha ao buscar matches.');
        }

        const data = await response.json();
        return data.matches;
    } catch (error) {
        console.error('Erro em getMatches:', error);
        throw error;
    }
}

interface ExplainResponse {
    explanations: { [key: string]: string };
}

/**
 * Solicita uma explicação para um ou mais matches de advogados.
 */
export async function getExplanation(caseId: string, lawyerIds: string[]): Promise<ExplainResponse> {
    try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_URL}/explain`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ case_id: caseId, lawyer_ids: lawyerIds }),
        });

        if (!response.ok) {
            throw new Error('Falha ao buscar explicações.');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro em getExplanation:', error);
        throw error;
    }
} 