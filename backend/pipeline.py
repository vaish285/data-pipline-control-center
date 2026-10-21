import csv
import json
import logging
import sqlite3
import time
from pathlib import Path

from db import DB_PATH
from validators import validate_order

PROJECT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_DIR / "data"
LOG_DIR = PROJECT_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "pipeline.log", encoding="utf-8"),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)


def load_customers(connection):
    count = 0

    with open(
        DATA_DIR / "customers.csv",
        newline="",
        encoding="utf-8",
    ) as file:
        for row in csv.DictReader(file):
            connection.execute(
                """
                INSERT OR IGNORE INTO customers
                    (customer_id, name, email, city)
                VALUES (?, ?, ?, ?)
                """,
                (
                    row["customer_id"],
                    row["name"],
                    row["email"],
                    row["city"],
                ),
            )
            count += 1

    logger.info("Customer rows read: %s", count)
    return count


def load_products(connection):
    count = 0

    with open(
        DATA_DIR / "products.csv",
        newline="",
        encoding="utf-8",
    ) as file:
        for row in csv.DictReader(file):
            connection.execute(
                """
                INSERT OR IGNORE INTO products
                    (product_id, product_name, current_price, category)
                VALUES (?, ?, ?, ?)
                """,
                (
                    row["product_id"],
                    row["product_name"],
                    row["current_price"],
                    row["category"],
                ),
            )
            count += 1

    logger.info("Product rows read: %s", count)
    return count


def reject_order(connection, row, reason):
    order_id = row.get("order_id", "").strip()

    connection.execute(
        """
        INSERT INTO rejected_orders
            (order_id, order_data, rejection_reason)
        VALUES (?, ?, ?)
        """,
        (
            int(order_id) if order_id.isdigit() else None,
            json.dumps(row),
            reason,
        ),
    )

    logger.warning(
        "Rejected order %s: %s",
        order_id or "unknown",
        reason,
    )


def load_orders(connection):
    processed = 0
    rejected = 0
    duplicates = 0
    inserted = 0

    with open(
        DATA_DIR / "orders.csv",
        newline="",
        encoding="utf-8",
    ) as file:
        for row in csv.DictReader(file):
            processed += 1
            errors = validate_order(row)

            if errors:
                reject_order(connection, row, "; ".join(errors))
                rejected += 1
                continue

            try:
                order_id = int(row["order_id"])

                existing = connection.execute(
                    "SELECT 1 FROM orders WHERE order_id = ?",
                    (order_id,),
                ).fetchone()

                if existing:
                    duplicates += 1
                    logger.info("Skipped existing order %s", order_id)
                    continue

                connection.execute(
                    """
                    INSERT INTO orders
                        (order_id, customer_id, product_id,
                         quantity, price_at_order, order_date)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        order_id,
                        int(row["customer_id"]),
                        int(row["product_id"]),
                        int(row["quantity"]),
                        float(row["price_at_order"]),
                        row["order_date"],
                    ),
                )
                inserted += 1

            except (sqlite3.IntegrityError, ValueError) as error:
                reject_order(connection, row, str(error))
                rejected += 1

    return {
        "processed": processed,
        "rejected": rejected,
        "duplicates": duplicates,
        "inserted": inserted,
    }


def run_pipeline():
    started = time.perf_counter()
    connection = sqlite3.connect(DB_PATH)
    connection.execute("PRAGMA foreign_keys = ON")

    cursor = connection.execute(
        "INSERT INTO pipeline_runs (status) VALUES ('running')"
    )
    run_id = cursor.lastrowid
    connection.commit()

    logger.info("Starting pipeline run %s", run_id)

    try:
        customer_rows = load_customers(connection)
        product_rows = load_products(connection)
        order_stats = load_orders(connection)

        connection.commit()

        duration = round(time.perf_counter() - started, 2)

        connection.execute(
            """
            UPDATE pipeline_runs
            SET finished_at = CURRENT_TIMESTAMP,
                status = 'success',
                records_processed = ?,
                records_rejected = ?
            WHERE run_id = ?
            """,
            (
                order_stats["processed"],
                order_stats["rejected"],
                run_id,
            ),
        )
        connection.commit()

        logger.info(
            "Run %s completed | customers_read=%s | products_read=%s "
            "| orders_processed=%s | orders_inserted=%s "
            "| orders_rejected=%s | duplicates=%s | duration=%ss",
            run_id,
            customer_rows,
            product_rows,
            order_stats["processed"],
            order_stats["inserted"],
            order_stats["rejected"],
            order_stats["duplicates"],
            duration,
        )

        print(
            json.dumps(
                {
                    "run_id": run_id,
                    "status": "success",
                    "customers_read": customer_rows,
                    "products_read": product_rows,
                    "orders_processed": order_stats["processed"],
                    "orders_inserted": order_stats["inserted"],
                    "orders_rejected": order_stats["rejected"],
                    "duplicates_skipped": order_stats["duplicates"],
                    "duration_seconds": duration,
                },
                indent=2,
            )
        )

    except Exception as error:
        connection.rollback()

        connection.execute(
            """
            UPDATE pipeline_runs
            SET finished_at = CURRENT_TIMESTAMP,
                status = 'failed',
                error_message = ?
            WHERE run_id = ?
            """,
            (str(error), run_id),
        )
        connection.commit()

        logger.exception("Pipeline run %s failed", run_id)
        raise

    finally:
        connection.close()


if __name__ == "__main__":
    run_pipeline()