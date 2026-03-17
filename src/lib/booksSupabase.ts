import type { Book, BookStatus, BooksResponse, CreateBookInput, UpdateBookInput } from '../types/book'
import { supabase } from './supabase'

export type BooksRow = {
  id: string
  user_id: string
  title: string
  author: string
  cover_url: string | null
  status: string
  rating: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

function rowToBook(row: BooksRow): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    coverUrl: row.cover_url ?? undefined,
    status: row.status as BookStatus,
    rating: row.rating ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function bookToRow(book: UpdateBookInput): Partial<BooksRow> {
  const row: Partial<BooksRow> = {}
  if (book.title !== undefined) row.title = book.title
  if (book.author !== undefined) row.author = book.author
  if (book.coverUrl !== undefined) row.cover_url = book.coverUrl || null
  if (book.status !== undefined) row.status = book.status
  if (book.rating !== undefined) row.rating = book.rating === null ? null : book.rating
  if (book.notes !== undefined) row.notes = book.notes === null ? null : book.notes
  return row
}

export async function getBooksSupabase(
  userId: string,
  params?: { status?: string; q?: string }
): Promise<BooksResponse> {
  if (!supabase) throw new Error('Supabase not configured')
  let query = supabase
    .from('books')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  if (params?.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  const { data, error } = await query
  if (error) throw new Error(error.message)
  let list = (data as BooksRow[]).map(rowToBook)
  if (params?.q?.trim()) {
    const lower = params.q.trim().toLowerCase()
    list = list.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        (b.author && b.author.toLowerCase().includes(lower))
    )
  }
  return { data: list, total: list.length }
}

export async function createBookSupabase(userId: string, input: CreateBookInput): Promise<Book> {
  if (!supabase) throw new Error('Supabase not configured')
  const row = {
    user_id: userId,
    title: input.title,
    author: input.author,
    cover_url: input.coverUrl ?? null,
    status: input.status ?? 'want',
    rating: input.rating ?? null,
    notes: input.notes ?? null,
  }
  const { data, error } = await supabase.from('books').insert(row).select().single()
  if (error) throw new Error(error.message)
  return rowToBook(data as BooksRow)
}

export async function updateBookSupabase(
  userId: string,
  id: string,
  input: UpdateBookInput
): Promise<Book | null> {
  if (!supabase) throw new Error('Supabase not configured')
  const row = bookToRow(input)
  const { data, error } = await supabase
    .from('books')
    .update(row)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) return null
  return rowToBook(data as BooksRow)
}

export async function deleteBookSupabase(userId: string, id: string): Promise<boolean> {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.from('books').delete().eq('id', id).eq('user_id', userId)
  return !error
}

const SEED_BOOKS: CreateBookInput[] = [
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

export async function seedInitialBooksSupabase(userId: string): Promise<void> {
  if (!supabase) return
  for (const input of SEED_BOOKS) {
    await createBookSupabase(userId, input)
  }
}
