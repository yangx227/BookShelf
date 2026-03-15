# 个人书架 (BookShelf)

基于 [PRD](prd.md) 实现的个人书架管理网页应用，支持书籍展示、搜索、按状态筛选、评分与笔记。**无后端，数据保存在浏览器 localStorage。**

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **存储**: 浏览器 localStorage（无需服务器）

首次打开时若无数据，会自动写入 10 本示例书籍；之后增删改均保存在本机浏览器中，刷新或下次打开仍保留。

## 快速开始

### 1. 安装依赖

在项目根目录执行：

```bash
npm install
```

### 2. 启动应用

```bash
npm run dev
```

在浏览器打开终端中显示的地址（如 **http://localhost:5173**）即可使用。无需启动任何后端服务。

### 3. 使用

- 点击「添加书籍」录入书名、作者、封面 URL（选填）、阅读状态
- 在搜索框按书名或作者过滤
- 使用「全部 / 在读 / 已读 / 想读」筛选
- 点击书籍卡片打开详情，可修改阅读状态、评分（1–5 星）、笔记，或删除书籍
- 数据自动保存在当前浏览器，刷新后仍存在

## 项目结构

```
BookShelf/
├── prd.md
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── lib/booksStorage.ts   # 本地数据层（localStorage）
│   ├── components/          # SearchBox, FilterTabs, BookCard, BookDetailModal, AddBookModal
│   ├── pages/BookListPage.tsx
│   ├── types/book.ts
│   └── hooks/useBooks.ts
└── server/                  # 已不使用；可保留或删除
```

## 构建与预览

```bash
npm run build    # 产出到 dist/
npm run preview  # 预览构建结果
```

构建后的静态文件可部署到任意静态托管，数据仍仅存于用户浏览器 localStorage。
