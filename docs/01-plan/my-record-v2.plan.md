# Plan: my-record-v2

## Overview
개인 기록/일기 앱 - 날짜별 기록을 작성하고 관리하는 정적 웹앱

## Feature Goals
- [ ] 기록 목록 조회 (홈)
- [ ] 새 기록 작성 (제목 + 내용 + 날짜)
- [ ] 기록 상세 보기
- [ ] 기록 수정 / 삭제
- [ ] LocalStorage 데이터 저장

## Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS
- TypeScript
- LocalStorage (백엔드 없음)

## Pages
| Route | Description |
|-------|-------------|
| `/` | 기록 목록 |
| `/records/new` | 새 기록 작성 |
| `/records/[id]` | 기록 상세 보기 |
| `/records/[id]/edit` | 기록 수정 |

## Next Steps
1. `/pdca design my-record-v2` - 상세 설계
2. 컴포넌트 구현 (RecordCard, RecordForm, Header)
3. LocalStorage 훅 구현
