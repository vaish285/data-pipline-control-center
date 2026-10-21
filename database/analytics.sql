-- 1. Total revenue from all orders
SELECT
    SUM(quantity * price_at_order) AS total_revenue
FROM orders;


-- 2. Revenue by product
SELECT
    p.product_name,
    SUM(o.quantity * o.price_at_order) AS revenue
FROM orders o
JOIN products p
    ON o.product_id = p.product_id
GROUP BY p.product_id, p.product_name
ORDER BY revenue DESC;


-- 3. Total orders by customer
SELECT
    c.name,
    COUNT(o.order_id) AS total_orders
FROM customers c
LEFT JOIN orders o
    ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.name
ORDER BY total_orders DESC;


-- 4. Daily order totals
SELECT
    order_date,
    COUNT(*) AS total_orders,
    SUM(quantity * price_at_order) AS daily_revenue
FROM orders
GROUP BY order_date
ORDER BY order_date;


-- 5. Pipeline run history
SELECT
    run_id,
    started_at,
    status,
    records_processed,
    records_rejected,
    error_message
FROM pipeline_runs
ORDER BY run_id DESC;