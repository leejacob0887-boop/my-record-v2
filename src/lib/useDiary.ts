'use client';

import { useState, useCallback, useEffect } from 'react';
import { DiaryEntry } from './types';
import { storageGet, storageSet, storageRemove } from './storage';
import { supabase } from './supabase';
import { useAuth } from '@/context/AuthContext';

const PREFIX = 'diary_';

function getAllDiaryKeys(): string[] {
  if (typeof window === 'undefined') return [];
  // diary_YYYY-MM-DD 형식만 (diary_tags_ 등 다른 키 제외)
  return Object.keys(localStorage).filter((k) => /^diary_\d{4}-\d{2}-\d{2}$/.test(k));
}

function loadAllEntries(): DiaryEntry[] {
  const keys = getAllDiaryKeys();
  return keys
    .map((k) => storageGet<DiaryEntry>(k))
    .filter((e): e is DiaryEntry => e !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

function mapFromDB(row: Record<string, unknown>): DiaryEntry {
  return {
    id: row.id as string,
    type: 'diary',
    date: row.date as string,
    title: row.title as string,
    content: row.content as string,
    imageBase64: (row.image_base64 as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useDiary() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      // 로그아웃 시 LocalStorage 초기화 후 빈 배열
      getAllDiaryKeys().forEach(k => storageRemove(k));
      setEntries([]);
      return;
    }
    supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (data) {
          getAllDiaryKeys().forEach(k => storageRemove(k));
          const mapped = data.map(mapFromDB);
          setEntries(mapped);
          mapped.forEach(e => storageSet(`${PREFIX}${e.date}`, e));
        }
      });
  }, [user, loading]);

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
    async (data: { date: string; title: string; content: string; imageBase64?: string }) => {
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

      // LocalStorage 저장 (동기)
      storageSet(`${PREFIX}${data.date}`, entry);
      setEntries(loadAllEntries());

      // Supabase 저장 (await, 로그인 시) - 완료 후 navigate해야 useEffect 덮어쓰기 방지
      if (user) {
        await supabase.from('diary_entries').upsert({
          id: entry.id,
          user_id: user.id,
          date: entry.date,
          title: entry.title,
          content: entry.content,
          image_base64: entry.imageBase64 ?? null,
          created_at: entry.createdAt,
          updated_at: now,
        }, { onConflict: 'user_id,date' });
      }
    },
    [user]
  );

  const remove = useCallback(
    async (id: string) => {
      const entry = entries.find((e) => e.id === id);
      if (entry) {
        storageRemove(`${PREFIX}${entry.date}`);
        setEntries(loadAllEntries());
        if (user) {
          await supabase.from('diary_entries').delete().eq('id', id).eq('user_id', user.id);
        }
      }
    },
    [entries, user]
  );

  return { entries, getTodayEntry, getByDate, getById, save, remove };
}
