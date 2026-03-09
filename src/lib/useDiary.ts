'use client';

import { useState, useCallback } from 'react';
import { DiaryEntry } from './types';
import { storageGet, storageSet, storageRemove } from './storage';

const PREFIX = 'diary_';

function getAllDiaryKeys(): string[] {
  if (typeof window === 'undefined') return [];
  return Object.keys(localStorage).filter((k) => k.startsWith(PREFIX));
}

function loadAllEntries(): DiaryEntry[] {
  const keys = getAllDiaryKeys();
  return keys
    .map((k) => storageGet<DiaryEntry>(k))
    .filter((e): e is DiaryEntry => e !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function useDiary() {
  const [entries, setEntries] = useState<DiaryEntry[]>(() => loadAllEntries());

  const getTodayEntry = useCallback((): DiaryEntry | undefined => {
    const today = new Date().toISOString().slice(0, 10);
    return entries.find((e) => e.date === today);
  }, [entries]);

  const getByDate = useCallback(
    (date: string): DiaryEntry | undefined => entries.find((e) => e.date === date),
    [entries]
  );

  const getById = useCallback(
    (id: string): DiaryEntry | undefined => entries.find((e) => e.id === id),
    [entries]
  );

  const save = useCallback(
    (data: { date: string; title: string; content: string; imageBase64?: string }) => {
      const existing = storageGet<DiaryEntry>(`${PREFIX}${data.date}`);
      const now = new Date().toISOString();
      const entry: DiaryEntry = existing
        ? { ...existing, ...data, type: 'diary', updatedAt: now }
        : {
            id: crypto.randomUUID(),
            type: 'diary',
            createdAt: now,
            updatedAt: now,
            ...data,
          };
      storageSet(`${PREFIX}${data.date}`, entry);
      setEntries(loadAllEntries());
    },
    []
  );

  const remove = useCallback(
    (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        storageRemove(`${PREFIX}${entry.date}`);
        setEntries(loadAllEntries());
      }
    },
    [entries]
  );

  return { entries, getTodayEntry, getByDate, getById, save, remove };
}
