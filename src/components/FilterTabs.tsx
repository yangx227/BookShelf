import type { FilterStatus } from '../types/book'

const TABS: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'reading', label: '在读' },
  { key: 'read', label: '已读' },
  { key: 'want', label: '想读' },
]

interface FilterTabsProps {
  value: FilterStatus
  onChange: (value: FilterStatus) => void
  counts?: Partial<Record<FilterStatus, number>>
}

export default function FilterTabs({ value, onChange, counts }: FilterTabsProps) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="阅读状态筛选">
      {TABS.map((tab) => {
        const count = counts && tab.key !== 'all' ? counts[tab.key] : counts?.all
        const label = tab.key === 'all' && count != null ? `全部 (${count})` : count != null ? `${tab.label} (${count})` : tab.label
        const selected = value === tab.key
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={selected}
            className={`filter-tabs__tab ${selected ? 'filter-tabs__tab--active' : ''}`}
            onClick={() => onChange(tab.key)}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
