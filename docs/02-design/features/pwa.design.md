# [Design] PWA (Progressive Web App)

> Plan 참조: `docs/01-plan/features/pwa.plan.md`

---

## 1. 아키텍처 개요

### 1.1 PWA 구성 요소

```
PWA 구성
├── Web App Manifest        → public/manifest.json
├── Service Worker          → @serwist/next (자동 생성)
├── 앱 아이콘               → public/icons/*.png
├── 오프라인 페이지          → src/app/offline/page.tsx
└── 메타데이터              → src/app/layout.tsx (metadata 확장)
```

### 1.2 캐싱 전략

```
요청 유형           캐싱 전략           설명
─────────────────────────────────────────────────────
정적 자산           Cache First        JS, CSS, 폰트, 이미지
페이지 (HTML)       Network First      최신 내용 우선, 오프라인 시 캐시
API (Supabase)     Network Only       오프라인 시 graceful 실패
오프라인 fallback   Cache Only        /offline 페이지
```

---

## 2. 파일 설계

### 2.1 `public/manifest.json`

```json
{
  "name": "나의 기록",
  "short_name": "나의 기록",
  "description": "나만의 기록 앱 - 일기, 아이디어, 순간을 기록하세요",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAF8F4",
  "theme_color": "#4F46E5",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["lifestyle", "productivity"]
}
```

**필드 설명**:
- `display: "standalone"` — 브라우저 UI 없이 네이티브 앱처럼 실행
- `background_color` — 스플래시 화면 배경 (라이트 모드 기준 `#FAF8F4`)
- `theme_color` — 상단 상태바 색상 (인디고 계열)
- `purpose: "any maskable"` — Android 적응형 아이콘 지원

### 2.2 `next.config.ts` 변경

```typescript
import type { NextConfig } from "next";
import withSerwist from "@serwist/next";

const withPWA = withSerwist({
  swSrc: "src/app/sw.ts",          // Service Worker 소스
  swDest: "public/sw.js",          // 빌드 출력 경로
  disable: process.env.NODE_ENV === "development",  // 개발 중 비활성화
});

const nextConfig: NextConfig = {
  /* 기존 config 옵션 */
};

export default withPWA(nextConfig);
```

### 2.3 `src/app/sw.ts` (Service Worker 소스)

```typescript
import { defaultCache } from "@serwist/next/worker";
import { installSerwist } from "serwist";

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    ...defaultCache,
    // Supabase API — Network Only (오프라인 시 실패 허용)
    {
      matcher: /^https:\/\/.*\.supabase\.co\/.*/,
      handler: "NetworkOnly",
    },
    // 폰트 캐싱 — Cache First
    {
      matcher: /^https:\/\/cdn\.jsdelivr\.net\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "cdn-fonts",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
  ],
  fallbacks: {
    document: "/offline",           // 오프라인 시 fallback 페이지
  },
});
```

### 2.4 `src/app/layout.tsx` 변경

**추가할 metadata 필드**:
```typescript
export const metadata: Metadata = {
  title: "나의 기록 | my-record-v2",
  description: "나만의 기록 앱 - 일기, 아이디어, 순간을 기록하세요",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "나의 기록",
  },
};
```

**`<head>`에 추가할 태그**:
```html
<meta name="theme-color" content="#4F46E5" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
```

### 2.5 `src/app/offline/page.tsx`

```typescript
export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <div className="text-6xl mb-4">📴</div>
      <h1 className="text-2xl font-bold mb-2 dark:text-white">
        오프라인 상태입니다
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        인터넷 연결을 확인해주세요.<br />
        이전에 저장된 기록은 계속 사용할 수 있습니다.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium"
      >
        다시 시도
      </a>
    </div>
  );
}
```

### 2.6 앱 아이콘 스펙

| 파일 | 크기 | 용도 |
|------|------|------|
| `public/icons/icon-192x192.png` | 192×192px | Android 홈 화면, PWA 기본 |
| `public/icons/icon-512x512.png` | 512×512px | 스플래시, 앱 스토어 |

**디자인 가이드**:
- 배경: 인디고 (`#4F46E5`) 또는 앱 테마 컬러
- 아이콘: 책/펜 모티프, 흰색
- Safe zone: 아이콘 전체 크기의 80% 내에 디자인 (maskable 대응)

---

## 3. 의존성

### 3.1 설치 패키지

```bash
npm install @serwist/next serwist
```

| 패키지 | 버전 | 역할 |
|--------|------|------|
| `@serwist/next` | ^9.x | Next.js PWA 플러그인 |
| `serwist` | ^9.x | Service Worker 빌드 도구 |

### 3.2 `tsconfig.json` 추가 (sw.ts 지원)

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext", "webworker"]
  }
}
```

> **Note**: `webworker` lib 추가로 Service Worker 타입 지원

---

## 4. 구현 순서 (Do Phase 가이드)

```
Step 1: 의존성 설치
  npm install @serwist/next serwist

Step 2: next.config.ts 수정
  withSerwist 래핑 추가

Step 3: src/app/sw.ts 생성
  installSerwist 설정

Step 4: public/manifest.json 생성

Step 5: 앱 아이콘 생성 및 배치
  public/icons/icon-192x192.png
  public/icons/icon-512x512.png

Step 6: src/app/layout.tsx 수정
  manifest, theme-color, apple-touch-icon 추가

Step 7: src/app/offline/page.tsx 생성

Step 8: 프로덕션 빌드 후 Lighthouse 테스트
  npm run build && npm start
```

---

## 5. 검증 기준

| 항목 | 검증 방법 | 기준 |
|------|----------|------|
| PWA 설치 | Chrome DevTools → Application → Manifest | 오류 없음 |
| Service Worker | DevTools → Application → Service Workers | 활성(active) 상태 |
| 오프라인 | DevTools → Network → Offline 체크 후 새로고침 | `/offline` 표시 |
| Lighthouse | DevTools → Lighthouse → PWA 카테고리 | 90점 이상 |
| 모바일 설치 | Android Chrome → 주소창 설치 아이콘 | 프롬프트 표시 |

---

## 6. 주의 사항

1. **개발 환경**: `disable: process.env.NODE_ENV === "development"` — SW는 `npm run build` 후 `npm start`에서만 활성화
2. **Supabase 인증**: 오프라인 상태에서 로그인 시도 시 graceful한 에러 메시지 표시 필요 (별도 처리)
3. **캐시 무효화**: 앱 업데이트 시 `skipWaiting: true`로 자동 처리됨
4. **HTTPS 필수**: PWA Service Worker는 HTTPS(또는 localhost)에서만 동작

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-11 | 최초 작성 | Claude |
