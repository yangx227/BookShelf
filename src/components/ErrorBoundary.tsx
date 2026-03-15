import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '400px',
          margin: '2rem auto',
          background: 'var(--surface, #1a1a1a)',
          border: '1px solid var(--border, #2a2a2a)',
          borderRadius: '12px',
          color: 'var(--text, #e8e8e8)',
        }}>
          <h2 style={{ marginTop: 0 }}>页面出错</h2>
          <p>请刷新页面重试。若窗口最大化时出现，可先还原窗口再刷新。</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--accent, #c9a227)',
              color: '#0f0f0f',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
