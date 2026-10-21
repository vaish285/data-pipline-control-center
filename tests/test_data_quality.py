import sqlite3
import unittest
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT_DIR / "database" / "pipeline.db"


class TestDataQuality(unittest.TestCase):

    def setUp(self):
        self.connection = sqlite3.connect(DB_PATH)
        self.connection.execute("PRAGMA foreign_keys = ON")

    def tearDown(self):
        self.connection.close()

    def test_customer_ids_are_unique(self):
        duplicates = self.connection.execute(
            """
            SELECT customer_id, COUNT(*)
            FROM customers
            GROUP BY customer_id
            HAVING COUNT(*) > 1
            """
        ).fetchall()

        self.assertEqual(duplicates, [])

    def test_product_ids_are_unique(self):
        duplicates = self.connection.execute(
            """
            SELECT product_id, COUNT(*)
            FROM products
            GROUP BY product_id
            HAVING COUNT(*) > 1
            """
        ).fetchall()

        self.assertEqual(duplicates, [])

    def test_order_quantities_are_positive(self):
        invalid_orders = self.connection.execute(
            "SELECT order_id FROM orders WHERE quantity <= 0"
        ).fetchall()

        self.assertEqual(invalid_orders, [])

    def test_order_prices_are_positive(self):
        invalid_orders = self.connection.execute(
            "SELECT order_id FROM orders WHERE price_at_order <= 0"
        ).fetchall()

        self.assertEqual(invalid_orders, [])

    def test_orders_have_valid_customers(self):
        invalid_orders = self.connection.execute(
            """
            SELECT o.order_id
            FROM orders o
            LEFT JOIN customers c
                ON o.customer_id = c.customer_id
            WHERE c.customer_id IS NULL
            """
        ).fetchall()

        self.assertEqual(invalid_orders, [])

    def test_orders_have_valid_products(self):
        invalid_orders = self.connection.execute(
            """
            SELECT o.order_id
            FROM orders o
            LEFT JOIN products p
                ON o.product_id = p.product_id
            WHERE p.product_id IS NULL
            """
        ).fetchall()

        self.assertEqual(invalid_orders, [])


if __name__ == "__main__":
    unittest.main()