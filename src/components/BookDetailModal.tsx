import { useState, useEffect } from 'react'
import type { Book } from '../types/book'

const STATUS_OPTIONS: { value: Book['status']; label: string }[] = [
  { value: 'reading', label: '在读' },
  { value: 'read', label: '已读' },
  { value: 'want', label: '想读' },
]

interface BookDetailModalProps {
  book: Book | null
  onClose: () => void
  onSave: (id: string, data: { status?: Book['status']; rating?: number | null; notes?: string | null }) => void | Promise<void>
  onDelete?: (id: string) => void | Promise<void>
}

export default function BookDetailModal({
  book,
  onClose,
  onSave,
  onDelete,
}: BookDetailModalProps) {
  const [status, setStatus] = useState<Book['status']>('want')
  const [rating, setRating] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (book) {
      setStatus(book.status)
      setRating(book.rating ?? null)
      setNotes(book.notes ?? '')
    }
  }, [book])

  if (!book) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(book.id, { status, rating, notes: notes || null })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || !confirm(`确定要删除《${book.title}》吗？`)) return
    setDeleting(true)
    try {
      await onDelete(book.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <div className="modal__header">
          <h2 id="modal-title" className="modal__title">
            {book.title}
          </h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <form className="modal__form" onSubmit={handleSubmit}>
          <p className="modal__author">{book.author}</p>

          <div className="modal__field">
            <label htmlFor="modal-status">阅读状态</label>
            <select
              id="modal-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Book['status'])}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="modal__field">
            <span className="modal__label">评分</span>
            <div className="modal__stars">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`modal__star ${rating !== null && n <= rating ? 'modal__star--on' : ''}`}
                  onClick={() => setRating(rating === n ? null : n)}
                  aria-label={`${n} 星`}
                >
                  {n <= (rating ?? 0) ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div className="modal__field">
            <label htmlFor="modal-notes">笔记</label>
            <textarea
              id="modal-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="写下你的阅读笔记…"
            />
          </div>

          <div className="modal__actions">
            {onDelete ? (
              <button
                type="button"
                className="modal__btn modal__btn--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? '删除中…' : '删除'}
              </button>
            ) : null}
            <div className="modal__actions-right">
              <button type="button" className="modal__btn modal__btn--secondary" onClick={onClose}>
                取消
              </button>
              <button type="submit" className="modal__btn modal__btn--primary" disabled={saving}>
                {saving ? '保存中…' : '保存'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
