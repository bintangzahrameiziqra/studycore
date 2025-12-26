from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import numpy as np

from model import MLService

app = Flask(__name__)
CORS(app)

# muat dataset & latih model saat startup
ml = MLService()

# ------------- Sanitizer biar JSON gak muntah -------------
def json_sanitize(obj):
    """Ubah np.* ke tipe Python, hilangkan NaN/Inf agar aman untuk jsonify."""
    if obj is None:
        return None
    if isinstance(obj, (np.floating,)):
        val = float(obj)
        return val if math.isfinite(val) else None
    if isinstance(obj, (np.integer,)):
        return int(obj)
    if isinstance(obj, float):
        return obj if math.isfinite(obj) else None
    if isinstance(obj, dict):
        return {k: json_sanitize(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [json_sanitize(v) for v in obj]
    return obj

# ------------------- Endpoint existing --------------------

@app.route("/api/metrics", methods=["GET"])
def metrics():
    return jsonify(json_sanitize(ml.get_metrics()))

@app.route("/api/predict", methods=["POST"])
def predict():
    payload = request.get_json(force=True) or {}
    predicted = ml.predict_price(payload)
    return jsonify(json_sanitize({"predicted_price": float(predicted)}))

@app.route("/api/recommend", methods=["POST"])
def recommend():
    payload = request.get_json(force=True) or {}
    recs = ml.recommend(payload)
    return jsonify(json_sanitize(recs))

@app.route("/api/compare", methods=["POST"])
def compare():
    payload = request.get_json(force=True) or {}
    a = ml.predict_price(payload.get("a", {}))
    b = ml.predict_price(payload.get("b", {}))
    return jsonify(json_sanitize({
        "a": {"predicted_price": float(a)},
        "b": {"predicted_price": float(b)},
        "diff": float(abs(a - b))
    }))

# ----------------------- CRUD Dataset ----------------------

# READ list
@app.route("/api/laptops", methods=["GET"])
def list_laptops():
    """
    Query params:
      - limit (default 50)
      - offset (default 0)
    """
    try:
        limit = int(request.args.get("limit", 50))
        offset = int(request.args.get("offset", 0))
    except Exception:
        limit, offset = 50, 0
    items = ml.list_laptops(limit=limit, offset=offset)
    return jsonify(json_sanitize(items)), 200

# READ detail
@app.route("/api/laptops/<int:item_id>", methods=["GET"])
def get_laptop(item_id: int):
    item = ml.get_laptop(item_id)
    if not item:
        return jsonify({"error": "Not found"}), 404
    return jsonify(json_sanitize(item)), 200

# CREATE
@app.route("/api/laptops", methods=["POST"])
def create_laptop():
    """
    Body JSON (contoh):
    {
      "name": "ASUS TUF A15",
      "brand": "ASUS",
      "cpu": "Ryzen 7 4800H",
      "ram_gb": 16,
      "storage_gb": 512,
      "gpu": "NVIDIA RTX 3050",
      "color_gamut": 100,
      "price": 14500000
    }
    """
    payload = request.get_json(force=True) or {}
    item = ml.create_laptop(payload)
    return jsonify(json_sanitize(item)), 201

# UPDATE (full/partial)
@app.route("/api/laptops/<int:item_id>", methods=["PUT", "PATCH"])
def update_laptop(item_id: int):
    payload = request.get_json(force=True) or {}
    item = ml.update_laptop(item_id, payload)
    if not item:
        return jsonify({"error": "Not found"}), 404
    return jsonify(json_sanitize(item)), 200

# DELETE
@app.route("/api/laptops/<int:item_id>", methods=["DELETE"])
def delete_laptop(item_id: int):
    ok = ml.delete_laptop(item_id)
    if not ok:
        return jsonify({"error": "Not found"}), 404
    return jsonify({"ok": True}), 200

# ---------------------- Run server -------------------------

if __name__ == "__main__":
    # Jalankan di 0.0.0.0:5000
    app.run(host="0.0.0.0", port=5000)