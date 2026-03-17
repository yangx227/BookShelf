# 个人书架 (BookShelf)

基于 [PRD](prd.md) 实现的个人书架管理网页应用，支持书籍展示、搜索、按状态筛选、评分与笔记。**无后端，数据保存在浏览器 localStorage。**

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **存储**: 默认浏览器 localStorage；可选 **Supabase** 做云同步（需配置）

未配置 Supabase 时，数据保存在浏览器 localStorage；配置 Supabase 后，数据同步到云端（匿名登录）。首次打开时若无书籍，会自动添加 10 本示例书。

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

## 可选：Supabase 云同步

1. **创建项目**： [supabase.com](https://supabase.com) → New project，记下 **Project URL** 和 **anon key**（Project Settings → API）。
2. **建表与 RLS**：在 SQL Editor 中执行以下 SQL（创建 `books` 表并开启 RLS）：

```sql
create table public.books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  author text not null,
  cover_url text,
  status text not null check (status in ('reading', 'read', 'want')),
  rating int check (rating is null or (rating >= 1 and rating <= 5)),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.books enable row level security;
create policy "Users can do everything on own books"
  on public.books for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger books_updated_at before update on public.books
  for each row execute function public.set_updated_at();
```

3. **开启匿名登录**：Authentication → Providers → **Anonymous** 设为 ON。
4. **配置前端**：复制 `.env.example` 为 `.env`，填入 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`，重启 `npm run dev`。

配置完成后，应用会使用匿名账号将书籍同步到 Supabase；不配置则继续使用 localStorage。

## 构建与预览

```bash
npm run build    # 产出到 dist/
npm run preview  # 预览构建结果
```

构建后的静态文件可部署到任意静态托管，数据仍仅存于用户浏览器 localStorage。
