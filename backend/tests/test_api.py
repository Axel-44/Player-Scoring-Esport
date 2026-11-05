"""
backend/tests/test_api.py
Pengujian otomatis menggunakan pytest dan FastAPI TestClient.
Mencakup:
1. Health check & model metadata endpoints (/health, /model/metrics, /model/feature-importance)
2. Inferensi skor dengan input valid (/predict, /predict/batch)
3. Validasi kegagalan pada input di luar rentang realistis (headshot > 100, rank < 1, rank > 100, nilai negatif, tier tidak valid)
4. Validasi penolakan ketika terdapat field yang hilang (missing fields)
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Pastikan backend dan app dapat diimport dengan benar
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.core.model_loader import model_service
from app.main import app

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_environment():
    """Memastikan artefak model termuat untuk seluruh suite pengujian."""
    if not model_service.is_loaded():
        model_service.load_artifacts()
    yield


# ==========================================
# 1. Health Check & Root Endpoints
# ==========================================

def test_root_endpoint():
    """Menguji endpoint root / mengembalikan status 200 dan pesan sambutan."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert "documentation" in data


def test_health_check_endpoint():
    """Menguji endpoint /health mengembalikan status ok dan model terbukti termuat."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert "version" in data


# ==========================================
# 2. Model Information Endpoints
# ==========================================

def test_get_model_metrics():
    """Menguji endpoint /model/metrics menyajikan metrik R2 >= 0.85, RMSE, dan MAE."""
    response = client.get("/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["model_name"] == "XGBRegressor"
    assert data["r2_score"] >= 0.85
    assert data["rmse"] > 0
    assert data["mae"] > 0
    assert data["target_met"] is True
    assert "best_params" in data
    assert "learning_rate" in data["best_params"]


def test_get_feature_importance():
    """Menguji endpoint /model/feature-importance mengembalikan daftar fitur dan nilai kontribusinya."""
    response = client.get("/model/feature-importance")
    assert response.status_code == 200
    data = response.json()
    assert "feature_importances" in data
    items = data["feature_importances"]
    assert len(items) > 0
    
    # Verifikasi elemen pertama adalah dictionary dengan field feature dan importance
    first_item = items[0]
    assert "feature" in first_item
    assert "importance" in first_item
    assert isinstance(first_item["importance"], (int, float))


# ==========================================
# 3. Predict Endpoint - Input Valid
# ==========================================

def test_predict_single_player_valid():
    """Menguji /predict dengan data statistik pemain valid."""
    payload = {
        "tier": "Crown",
        "kills": 6,
        "damage_dealt": 650.0,
        "survival_time_minutes": 25.0,
        "headshot_percentage": 35.0,
        "assists": 3,
        "revives": 2,
        "distance_travelled_km": 5.8,
        "longest_kill_meters": 180.5,
        "heals_used": 4,
        "boosts_used": 5,
        "match_rank": 5
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "player_score" in data
    assert "score_category" in data
    assert 0.0 <= data["player_score"] <= 100.0
    assert data["score_category"] in ["Rendah", "Menengah", "Tinggi", "Elite"]


def test_predict_single_player_elite():
    """Menguji /predict dengan statistik performa tinggi (Conqueror, Rank 1, Kill tinggi)."""
    payload = {
        "tier": "Conqueror",
        "kills": 15,
        "damage_dealt": 1500.0,
        "survival_time_minutes": 30.0,
        "headshot_percentage": 50.0,
        "assists": 5,
        "revives": 3,
        "distance_travelled_km": 8.5,
        "longest_kill_meters": 320.0,
        "heals_used": 6,
        "boosts_used": 8,
        "match_rank": 1
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["player_score"] >= 60.0  # Skor harus berada di kategori Tinggi atau Elite


def test_predict_single_player_low():
    """Menguji /predict dengan statistik performa rendah (Bronze, Rank 98, 0 Kill)."""
    payload = {
        "tier": "Bronze",
        "kills": 0,
        "damage_dealt": 20.0,
        "survival_time_minutes": 2.5,
        "headshot_percentage": 0.0,
        "assists": 0,
        "revives": 0,
        "distance_travelled_km": 0.5,
        "longest_kill_meters": 0.0,
        "heals_used": 0,
        "boosts_used": 0,
        "match_rank": 98
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["player_score"] <= 40.0
    assert data["score_category"] == "Rendah"


# ==========================================
# 4. Predict Endpoint - Input Di Luar Rentang (Edge Cases)
# ==========================================

@pytest.mark.parametrize("invalid_field, invalid_value", [
    ("headshot_percentage", 101.5),  # Melebihi 100%
    ("headshot_percentage", -1.0),   # Negatif
    ("match_rank", 0),               # Di bawah 1
    ("match_rank", 101),             # Di atas 100
    ("kills", -5),                   # Kills negatif
    ("damage_dealt", -10.0),         # Damage negatif
    ("survival_time_minutes", -2.0), # Survival negatif
    ("tier", "Grandmaster"),         # Tier tidak ada dalam daftar resmi PUBG Mobile
    ("tier", "Iron"),                # Tier game lain
])
def test_predict_out_of_range_rejected(invalid_field, invalid_value):
    """Menguji validasi Pydantic menolak input dengan nilai di luar rentang realistis (HTTP 422)."""
    payload = {
        "tier": "Gold",
        "kills": 3,
        "damage_dealt": 350.0,
        "survival_time_minutes": 18.0,
        "headshot_percentage": 20.0,
        "assists": 1,
        "revives": 1,
        "distance_travelled_km": 4.2,
        "longest_kill_meters": 75.0,
        "heals_used": 3,
        "boosts_used": 2,
        "match_rank": 25
    }
    payload[invalid_field] = invalid_value

    response = client.post("/predict", json=payload)
    assert response.status_code == 422  # Unprocessable Entity
    error_detail = response.json()
    assert "detail" in error_detail


# ==========================================
# 5. Predict Endpoint - Field Kurang (Missing Fields)
# ==========================================

@pytest.mark.parametrize("missing_field", [
    "tier",
    "kills",
    "damage_dealt",
    "match_rank",
    "survival_time_minutes",
    "headshot_percentage"
])
def test_predict_missing_fields_rejected(missing_field):
    """Menguji validasi Pydantic menolak request jika ada field wajib yang kurang (HTTP 422)."""
    payload = {
        "tier": "Diamond",
        "kills": 4,
        "damage_dealt": 420.0,
        "survival_time_minutes": 20.0,
        "headshot_percentage": 25.0,
        "assists": 2,
        "revives": 1,
        "distance_travelled_km": 5.0,
        "longest_kill_meters": 110.0,
        "heals_used": 2,
        "boosts_used": 3,
        "match_rank": 15
    }
    del payload[missing_field]

    response = client.post("/predict", json=payload)
    assert response.status_code == 422
    assert "detail" in response.json()


def test_predict_empty_payload_rejected():
    """Menguji payload kosong ditolak dengan HTTP 422."""
    response = client.post("/predict", json={})
    assert response.status_code == 422


# ==========================================
# 6. Batch Predict Endpoint
# ==========================================

def test_predict_batch_valid():
    """Menguji /predict/batch memproses beberapa pemain sekaligus dengan tepat."""
    batch_payload = {
        "players": [
            {
                "tier": "Ace",
                "kills": 8,
                "damage_dealt": 850.0,
                "survival_time_minutes": 27.0,
                "headshot_percentage": 40.0,
                "assists": 4,
                "revives": 2,
                "distance_travelled_km": 6.5,
                "longest_kill_meters": 220.0,
                "heals_used": 5,
                "boosts_used": 6,
                "match_rank": 3
            },
            {
                "tier": "Silver",
                "kills": 1,
                "damage_dealt": 120.0,
                "survival_time_minutes": 8.0,
                "headshot_percentage": 10.0,
                "assists": 0,
                "revives": 0,
                "distance_travelled_km": 1.5,
                "longest_kill_meters": 35.0,
                "heals_used": 1,
                "boosts_used": 0,
                "match_rank": 65
            }
        ]
    }
    response = client.post("/predict/batch", json=batch_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["predictions"]) == 2
    for pred in data["predictions"]:
        assert "player_score" in pred
        assert "score_category" in pred
        assert 0.0 <= pred["player_score"] <= 100.0


def test_predict_batch_empty():
    """Menguji /predict/batch dengan array kosong mengembalikan total 0."""
    response = client.post("/predict/batch", json={"players": []})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["predictions"] == []


def test_predict_batch_with_invalid_element():
    """Menguji /predict/batch ditolak jika salah satu pemain memiliki nilai tidak valid."""
    batch_payload = {
        "players": [
            {
                "tier": "Platinum",
                "kills": 4,
                "damage_dealt": 400.0,
                "survival_time_minutes": 20.0,
                "headshot_percentage": 25.0,
                "assists": 2,
                "revives": 1,
                "distance_travelled_km": 4.0,
                "longest_kill_meters": 90.0,
                "heals_used": 2,
                "boosts_used": 2,
                "match_rank": 20
            },
            {
                "tier": "Platinum",
                "kills": 4,
                "damage_dealt": 400.0,
                "survival_time_minutes": 20.0,
                "headshot_percentage": 150.0,  # INVALID: > 100%
                "assists": 2,
                "revives": 1,
                "distance_travelled_km": 4.0,
                "longest_kill_meters": 90.0,
                "heals_used": 2,
                "boosts_used": 2,
                "match_rank": 20
            }
        ]
    }
    response = client.post("/predict/batch", json=batch_payload)
    assert response.status_code == 422
