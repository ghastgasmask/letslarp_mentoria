import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/admin'

const AuthContext = createContext()

async function fetchProfile(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('role, full_name, grade, interests')
    .eq('id', userId)
    .single()

  return data
}

async function enrichUser(authUser) {
  if (!authUser) return null

  const profile = await fetchProfile(authUser.id)
  return {
    ...authUser,
    full_name: profile?.full_name ?? authUser?.user_metadata?.full_name ?? '',
    grade: profile?.grade ?? null,
    interests: profile?.interests ?? [],
    role: profile?.role ?? 'student',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(await enrichUser(session?.user ?? null))
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(await enrichUser(session?.user ?? null))
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password, name, grade, interests, wantsAdmin) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    })

    if (error) throw error

    const newUser = data.user
    const isAdmin = wantsAdmin && isAdminEmail(email)

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUser.id,
        full_name: name,
        grade: isAdmin ? null : parseInt(grade),
        interests: interests || [],
        role: isAdmin ? 'admin' : 'student',
      })

    if (profileError) throw profileError

    if (!isAdmin) {
      const { error: leaderboardError } = await supabase
        .from('leaderboard')
        .insert({
          user_id: newUser.id,
          points: 0,
          courses_completed: 0,
        })

      if (leaderboardError) throw leaderboardError
    }

    return { ...data, role: isAdmin ? 'admin' : 'student' }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    const profile = await fetchProfile(data.user.id)
    const role = profile?.role ?? 'student'

    setUser({ ...data.user, ...profile, role })

    return { ...data, role }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const updateProfile = async ({ full_name, grade }) => {
    const userId = user?.id
    if (!userId) throw new Error('Пользователь не авторизован')

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name,
      },
    })
    if (authError) throw authError

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name,
        grade: grade !== undefined ? Number(grade) : null,
      })
      .eq('id', userId)

    if (profileError) throw profileError

    setUser((prevUser) => prevUser ? { ...prevUser, full_name, grade: grade !== undefined ? Number(grade) : prevUser.grade } : prevUser)
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signUp, signIn, signOut, updateProfile }}>
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
