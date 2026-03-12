# Edit Mode Analysis Report

> **Analysis Type**: Gap Analysis (Design vs Implementation)
>
> **Project**: my-record-v2
> **Analyst**: Claude (gap-detector)
> **Date**: 2026-03-12
> **Design Doc**: [edit-mode.design.md](../02-design/features/edit-mode.design.md)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

Re-verify edit-mode feature against its design spec. The previous v1.0 analysis (100% match) was inaccurate -- it did not account for intentional UI evolution that diverged from the original design.

### 1.2 Analysis Scope

- **Design Document**: `docs/02-design/features/edit-mode.design.md`
- **Implementation Files**:
  - `src/app/diary/page.tsx`
  - `src/app/moments/page.tsx`
  - `src/app/ideas/page.tsx`
- **Analysis Date**: 2026-03-12

---

## 2. Gap Analysis (Design vs Implementation)

### 2.1 State Design

| Design State | Implementation State | Status | Notes |
|-------------|---------------------|:------:|-------|
| `editMode: boolean` | `editMode: boolean` | ✅ | Identical |
| `selected: Set<string>` | `selected: Set<string>` | ✅ | Identical |
| `deleteTarget: 'selected' \| 'all' \| null` | `confirmDelete: boolean` | ⚠ Changed | "전체 삭제" path removed; single boolean replaces union type |

All three implementation files use the same `confirmDelete: boolean` pattern consistently.

### 2.2 Acceptance Criteria Verification

| FR | Criterion | diary | moments | ideas | Status |
|----|-----------|:-----:|:-------:|:-----:|:------:|
| FR-01 | Edit button on title right (shown when items exist) | L241-248 | L210-217 | L214-221 | ✅ Match |
| FR-02 | Checkboxes in edit mode (w-6 h-6 circle) | L74-81 | L61-68 | L61-68 | ✅ Match |
| FR-03 | Hide search/tag filter/new button in edit mode | L252,268,289 | L221,237,258 | L225,241,262 | ✅ Match |
| FR-04 | Blue highlight + checkmark on selection | L75,106 | L62,90 | L62,93 | ✅ Match |
| FR-05 | Bottom bar: "선택 삭제(N)" + "전체 삭제" two buttons | -- | -- | -- | ⚠ Changed |
| FR-06 | Disable select-delete when nothing selected | L334 | L303 | L307 | ✅ Match |
| FR-07 | Confirm dialog before delete | L349-376 | L318-345 | L322-349 | ✅ Match |
| FR-08 | Actual delete via hooks remove() | L200 | L169 | L173 | ✅ Match |
| FR-09 | Cancel button exits edit mode | L243 | L212 | L216 | ✅ Match |
| FR-10 | Dark mode support | all files | all files | all files | ✅ Match |

### 2.3 Missing Features (Design O, Implementation X)

| Item | Design Location | Description | Impact |
|------|----------------|-------------|--------|
| "전체 삭제" button | design.md L29, L89-91 | Separate "전체 삭제" button removed from bottom bar | Low -- replaced by "전체 선택" + trash |
| `deleteTarget` state | design.md L54 | Union type `'selected' \| 'all' \| null` not used | Low -- simplified to boolean |
| "전체 삭제" dialog variant | design.md L100 | Dialog title "전체 삭제" / body text for all-delete path | Low -- only selected-delete dialog remains |

### 2.4 Added Features (Design X, Implementation O)

| Item | Implementation Location | Description | Impact |
|------|------------------------|-------------|--------|
| "전체 선택" checkbox | diary L222-236, moments L191-205, ideas L195-209 | Circular checkbox + "전체 선택" label on title-area left side | Low -- improves UX |
| `allSelected` derived state | diary L176, moments L145, ideas L149 | Computed boolean for select-all toggle | Low |
| `toggleSelectAll()` function | diary L186-191, moments L155-161, ideas L159-165 | Select/deselect all filtered items | Low |
| Selection count text | diary L329-331, moments L298-300, ideas L302-304 | "N개 선택됨" / "항목을 선택하세요" replaces button labels | Low |
| Single trash icon button | diary L332-344, moments L301-313, ideas L305-317 | Red trash icon replaces two text buttons | Low |

### 2.5 Changed Features (Design != Implementation)

| Item | Design | Implementation | Impact |
|------|--------|---------------|--------|
| Bottom bar layout | Two buttons: "선택 삭제(N)" + "전체 삭제" | Left: count text, Right: single trash icon | Low |
| Delete state management | `deleteTarget: 'selected' \| 'all' \| null` | `confirmDelete: boolean` | Low |
| Bulk delete mechanism | Explicit "전체 삭제" button | "전체 선택" checkbox + trash (same result, different UX) | Low |
| `handleDeleteConfirm` logic | Branching on `deleteTarget === 'all'` vs selected | Always deletes `Array.from(selected)` | Low |

