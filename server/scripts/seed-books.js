/**
 * 从 Open Library API 抓取书籍并写入 books.json 作为初始数据。
 * 使用: node server/scripts/seed-books.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuid } from 'uuid'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../src/data/books.json')
const OPEN_LIBRARY_URL = 'https://openlibrary.org/search.json?q=fiction&limit=10&fields=key,title,author_name,cover_i,first_publish_year'

async function fetchBooks() {
  const res = await fetch(OPEN_LIBRARY_URL)
  if (!res.ok) throw new Error(`Open Library API error: ${res.status}`)
  const json = await res.json()
  return json.docs || []
}

function toBook(doc, index) {
  const now = new Date().toISOString()
  const statuses = ['want', 'want', 'reading', 'read', 'read']
  const status = statuses[index % statuses.length]
  const author = Array.isArray(doc.author_name) ? doc.author_name[0] : '未知作者'
  const coverUrl = doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
    : undefined
  return {
    id: uuid(),
    title: doc.title || '未知书名',
    author: author || '未知作者',
    coverUrl,
    status,
    rating: status === 'read' ? 4 : undefined,
    notes: undefined,
    createdAt: now,
    updatedAt: now,
  }
}

async function main() {
  console.log('正在从 Open Library 获取 10 本书...')
  const docs = await fetchBooks()
  const books = docs.slice(0, 10).map((doc, i) => toBook(doc, i))
  fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf8')
  console.log(`已写入 ${books.length} 本书到 ${DATA_FILE}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
