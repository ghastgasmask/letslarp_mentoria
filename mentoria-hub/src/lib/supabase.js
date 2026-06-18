import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://mhtuqbwqixljorwblvuj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odHVxYndxaXhsam9yd2JsdnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzgxODgsImV4cCI6MjA5NzAxNDE4OH0.ggy1NwDfmSuCLpQ-tnfCZt45baD9nLuBGk-Grx4yB_A'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)