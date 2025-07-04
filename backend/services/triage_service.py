# backend/triage_service.py
import os
import re
import anthropic
from dotenv import load_dotenv

# Importação do novo serviço de embedding
from .embedding_service import generate_embedding

load_dotenv()

# --- Configuração do Cliente Anthropic ---
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

class TriageService:
    def __init__(self):
        if not ANTHROPIC_API_KEY:
            print("Aviso: Chave da API da Anthropic (ANTHROPIC_API_KEY) não encontrada. Usando fallback de regex.")
            self.client = None
        else:
            self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    async def run_triage(self, text: str) -> dict:
        """
        Executa a triagem, gera o embedding e retorna os dados consolidados.
        """
        triage_results = {}
        if self.client:
            try:
                triage_results = await self._run_claude_triage(text)
            except Exception as e:
                print(f"Erro na triagem com Claude: {e}. Usando fallback.")
                triage_results = self._run_regex_fallback(text)
        else:
            triage_results = self._run_regex_fallback(text)

        # Geração do embedding a partir do resumo
        summary = triage_results.get("summary")
        if summary:
            embedding_vector = await generate_embedding(summary)
            triage_results["summary_embedding"] = embedding_vector
        else:
            triage_results["summary_embedding"] = None # Garante que o campo exista

        return triage_results

    async def _run_claude_triage(self, text: str) -> dict:
        """
        Chama a API do Claude para extrair informações estruturadas do texto.
        """
        if not self.client:
            raise Exception("Cliente Anthropic não inicializado.")

        # Tool (função) que queremos que o Claude preencha com os dados extraídos
        triage_tool = {
            "name": "extract_case_details",
            "description": "Extrai detalhes estruturados de um relato de caso jurídico.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "area": {"type": "string", "description": "A principal área jurídica do caso (ex: Trabalhista, Cível, Criminal)."},
                    "subarea": {"type": "string", "description": "A subárea ou assunto específico (ex: Rescisão Indireta, Contrato de Aluguel)."},
                    "urgency_h": {"type": "integer", "description": "Estimativa da urgência em horas para uma ação inicial (ex: 24, 72)."},
                    "summary": {"type": "string", "description": "Um resumo conciso do caso em uma frase."}
                },
                "required": ["area", "subarea", "urgency_h", "summary"]
            }
        }

        message = self.client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=1024,
            tools=[triage_tool],
            tool_choice={"type": "tool", "name": "extract_case_details"},
            messages=[
                {"role": "user", "content": f"Analise o seguinte relato de caso jurídico e extraia os detalhes estruturados: '{text}'"}
            ]
        )

        # Extrai o conteúdo da ferramenta preenchida pelo modelo
        if message.content and isinstance(message.content, list) and message.content[0].type == 'tool_use':
            tool_result = message.content[0].input
            return {
                "area": tool_result.get("area", "Não identificado"),
                "subarea": tool_result.get("subarea", "Não identificado"),
                "urgency_h": tool_result.get("urgency_h", 72),
                "summary": tool_result.get("summary", "N/A"),
            }
        else:
            raise Exception("A resposta do LLM não continha os dados esperados.")
            
    def _run_regex_fallback(self, text: str) -> dict:
        """
        Fallback simples que usa regex para extrair a área jurídica.
        """
        text_lower = text.lower()

        # -------- Heurística de área --------------------------------------
        area = "Cível"  # padrão
        subarea = "A ser definido"

        trabalhista = r"trabalho|trabalhista|demitido|verbas? rescisórias|rescisão|salário"
        criminal = r"pol[ií]cia|crime|criminoso|preso|roubo|furto|homic[ií]dio"
        consumidor = r"consumidor|produto|compra|loja|defeito|garantia"

        if re.search(trabalhista, text_lower):
            area = "Trabalhista"
            if re.search(r"justa causa", text_lower):
                subarea = "Justa Causa"
            elif re.search(r"verbas? rescisórias", text_lower):
                subarea = "Verbas Rescisórias"
        elif re.search(criminal, text_lower):
            area = "Criminal"
            if re.search(r"homic[ií]dio", text_lower):
                subarea = "Homicídio"
            elif re.search(r"roubo|furto", text_lower):
                subarea = "Patrimonial"
        elif re.search(consumidor, text_lower):
            area = "Consumidor"
            if re.search(r"garantia", text_lower):
                subarea = "Garantia"

        # -------- Heurística de urgência ----------------------------------
        # 24h para casos urgentes (liminar, prazo curto, réu preso)
        if re.search(r"\b(liminar|urgente|réu preso)\b", text_lower):
            urgency_h = 24
        # 48h se menciona prazo até 2 dias
        elif re.search(r"\b(48h|2 dias?)\b", text_lower):
            urgency_h = 48
        # Caso mencione prazo específico em dias
        else:
            m = re.search(r"\b(\d{1,2})\s*dias?\b", text_lower)
            if m:
                urgency_h = int(m.group(1)) * 24
            else:
                urgency_h = 72  # padrão

        return {
            "area": area,
            "subarea": subarea,
            "urgency_h": urgency_h,
            "summary": text[:150]
        }

# Instância única para ser usada na aplicação
triage_service = TriageService() 