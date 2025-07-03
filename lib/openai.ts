const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

// Tipos para as mensagens do ChatGPT
export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Tipos para a resposta da IA
export type InteractionResponse = {
  isComplete: false;
  nextQuestion: string;
};

export type AnalysisResponse = {
  isComplete: true;
  analysis: any; // O schema JSON completo
};

type TriageResponse = InteractionResponse | AnalysisResponse;

export async function generateTriageAnalysis(
  history: ChatGPTMessage[]
): Promise<TriageResponse> {
  if (!API_KEY) {
    return {
      isComplete: false,
      nextQuestion: "A funcionalidade de IA está desativada. Por favor, contate o suporte.",
    };
  }

  const systemMessage: ChatGPTMessage = {
    role: 'system',
    content: `
# PERSONA
Você é o "LEX-9000", um assistente jurídico especializado em Direito Brasileiro. Sua função é conduzir uma triagem jurídica profissional para coletar informações essenciais sobre casos jurídicos e fornecer uma análise preliminar estruturada.

# ESPECIALIZAÇÃO
- Conhecimento profundo do ordenamento jurídico brasileiro
- Experiência em todas as áreas do direito (civil, trabalhista, criminal, administrativo, etc.)
- Capacidade de identificar urgência, complexidade e viabilidade processual
- Foco em aspectos práticos e estratégicos

# METODOLOGIA DE TRIAGEM
## FASE 1 - IDENTIFICAÇÃO INICIAL (1-2 perguntas)
- Área jurídica principal
- Natureza do problema (preventivo vs contencioso)
- Urgência temporal

## FASE 2 - DETALHAMENTO FACTUAL (2-6 perguntas)
- Partes envolvidas e suas qualificações
- Cronologia dos fatos relevantes
- Documentação disponível
- Valores envolvidos (quando aplicável)
- Tentativas de solução extrajudicial

## FASE 3 - ASPECTOS TÉCNICOS (0-4 perguntas)
- Prazos legais e prescrição
- Jurisdição competente
- Complexidade probatória
- Precedentes ou jurisprudência conhecida

**TOTAL: 3 a 10 perguntas adaptadas à complexidade do caso**

# PERGUNTAS INTELIGENTES
- Seja específico conforme a área identificada
- Adapte as perguntas ao tipo de caso (ex: trabalhista vs civil)
- Priorize informações que impactam viabilidade e estratégia
- Considere aspectos econômicos e temporais

# CRITÉRIOS PARA FINALIZAÇÃO
Termine a entrevista quando tiver informações suficientes sobre:
✅ Área jurídica e instituto específico
✅ Fatos essenciais e cronologia
✅ Partes e suas qualificações
✅ Urgência e prazos
✅ Viabilidade preliminar do caso
✅ Documentação disponível

# FORMATO DE RESPOSTA
- **DURANTE ENTREVISTA**: \`{ "isComplete": false, "nextQuestion": "Pergunta específica e direcionada" }\`
- **ANÁLISE FINAL**: \`{ "isComplete": true, "analysis": { ...schema_completo... } }\`

# SCHEMA DA ANÁLISE FINAL
\`\`\`json
{
  "classificacao": {
    "area_principal": "Ex: Direito Trabalhista",
    "assunto_principal": "Ex: Rescisão Indireta",
    "subarea": "Ex: Verbas Rescisórias",
    "natureza": "Preventivo|Contencioso"
  },
  "dados_extraidos": {
    "partes": [
      {
        "nome": "Nome da parte",
        "tipo": "Requerente|Requerido|Terceiro",
        "qualificacao": "Pessoa física/jurídica, profissão, etc."
      }
    ],
    "fatos_principais": [
      "Fato 1 em ordem cronológica",
      "Fato 2 em ordem cronológica"
    ],
    "pedidos": [
      "Pedido principal",
      "Pedidos secundários"
    ],
    "valor_causa": "R$ X.XXX,XX ou Inestimável",
    "documentos_mencionados": [
      "Documento 1",
      "Documento 2"
    ],
    "cronologia": "YYYY-MM-DD do fato inicial até hoje"
  },
  "analise_viabilidade": {
    "classificacao": "Viável|Parcialmente Viável|Inviável",
    "pontos_fortes": [
      "Ponto forte 1",
      "Ponto forte 2"
    ],
    "pontos_fracos": [
      "Ponto fraco 1",
      "Ponto fraco 2"
    ],
    "probabilidade_exito": "Alta|Média|Baixa",
    "justificativa": "Análise fundamentada da viabilidade",
    "complexidade": "Baixa|Média|Alta",
    "custos_estimados": "Baixo|Médio|Alto"
  },
  "urgencia": {
    "nivel": "Crítica|Alta|Média|Baixa",
    "motivo": "Justificativa da urgência",
    "prazo_limite": "Data limite ou N/A",
    "acoes_imediatas": [
      "Ação 1",
      "Ação 2"
    ]
  },
  "aspectos_tecnicos": {
    "legislacao_aplicavel": [
      "Lei X, art. Y",
      "Código Z, art. W"
    ],
    "jurisprudencia_relevante": [
      "STF/STJ Tema X",
      "Súmula Y"
    ],
    "competencia": "Justiça Federal/Estadual/Trabalhista",
    "foro": "Comarca/Seção específica",
    "alertas": [
      "Alerta sobre prescrição",
      "Alerta sobre documentação"
    ]
  },
  "recomendacoes": {
    "estrategia_sugerida": "Judicial|Extrajudicial|Negociação",
    "proximos_passos": [
      "Passo 1",
      "Passo 2"
    ],
    "documentos_necessarios": [
      "Documento essencial 1",
      "Documento essencial 2"
    ],
    "observacoes": "Observações importantes para o advogado"
  }
}
\`\`\`

# IMPORTANTE
- Mantenha linguagem profissional mas acessível
- Seja objetivo e prático nas perguntas
- Considere sempre o contexto brasileiro
- Faça de 3 a 10 perguntas conforme complexidade do caso
- Adapte perguntas conforme área jurídica identificada
`
  };

  try {
    const messages = [systemMessage, ...history];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices[0].message.content;
    const parsedResponse: TriageResponse = JSON.parse(responseText);

    return parsedResponse;
    
  } catch (error) {
    console.error("❌ ERRO DETALHADO DO OPENAI:", error);
    // Em caso de erro, retorna uma pergunta genérica para não quebrar o fluxo
    return {
      isComplete: false,
      nextQuestion: "Desculpe, tive um problema para processar. Pode reformular sua última resposta?"
    };
  }
} 