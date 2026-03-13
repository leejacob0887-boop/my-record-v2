---
name: my-record-v2 Project Context
description: 개인 기록/일기 앱 프로젝트, Next.js 기반 Starter 레벨
type: project
---

# my-record-v2 Project Overview

## Project Details
- **Name**: my-record-v2
- **Level**: Starter (Static web app with LocalStorage)
- **Tech Stack**: Next.js 15+, Tailwind CSS, TypeScript, LocalStorage
- **Language**: Korean UI

## Project Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (home + record list)
│   ├── records/[id]/page.tsx
│   ├── chat/page.tsx (AI Voice Chat)
│   └── api/chat/route.ts
├── components/
│   ├── RecordCard.tsx
│   ├── RecordForm.tsx
│   ├── ChatMessage.tsx
│   └── Header.tsx
└── lib/
    ├── useDiary.ts
    ├── useMoments.ts
    ├── useIdeas.ts
    └── useSpeechInput.ts
```

## Coding Conventions
- TypeScript strict mode
- Tailwind CSS for styling (no external UI libraries)
- LocalStorage for persistence (no backend)
- Korean language UI
- Dark mode support

## PDCA Status
- **Current Phase**: Report generation (Act phase)
- **Output Style**: bkit-learning
- **Memory Scope**: project (shared across sessions)

## Note
This project uses bkit v1.6.1 PDCA skill framework with automated gap-detector analysis.
Report generation follows template: `report.template.md`
