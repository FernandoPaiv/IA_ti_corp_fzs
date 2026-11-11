CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_claims jsonb;
  v_user_id uuid;
  v_requested_tenant_id uuid;
  v_tenant_id uuid;
  v_membership_count integer;
BEGIN
  v_claims := COALESCE(event -> 'claims', '{}'::jsonb);

  IF NULLIF(event ->> 'user_id', '') IS NULL THEN
    RAISE EXCEPTION 'Custom access token hook requires user_id';
  END IF;
  v_user_id := (event ->> 'user_id')::uuid;

  IF NULLIF(v_claims -> 'app_metadata' ->> 'tenant_id', '') IS NOT NULL THEN
    v_requested_tenant_id := (v_claims -> 'app_metadata' ->> 'tenant_id')::uuid;
    SELECT m.tenant_id
      INTO v_tenant_id
      FROM public.memberships AS m
     WHERE m.user_id = v_user_id
       AND m.tenant_id = v_requested_tenant_id;
    IF v_tenant_id IS NULL THEN
      RAISE EXCEPTION 'Configured tenant is not an active membership';
    END IF;
  ELSE
    SELECT count(*)::integer, min(m.tenant_id::text)::uuid
      INTO v_membership_count, v_tenant_id
      FROM public.memberships AS m
     WHERE m.user_id = v_user_id;
    IF v_membership_count <> 1 THEN
      RAISE EXCEPTION 'User must have exactly one membership or a trusted app_metadata.tenant_id';
    END IF;
  END IF;

  v_claims := jsonb_set(v_claims, '{tenant_id}', to_jsonb(v_tenant_id::text), true);
  RETURN jsonb_set(event, '{claims}', v_claims, true);
END;
$function$;

REVOKE ALL ON FUNCTION public.custom_access_token_hook(jsonb) FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
