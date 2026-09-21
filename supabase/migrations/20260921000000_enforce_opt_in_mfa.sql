-- Require AAL2 for private data when a user has opted in to Supabase MFA.
-- Restrictive policies are combined with the existing ownership policies.
-- Apply after 20260918000000_create_workout_tables.sql.
DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'profiles', 'day_logs', 'weight_entries', 'custom_foods',
    'workout_routines', 'completed_workouts'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Require MFA for opted-in users" ON public.%I', table_name);
    EXECUTE format($policy$
      CREATE POLICY "Require MFA for opted-in users" ON public.%I
      AS RESTRICTIVE FOR ALL TO authenticated
      USING (
        array[(select auth.jwt()->>'aal')] <@ (
          select case when count(id) > 0 then array['aal2'] else array['aal1', 'aal2'] end
          from auth.mfa_factors
          where user_id = (select auth.uid()) and status = 'verified'
        )
      )
      WITH CHECK (
        array[(select auth.jwt()->>'aal')] <@ (
          select case when count(id) > 0 then array['aal2'] else array['aal1', 'aal2'] end
          from auth.mfa_factors
          where user_id = (select auth.uid()) and status = 'verified'
        )
      )
    $policy$, table_name);
  END LOOP;
END $$;
