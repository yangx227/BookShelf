import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuid } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, 'books.json')

function readBooks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    return JSON.parse(raw)
  } catch (e) {
    if (e.code === 'ENOENT') return []
    throw e
  }
}

function writeBooks(books) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf8')
}

export function getAllBooks() {
  return readBooks()
}

export function getBooksFiltered({ status, q }) {
  let list = readBooks()
  if (status && status !== 'all') {
    list = list.filter((b) => b.status === status)
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

export function getBookById(id) {
  const books = readBooks()
  return books.find((b) => b.id === id) ?? null
}

export function createBook(input) {
  const books = readBooks()
  const now = new Date().toISOString()
  const book = {
    id: uuid(),
    title: input.title,
    author: input.author,
    coverUrl: input.coverUrl ?? undefined,
    status: input.status || 'want',
    rating: input.rating ?? undefined,
    notes: input.notes ?? undefined,
    createdAt: now,
    updatedAt: now,
  }
  books.push(book)
  writeBooks(books)
  return book
}

export function updateBook(id, input) {
  const books = readBooks()
  const idx = books.findIndex((b) => b.id === id)
  if (idx === -1) return null
  const now = new Date().toISOString()
  const prev = books[idx]
  books[idx] = {
    ...prev,
    ...(input.title !== undefined && { title: input.title }),
    ...(input.author !== undefined && { author: input.author }),
    ...(input.coverUrl !== undefined && { coverUrl: input.coverUrl }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.rating !== undefined && { rating: input.rating === null ? undefined : input.rating }),
    ...(input.notes !== undefined && { notes: input.notes === null ? undefined : input.notes }),
    updatedAt: now,
  }
  writeBooks(books)
  return books[idx]
}

export function deleteBook(id) {
  const books = readBooks()
  const idx = books.findIndex((b) => b.id === id)
  if (idx === -1) return false
  books.splice(idx, 1)
  writeBooks(books)
  return true
}
