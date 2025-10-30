import os
import json
import glob
import pickle
from typing import List, Tuple

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# ----------------------------
# Configuration
# ----------------------------
# Folders to search for CSV files (relative to this script)
CANDIDATE_DATA_DIRS = [
    os.path.join(os.path.dirname(__file__), "data"),
    os.path.join(os.path.dirname(__file__), "..", "data"),
]

# Expected column names (case-insensitive match, accents tolerated)
CANDIDATE_MEASURE = ["mesure", "mesure_um", "valeur", "value", "valeur_mesure"]
CANDIDATE_NOMINAL = ["nominal", "cible", "target", "setpoint"]
CANDIDATE_TOL = ["tol", "tolerance", "tolérance", "tolerence"]

# Output model paths
MODEL_PKL = os.path.join(os.path.dirname(__file__), "modele_clf.pkl")
FEATURES_JSON = os.path.join(os.path.dirname(__file__), "modele_features.json")
REPORT_TXT = os.path.join(os.path.dirname(__file__), "modele_report.txt")

RANDOM_STATE = 42


def find_csv_files() -> List[str]:
    files: List[str] = []
    for base in CANDIDATE_DATA_DIRS:
        if os.path.isdir(base):
            files.extend(glob.glob(os.path.join(base, "**", "*.csv"), recursive=True))
    return files


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    # lower, strip, remove accents-like diacritics by simple replace
    cols = (
        df.columns.str.strip()
        .str.lower()
        .str.replace("é", "e", regex=False)
        .str.replace("è", "e", regex=False)
        .str.replace("ê", "e", regex=False)
        .str.replace("à", "a", regex=False)
        .str.replace("ï", "i", regex=False)
        .str.replace("î", "i", regex=False)
    )
    df.columns = cols
    return df


def pick_column(df: pd.DataFrame, candidates: List[str]) -> str:
    for c in candidates:
        if c in df.columns:
            return c
    # try startswith matches
    for c in candidates:
        for col in df.columns:
            if col.startswith(c):
                return col
    raise KeyError(f"None of the columns {candidates} found in: {list(df.columns)}")


def load_and_concat(csv_files: List[str]) -> pd.DataFrame:
    frames: List[pd.DataFrame] = []
    for path in csv_files:
        try:
            df = pd.read_csv(path, low_memory=False)
            df = normalize_columns(df)
            frames.append(df)
        except Exception as e:
            print(f"[WARN] Failed to read {path}: {e}")
    if not frames:
        raise FileNotFoundError("No readable CSV files found in data directories")
    return pd.concat(frames, axis=0, ignore_index=True)


def build_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series, List[str]]:
    m_col = pick_column(df, CANDIDATE_MEASURE)
    n_col = pick_column(df, CANDIDATE_NOMINAL)
    t_col = pick_column(df, CANDIDATE_TOL)

    # keep only numeric
    sub = df[[m_col, n_col, t_col]].apply(pd.to_numeric, errors="coerce").dropna()

    # label: ok if within tolerance, else 0
    y = (np.abs(sub[m_col] - sub[n_col]) <= sub[t_col]).astype(int)

    X = sub[[m_col, n_col, t_col]].copy()
    feature_names = list(X.columns)
    return X, y, feature_names


def main():
    print("🔎 Searching CSVs in:", ", ".join(CANDIDATE_DATA_DIRS))
    csvs = find_csv_files()
    if not csvs:
        raise SystemExit("❌ No CSV files found under 'data/' folders.")
    print(f"📄 Found {len(csvs)} CSV files")

    df = load_and_concat(csvs)
    print(f"🧮 Loaded dataset shape: {df.shape}")

    X, y, feature_names = build_features(df)
    print(f"✅ Using features: {feature_names} | Samples: {len(X)}")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    # Pipeline with scaler + RF (scaler is not essential for RF but harmless)
    pipe = Pipeline([
        ("scaler", StandardScaler(with_mean=False)),
        ("rf", RandomForestClassifier(
            n_estimators=300,
            max_depth=None,
            random_state=RANDOM_STATE,
            class_weight="balanced_subsample",
            n_jobs=-1,
        )),
    ])

    print("🚂 Training RandomForest...")
    pipe.fit(X_train, y_train)

    print("🧪 Evaluating...")
    y_pred = pipe.predict(X_test)
    report = classification_report(y_test, y_pred, digits=3)
    cm = confusion_matrix(y_test, y_pred)

    # Save artifacts
    with open(MODEL_PKL, "wb") as f:
        pickle.dump(pipe, f)
    with open(FEATURES_JSON, "w", encoding="utf-8") as f:
        json.dump({"features": feature_names}, f, ensure_ascii=False, indent=2)
    with open(REPORT_TXT, "w", encoding="utf-8") as f:
        f.write("Classification report\n")
        f.write(report + "\n\n")
        f.write("Confusion matrix\n")
        f.write(np.array2string(cm))

    print(f"💾 Saved model -> {MODEL_PKL}")
    print(f"💾 Saved features -> {FEATURES_JSON}")
    print(f"📄 Report -> {REPORT_TXT}\n")
    print(report)
    print("Confusion matrix:\n", cm)


if __name__ == "__main__":
    main()
