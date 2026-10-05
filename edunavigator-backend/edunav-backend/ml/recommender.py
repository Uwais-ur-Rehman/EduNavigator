"""
recommender.py — EduNavigator Core ML Recommendation Engine

Implements strict location pre-filtering followed by 5-part weighted scoring (100% total):
1. Location Pre-filtering (Highest Priority):
   - Province AND City selected: Include only universities where uni.province == province AND uni.city == city.
   - Only Province selected: Include only universities where uni.province == province.
   - Neither selected: Include all universities.
2. New Weighted Scoring Weights (100% Total):
   - TF-IDF Cosine Similarity (Field/Program ↔ Programs) : 40% (0.40)
   - Continuous Budget Match Score                      : 30% (0.30)
   - Location Match Score (Province & City)             : 10% (0.10)
   - Sector Match Score (Public / Private)               : 10% (0.10)
   - Facilities Match Score (Requested Facilities)      : 10% (0.10)
"""

import os
import json
import re
import joblib
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR  = os.path.join(BASE_DIR, 'model')

# ─── Lazy-load model artefacts (singleton per process) ───────────────────────
_vectorizer   = None
_tfidf_matrix = None
_universities = None
_min_fees     = None

def _load_model():
    global _vectorizer, _tfidf_matrix, _universities, _min_fees
    if _vectorizer is not None:
        return  # already loaded

    vec_path  = os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl')
    mat_path  = os.path.join(MODEL_DIR, 'tfidf_matrix.pkl')
    unis_path = os.path.join(MODEL_DIR, 'universities.json')
    meta_path = os.path.join(MODEL_DIR, 'metadata.json')

    if not all(os.path.exists(p) for p in [vec_path, mat_path, unis_path, meta_path]):
        raise FileNotFoundError(
            'Model artefacts not found. Run train_model.py first.'
        )

    _vectorizer   = joblib.load(vec_path)
    _tfidf_matrix = joblib.load(mat_path)
    with open(unis_path, 'r', encoding='utf-8') as f:
        _universities = json.load(f)
    with open(meta_path, 'r') as f:
        meta = json.load(f)
    _min_fees = meta.get('min_fees', [None] * len(_universities))


def reload_model():
    """Force re-load artefacts from disk (called after retraining)."""
    global _vectorizer, _tfidf_matrix, _universities, _min_fees
    _vectorizer = _tfidf_matrix = _universities = _min_fees = None
    _load_model()


def _normalize_string(val: str) -> str:
    if not val:
        return ''
    return re.sub(r'\s+', ' ', str(val).strip().lower())


def _build_query_string(field: str, program: str) -> str:
    tokens = []
    if program:
        prog_norm = program.lower()
        tokens += [prog_norm] * 4
        tokens += prog_norm.split() * 2
    if field:
        field_norm = field.lower()
        tokens += [field_norm] * 2
        tokens += field_norm.split()

    return ' '.join(tokens)


def _extract_uni_facilities(uni: dict) -> set[str]:
    facs = uni.get('facilities')
    if not facs:
        return set()
    if isinstance(facs, list):
        return {str(f).strip().lower() for f in facs if f}
    if isinstance(facs, dict):
        return {str(k).strip().lower() for k, v in facs.items() if v is True or str(v).lower() == 'true'}
    return set()


def _parse_facilities(facilities) -> list[str]:
    if not facilities:
        return []
    if isinstance(facilities, str):
        return [f.strip().lower() for f in facilities.split(',') if f.strip()]
    if isinstance(facilities, list):
        return [str(f).strip().lower() for f in facilities if str(f).strip()]
    return []


