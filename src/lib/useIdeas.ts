'use client';

import { useState, useEffect, useCallback } from 'react';
import { Idea } from './types';
import { storageGet, storageSet } from './storage';

const KEY = 'ideas_list';

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  const load = useCallback(() => {
    const all = storageGet<Idea[]>(KEY) ?? [];
    setIdeas(all.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getById = useCallback(
    (id: string): Idea | undefined => ideas.find((i) => i.id === id),
    [ideas]
  );

  const add = useCallback(
    (data: { title: string; content: string; imageBase64?: string }) => {
      const now = new Date().toISOString();
      const newIdea: Idea = {
        id: crypto.randomUUID(),
        type: 'idea',
        createdAt: now,
        updatedAt: now,
        ...data,
      };
      const current = storageGet<Idea[]>(KEY) ?? [];
      storageSet(KEY, [newIdea, ...current]);
      load();
    },
    [load]
  );

  const update = useCallback(
    (id: string, data: Partial<Pick<Idea, 'title' | 'content' | 'imageBase64'>>) => {
      const current = storageGet<Idea[]>(KEY) ?? [];
      const updated = current.map((i) =>
        i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i
      );
      storageSet(KEY, updated);
      load();
    },
    [load]
  );

  const remove = useCallback(
    (id: string) => {
      const current = storageGet<Idea[]>(KEY) ?? [];
      storageSet(KEY, current.filter((i) => i.id !== id));
      load();
    },
    [load]
  );

  return { ideas, getById, add, update, remove };
}
