# [Plan] PWA (Progressive Web App)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | PWA (Progressive Web App) |
| 시작일 | 2026-03-11 |
| 예상 기간 | 2~3일 |
| 우선순위 | Medium |

### Value Delivered (4-Perspective)

| 관점 | 내용 |
|------|------|
| **Problem** | 모바일에서 브라우저를 열고 URL을 입력해야 앱을 사용할 수 있어 접근성이 낮음 |
| **Solution** | PWA 적용으로 홈 화면 추가 및 오프라인 사용을 지원 |
| **Function UX Effect** | 앱처럼 설치 가능하고 오프라인에서도 기록 조회·작성 가능 |
| **Core Value** | 네이티브 앱 수준의 접근성과 사용 편의성 제공 |

---

## 1. 기능 개요

### 1.1 목적
my-record-v2를 PWA로 전환하여 사용자가 모바일/데스크탑 홈 화면에 앱처럼 설치하고, 오프라인 환경에서도 기록을 작성·조회할 수 있게 한다.

### 1.2 범위
- Web App Manifest 설정
- Service Worker 등록 및 캐싱 전략
- 오프라인 지원 (LocalStorage 기반이므로 데이터는 이미 로컬)
- 설치 프롬프트 UI (선택)
- 앱 아이콘 및 스플래시 화면

### 1.3 제외 범위
- Push Notification (별도 백엔드 필요, 현재 Starter 레벨 제외)
- Background Sync (서버 없이 불필요)

---

## 2. 요구사항

### 2.1 기능 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|----------|
| FR-01 | Web App Manifest (`manifest.json`) 생성 및 연결 | High |
| FR-02 | Service Worker 등록 및 정적 자산 캐싱 | High |
| FR-03 | 오프라인 fallback 페이지 제공 | Medium |
| FR-04 | 모바일 홈 화면 추가 지원 (standalone 모드) | High |
| FR-05 | 앱 아이콘 다양한 크기 제공 (192x192, 512x512) | High |
| FR-06 | 설치 가능 배너/버튼 UI (선택적) | Low |

### 2.2 비기능 요구사항

| ID | 요구사항 |
|----|----------|
| NFR-01 | Lighthouse PWA 점수 90점 이상 |
| NFR-02 | 오프라인 상태에서 기존 기록 조회 가능 |
| NFR-03 | 첫 로드 후 재방문 시 캐시에서 즉시 로딩 |
| NFR-04 | Next.js App Router와 호환 |

---

## 3. 기술 스택

| 항목 | 선택 | 이유 |
|------|------|------|
| Service Worker | `next-pwa` 또는 수동 구현 | Next.js 15와 호환, 설정 간단 |
| Manifest | `public/manifest.json` | 표준 PWA 방식 |
| 캐싱 전략 | Cache First (정적) + Network First (페이지) | 성능과 최신성 균형 |
| 아이콘 | SVG 기반 PNG 변환 | 현재 프로젝트 디자인 연속성 |

> **Note**: `next-pwa` 패키지(serwist 기반) 사용 권장 — Next.js 15 App Router 호환

---

## 4. 구현 계획

### 4.1 구현 순서

```
1. 의존성 설치 (next-pwa / @serwist/next)
2. next.config.ts PWA 설정 추가
3. manifest.json 생성 (public/)
4. 앱 아이콘 생성 (192x192, 512x512)
5. layout.tsx에 manifest 링크 추가
6. Service Worker 캐싱 전략 설정
7. 오프라인 fallback 페이지 생성
8. Lighthouse 테스트 및 점수 확인
```

### 4.2 파일 변경 목록

| 파일 | 변경 내용 |
|------|-----------|
| `next.config.ts` | PWA 플러그인 래핑 |
| `public/manifest.json` | 앱 메타데이터 정의 |
| `public/icons/icon-192x192.png` | 앱 아이콘 |
| `public/icons/icon-512x512.png` | 앱 아이콘 (대형) |
| `src/app/layout.tsx` | manifest 링크, theme-color 메타태그 |
| `src/app/offline/page.tsx` | 오프라인 fallback 페이지 |

### 4.3 의존성

```bash
npm install @serwist/next serwist
```

---

## 5. 수용 기준 (Acceptance Criteria)

- [ ] 모바일 Chrome에서 "홈 화면에 추가" 프롬프트가 표시됨
- [ ] 설치 후 standalone 모드로 실행됨 (브라우저 UI 없음)
- [ ] 네트워크 끊긴 상태에서 앱 진입 가능 (오프라인 페이지 또는 캐시)
- [ ] LocalStorage 데이터가 오프라인에서도 조회됨
- [ ] Lighthouse PWA 점수 90점 이상
- [ ] 다크모드/라이트모드 아이콘 정상 표시

---

## 6. 위험 요소 및 대응

| 위험 | 가능성 | 대응 |
|------|--------|------|
| Next.js 15와 `next-pwa` 호환 문제 | Medium | `@serwist/next` 사용 (공식 지원) |
| Service Worker 캐시 업데이트 이슈 | Low | `skipWaiting: true` 설정 |
| 아이콘 생성 도구 부재 | Low | Canvas API 또는 온라인 도구 활용 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-11 | 최초 작성 | Claude |
