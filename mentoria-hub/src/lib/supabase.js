import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'http://127.0.0.1:54321/storage/v1/s3'
const SUPABASE_ANON_KEY = '850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907 '

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)