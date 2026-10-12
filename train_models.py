from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd

from lightgbm import LGBMClassifier
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import f_classif
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import (
    average_precision_score,
    roc_auc_score,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)

# 1. НАЛАШТУВАННЯ

DATA_PATH = "data.csv"
TARGET_COLUMN = "Bankrupt?"
RANDOM_STATE = 42
TEST_SIZE = 0.20
N_SPLITS = 5
CORRELATION_THRESHOLD = 0.85
OUTPUT_DIR = Path("backend/saved_models")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Конфігурації моделей 
CONFIGS = [
    {
        "key": "model_30",
        "name": "Random Forest (30 ознак)",
        "n_features": 30,
        "model_type": "random_forest",
    },
    {
        "key": "model_50",
        "name": "LightGBM SMOTE (50 ознак)",
        "n_features": 50,
        "model_type": "lightgbm_smote",
    },
]

# 2. ФУНКЦІЯ ВКЛАДЕНОГО ВІДБОРУ ОЗНАК (NESTED FEATURE SELECTION)

def select_nested_features(
    X_fit,
    y_fit,
    max_features=50,
    corr_threshold=0.90,
):
    non_constant = X_fit.columns[X_fit.nunique(dropna=False) > 1].tolist()
    X_candidates = X_fit[non_constant]

    scores, _ = f_classif(X_candidates, y_fit)
    scores = np.nan_to_num(
        scores,
        nan=-np.inf,
        posinf=np.inf,
        neginf=-np.inf,
    )

    ranking = np.argsort(-scores, kind="stable")
    ranked_features = [X_candidates.columns[i] for i in ranking]

    corr = X_candidates.corr().abs()
    selected = []

    for feature in ranked_features:
        if all(
            corr.loc[feature, previous] <= corr_threshold
            for previous in selected
        ):
            selected.append(feature)

        if len(selected) == max_features:
            break

    if len(selected) < max_features:
        raise ValueError(
            f"Вдалося відібрати лише {len(selected)} із {max_features} ознак "
            f"за порогу кореляції {corr_threshold}."
        )

    return selected

# 3. СТВОРЕННЯ МОДЕЛЕЙ

def build_model(config, random_state=RANDOM_STATE):
    model_type = config["model_type"]

    if model_type == "random_forest":
        return RandomForestClassifier(
            n_estimators=500,
            random_state=random_state,
            n_jobs=-1,
        )

    if model_type == "lightgbm_smote":
        return ImbPipeline([
            ("smote", SMOTE(random_state=random_state)),
            (
                "model",
                LGBMClassifier(
                    n_estimators=400,
                    learning_rate=0.03,
                    num_leaves=31,
                    random_state=random_state,
                    verbosity=-1,
                    n_jobs=-1,
                ),
            ),
        ])

    raise ValueError(f"Невідомий тип моделі: {model_type}")

# 4. ПОШУК ОПТИМАЛЬНОГО ПОРОГУ НА OOF-ПРОГНОЗАХ

def find_best_threshold(y_true, probabilities):
    """
    Шукає поріг, що максимізує F1-score для класу 1.
    """
    best = None

    for threshold in np.arange(0.01, 1.00, 0.01):
        predictions = (probabilities >= threshold).astype(int)

        precision = precision_score(y_true, predictions, zero_division=0)
        recall = recall_score(y_true, predictions, zero_division=0)
        f1 = f1_score(y_true, predictions, zero_division=0)

        candidate = (f1, precision, threshold, recall)

        if best is None or candidate[:3] > best[:3]:
            best = candidate

    return {
        "threshold": float(best[2]),
        "oof_f1": float(best[0]),
        "oof_precision": float(best[1]),
        "oof_recall": float(best[3]),
    }

# 5. ОСНОВНИЙ СКРИПТ ВИКОНАННЯ

print("Завантаження даних...")
df = pd.read_csv(DATA_PATH)

if TARGET_COLUMN not in df.columns:
    raise ValueError(f"Не знайдено цільову колонку '{TARGET_COLUMN}'")

X = df.drop(columns=[TARGET_COLUMN]).select_dtypes(include=[np.number])
y = df[TARGET_COLUMN].astype(int)

if X.isna().any().any() or not np.isfinite(X.to_numpy()).all():
    raise ValueError("У даних є пропущені або нескінченні значення.")

print(f"Дані завантажені. Розмір: {X.shape}")

# Обчислення медіан для всіх ознак
feature_medians = X.median().to_dict()

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE,
    stratify=y,
)

X_train = X_train.reset_index(drop=True)
y_train = y_train.reset_index(drop=True)
X_test = X_test.reset_index(drop=True)
y_test = y_test.reset_index(drop=True)

print(f"Train: {X_train.shape}, Test: {X_test.shape}")

# Крос-валідація з відбором ознак всередині фолдів
print("\nКрос-валідація...")
cv = StratifiedKFold(
    n_splits=N_SPLITS,
    shuffle=True,
    random_state=RANDOM_STATE,
)

