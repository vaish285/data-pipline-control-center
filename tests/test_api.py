import sys
from pathlib import Path

from fastapi.testclient import TestClient

PROJECT_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_DIR / "backend"))

from main import app

client = TestClient(app)


def test_home_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_summary_endpoint():
    response = client.get("/summary")
    assert response.status_code == 200
    data = response.json()
    assert "customers_count" in data
    assert "orders_count" in data


def test_pipeline_runs_endpoint():
    response = client.get("/pipeline-runs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_rejected_orders_endpoint():
    response = client.get("/rejected-orders")
    assert response.status_code == 200
    assert isinstance(response.json(), list)