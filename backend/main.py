import sqlite3
import subprocess
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import DB_PATH

app = FastAPI(title="Data Pipeline Control Center")

# Allow the React + Vite frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROJECT_DIR = Path(__file__).resolve().parent.parent
PIPELINE_PATH = PROJECT_DIR / "backend" / "pipeline.py"


def get_connection():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    return connection


@app.get("/")
def home():
    return {
        "message": "Data Pipeline Control Center API is running"
    }


@app.get("/health")
def health_check():
    try:
        with get_connection() as connection:
            connection.execute("SELECT 1")

        return {
            "status": "healthy",
            "database": "connected",
        }
    except sqlite3.Error:
        return {
            "status": "unhealthy",
            "database": "error",
        }


@app.get("/customers")
def get_customers():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM customers ORDER BY customer_id"
        ).fetchall()

        return [dict(row) for row in rows]


@app.get("/products")
def get_products():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM products ORDER BY product_id"
        ).fetchall()

        return [dict(row) for row in rows]


@app.get("/orders")
def get_orders():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM orders ORDER BY order_id"
        ).fetchall()

        return [dict(row) for row in rows]


@app.get("/rejected-orders")
def get_rejected_orders():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM rejected_orders ORDER BY rejection_id DESC"
        ).fetchall()

        return [dict(row) for row in rows]


@app.get("/pipeline-runs")
def get_pipeline_runs():
    with get_connection() as connection:
        rows = connection.execute(
            "SELECT * FROM pipeline_runs ORDER BY run_id DESC"
        ).fetchall()

        return [dict(row) for row in rows]


@app.get("/summary")
def get_summary():
    with get_connection() as connection:
        customers = connection.execute(
            "SELECT COUNT(*) FROM customers"
        ).fetchone()[0]

        products = connection.execute(
            "SELECT COUNT(*) FROM products"
        ).fetchone()[0]

        orders = connection.execute(
            "SELECT COUNT(*) FROM orders"
        ).fetchone()[0]

        rejected = connection.execute(
            "SELECT COUNT(*) FROM rejected_orders"
        ).fetchone()[0]

        runs = connection.execute(
            "SELECT COUNT(*) FROM pipeline_runs"
        ).fetchone()[0]

    return {
        "customers_count": customers,
        "products_count": products,
        "orders_count": orders,
        "rejected_orders_count": rejected,
        "pipeline_runs_count": runs,
    }


@app.post("/run-pipeline")
def trigger_pipeline():
    try:
        result = subprocess.run(
            [sys.executable, str(PIPELINE_PATH)],
            cwd=PROJECT_DIR,
            capture_output=True,
            text=True,
            timeout=120,
        )

    except subprocess.TimeoutExpired:
        raise HTTPException(
            status_code=504,
            detail="Pipeline execution timed out",
        )

    if result.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail=(
                result.stderr
                or result.stdout
                or "Pipeline failed"
            ),
        )

    return {
        "message": "Pipeline execution finished",
        "output": result.stdout,
    }