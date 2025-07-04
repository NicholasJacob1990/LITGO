# backend/jobs/ltr_export.py
import json
import pandas as pd
import logging
from pathlib import Path

# --- Configuração ---
LOG_FILE = Path("logs/audit.log")
OUTPUT_FILE = Path("data/ltr_dataset.parquet")
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_ltr_dataset():
    """
    Lê os logs de auditoria, extrai dados de match e salva em um dataset Parquet.
    """
    if not LOG_FILE.exists():
        logging.error(f"Arquivo de log não encontrado em '{LOG_FILE}'")
        return

    logging.info(f"Iniciando ETL do arquivo de log: {LOG_FILE}")
    
    records = []
    with open(LOG_FILE, 'r') as f:
        for line in f:
            try:
                log_entry = json.loads(line)
                
                # Processa apenas logs de 'match' que contêm as chaves necessárias
                if log_entry.get("event") == "match" and "features" in log_entry and "label" in log_entry:
                    # 'Flattens' a estrutura do JSON para colunas do DataFrame
                    flat_record = {
                        'case_id': log_entry.get('case_id'),
                        'lawyer_id': log_entry.get('lawyer_id'),
                        'label_str': log_entry.get('label')
                    }
                    # Adiciona cada feature como uma coluna separada (f_A, f_S, etc.)
                    for feature, value in log_entry.get("features", {}).items():
                        flat_record[f'f_{feature}'] = value
                        
                    records.append(flat_record)

            except json.JSONDecodeError:
                logging.warning(f"Ignorando linha mal formatada: {line.strip()}")
                continue
    
    if not records:
        logging.warning("Nenhum registro de match válido encontrado nos logs.")
        return

    df = pd.DataFrame(records)
    
    # --- Mapeamento de Labels para Relevância Numérica ---
    # Define a relevância para o modelo de ranking.
    # Ex: 'won' (contrato assinado e ganho) é mais relevante que 'accepted'.
    relevance_map = {
        'lost': 0,
        'declined': 1,
        'accepted': 2,
        'won': 3 
    }
    df['relevance'] = df['label_str'].map(relevance_map).fillna(0).astype(int)

    # Garante que o diretório de saída exista
    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    
    # Salva o DataFrame em formato Parquet
    df.to_parquet(OUTPUT_FILE, index=False)
    
    logging.info(f"Dataset de LTR criado com sucesso em '{OUTPUT_FILE}'. Total de {len(df)} registros.")
    print(df.head())


if __name__ == "__main__":
    create_ltr_dataset() 