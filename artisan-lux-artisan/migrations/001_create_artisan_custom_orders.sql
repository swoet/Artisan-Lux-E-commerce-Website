-- Artisan Portal Custom Orders System
-- Separate tables from main site custom_orders to avoid conflicts

-- Create artisan_custom_orders table
CREATE TABLE IF NOT EXISTS artisan_custom_orders (
  id SERIAL PRIMARY KEY,
  artisan_id INTEGER REFERENCES artisans(id),
  customer_id INTEGER REFERENCES customers(id),
  base_product_id INTEGER REFERENCES products(id),
  title VARCHAR(200),
  description TEXT,
  budget_min NUMERIC(12, 2),
  budget_max NUMERIC(12, 2),
  desired_completion_date TIMESTAMP,
  preferred_materials TEXT[],
  reference_images TEXT[],
  quoted_price NUMERIC(12, 2),
  estimated_completion_date TIMESTAMP,
  quote_notes TEXT,
  quoted_at TIMESTAMP,
  total_price NUMERIC(12, 2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'draft', 'quoted', 'accepted', 'in_production', 'completed', 'delivered', 'cancelled')),
  accepted_at TIMESTAMP,
  production_started_at TIMESTAMP,
  completed_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create artisan_custom_order_messages table
CREATE TABLE IF NOT EXISTS artisan_custom_order_messages (
  id SERIAL PRIMARY KEY,
  custom_order_id INTEGER REFERENCES artisan_custom_orders(id) NOT NULL,
  sender_id INTEGER NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('artisan', 'customer')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create artisan_production_stages table
CREATE TABLE IF NOT EXISTS artisan_production_stages (
  id SERIAL PRIMARY KEY,
  custom_order_id INTEGER REFERENCES artisan_custom_orders(id) NOT NULL,
  stage VARCHAR(50) NOT NULL,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_artisan_custom_orders_artisan_id ON artisan_custom_orders(artisan_id);
CREATE INDEX IF NOT EXISTS idx_artisan_custom_orders_customer_id ON artisan_custom_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_artisan_custom_orders_status ON artisan_custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_artisan_custom_order_messages_order_id ON artisan_custom_order_messages(custom_order_id);
CREATE INDEX IF NOT EXISTS idx_artisan_production_stages_order_id ON artisan_production_stages(custom_order_id);
