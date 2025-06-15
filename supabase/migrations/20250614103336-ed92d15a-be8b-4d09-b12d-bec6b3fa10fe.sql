
-- Remove old admin users with a non-UUID id by matching on UNIQUE fields like email
-- (Replace 'admin@email.com' with the actual email if different)

DELETE FROM public.users WHERE email = 'admin@email.com' AND id::text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- Alternative: If the email isn't unique, use name and role
-- DELETE FROM public.users WHERE name = 'Admin User' AND role = 'admin' AND id::text !~* UUID_REGEX_HERE;

-- After running this, there should be only valid UUID-based admin users in your users table.
