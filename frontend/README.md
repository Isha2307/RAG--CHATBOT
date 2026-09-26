# IntelliRAG Frontend

Modern, recruiter-ready AI SaaS Interface for IntelliRAG, built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Lucide Icons**.

## Features

- **ChatGPT-Style Interactive Chat**: Markdown response formatting (headings, code blocks, lists).
- **Live Sources Drawer**: Displays real vector search confidence scores, chunk previews, and source filenames returned by the backend.
- **Document Management**: Document selector, upload modal with drag-and-drop, and real-time processing status.
- **Multi-Environment Support**: Switch between local backend (`http://127.0.0.1:8000`) and live Render backend (`https://rag-chatbot-1-5n2r.onrender.com`) via `NEXT_PUBLIC_API_URL`.

## Setup & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
# Or for Render API:
# NEXT_PUBLIC_API_URL=https://rag-chatbot-1-5n2r.onrender.com
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for Production
```bash
npm run build
```
