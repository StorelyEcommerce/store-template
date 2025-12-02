-- Stores
CREATE TABLE stores (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  primary_domain TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'inactive'
  theme_config TEXT NOT NULL, -- JSON string
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Products
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);
CREATE INDEX idx_products_store_id ON products(store_id);

-- Orders
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  status TEXT NOT NULL, -- 'pending', 'paid', 'cancelled'
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  shipping_address TEXT, -- JSON string with name, line1, line2, city, state, postalCode, country
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);
CREATE INDEX idx_orders_store_id ON orders(store_id);
CREATE INDEX idx_orders_stripe_session ON orders(stripe_checkout_session_id);

-- Order Items
CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Payments
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL, -- 'requires_payment', 'succeeded', 'failed', 'refunded'
  stripe_payment_intent_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (order_id) REFERENCES orders(id)
);
CREATE INDEX idx_payments_store_id ON payments(store_id);
CREATE INDEX idx_payments_order_id ON payments(order_id);

-- Users (Admins)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL, -- 'platform_admin', 'store_admin', 'customer'
  store_id TEXT, -- Null for platform_admin
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_users_store_id ON users(store_id);

-- API Keys
CREATE TABLE api_keys (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  last_used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);
CREATE INDEX idx_api_keys_store_id ON api_keys(store_id);

-- Webhook Endpoints
CREATE TABLE webhook_endpoints (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  url TEXT NOT NULL,
  secret TEXT NOT NULL,
  event_types TEXT NOT NULL, -- JSON array of strings
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);
CREATE INDEX idx_webhook_endpoints_store_id ON webhook_endpoints(store_id);

-- Webhook Events (Log)
CREATE TABLE webhook_events (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload TEXT NOT NULL, -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (store_id) REFERENCES stores(id)
);
CREATE INDEX idx_webhook_events_store_id ON webhook_events(store_id);
