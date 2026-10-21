from datetime import date


def validate_order(row):
    errors = []

    order_id = row.get("order_id", "").strip()
    if not order_id.isdigit():
        errors.append("Invalid order ID")

    try:
        quantity = int(row.get("quantity", ""))
        if quantity <= 0:
            errors.append("Quantity must be greater than zero")
    except ValueError:
        errors.append("Quantity must be an integer")

    try:
        price = float(row.get("price_at_order", ""))
        if price <= 0:
            errors.append("Price must be greater than zero")
    except ValueError:
        errors.append("Price must be a number")

    try:
        date.fromisoformat(row.get("order_date", ""))
    except ValueError:
        errors.append("Invalid order date")

    return errors