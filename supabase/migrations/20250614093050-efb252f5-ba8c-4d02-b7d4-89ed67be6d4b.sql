
-- 1. Delete all records from products (inventory)
DELETE FROM public.products;

-- 2. Enable RLS on the products table if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Create a helper function to check for admin role, if not already exists
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 4. Allow only admin to insert into products (now using WITH CHECK)
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (public.is_admin());

-- 5. Allow all users to select products (optional; remove if you want to restrict read access)
CREATE POLICY "Anyone can select products"
ON public.products
FOR SELECT
USING (true);

-- Optionally, you may also want to restrict UPDATE/DELETE to admins only:
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (public.is_admin());
