# backend/jobs/ltr_train.py
import pandas as pd
import lightgbm as lgb
import logging
from pathlib import Path
import json

# --- Configuração ---
DATASET_FILE = Path("data/ltr_dataset.parquet")
MODEL_FILE = Path("backend/models/ltr_model.txt")
WEIGHTS_FILE = Path("backend/models/ltr_weights.json")
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def train_ltr_model():
    """
    Treina um modelo LightGBM Ranker e salva o modelo e os pesos das features.
    """
    if not DATASET_FILE.exists():
        logging.error(f"Dataset não encontrado em '{DATASET_FILE}'. Execute o job de ETL primeiro.")
        return

    logging.info(f"Carregando dataset de '{DATASET_FILE}'")
    df = pd.read_parquet(DATASET_FILE)

    # --- Preparação dos Dados ---
    if 'relevance' not in df.columns or df.empty:
        logging.warning("Dataset sem coluna 'relevance' ou vazio – treinamento LTR pulado.")
        return

    # Features são as colunas que começam com 'f_'
    features = [col for col in df.columns if col.startswith('f_')]
    if not features:
        logging.warning("Dataset sem colunas de feature ('f_*') – treinamento LTR pulado.")
        return

    X = df[features]
    y = df['relevance']
    
    # O LTR precisa saber quais documentos pertencem a qual query.
    # Usamos 'case_id' para agrupar os documentos (advogados) de uma mesma "busca".
    # Criamos um array com o tamanho de cada grupo (quantos advogados por caso).
    group_counts = df.groupby('case_id').size().to_numpy()

    logging.info(f"Treinando modelo com {len(df)} exemplos, {len(group_counts)} queries e {len(features)} features.")

    # --- Treinamento do Modelo ---
    # Usamos o LGBMRanker, específico para problemas de ranking
    ranker = lgb.LGBMRanker(
        objective="lambdarank",
        metric="ndcg",
        n_estimators=100,
        learning_rate=0.05,
        random_state=42
    )

    ranker.fit(X, y, group=group_counts, eval_set=[(X, y)], eval_group=[group_counts], eval_at=[3], callbacks=[lgb.early_stopping(10, verbose=False)])

    # --- Salvando Artefatos ---
    MODEL_FILE.parent.mkdir(exist_ok=True)
    ranker.booster_.save_model(str(MODEL_FILE))
    logging.info(f"Modelo LTR salvo em '{MODEL_FILE}'")

    # --- Extraindo e Salvando Pesos (Feature Importances) ---
    feature_importances = ranker.feature_importances_
    
    # Normaliza as importâncias para que somem 1 (como os pesos originais)
    total_importance = sum(feature_importances)
    normalized_weights = feature_importances / total_importance if total_importance > 0 else feature_importances

    # Mapeia os pesos de volta para os nomes das features (A, S, T, etc.)
    weights_dict = {
        feature.replace('f_', ''): int(weight)
        for feature, weight in zip(features, normalized_weights)
    }

    with open(WEIGHTS_FILE, 'w') as f:
        json.dump(weights_dict, f, indent=4)
        
    logging.info(f"Pesos do LTR salvos em '{WEIGHTS_FILE}'")
    print("Pesos extraídos:", json.dumps(weights_dict, indent=2))


if __name__ == "__main__":
    train_ltr_model() 