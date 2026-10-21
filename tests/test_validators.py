import sys
import unittest
from pathlib import Path

sys.path.insert(
    0, str(Path(__file__).resolve().parent.parent / "backend")
)

from validators import validate_order


class TestOrderValidator(unittest.TestCase):

    def test_valid_order(self):
        row = {
            "order_id": "1001",
            "quantity": "2",
            "price_at_order": "500",
            "order_date": "2026-10-01"
        }
        self.assertEqual(validate_order(row), [])

    def test_zero_quantity(self):
        row = {
            "order_id": "1002",
            "quantity": "0",
            "price_at_order": "500",
            "order_date": "2026-10-01"
        }
        self.assertTrue(validate_order(row))

    def test_negative_price(self):
        row = {
            "order_id": "1003",
            "quantity": "1",
            "price_at_order": "-100",
            "order_date": "2026-10-01"
        }
        self.assertTrue(validate_order(row))

    def test_invalid_date(self):
        row = {
            "order_id": "1004",
            "quantity": "1",
            "price_at_order": "500",
            "order_date": "invalid-date"
        }
        self.assertTrue(validate_order(row))


if __name__ == "__main__":
    unittest.main()