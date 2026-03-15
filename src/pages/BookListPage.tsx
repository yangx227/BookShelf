import { useState, useCallback, useEffect, useMemo } from 'react'
import SearchBox from '../components/SearchBox'
import FilterTabs from '../components/FilterTabs'
import BookCard from '../components/BookCard'
import BookDetailModal from '../components/BookDetailModal'
import AddBookModal from '../components/AddBookModal'
import type { Book, FilterStatus } from '../types/book'
import { useBooks } from '../hooks/useBooks'

const DEBOUNCE_MS = 300

export default function BookListPage() {
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [detailBook, setDetailBook] = useState<Book | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const [status, setStatus] = useState<FilterStatus>('all')
  const {
    books,
    loading,
    error,
    refetch,
    updateBook,
    removeBook,
    addBook,
  } = useBooks(status, debouncedQuery)

  // 防抖：同步到真正请求用的 query
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
  }, [])

  // 防抖：同步到请求用的 query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchInput), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleSaveDetail = useCallback(
    async (id: string, data: { status?: Book['status']; rating?: number | null; notes?: string | null }) => {
      await updateBook(id, data)
    },
    [updateBook]
  )

  const handleAddBook = useCallback(
    async (input: { title: string; author: string; coverUrl?: string; status: Book['status'] }) => {
      await addBook(input)
    },
    [addBook]
  )

  const handleCardClick = useCallback((book: Book) => setDetailBook(book), [])

  const counts: Partial<Record<FilterStatus, number>> | undefined = useMemo(() => {
    // 从当前数据无法得到各状态数量，需要后端返回；这里先不传，或后端在 list 接口里带 counts
    return undefined
  }, [])

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">个人书架</h1>
        <button
          type="button"
          className="page__add"
          onClick={() => setShowAddModal(true)}
          aria-label="添加书籍"
        >
          添加书籍
        </button>
      </header>

      <div className="page__toolbar">
        <SearchBox
          value={searchInput}
          onChange={handleSearchChange}
          onClear={() => {
            setSearchInput('')
            setDebouncedQuery('')
          }}
        />
        <FilterTabs value={status} onChange={setStatus} counts={counts} />
      </div>

      <main className="page__main">
        {error ? (
          <p className="page__error" role="alert">
            {error}
            <button type="button" className="page__retry" onClick={() => refetch()}>
              重试
            </button>
          </p>
        ) : loading ? (
          <p className="page__loading">加载中…</p>
        ) : books.length === 0 ? (
          <div className="page__empty">
            <p className="page__empty-text">
              {searchInput || status !== 'all'
                ? '没有符合条件的书籍'
                : '还没有书籍，点击上方「添加书籍」开始记录'}
            </p>
            {!searchInput && status === 'all' ? (
              <button
                type="button"
                className="page__add page__add--center"
                onClick={() => setShowAddModal(true)}
              >
                添加书籍
              </button>
            ) : null}
          </div>
        ) : (
          <ul className="book-grid" aria-label="书籍列表">
            {books.map((book) => (
              <li key={book.id}>
                <BookCard book={book} onClick={() => handleCardClick(book)} />
              </li>
            ))}
          </ul>
        )}
      </main>

      {detailBook ? (
        <BookDetailModal
          book={detailBook}
          onClose={() => setDetailBook(null)}
          onSave={handleSaveDetail}
          onDelete={removeBook}
        />
      ) : null}

      {showAddModal ? (
        <AddBookModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddBook}
        />
      ) : null}
    </div>
  )
}
