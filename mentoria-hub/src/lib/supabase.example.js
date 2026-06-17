import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xxxxx.supabase.co'      //  вставь сюда
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...'  //  вставь сюда

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)