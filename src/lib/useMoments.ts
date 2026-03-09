'use client';

import { useState, useCallback } from 'react';
import { Moment } from './types';
import { storageGet, storageSet } from './storage';

const KEY = 'moments_list';

function loadAllMoments(): Moment[] {
  const all = storageGet<Moment[]>(KEY) ?? [];
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function useMoments() {
  const [moments, setMoments] = useState<Moment[]>(() => loadAllMoments());

  const getByDate = useCallback(
    (date: string): Moment[] => moments.filter((m) => m.date === date),
    [moments]
  );

  const getById = useCallback(
    (id: string): Moment | undefined => moments.find((m) => m.id === id),
    [moments]
  );

  const add = useCallback(
    (data: { text: string; date: string; imageBase64?: string }) => {
      const now = new Date().toISOString();
      const newMoment: Moment = {
        id: crypto.randomUUID(),
        type: 'moment',
        createdAt: now,
        updatedAt: now,
        ...data,
      };
      const current = storageGet<Moment[]>(KEY) ?? [];
      storageSet(KEY, [newMoment, ...current]);
      setMoments(loadAllMoments());
    },
    []
  );

  const update = useCallback(
    (id: string, data: Partial<Pick<Moment, 'text' | 'imageBase64'>>) => {
      const current = storageGet<Moment[]>(KEY) ?? [];
      const updated = current.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      );
      storageSet(KEY, updated);
      setMoments(loadAllMoments());
    },
    []
  );

  const remove = useCallback(
    (id: string) => {
      const current = storageGet<Moment[]>(KEY) ?? [];
      storageSet(KEY, current.filter((m) => m.id !== id));
      setMoments(loadAllMoments());
    },
    []
  );

  return { moments, getByDate, getById, add, update, remove };
}