oof_probabilities = {
    config["key"]: np.full(len(X_train), np.nan)
    for config in CONFIGS
}
fold_pr_auc = {config["key"]: [] for config in CONFIGS}

MAX_FEATURES_NEEDED = max(cfg["n_features"] for cfg in CONFIGS)

for fold_number, (fit_idx, val_idx) in enumerate(
    cv.split(X_train, y_train),
    start=1,
):
    print(f"  Fold {fold_number}/{N_SPLITS}...", end=" ")
    X_fit, y_fit = X_train.iloc[fit_idx], y_train.iloc[fit_idx]
    X_val, y_val = X_train.iloc[val_idx], y_train.iloc[val_idx]

    # Відбір ознак ТІЛЬКИ на частині fit поточного фолду
    fold_features = select_nested_features(
        X_fit,
        y_fit,
        max_features=MAX_FEATURES_NEEDED,
        corr_threshold=CORRELATION_THRESHOLD,
    )

    for config in CONFIGS:
        key = config["key"]
        n_features = config["n_features"]

        # Беремо перші N ознак з єдиного впорядкованого списку фолду
        features = fold_features[:n_features]

        model = build_model(
            config,
            random_state=RANDOM_STATE + fold_number,
        )
        model.fit(X_fit[features], y_fit)

        probabilities = model.predict_proba(X_val[features])[:, 1]
        oof_probabilities[key][val_idx] = probabilities

        ap = average_precision_score(y_val, probabilities)
        fold_pr_auc[key].append(ap)
    
    print("OK")

# 5.3 Фінальний відбір ознак на X_train та оцінка на X_test
print("\nФінальний відбір ознак та тренування моделей...")
final_nested_features = select_nested_features(
    X_train,
    y_train,
    max_features=MAX_FEATURES_NEEDED,
    corr_threshold=CORRELATION_THRESHOLD,
)

features_by_size = {
    30: final_nested_features[:30],
    50: final_nested_features[:50],
}

# Перевірка строгої вкладеності
assert features_by_size[30] == features_by_size[50][:30]

results = []

for config in CONFIGS:
    key = config["key"]
    name = config["name"]
    n_features = config["n_features"]
    features = features_by_size[n_features]

    print(f"\n{name}:")
    print(f"  Ознаки: {', '.join(features[:5])}... (всього {len(features)})")

    # Вибір оптимального порогу за OOF-прогнозами
    threshold_info = find_best_threshold(
        y_train,
        oof_probabilities[key],
    )
    threshold = threshold_info["threshold"]
    print(f"  Оптимальний поріг: {threshold:.3f}")

    # Навчання фінальної моделі
    final_model = build_model(config)
    final_model.fit(X_train[features], y_train)

    # Тестування
    test_probs = final_model.predict_proba(X_test[features])[:, 1]
    test_preds = (test_probs >= threshold).astype(int)

    test_ap = average_precision_score(y_test, test_probs)
    test_roc_auc = roc_auc_score(y_test, test_probs)
    test_acc = accuracy_score(y_test, test_preds)
    test_prec = precision_score(y_test, test_preds, zero_division=0)
    test_rec = recall_score(y_test, test_preds, zero_division=0)
    test_f1 = f1_score(y_test, test_preds, zero_division=0)

    cv_scores = np.array(fold_pr_auc[key])

    print(f"  CV PR-AUC: {cv_scores.mean():.4f} (±{cv_scores.std(ddof=1):.4f})")
    print(f"  Test PR-AUC: {test_ap:.4f}")
    print(f"  Test ROC-AUC: {test_roc_auc:.4f}")
    print(f"  Test F1: {test_f1:.4f}")

    # Збереження артефактів
    model_path = OUTPUT_DIR / f"{key}.joblib"
    artifact = {
        "name": name,
        "model": final_model,
        "features": features,
        "n_features": n_features,
        "threshold": threshold,
        "model_type": config["model_type"],
        "cv_pr_auc_mean": float(cv_scores.mean()),
        "cv_pr_auc_std": float(cv_scores.std(ddof=1)),
        "threshold_oof_f1": threshold_info["oof_f1"],
        "feature_medians": feature_medians,
    }
    joblib.dump(artifact, model_path)
    print(f"  Модель збережена: {model_path}")

    results.append({
        "Model": name,
        "Features": n_features,
        "Threshold": threshold,
        "CV_PR_AUC": cv_scores.mean(),
        "Test_PR_AUC": test_ap,
        "Test_ROC_AUC": test_roc_auc,
        "Test_Accuracy": test_acc,
        "Test_Precision": test_prec,
        "Test_Recall": test_rec,
        "Test_F1": test_f1,
    })

results_df = pd.DataFrame(results)
print("\n" + "="*80)
print(results_df.to_string(
    index=False,
    float_format=lambda value: f"{value:.4f}",
))
print("="*80)
print("\nМоделі успішно натреновані та збережені!")
