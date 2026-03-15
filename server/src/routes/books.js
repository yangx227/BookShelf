import { Router } from 'express'
import * as store from '../data/store.js'

const router = Router()

router.get('/', (req, res) => {
  try {
    const status = req.query.status
    const q = req.query.q
    const data = store.getBooksFiltered({ status, q })
    res.json({ data, total: data.length })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})

router.get('/:id', (req, res) => {
  const book = store.getBookById(req.params.id)
  if (!book) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: '书籍不存在' } })
  }
  res.json(book)
})

router.post('/', (req, res) => {
  try {
    const { title, author, coverUrl, status, rating, notes } = req.body || {}
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: '书名为必填' } })
    }
    if (!author || typeof author !== 'string' || !author.trim()) {
      return res.status(400).json({ error: { code: 'VALIDATION', message: '作者为必填' } })
    }
    const validStatus = ['reading', 'read', 'want'].includes(status) ? status : 'want'
    const book = store.createBook({
      title: title.trim(),
      author: author.trim(),
      coverUrl: coverUrl && typeof coverUrl === 'string' ? coverUrl.trim() : undefined,
      status: validStatus,
      rating: rating != null && rating >= 1 && rating <= 5 ? Number(rating) : undefined,
      notes: notes != null && typeof notes === 'string' ? notes.trim() : undefined,
    })
    res.status(201).json(book)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})

router.patch('/:id', (req, res) => {
  try {
    const book = store.getBookById(req.params.id)
    if (!book) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: '书籍不存在' } })
    }
    const { title, author, coverUrl, status, rating, notes } = req.body || {}
    const updates = {}
    if (title !== undefined) updates.title = typeof title === 'string' ? title.trim() : book.title
    if (author !== undefined) updates.author = typeof author === 'string' ? author.trim() : book.author
    if (coverUrl !== undefined) updates.coverUrl = typeof coverUrl === 'string' ? coverUrl.trim() : undefined
    if (status !== undefined && ['reading', 'read', 'want'].includes(status)) updates.status = status
    if (rating !== undefined) updates.rating = rating === null ? null : (rating >= 1 && rating <= 5 ? Number(rating) : book.rating)
    if (notes !== undefined) updates.notes = notes === null ? null : (typeof notes === 'string' ? notes.trim() : book.notes)
    const updated = store.updateBook(req.params.id, updates)
    res.json(updated)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: { code: 'INTERNAL', message: e.message } })
  }
})

router.delete('/:id', (req, res) => {
  const deleted = store.deleteBook(req.params.id)
  if (!deleted) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: '书籍不存在' } })
  }
  res.status(204).send()
})

export default router
