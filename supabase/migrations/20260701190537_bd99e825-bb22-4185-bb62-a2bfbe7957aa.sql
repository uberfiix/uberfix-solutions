
-- 1. Restrict branches & technicians read to authenticated users (hides phone from anon)
DROP POLICY IF EXISTS "Branches are publicly readable" ON public.branches;
CREATE POLICY "Authenticated users can view branches"
  ON public.branches FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.branches FROM anon;

DROP POLICY IF EXISTS "Active technicians are publicly readable" ON public.technicians;
CREATE POLICY "Authenticated users can view active technicians"
  ON public.technicians FOR SELECT TO authenticated USING (is_active = true);
REVOKE SELECT ON public.technicians FROM anon;

-- 2. Profiles.status + rate limit + hardened order-create policy
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active','suspended','banned'));

CREATE OR REPLACE FUNCTION public.check_request_rate_limit(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*) < 10
  FROM public.service_orders
  WHERE requested_by = _user_id
    AND created_at > NOW() - INTERVAL '1 hour';
$$;
REVOKE EXECUTE ON FUNCTION public.check_request_rate_limit(UUID) FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.service_orders;
CREATE POLICY "Active users can create orders"
  ON public.service_orders FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND requested_by = auth.uid()
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
  );

-- 3. DELETE policies
CREATE POLICY "Users can delete their own pending orders"
  ON public.service_orders FOR DELETE TO authenticated
  USING (requested_by = auth.uid() AND status IN ('pending','cancelled'));

CREATE POLICY "Users can delete their own recent reviews"
  ON public.reviews FOR DELETE TO authenticated
  USING (reviewer_id = auth.uid() AND created_at > NOW() - INTERVAL '24 hours');

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE TO authenticated
  USING (id = auth.uid());

-- 4. Harden handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', '');
  IF LENGTH(user_name) > 100 THEN
    user_name := LEFT(user_name, 100);
  END IF;
  user_name := REGEXP_REPLACE(user_name, '[^\w\s\-''\u0600-\u06FF]', '', 'g');
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NULLIF(user_name, ''));
  RETURN NEW;
END;
$$;

-- 5. Drop unused spatial_ref_sys views (SECURITY DEFINER wrappers)
DROP VIEW IF EXISTS public.v_spatial_ref_sys CASCADE;
DROP VIEW IF EXISTS public.v_spatial_ref_sys_backup CASCADE;
DROP VIEW IF EXISTS public.v_spatial_ref_sys_backup_old CASCADE;
DROP VIEW IF EXISTS public.v_spatial_ref_sys_old CASCADE;
DROP VIEW IF EXISTS public.v_spatial_ref_sys_safe CASCADE;

-- 6. Revoke PostgREST access on PostGIS system table (RLS can't be enabled on it)
REVOKE ALL ON public.spatial_ref_sys FROM anon, authenticated;
REVOKE ALL ON public.spatial_ref_sys_copy FROM anon, authenticated;

-- 7. Revoke EXECUTE on internal SECURITY DEFINER helpers (triggers still work as they run as owner)
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_technician_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
