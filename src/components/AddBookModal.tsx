import { useState } from 'react'
import type { BookStatus } from '../types/book'

const STATUS_OPTIONS: { value: BookStatus; label: string }[] = [
  { value: 'want', label: '想读' },
  { value: 'reading', label: '在读' },
  { value: 'read', label: '已读' },
]

interface AddBookModalProps {
  onClose: () => void
  onAdd: (input: { title: string; author: string; coverUrl?: string; status: BookStatus }) => Promise<void>
}

export default function AddBookModal({ onClose, onAdd }: AddBookModalProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [status, setStatus] = useState<BookStatus>('want')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    const a = author.trim()
    if (!t || !a) {
      setError('请填写书名和作者')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onAdd({
        title: t,
        author: a,
        coverUrl: coverUrl.trim() || undefined,
        status,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-modal-title"
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <div className="modal__header">
          <h2 id="add-modal-title" className="modal__title">
            添加书籍
          </h2>
          <button type="button" className="modal__close" onClick={onClose} aria-label="关闭">
            ×
          </button>
        </div>
        <form className="modal__form" onSubmit={handleSubmit}>
          {error ? <p className="modal__error" role="alert">{error}</p> : null}
          <div className="modal__field">
            <label htmlFor="add-title">书名 *</label>
            <input
              id="add-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="请输入书名"
              required
            />
          </div>
          <div className="modal__field">
            <label htmlFor="add-author">作者 *</label>
            <input
              id="add-author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="请输入作者"
              required
            />
          </div>
          <div className="modal__field">
            <label htmlFor="add-cover">封面 URL（选填）</label>
            <input
              id="add-cover"
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="modal__field">
            <label htmlFor="add-status">阅读状态</label>
            <select
              id="add-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookStatus)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="modal__actions modal__actions--single">
            <button type="button" className="modal__btn modal__btn--secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="modal__btn modal__btn--primary" disabled={submitting}>
              {submitting ? '添加中…' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
