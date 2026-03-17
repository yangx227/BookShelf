import BookListPage from './pages/BookListPage'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <BookListPage />
    </AuthProvider>
  )
}

export default App
