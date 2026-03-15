import { memo } from 'react'
import type { Book } from '../types/book'

const STATUS_LABEL: Record<Book['status'], string> = {
  reading: '在读',
  read: '已读',
  want: '想读',
}

interface BookCardProps {
  book: Book
  onClick: () => void
}

function BookCard({ book, onClick }: BookCardProps) {
  return (
    <article
      className="book-card"
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      role="button"
      tabIndex={0}
      aria-label={`${book.title}，${book.author}，${STATUS_LABEL[book.status]}`}
    >
      <div className="book-card__cover">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt=""
            className="book-card__img"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="book-card__placeholder">
            <span className="book-card__placeholder-text">{book.title.slice(0, 1)}</span>
          </div>
        )}
      </div>
      <div className="book-card__body">
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__author">{book.author}</p>
        <span className={`book-card__status book-card__status--${book.status}`}>
          {STATUS_LABEL[book.status]}
        </span>
        {book.rating != null && book.rating > 0 ? (
          <p className="book-card__rating" aria-label={`评分 ${book.rating} 星`}>
            {'★'.repeat(book.rating)}{'☆'.repeat(5 - book.rating)}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export default memo(BookCard)
