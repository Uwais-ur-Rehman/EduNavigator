"""
train_model.py — EduNavigator ML Recommendation Model Trainer

Connects to MongoDB, exports all universities, engineers combined feature
strings, trains a TF-IDF vectorizer, computes the cosine similarity matrix,
and saves all artefacts to ./model/ so app.py can serve recommendations
without retraining on every request.

Run:
    py train_model.py
or triggered automatically from Express: POST /api/recommend/retrain
"""

import os
import sys

# Cap threading to prevent OpenBLAS memory allocation errors on Windows
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

import json
import re
import joblib
import numpy as np
from datetime import datetime

from pymongo import MongoClient
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import MinMaxScaler
from dotenv import load_dotenv

# ─── Config ──────────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR  = os.path.join(BASE_DIR, 'model')
ENV_PATH   = os.path.join(BASE_DIR, '..', '.env')

load_dotenv(ENV_PATH)

MONGO_URI  = os.getenv('MONGO_URI', 'mongodb://localhost:27017/edunavigator')
MODEL_DIR  = os.path.join(BASE_DIR, 'model')
os.makedirs(MODEL_DIR, exist_ok=True)

# ─── Budget Category helper ───────────────────────────────────────────────────
def budget_category(fee_per_semester: float) -> str:
    """Map numeric fee to a human-readable budget label used in TF-IDF."""
    if fee_per_semester is None or fee_per_semester == 0:
        return 'unknown_fee'
    if fee_per_semester <= 30_000:
        return 'very_affordable'
    if fee_per_semester <= 70_000:
        return 'affordable'
    if fee_per_semester <= 130_000:
        return 'moderate'
    if fee_per_semester <= 200_000:
        return 'expensive'
    return 'very_expensive'


# ─── Facilities extractor ─────────────────────────────────────────────────────
def extract_facilities(facilities_field) -> list[str]:
    """Return a flat list of facility names from Mixed schema field."""
    if not facilities_field:
        return []
    if isinstance(facilities_field, list):
        return [str(f).lower().replace(' ', '_') for f in facilities_field if f]
    if isinstance(facilities_field, dict):
        return [
            k.lower().replace(' ', '_')
            for k, v in facilities_field.items()
            if v is True or str(v).lower() == 'true'
        ]
    return []


# ─── Program / field text ─────────────────────────────────────────────────────
def extract_program_text(programs: list) -> str:
    """Join all program names + faculties + departments into searchable text."""
    parts = []
    for p in (programs or []):
        if p.get('name'):
            # Normalise: 'BS Computer Science' → 'bs computer science computer science'
            name = p['name'].lower()
            parts.append(name)
            # Also add individual words so "computer" alone can match
            parts.extend(name.split())
        if p.get('faculty'):
            parts.append(str(p['faculty']).lower())
        if p.get('department'):
            parts.append(str(p['department']).lower())
    return ' '.join(parts)


# ─── Scholarship text ─────────────────────────────────────────────────────────
def extract_scholarship_text(scholarships: list) -> str:
    parts = []
    if scholarships:
        parts.append('scholarship')
        for s in scholarships:
            if isinstance(s, dict) and s.get('name'):
                parts.append(str(s['name']).lower())
            elif isinstance(s, str):
                parts.append(s.lower())
    return ' '.join(parts)


