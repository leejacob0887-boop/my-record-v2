# my-record-v2

## Project Level
**Level: Starter** - Static web app (Next.js + Tailwind CSS)

## Project Overview
개인 기록/일기 앱. 날짜별 기록을 작성하고 관리하는 정적 웹사이트.

## Tech Stack
- Next.js 15+ (App Router)
- Tailwind CSS
- TypeScript
- LocalStorage (데이터 저장)

## Project Structure
```
src/
├── app/
│   ├── layout.tsx       # Common layout
│   ├── page.tsx         # Home / record list
│   ├── globals.css
│   └── records/
│       └── [id]/
│           └── page.tsx # Record detail
└── components/
    ├── RecordCard.tsx   # Record list item
    ├── RecordForm.tsx   # Create/edit form
    └── Header.tsx       # Site header
docs/
├── 01-plan/
└── 02-design/
```

## Coding Conventions
- TypeScript strict mode
- Tailwind CSS for all styling
- No external UI libraries (keep it simple)
- LocalStorage for data persistence (no backend)
- Korean language UI

## bkit Settings
- Output Style: bkit-learning
- PDCA Level: Starter
