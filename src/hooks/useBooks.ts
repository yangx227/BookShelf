import { useState, useEffect, useCallback, useRef } from 'react'
import type { Book, FilterStatus } from '../types/book'
import { isSupabaseConfigured } from '../lib/supabase'
import * as storage from '../lib/booksStorage'
import * as supabaseBooks from '../lib/booksSupabase'

export function useBooks(status: FilterStatus, query: string, userId: string | null) {
  const [books, setBooks] = useState<Book[]>([])
  const supabaseConfigured = isSupabaseConfigured()
  const useSupabase = supabaseConfigured && Boolean(userId)
  const [loading, setLoading] = useState(supabaseConfigured && !userId)
  const [error, setError] = useState<string | null>(null)
  const hasSeededSupabase = useRef(false)

  useEffect(() => {
    if (supabaseConfigured && !userId) {
      setLoading(true)
      setBooks([])
      return
    }
    if (!useSupabase) {
      setError(null)
      try {
        const res = storage.getBooks({
          status: status === 'all' ? undefined : status,
          q: query || undefined,
        })
        setBooks(res.data)
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败')
        setBooks([])
      }
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    supabaseBooks
      .getBooksSupabase(userId!, {
        status: status === 'all' ? undefined : status,
        q: query || undefined,
      })
      .then(async (res) => {
        if (
          status === 'all' &&
          !query &&
          res.data.length === 0 &&
          !hasSeededSupabase.current
        ) {
          hasSeededSupabase.current = true
          await supabaseBooks.seedInitialBooksSupabase(userId!)
          const refetched = await supabaseBooks.getBooksSupabase(userId!, {})
          setBooks(refetched.data)
        } else {
          setBooks(res.data)
        }
        setError(null)
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : '加载失败')
        setBooks([])
      })
      .finally(() => setLoading(false))
  }, [useSupabase, userId, status, query])

  const refetch = useCallback(() => {
    if (!useSupabase) {
      try {
        const res = storage.getBooks({
          status: status === 'all' ? undefined : status,
          q: query || undefined,
        })
        setBooks(res.data)
        setError(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败')
      }
      return
    }
    setLoading(true)
    supabaseBooks
      .getBooksSupabase(userId!, { status: status === 'all' ? undefined : status, q: query || undefined })
      .then((res) => {
        setBooks(res.data)
        setError(null)
      })
      .catch((e) => setError(e instanceof Error ? e.message : '加载失败'))
      .finally(() => setLoading(false))
  }, [useSupabase, userId, status, query])

  const updateBook = useCallback(
    (id: string, data: Parameters<typeof storage.updateBook>[1]) => {
      if (!useSupabase) {
        const updated = storage.updateBook(id, data)
        if (updated) setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)))
        return updated
      }
      return supabaseBooks.updateBookSupabase(userId!, id, data).then((updated) => {
        if (updated) setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)))
        return updated
      })
    },
    [useSupabase, userId]
  )

  const removeBook = useCallback(
    (id: string) => {
      if (!useSupabase) {
        const ok = storage.deleteBook(id)
        if (ok) setBooks((prev) => prev.filter((b) => b.id !== id))
        return
      }
      return supabaseBooks.deleteBookSupabase(userId!, id).then((ok) => {
        if (ok) setBooks((prev) => prev.filter((b) => b.id !== id))
      })
    },
    [useSupabase, userId]
  )

  const addBook = useCallback(
    (input: Parameters<typeof storage.createBook>[0]) => {
      if (!useSupabase) {
        const created = storage.createBook(input)
        setBooks((prev) => [...prev, created])
        return created
      }
      return supabaseBooks.createBookSupabase(userId!, input).then((created) => {
        setBooks((prev) => [...prev, created])
        return created
      })
    },
    [useSupabase, userId]
  )

  return {
    books,
    loading,
    error,
    refetch,
    updateBook,
    removeBook,
    addBook,
  }
}
