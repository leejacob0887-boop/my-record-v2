# dark-mode Plan

> **작성일**: 2026-03-10
> **프로젝트**: my-record-v2

---

## Executive Summary

| 관점 | 내용 |
|------|------|
| **Problem** | 햄버거 버튼(≡)이 기능 없이 자리만 차지하고, 다크모드 미지원으로 야간 사용 불편 |
| **Solution** | 햄버거 버튼 제거 후 그 자리에 🌙/☀️ 다크모드 토글 배치, `next-themes` + Tailwind `dark:` 클래스로 전체 적용 |
| **Function/UX** | 상단 좌측 버튼 한 번으로 라이트/다크 전환, localStorage에 선호 저장, 시스템 테마 자동 감지 |
| **Core Value** | 야간 사용성 대폭 향상, 눈 피로도 감소, 개인 앱으로서 완성도 UP |

---

## 1. 개요

### 1.1 변경 대상
햄버거 버튼이 있는 페이지 5개:
- `src/app/page.tsx` (홈)
- `src/app/diary/page.tsx`
- `src/app/moments/page.tsx`
- `src/app/ideas/page.tsx`
- `src/app/calendar/page.tsx`

### 1.2 기술 스택
- **`next-themes`**: SSR-safe 테마 관리, localStorage 자동 저장
- **Tailwind CSS `dark:` 클래스**: 다크모드 스타일 적용
- **Tailwind v4 dark variant**: `@variant dark (&:where(.dark, .dark *))` 설정

---

## 2. 구현 상세

### FR-01: next-themes 설치 및 설정

```bash
npm install next-themes
```

**`src/app/layout.tsx`** 수정:
```tsx
import { ThemeProvider } from 'next-themes';
// body wrapping with ThemeProvider
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  ...
</ThemeProvider>
```

---

### FR-02: globals.css — 다크모드 색상 변수

현재 하드코딩된 색상들을 CSS 변수 기반으로 전환:

```css
/* Light mode */
:root {
  --bg-page: #FAF8F4;
  --bg-card: #ffffff;
  --text-primary: #111827;
  --text-secondary: #374151;
  --text-muted: #9ca3af;
  --border: #f3f4f6;
  --accent: #4A90D9;
}

/* Dark mode */
.dark {
  --bg-page: #111827;
  --bg-card: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #6b7280;
  --border: #374151;
  --accent: #60a5fa;
}
```

---

### FR-03: DarkModeToggle 컴포넌트

**`src/components/DarkModeToggle.tsx`** (신규):
```tsx
'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />; // hydration placeholder

  const isDark = theme === 'dark';
  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? <Sun size={20} color="#f9fafb" /> : <Moon size={20} color="#374151" />}
    </button>
  );
}
```

---

### FR-04: 햄버거 버튼 → DarkModeToggle 교체

5개 페이지에서 햄버거 버튼 SVG 블록 교체:

**Before** (각 페이지 상단):
```tsx
<button className="w-9 h-9 ..." aria-label="메뉴">
  <svg>/* 햄버거 아이콘 */</svg>
</button>
```

**After**:
```tsx
import DarkModeToggle from '@/components/DarkModeToggle';
// ...
<DarkModeToggle />
```

---

### FR-05: 전체 페이지 dark: 클래스 적용

주요 색상 교체 패턴:

| 현재 클래스 | 다크모드 추가 |
|------------|--------------|
| `bg-[#FAF8F4]` | `bg-[#FAF8F4] dark:bg-gray-900` |
| `bg-white` | `bg-white dark:bg-gray-800` |
| `text-gray-800` | `text-gray-800 dark:text-gray-100` |
| `text-gray-400` | `text-gray-400 dark:text-gray-500` |
| `border-gray-100` | `border-gray-100 dark:border-gray-700` |
| `stroke="#374151"` | 다크모드 시 `stroke="#d1d5db"` (동적 처리 필요) |
| `bg-[#FAF8F4]` (BottomTabBar bg) | `dark:bg-gray-900` |

**영향 파일 목록** (dark: 클래스 추가):
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/diary/page.tsx`
- `src/app/moments/page.tsx`
- `src/app/ideas/page.tsx`
- `src/app/calendar/page.tsx`
- `src/app/calendar/[date]/page.tsx`
- `src/app/diary/[id]/page.tsx`
- `src/app/diary/new/page.tsx`
- `src/app/diary/[id]/edit/page.tsx`
- `src/app/moments/[id]/page.tsx`
- `src/app/moments/new/page.tsx`
- `src/app/moments/[id]/edit/page.tsx`
- `src/app/ideas/[id]/page.tsx`
- `src/app/ideas/new/page.tsx`
- `src/app/ideas/[id]/edit/page.tsx`
- `src/app/settings/page.tsx`
- `src/components/BottomTabBar.tsx`
- `src/components/DiaryForm.tsx`
- `src/components/ImagePicker.tsx`
- `src/app/globals.css`

---

## 3. 구현 순서

1. `npm install next-themes`
2. `globals.css` — Tailwind v4 dark variant 설정 추가
3. `layout.tsx` — ThemeProvider 추가
4. `DarkModeToggle.tsx` — 컴포넌트 생성
5. 5개 페이지 — 햄버거 → DarkModeToggle 교체 (FR-04)
6. 전체 페이지/컴포넌트 — `dark:` 클래스 추가 (FR-05)

---

## 4. 완료 기준

- [ ] 🌙/☀️ 토글 버튼이 모든 주요 페이지 상단 좌측에 표시
- [ ] 클릭 시 라이트/다크 전환
- [ ] 새로고침 후에도 선택한 테마 유지 (localStorage)
- [ ] 시스템 다크모드 자동 감지
- [ ] 모든 페이지/컴포넌트에 다크 배경/텍스트/보더 적용
- [ ] BottomTabBar 다크모드 적용
- [ ] TypeScript 에러 없음
