import { useState, useEffect, useCallback } from 'react'
import type { Book, FilterStatus } from '../types/book'
import * as storage from '../lib/booksStorage'

export function useBooks(status: FilterStatus, query: string) {
  const [books, setBooks] = useState<Book[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [status, query])

  const refetch = useCallback(() => {
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
  }, [status, query])

  const updateBook = useCallback((id: string, data: Parameters<typeof storage.updateBook>[1]) => {
    const updated = storage.updateBook(id, data)
    if (updated) setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)))
    return updated
  }, [])

  const removeBook = useCallback((id: string) => {
    const ok = storage.deleteBook(id)
    if (ok) setBooks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const addBook = useCallback((input: Parameters<typeof storage.createBook>[0]) => {
    const created = storage.createBook(input)
    setBooks((prev) => [...prev, created])
    return created
  }, [])

  return {
    books,
    loading: false,
    error,
    refetch,
    updateBook,
    removeBook,
    addBook,
  }
}
