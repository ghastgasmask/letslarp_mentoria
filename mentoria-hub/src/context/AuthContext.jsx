import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, name, grade, interests) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    })

    if (error) throw error

    const newUser = data.user

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.id,
        full_name: name,
        grade: parseInt(grade),
        interests: interests || []
      })

    if (profileError) throw profileError

    const { error: leaderboardError } = await supabase
      .from('leaderboard')
      .insert({
        user_id: newUser.id,
        points: 0,
        courses_completed: 0
      })

    if (leaderboardError) throw leaderboardError

    return data
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth должен быть внутри AuthProvider')
  }
  return context
}
