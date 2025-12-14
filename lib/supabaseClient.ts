
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://scxwoijurerfnbscfmeh.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7OVF1WnvWz-npfym9KqIAA_7GlrqV8g'

export const supabase = createClient(supabaseUrl, supabaseKey)