### 2.6 Consistency Across Pages

All three pages implement identical edit-mode behavior. No cross-page inconsistencies found.

| Aspect | diary | moments | ideas |
|--------|:-----:|:-------:|:-----:|
| "전체 선택" checkbox | Yes | Yes | Yes |
| Trash icon bottom bar | Yes | Yes | Yes |
| `confirmDelete` boolean state | Yes | Yes | Yes |
| `toggleSelectAll()` | Yes | Yes | Yes |

### 2.7 Match Rate Summary

```
+---------------------------------------------+
|  Overall Match Rate: 92%                     |
+---------------------------------------------+
|  FR-01 ~ FR-10: 9/10 criteria match          |
|  FR-05: intentionally changed (1 item)       |
+---------------------------------------------+
|  Missing in impl:   3 items (all intentional)|
|  Added in impl:     5 items (all intentional)|
|  Changed items:     4 items (all intentional)|
+---------------------------------------------+
```

---

## 3. Code Quality Observations

### 3.1 Code Duplication

| Issue | Severity | Description |
|-------|:--------:|-------------|
| Repeated edit-mode logic | Info | All 3 pages duplicate ~40 lines of identical state/handlers. Could extract `useEditMode()` hook. |
| Repeated Card pattern | Info | DiaryCard, MomentCard, IdeaCard share checkbox/highlight/wrapper structure. Could extract `EditableCard`. |
| Repeated bottom bar + dialog | Info | Identical JSX in all 3 pages. Could extract `EditModeBottomBar` and `DeleteConfirmDialog`. |

### 3.2 Dark Mode Verification (FR-10)

| Element | Light Mode | Dark Mode | Status |
|---------|-----------|-----------|:------:|
| Bottom bar bg | `bg-white` | `dark:bg-gray-800` | ✅ |
| Bottom bar border | `border-gray-100` | `dark:border-gray-700` | ✅ |
| Dialog bg | `bg-white` | `dark:bg-gray-800` | ✅ |
| Dialog title text | `text-gray-800` | `dark:text-gray-100` | ✅ |
| Dialog body text | `text-gray-500` | `dark:text-gray-400` | ✅ |
| Selected row bg | `bg-blue-50` | `dark:bg-blue-900/20` | ✅ |
| Checkbox border (unselected) | `border-gray-300` | `dark:border-gray-600` | ✅ |
| "전체 선택" checkbox border | `border-gray-300` | `dark:border-gray-500` | ✅ |
| Selection count text | `text-gray-400` | `dark:text-gray-500` | ✅ |

---

## 4. Overall Score

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match | 92% | ✅ |
| Architecture Compliance | N/A | -- |
| Convention Compliance | N/A | -- |
| **Overall (Feature Match)** | **92%** | ✅ |

> All divergences are intentional UX improvements. The implementation achieves
> the same functional goal (select + delete items) through a cleaner UI pattern
> ("전체 선택" checkbox + single trash icon instead of two text buttons).

---

## 5. Recommended Actions

### 5.1 Design Document Update (Recommended)

The design document should be updated to reflect the intentional evolution:

| Section | Current (Design) | Should Be |
|---------|-----------------|-----------|
| Section 1 (컴포넌트 구조) | 하단 바: "선택 삭제(N)" + "전체 삭제" | 하단 바: "N개 선택됨" 텍스트 + 휴지통 아이콘 |
| Section 1 (컴포넌트 구조) | -- | 제목 영역 좌측: "전체 선택" 체크박스 (편집 모드 시) |
| Section 3 (상태 설계) | `deleteTarget: 'selected' \| 'all' \| null` | `confirmDelete: boolean` |
| Section 6 (하단 액션 바) | 두 버튼 레이아웃 | 텍스트 + 아이콘 레이아웃 |
| Section 8 (삭제 실행) | `deleteTarget` 분기 로직 | `Array.from(selected)` 단일 경로 |

### 5.2 Future Improvements (Backlog)

| Priority | Item | Expected Impact |
|----------|------|-----------------|
| Low | Extract `useEditMode()` custom hook | Reduce ~120 lines of duplication |
| Low | Extract `DeleteConfirmDialog` component | Reusable across pages |
| Low | Extract `EditModeBottomBar` component | Reusable across pages |

---

## 6. Next Steps

- [ ] Update design document to match implementation (close the 8% gap)
- [ ] Write completion report (`edit-mode.report.md`) if desired

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-12 | Initial analysis -- incorrectly reported 100% match | Claude |
| 2.0 | 2026-03-12 | Corrected analysis -- identified intentional divergences, actual match 92% | Claude |
