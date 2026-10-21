import sqlite3
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT_DIR / "database" / "pipeline.db"


def generate_quality_report():
    with sqlite3.connect(DB_PATH) as connection:
        total_orders = connection.execute(
            "SELECT COUNT(*) FROM orders"
        ).fetchone()[0]

        rejected_orders = connection.execute(
            "SELECT COUNT(*) FROM rejected_orders"
        ).fetchone()[0]

        rejection_reasons = connection.execute(
            """
            SELECT rejection_reason, COUNT(*) AS total
            FROM rejected_orders
            GROUP BY rejection_reason
            ORDER BY total DESC
            """
        ).fetchall()

        missing_customers = connection.execute(
            """
            SELECT COUNT(*)
            FROM orders o
            LEFT JOIN customers c
                ON o.customer_id = c.customer_id
            WHERE c.customer_id IS NULL
            """
        ).fetchone()[0]

        missing_products = connection.execute(
            """
            SELECT COUNT(*)
            FROM orders o
            LEFT JOIN products p
                ON o.product_id = p.product_id
            WHERE p.product_id IS NULL
            """
        ).fetchone()[0]

    print("\n===== DATA QUALITY REPORT =====")
    print(f"Valid orders in database: {total_orders}")
    print(f"Rejected records recorded: {rejected_orders}")
    print(f"Orders with missing customers: {missing_customers}")
    print(f"Orders with missing products: {missing_products}")

    print("\nRejection reasons:")
    if rejection_reasons:
        for reason, count in rejection_reasons:
            print(f"- {reason}: {count}")
    else:
        print("- No rejected records recorded")

    print("===============================\n")


if __name__ == "__main__":
    generate_quality_report()