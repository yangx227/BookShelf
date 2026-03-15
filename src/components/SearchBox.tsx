import { useId } from 'react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
}

export default function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = '按书名或作者搜索',
}: SearchBoxProps) {
  const id = useId()
  return (
    <div className="search-box">
      <label htmlFor={id} className="search-box__label">
        搜索
      </label>
      <div className="search-box__wrap">
        <input
          id={id}
          type="search"
          className="search-box__input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={placeholder}
        />
        {value ? (
          <button
            type="button"
            className="search-box__clear"
            onClick={onClear ?? (() => onChange(''))}
            aria-label="清空搜索"
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  )
}
