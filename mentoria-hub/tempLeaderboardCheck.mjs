import fetch from 'node-fetch'

const url = 'https://mhtuqbwqixljorwblvuj.supabase.co'
const key = 'eyJhbGciOiJIUzI1NiIsInJlZiI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1odHVxYndxaXhsam9yd2JsdnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzgxODgsImV4cCI6MjA5NzAxNDE4OH0.ggy1NwDfmSuCLpQ-tnfCZt45baD9nLuBGk-Grx4yB_A'
const tables = [
  'profiles?select=id,full_name,role&limit=5',
  'course_progress?select=user_id,course_id,progress_percentage&limit=5',
  'quiz_results?select=user_id,score&limit=5',
  'leaderboard?select=user_id,points,courses_completed&limit=5',
]

for (const q of tables) {
  const res = await fetch(`${url}/rest/v1/${q}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: 'return=representation',
    },
  })
  const data = await res.json()
  console.log('QUERY', q, 'STATUS', res.status, 'LEN', Array.isArray(data) ? data.length : typeof data)
  console.log(JSON.stringify(data, null, 2))
}
