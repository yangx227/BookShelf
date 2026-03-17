import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  error: string | null
  retry: () => void
}>({
  user: null,
  loading: false,
  error: null,
  retry: () => {},
})

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

function useAuthEffect(setUser: (u: User | null) => void, setLoading: (l: boolean) => void, setError: (e: string | null) => void) {
  const client = supabase
  if (!client || !isSupabaseConfigured()) {
    setLoading(false)
    return () => {}
  }
  let cancelled = false
  setError(null)
  setLoading(true)
  client.auth
    .getSession()
    .then(({ data: { session } }) => {
      if (cancelled) return
      if (session?.user) {
        setUser(session.user)
        setLoading(false)
        return
      }
      return client.auth.signInAnonymously().then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
          setLoading(false)
          return
        }
        setUser(data.user ?? null)
        setLoading(false)
      })
    })
    .catch((e) => {
      if (!cancelled) {
        setError(e?.message ?? 'Failed to fetch')
        setLoading(false)
      }
    })
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    if (!cancelled) setUser(session?.user ?? null)
  })
  return () => {
    cancelled = true
    subscription.unsubscribe()
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured())
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const retry = () => {
    setError(null)
    setRetryCount((c) => c + 1)
  }

  useEffect(() => {
    const cleanup = useAuthEffect(setUser, setLoading, setError)
    return cleanup
  }, [retryCount])

  return (
    <AuthContext.Provider value={{ user, loading, error, retry }}>
      {children}
    </AuthContext.Provider>
  )
}