# ─── Build combined feature string for one university ────────────────────────
def build_feature_string(uni: dict) -> str:
    """
    Combine all relevant features into a single text document for TF-IDF.
    Repetition is intentional — it boosts weight of important features.
    """
    tokens = []

    # Sector (repeated 3× for higher weight)
    sector = str(uni.get('sector', '')).lower().replace('-', '_').replace(' ', '_')
    tokens += [sector] * 3

    # Province (repeated 3×)
    province = str(uni.get('province', '')).lower().replace(' ', '_')
    tokens += [province] * 3

    # City (repeated 2×)
    city = str(uni.get('city', '')).lower().replace(' ', '_')
    tokens += [city] * 2

    # Programs (repeated 4× — most important signal)
    prog_text = extract_program_text(uni.get('programs', []))
    tokens += ([prog_text] * 4) if prog_text else []

    # Budget categories from actual fees
    fees = [p.get('feePerSemester') for p in (uni.get('programs') or []) if p.get('feePerSemester')]
    if fees:
        min_fee = min(fees)
        tokens.append(budget_category(min_fee))

    # Facilities
    fac_tokens = extract_facilities(uni.get('facilities'))
    tokens += fac_tokens

    # Scholarships
    schol_text = extract_scholarship_text(uni.get('scholarships', []))
    if schol_text:
        tokens.append(schol_text)

    # Description (free-form text — lower weight, not repeated)
    desc = str(uni.get('description', '')).lower()
    # Remove punctuation
    desc = re.sub(r'[^\w\s]', ' ', desc)
    tokens.append(desc)

    # University name / short name as additional identifier tokens
    name_tokens = re.sub(r'[^\w\s]', ' ', str(uni.get('name', '')).lower()).split()
    tokens += name_tokens

    return ' '.join(tokens).strip()


# ─── Main training routine ────────────────────────────────────────────────────
def train():
    print(f'[{datetime.now():%H:%M:%S}] Connecting to MongoDB ...')
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10_000)
    db     = client.get_default_database()

    universities = list(db['universities'].find({}))
    if not universities:
        print('[ERROR] No universities found in the database. Seed the DB first.')
        sys.exit(1)

    print(f'[{datetime.now():%H:%M:%S}] Found {len(universities)} universities. OK')

    # ── Serialise raw university data (needed by recommender at runtime) ──
    serialised = []
    for u in universities:
        # Convert ObjectId → str for JSON serialisation
        d = {k: (str(v) if hasattr(v, '__str__') and not isinstance(v, (str, int, float, bool, list, dict, type(None))) else v)
             for k, v in u.items()}
        d['_id'] = str(u['_id'])
        serialised.append(d)

    # ── Feature engineering ───────────────────────────────────────────────
    features = [build_feature_string(u) for u in universities]

    # ── TF-IDF ───────────────────────────────────────────────────────────
    print(f'[{datetime.now():%H:%M:%S}] Fitting TF-IDF vectorizer ...')
    vectorizer = TfidfVectorizer(
        analyzer       = 'word',
        ngram_range    = (1, 2),   # unigrams + bigrams (e.g. "computer science")
        max_features   = 5_000,
        sublinear_tf   = True,
        min_df         = 1,
        strip_accents  = 'unicode',
    )
    tfidf_matrix = vectorizer.fit_transform(features)

    # ── Min fees per university (for budget scoring at runtime) ──────────
    min_fees = []
    for u in universities:
        fees = [p.get('feePerSemester') for p in (u.get('programs') or []) if p.get('feePerSemester')]
        min_fees.append(min(fees) if fees else None)

    # ── Save artefacts ────────────────────────────────────────────────────
    print(f'[{datetime.now():%H:%M:%S}] Saving model artefacts to {MODEL_DIR} ...')
    joblib.dump(vectorizer,   os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
    joblib.dump(tfidf_matrix, os.path.join(MODEL_DIR, 'tfidf_matrix.pkl'))

    with open(os.path.join(MODEL_DIR, 'universities.json'), 'w', encoding='utf-8') as f:
        json.dump(serialised, f, ensure_ascii=False, default=str)

    metadata = {
        'trained_at'       : datetime.now().isoformat(),
        'university_count' : len(universities),
        'feature_count'    : tfidf_matrix.shape[1],
        'min_fees'         : min_fees,
    }
    with open(os.path.join(MODEL_DIR, 'metadata.json'), 'w') as f:
        json.dump(metadata, f)

    print(f'[{datetime.now():%H:%M:%S}] DONE - Training complete!')
    print(f'    Universities : {len(universities)}')
    print(f'    TF-IDF shape : {tfidf_matrix.shape}')
    client.close()


if __name__ == '__main__':
    train()
