import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      setProfile(data || null)
    } catch (e) {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email, password, fullName, phone) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone } }
    })
    if (!error && data.user) {
      // Create profile row immediately on signup
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        email: email,
        phone: phone || null,
        onboarded: false,
        role: 'candidate',
        active_role: 'candidate',
      })
    }
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
