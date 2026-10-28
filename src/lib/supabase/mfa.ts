import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * True when the user has a verified TOTP factor but the current session
 * has not passed the second step yet (aal1 instead of aal2).
 */
export async function needsMfa(supabase: SupabaseClient) {
  let { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  return data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2'
}
