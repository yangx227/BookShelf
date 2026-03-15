export type BookStatus = 'reading' | 'read' | 'want'

export interface Book {
  id: string
  title: string
  author: string
  coverUrl?: string
  status: BookStatus
  rating?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export type FilterStatus = 'all' | BookStatus

export interface BooksResponse {
  data: Book[]
  total: number
}

export interface CreateBookInput {
  title: string
  author: string
  coverUrl?: string
  status?: BookStatus
  rating?: number | null
  notes?: string | null
}

export interface UpdateBookInput {
  title?: string
  author?: string
  coverUrl?: string
  status?: BookStatus
  rating?: number | null
  notes?: string | null
}