def recommend(
    field: str      = '',
    program: str    = '',
    budget: float   = 0,
    sector: str     = '',
    province: str   = '',
    city: str       = '',
    facilities      = None,
    top_n: int      = 10,
) -> list[dict]:
    """
    Return top_n university recommendations sorted by weighted ML score.
    """
    _load_model()

    req_prov  = _normalize_string(province)
    req_city  = _normalize_string(city)
    req_sect  = _normalize_string(sector)
    req_prog  = _normalize_string(program)
    req_field = _normalize_string(field)
    req_facs  = _parse_facilities(facilities)

    # ── 1. Location Pre-filtering (Highest Priority) ──────────────────────────
    candidate_indices = []
    for idx, uni in enumerate(_universities):
        u_prov = _normalize_string(uni.get('province', ''))
        u_city = _normalize_string(uni.get('city', ''))

        prov_matches = (not req_prov) or (req_prov in u_prov or u_prov in req_prov)
        city_matches = (not req_city) or (req_city in u_city or u_city in req_city)

        # Case 1: Province AND City selected -> Must match BOTH
        if req_prov and req_city:
            if prov_matches and city_matches:
                candidate_indices.append(idx)
        # Case 2: Province selected but City NOT selected -> Must match Province
        elif req_prov:
            if prov_matches:
                candidate_indices.append(idx)
        # Case 3: Neither selected -> Include all
        else:
            candidate_indices.append(idx)

    if not candidate_indices:
        return []

    # ── 2. Compute TF-IDF Cosine Similarity Scores (40%) ──────────────────────
    query_str = _build_query_string(field, program)
    if query_str.strip() and _vectorizer is not None and _tfidf_matrix is not None:
        query_vec  = _vectorizer.transform([query_str])
        cos_scores = cosine_similarity(query_vec, _tfidf_matrix).flatten()
    else:
        cos_scores = np.ones(len(_universities))

    # Determine max fee difference across candidates for budget normalization
    all_fees = []
    for idx in candidate_indices:
        fees = [p.get('feePerSemester') for p in (_universities[idx].get('programs') or []) if p.get('feePerSemester')]
        if fees:
            all_fees.extend(fees)
        elif _min_fees and _min_fees[idx]:
            all_fees.append(_min_fees[idx])

    if budget > 0 and all_fees:
        max_diff = max([abs(budget - f) for f in all_fees] + [100_000.0])
    else:
        max_diff = 100_000.0

    results = []
    for idx in candidate_indices:
        uni = _universities[idx]
        cos_sim = float(cos_scores[idx]) if (query_str.strip()) else 1.0

        # Program matching check
        prog_matched = None
        for p in (uni.get('programs') or []):
            p_name = _normalize_string(p.get('name', ''))
            if req_prog and (req_prog in p_name or p_name in req_prog):
                prog_matched = p
                break
            elif req_field and (req_field in p_name or p_name in req_field):
                if not prog_matched:
                    prog_matched = p

        matched_fee = prog_matched.get('feePerSemester') if prog_matched else (_min_fees[idx] if _min_fees else None)

        # ── 3. Continuous Budget Match Score (30%) ─────────────────────────────
        if budget > 0 and matched_fee is not None:
            fee_diff = abs(budget - float(matched_fee))
            budget_s = max(0.0, min(1.0, 1.0 - (fee_diff / max_diff)))
        else:
            budget_s = 1.0

        # ── 4. Location Match Score (10%) ──────────────────────────────────────
        u_prov = _normalize_string(uni.get('province', ''))
        u_city = _normalize_string(uni.get('city', ''))
        
        if req_prov and req_city:
            loc_s = 1.0 if (req_prov in u_prov and req_city in u_city) else 0.8
        elif req_prov:
            loc_s = 1.0 if (req_prov in u_prov) else 0.8
        else:
            loc_s = 1.0

        # ── 5. Sector Match Score (10%) ────────────────────────────────────────
        u_sect = _normalize_string(uni.get('sector', ''))
        if req_sect:
            sector_s = 1.0 if (req_sect in u_sect or u_sect in req_sect) else 0.0
        else:
            sector_s = 1.0

        # ── 6. Facilities Match Score (10%) ────────────────────────────────────
        uni_facs = _extract_uni_facilities(uni)
        matched_facs_count = 0
        matched_facs_names = []
        if req_facs:
            for rf in req_facs:
                match = any((rf in uf or uf in rf) for uf in uni_facs)
                if match:
                    matched_facs_count += 1
                    matched_facs_names.append(rf.title())
            facility_s = matched_facs_count / len(req_facs)
        else:
            facility_s = 1.0

        # ── 7. Final Weighted Score Formula (100% Total) ──────────────────────
        # (0.40 * TF-IDF Sim) + (0.30 * Budget) + (0.10 * Location) + (0.10 * Sector) + (0.10 * Facilities)
        final_score = (
            (0.40 * cos_sim) +
            (0.30 * budget_s) +
            (0.10 * loc_s) +
            (0.10 * sector_s) +
            (0.10 * facility_s)
        )

        # ── 8. Generate Matching Reasons ──────────────────────────────────────
        reasons = []
        
        if prog_matched:
            reasons.append(f"✓ {prog_matched.get('name')} matches your desired field/program")
        elif req_field:
            reasons.append(f"✓ Relevant programs in {field}")

        if budget > 0 and matched_fee:
            fee_val = int(matched_fee)
            if abs(budget - fee_val) <= 15_000:
                reasons.append(f"✓ Budget is close to your selected budget (Rs. {fee_val:,}/sem)")
            elif budget >= fee_val:
                reasons.append(f"✓ Within your budget (Rs. {fee_val:,}/sem)")
            else:
                reasons.append(f"⚡ Semester fee is Rs. {fee_val:,}")

        if uni.get('city') and uni.get('province'):
            reasons.append(f"✓ Located in {uni.get('city')}, {uni.get('province')}")
        elif uni.get('city'):
            reasons.append(f"✓ Located in {uni.get('city')}")

        if uni.get('sector'):
            reasons.append(f"✓ {uni.get('sector')} University")

        if req_facs:
            if matched_facs_count == len(req_facs):
                reasons.append(f"✓ All {len(req_facs)} requested facilities available ({', '.join(matched_facs_names)})")
            elif matched_facs_count > 0:
                reasons.append(f"✓ Offers {matched_facs_count}/{len(req_facs)} requested facilities ({', '.join(matched_facs_names)})")
            else:
                reasons.append("⚡ Does not list requested facilities")

        rating = uni.get('rating', 0)
        if rating >= 4.5:
            reasons.append(f"✓ Top rated institution ({rating}/5)")

        ranking = uni.get('ranking')
        if ranking and ranking <= 10:
            reasons.append(f"✓ Top-10 ranked institution (#{ranking})")

        results.append({
            'score'          : round(final_score * 100, 1),
            'matchPercent'   : min(100, max(1, round(final_score * 100))),
            'scoreBreakdown' : {
                'fieldMatch'      : round(cos_sim, 4),
                'budgetMatch'     : round(budget_s, 4),
                'locationMatch'   : round(loc_s, 4),
                'sectorMatch'     : round(sector_s, 4),
                'facilitiesMatch' : round(facility_s, 4),
            },
            'reasons'        : reasons,
            'cosineSimilarity': round(cos_sim, 4),
            'university' : {
                '_id'          : uni.get('_id'),
                'name'         : uni.get('name'),
                'shortName'    : uni.get('shortName'),
                'city'         : uni.get('city'),
                'province'     : uni.get('province'),
                'sector'       : uni.get('sector'),
                'website'      : uni.get('website'),
                'rating'       : uni.get('rating', 0),
                'ranking'      : ranking,
                'admissionStatus': uni.get('admissionStatus', {}),
                'programs'     : (uni.get('programs') or [])[:5],
            },
            'matchedProgram' : prog_matched.get('name') if prog_matched else (uni.get('programs', [{}])[0].get('name') if uni.get('programs') else None),
            'semesterFee'    : matched_fee,
            'minFee'         : _min_fees[idx] if _min_fees else matched_fee,
        })

    # Sort by final score descending
    results.sort(key=lambda x: x['score'], reverse=True)

    return results[:top_n]


# ─── Self-test ──────────────────────────────────────────────────────────
if __name__ == '__main__':
    print('Running self-test for Karachi...')
    recs = recommend(
        field      = 'Computing & Information Technology',
        program    = 'BS Computer Science',
        budget     = 200_000,
        province   = 'Sindh',
        city       = 'Karachi',
    )
    print(f"Total recommendations for Karachi: {len(recs)}")
    for i, r in enumerate(recs, 1):
        print(f"\n#{i} {r['university']['name']} ({r['university']['city']}, {r['university']['province']}) - {r['score']}%")
        print(f"   Breakdown: {r['scoreBreakdown']}")


