import type {
  Book,
  BookStatus,
  BooksResponse,
  CreateBookInput,
  UpdateBookInput,
} from '../types/book'

const STORAGE_KEY = 'bookshelf-books'

const SEED_BOOKS: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { title: 'Foundation', author: 'Isaac Asimov', coverUrl: 'https://covers.openlibrary.org/b/id/14612610-M.jpg', status: 'want' },
  { title: 'Ficciones', author: 'Jorge Luis Borges', coverUrl: 'https://covers.openlibrary.org/b/id/10832290-M.jpg', status: 'want' },
  { title: 'The Mysterious Affair at Styles', author: 'Agatha Christie', coverUrl: 'https://covers.openlibrary.org/b/id/13699667-M.jpg', status: 'reading' },
  { title: 'Dracula', author: 'Bram Stoker', coverUrl: 'https://covers.openlibrary.org/b/id/12216503-M.jpg', status: 'read', rating: 4 },
  { title: 'Beloved', author: 'Toni Morrison', coverUrl: 'https://covers.openlibrary.org/b/id/8261367-M.jpg', status: 'read', rating: 4 },
  { title: 'The Last Man', author: 'Mary Shelley', coverUrl: 'https://covers.openlibrary.org/b/id/882662-M.jpg', status: 'want' },
  { title: 'The Time Machine', author: 'H. G. Wells', coverUrl: 'https://covers.openlibrary.org/b/id/9009316-M.jpg', status: 'want' },
  { title: 'Herland', author: 'Charlotte Perkins Gilman', coverUrl: 'https://covers.openlibrary.org/b/id/448130-M.jpg', status: 'reading' },
  { title: 'The Invisible Man', author: 'H. G. Wells', coverUrl: 'https://covers.openlibrary.org/b/id/6419199-M.jpg', status: 'read', rating: 4 },
  { title: 'Dune', author: 'Frank Herbert', coverUrl: 'https://covers.openlibrary.org/b/id/11481354-M.jpg', status: 'read', rating: 4 },
]

function genId(): string {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function now(): string {
  return new Date().toISOString()
}

function getBooksFromStorage(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveBooks(books: Book[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
}

function ensureSeed(): Book[] {
  let books = getBooksFromStorage()
  if (books.length === 0) {
    const t = now()
    books = SEED_BOOKS.map((b) => ({
      ...b,
      id: genId(),
      createdAt: t,
      updatedAt: t,
    }))
    saveBooks(books)
  }
  return books
}

function filterBooks(books: Book[], status?: string, q?: string): Book[] {
  let list = books
  if (status && status !== 'all') {
    list = list.filter((b) => b.status === (status as BookStatus))
  }
  if (q && q.trim()) {
    const lower = q.trim().toLowerCase()
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        (b.author && b.author.toLowerCase().includes(lower))
    )
  }
  return list
}

export function getBooks(params?: { status?: string; q?: string }): BooksResponse {
  const books = ensureSeed()
  const data = filterBooks(
    books,
    params?.status,
    params?.q
  )
  return { data, total: data.length }
}

export function getBook(id: string): Book | null {
  const books = ensureSeed()
  return books.find((b) => b.id === id) ?? null
}

export function createBook(input: CreateBookInput): Book {
  const books = ensureSeed()
  const t = now()
  const book: Book = {
    id: genId(),
    title: input.title,
    author: input.author,
    coverUrl: input.coverUrl,
    status: input.status ?? 'want',
    rating: input.rating ?? undefined,
    notes: input.notes ?? undefined,
    createdAt: t,
    updatedAt: t,
  }
  books.push(book)
  saveBooks(books)
  return book
}

export function updateBook(id: string, input: UpdateBookInput): Book | null {
  const books = ensureSeed()
  const idx = books.findIndex((b) => b.id === id)
  if (idx === -1) return null
  const prev = books[idx]
  const updated: Book = {
    ...prev,
    ...(input.title !== undefined && { title: input.title }),
    ...(input.author !== undefined && { author: input.author }),
    ...(input.coverUrl !== undefined && { coverUrl: input.coverUrl }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.rating !== undefined && { rating: input.rating === null ? undefined : input.rating }),
    ...(input.notes !== undefined && { notes: input.notes === null ? undefined : input.notes }),
    updatedAt: now(),
  }
  books[idx] = updated
  saveBooks(books)
  return updated
}

export function deleteBook(id: string): boolean {
  const books = ensureSeed()
  const idx = books.findIndex((b) => b.id === id)
  if (idx === -1) return false
  books.splice(idx, 1)
  saveBooks(books)
  return true
}
