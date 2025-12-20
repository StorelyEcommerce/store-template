-- =====================================================
-- SAMPLE DATA - CUSTOMIZE FOR YOUR STORE THEME
-- =====================================================
-- 
-- IMPORTANT: Modify this seed data to match your store's theme/niche!
-- 
-- For example:
--   Fishing Store: Products like fishing rods, tackle boxes, lures
--   Fashion Boutique: Dresses, accessories, shoes
--   Tech Store: Gadgets, electronics, accessories
--
-- Always include:
--   1. At least 1 sample product with a realistic name, description, price
--   2. An image_url from Unsplash that matches your product type
--   3. Appropriate theme_config that matches your store's brand
--
-- =====================================================

-- Seed Stores
-- Customize the theme_config with your store's name, colors, and hero text
INSERT INTO stores (id, slug, status, theme_config) VALUES
('store_01', 'demo-store', 'active', '{"primaryColor":"#2563eb","secondaryColor":"#1e40af","backgroundColor":"#f8fafc","layoutVariant":"classic","homepageHero":{"title":"Welcome to Our Store","subtitle":"Discover quality products curated just for you","ctaLabel":"Shop Now"}}');

-- Seed Products
-- IMPORTANT: Create at least 1 product that matches your store theme!
-- Include: title, description, price_cents (in cents), currency, image_url, stock
INSERT INTO products (id, store_id, title, description, price_cents, currency, image_url, stock) VALUES
('prod_01', 'store_01', 'Premium Product', 'A high-quality product that showcases what your store offers. This sample product demonstrates how products appear on your shop page.', 4999, 'usd', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 50);

-- Seed Users
INSERT INTO users (id, email, role, store_id) VALUES
('user_01', 'admin@platform.com', 'platform_admin', NULL),
('user_02', 'admin@demo.com', 'store_admin', 'store_01');
