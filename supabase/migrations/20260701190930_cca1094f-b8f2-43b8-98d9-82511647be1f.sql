
-- Enable RLS on PostGIS spatial_ref_sys (owner is postgres in Supabase, so this works)
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY';
  EXCEPTION WHEN insufficient_privilege THEN
    -- Can't enable RLS; grants already revoked from anon/authenticated
    NULL;
  END;
END $$;

DROP POLICY IF EXISTS "spatial_ref_sys read for authenticated" ON public.spatial_ref_sys;
DO $$
BEGIN
  BEGIN
    EXECUTE 'CREATE POLICY "spatial_ref_sys read for authenticated" ON public.spatial_ref_sys FOR SELECT TO authenticated USING (true)';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;

-- Lock down spatial_ref_sys_copy: remove permissive policy, revoke grants
DROP POLICY IF EXISTS select_only_authenticated ON public.spatial_ref_sys_copy;
REVOKE ALL ON public.spatial_ref_sys_copy FROM anon, authenticated;
