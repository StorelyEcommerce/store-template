-- Seed Stores
INSERT INTO stores (id, slug, status, theme_config) VALUES
('store_01', 'demo-store', 'active', '{"primaryColor":"#2563eb","secondaryColor":"#1e40af","backgroundColor":"#f8fafc","layoutVariant":"classic","homepageHero":{"title":"Demo Store","subtitle":"The best demo products","ctaLabel":"Shop Now"}}');

-- Seed Products
INSERT INTO products (id, store_id, title, description, price_cents, currency, stock) VALUES
('prod_01', 'store_01', 'Classic T-Shirt', 'A comfortable cotton t-shirt', 2500, 'usd', 100),
('prod_02', 'store_01', 'Denim Jeans', 'High quality denim jeans', 6000, 'usd', 50),
('prod_03', 'store_01', 'Sneakers', 'Running sneakers', 8500, 'usd', 30);

-- Seed Users
INSERT INTO users (id, email, role, store_id) VALUES
('user_01', 'admin@platform.com', 'platform_admin', NULL),
('user_02', 'admin@demo.com', 'store_admin', 'store_01');
