"""
app.py — EduNavigator ML Microservice (Flask, port 5001)

Endpoints:
  GET  /health       → liveness check
  POST /recommend    → run ML recommendation
  POST /retrain      → retrain model from MongoDB and reload
"""

import os
import sys
import subprocess
from flask import Flask, request, jsonify
from recommender import recommend, reload_model

app = Flask(__name__)

# ─── Health check ─────────────────────────────────────────────────────────────
@app.get('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'EduNavigator ML Recommender'})


# ─── Recommend ────────────────────────────────────────────────────────────────
@app.post('/recommend')
def recommend_route():
    body = request.get_json(silent=True) or {}

    field      = str(body.get('field',      '')).strip()
    program    = str(body.get('program',    '')).strip()
    sector     = str(body.get('sector',     '')).strip()
    province   = str(body.get('province',   '')).strip()
    city       = str(body.get('city',       '')).strip()
    facilities = body.get('facilities', [])
    top_n      = int(body.get('topN', 10))

    try:
        budget = float(body.get('budget', 0))
    except (TypeError, ValueError):
        budget = 0.0

    try:
        results = recommend(
            field=field, program=program, budget=budget,
            sector=sector, province=province, city=city,
            facilities=facilities, top_n=top_n,
        )
        return jsonify({'success': True, 'count': len(results), 'recommendations': results})
    except FileNotFoundError as e:
        return jsonify({'success': False, 'error': str(e)}), 503
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── Retrain & Reload ──────────────────────────────────────────────────────────
@app.post('/reload')
@app.get('/reload')
def reload_route():
    try:
        reload_model()
        return jsonify({'success': True, 'message': 'Model reloaded from disk successfully.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.post('/retrain')
def retrain_route():
    try:
        env = os.environ.copy()
        env['OPENBLAS_NUM_THREADS'] = '1'
        env['OMP_NUM_THREADS'] = '1'
        env['MKL_NUM_THREADS'] = '1'

        # Re-run train_model.py in a subprocess
        train_script = os.path.join(os.path.dirname(__file__), 'train_model.py')
        result = subprocess.run(
            [sys.executable, train_script],
            capture_output=True, text=True, timeout=120, env=env
        )
        if result.returncode != 0:
            # If training fails, try reloading existing disk artefacts before failing
            try:
                reload_model()
                return jsonify({
                    'success': True,
                    'message': 'Model reloaded existing disk artefacts after subprocess notice.',
                    'warning': result.stderr
                })
            except Exception:
                pass

            return jsonify({
                'success': False,
                'error': result.stderr or 'Training failed'
            }), 500

        # Reload the freshly saved artefacts
        reload_model()
        return jsonify({'success': True, 'message': 'Model retrained and reloaded successfully.'})
    except subprocess.TimeoutExpired:
        return jsonify({'success': False, 'error': 'Training timed out (>120s)'}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ─── Run ─────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('ML_PORT', 5001))
    print(f'EduNavigator ML Microservice starting on port {port} ...')

    # Pre-load model on startup (fail fast if not trained yet)
    try:
        from recommender import _load_model
        _load_model()
        print('[OK] Model loaded successfully.')
    except FileNotFoundError:
        print('[WARN] Model artefacts not found. Run train_model.py first, then restart this service.')

    app.run(host='0.0.0.0', port=port, debug=False)
