import express from 'express'
import cors from 'cors'
import booksRouter from './routes/books.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: true }))
app.use(express.json())
app.use('/api/books', booksRouter)

app.get('/', (req, res) => {
  res.send(
    '<p>BookShelf API 已运行。</p><p>请在前端地址打开应用：<a href="http://localhost:5173">http://localhost:5173</a></p>'
  )
})

const server = app.listen(PORT, () => {
  console.log(`BookShelf API running at http://localhost:${PORT}`)
  console.log(`前端请访问: http://localhost:5173 (需在另一终端运行 npm run dev)`)
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`端口 ${PORT} 已被占用。请先结束占用进程，或在另一终端执行: netstat -ano | findstr :${PORT} 查看 PID 后 taskkill /PID <PID> /F`)
  } else {
    console.error(err)
  }
  process.exit(1)
})
