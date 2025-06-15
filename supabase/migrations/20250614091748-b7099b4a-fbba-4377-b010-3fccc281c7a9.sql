
-- First, let's add some initial users to the database for testing
INSERT INTO public.users (id, name, email, role, password) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Admin User', 'admin@smartinventory.com', 'admin', 'admin123'),
('550e8400-e29b-41d4-a716-446655440002', 'John Cashier', 'john@smartinventory.com', 'cashier', 'cashier123')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  password = EXCLUDED.password;

-- Add some sample categories with proper UUIDs
INSERT INTO public.categories (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440011', 'Electronics'),
('550e8400-e29b-41d4-a716-446655440012', 'Clothing'),
('550e8400-e29b-41d4-a716-446655440013', 'Groceries'),
('550e8400-e29b-41d4-a716-446655440014', 'Home & Kitchen'),
('550e8400-e29b-41d4-a716-446655440015', 'Beauty & Personal Care')
ON CONFLICT (id) DO NOTHING;

-- Add some initial products for testing with proper UUIDs
INSERT INTO public.products (id, name, description, category, price, stock, threshold) VALUES
('550e8400-e29b-41d4-a716-446655440021', 'Smartphone', 'Latest smartphone model', 'Electronics', 599.99, 25, 5),
('550e8400-e29b-41d4-a716-446655440022', 'T-Shirt', 'Cotton T-shirt', 'Clothing', 19.99, 50, 10),
('550e8400-e29b-41d4-a716-446655440023', 'Coffee Beans', 'Premium coffee beans', 'Groceries', 12.99, 100, 20),
('550e8400-e29b-41d4-a716-446655440024', 'Kitchen Knife', 'Professional kitchen knife', 'Home & Kitchen', 45.99, 15, 3),
('550e8400-e29b-41d4-a716-446655440025', 'Shampoo', 'Organic shampoo', 'Beauty & Personal Care', 8.99, 30, 8)
ON CONFLICT (id) DO NOTHING;

-- Create a settings table for admin configurations
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (key, value, description) VALUES
('site_name', 'Smart Inventory Management', 'The name of the application'),
('company_name', 'Smart Inventory', 'Company name for branding'),
('low_stock_threshold_multiplier', '0.5', 'Multiplier for critical stock alerts')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- Enable RLS on settings table
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for settings (only admins can manage)
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Only admins can modify settings" ON public.settings FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
