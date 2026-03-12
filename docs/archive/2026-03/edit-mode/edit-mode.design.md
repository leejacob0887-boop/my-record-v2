# [Design] Edit Mode (선택 삭제 + 전체 삭제)

## Executive Summary

| 항목 | 내용 |
|------|------|
| Feature | Edit Mode — 일기/메모/아이디어 목록 선택 삭제 기능 |
| 신규 파일 | 없음 |
| 수정 파일 | `src/app/diary/page.tsx`, `src/app/moments/page.tsx`, `src/app/ideas/page.tsx` |

---

## 1. 컴포넌트 구조

```
목록 페이지 (diary/moments/ideas page.tsx)
├── 헤더 영역 (기존)
├── 제목 영역
│   ├── [편집 모드 ON] '전체 선택' 원형 체크박스 버튼 (좌측 절대 위치)
│   ├── 제목 + 부제 (가운데 정렬)
│   └── '편집' / '취소' 버튼 (우측 절대 위치, 항목 있을 때만 표시)
├── [편집 모드 OFF] 검색 바 (기존)
├── [편집 모드 OFF] 태그 필터 (기존)
├── [편집 모드 OFF] 새 항목 버튼 (기존)
├── 목록 카드들
│   ├── [편집 모드 OFF] Link → 상세 페이지
│   └── [편집 모드 ON] div + 원형 체크박스, 선택 시 파란 하이라이트
├── [편집 모드 ON] 하단 고정 바
│   ├── 좌측: "N개 선택됨" / "항목을 선택하세요" 텍스트
│   └── 우측: 휴지통 아이콘 버튼 — 선택 없으면 disabled
└── 삭제 확인 다이얼로그 (모달)
    ├── 삭제 대상 개수 표시
    ├── "삭제된 기록은 복구할 수 없어요" 경고
    ├── '취소' 버튼
    └── '삭제하기' 버튼
```

---

## 2. 파일 목록

| 파일 | 신규/수정 | 설명 |
|------|-----------|------|
| `src/app/diary/page.tsx` | 수정 | 편집 모드 + 삭제 기능 |
| `src/app/moments/page.tsx` | 수정 | 편집 모드 + 삭제 기능 |
| `src/app/ideas/page.tsx` | 수정 | 편집 모드 + 삭제 기능 |

---

## 3. 상태 설계

```ts
const [editMode, setEditMode] = useState(false);
const [selected, setSelected] = useState<Set<string>>(new Set());
const [confirmDelete, setConfirmDelete] = useState(false);

// 파생 상태
const allSelected = filtered.length > 0 && filtered.every(e => e.id && selected.has(e.id));
```

---

## 4. 편집 모드 진입/종료

```ts
const exitEditMode = () => {
  setEditMode(false);
  setSelected(new Set());
};
```

- `editMode = true` 진입 시: 검색/태그필터/새 항목 버튼 숨김
- `pb-28` 추가로 하단 바가 콘텐츠를 가리지 않게 처리

---

## 5. 체크박스 (카드 컴포넌트)

```
편집 모드 OFF: w-10 h-10 아이콘 + Link 래퍼
편집 모드 ON:  w-6 h-6 원형 체크박스 + div 래퍼 (클릭 → toggleSelect)
  - 미선택: border-gray-300, 배경 투명
  - 선택: bg-[#4A90D9] border-[#4A90D9] + 흰색 체크마크 SVG
  - 행 배경: 선택 시 bg-blue-50 dark:bg-blue-900/20
```

---

## 6. 전체 선택 버튼 (편집 모드 ON)

```
절대 위치(left-0), 제목 영역 내부
- 원형 체크박스 (w-5 h-5) + "전체 선택" 텍스트
- allSelected = true: bg-[#4A90D9], 흰 체크마크
- allSelected = false: border-gray-300, 빈 원
- 클릭: toggleSelectAll() — 전체 선택/해제 토글
```

## 7. 하단 액션 바

```
fixed bottom-0, bg-white dark:bg-gray-800, z-40
justify-between 레이아웃
좌측: "N개 선택됨" 텍스트 (선택 없으면 "항목을 선택하세요")
우측: 휴지통 아이콘 버튼 (w-11 h-11, bg-red-50)
      selected.size === 0 → disabled:opacity-30
```

---

## 8. 삭제 확인 다이얼로그

```
fixed inset-0 overlay (z-50) + 중앙 카드
- 제목: "N개 삭제"
- 본문: "선택한 N개의 [타입]을 삭제할까요?"
- 경고: "삭제된 기록은 복구할 수 없어요."
- 버튼: [취소] [삭제하기]
```

---

## 9. 삭제 실행

```ts
const handleDeleteConfirm = () => {
  Array.from(selected).forEach(id => remove(id));
  setConfirmDelete(false);
  exitEditMode();
};
```

---

## 10. 수용 기준

| 기준 | 설명 |
|------|------|
| FR-01 | 제목 우측 '편집' 버튼 (항목 있을 때만 표시) |
| FR-02 | 편집 모드 진입 시 체크박스 표시 |
| FR-03 | 편집 모드 진입 시 검색/태그필터/새 항목 버튼 숨김 |
| FR-04 | 항목 선택 시 파란 하이라이트 + 체크마크 |
| FR-05 | 편집 모드 진입 시 제목 좌측 '전체 선택' 버튼 표시 |
| FR-06 | 하단 바: 선택 수 텍스트 + 휴지통 아이콘 버튼 |
| FR-07 | 선택 없으면 휴지통 버튼 비활성화 |
| FR-08 | 삭제 전 확인 다이얼로그 표시 |
| FR-09 | 실제 삭제: hooks remove() 호출 |
| FR-10 | '취소' 버튼으로 편집 모드 종료 |
| FR-11 | 다크모드 대응 |

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
|------|------|--------|
| 2026-03-12 | 초안 작성 (구현 후 역문서화) | Claude |
| 2026-03-12 | v2.0 — 전체 선택 + 휴지통 UI 반영, 설계 동기화 | Claude |
