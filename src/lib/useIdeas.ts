'use client';

import { useState, useCallback, useEffect } from 'react';
import { Idea } from './types';
import { storageGet, storageSet } from './storage';
import { supabase } from './supabase';
import { deleteImage } from './storageUpload';
import { useAuth } from '@/context/AuthContext';

const KEY = 'ideas_list';

function loadAllIdeas(): Idea[] {
  const all = storageGet<Idea[]>(KEY) ?? [];
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function mapFromDB(row: Record<string, unknown>): Idea {
  return {
    id: row.id as string,
    type: 'idea',
    date: (row.date as string) ?? (row.created_at as string).slice(0, 10),
    title: row.title as string,
    content: row.content as string,
    imageBase64: (row.image_base64 as string) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useIdeas() {
  const { user, loading } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      storageSet(KEY, []);
      setIdeas([]);
      setIsLoading(false);
      return;
    }
    supabase
      .from('ideas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(mapFromDB);
          setIdeas(mapped);
          storageSet(KEY, mapped);
        }
        setIsLoading(false);
      }, () => setIsLoading(false));
  }, [user, loading]);

  const getById = useCallback(
    (id: string): Idea | undefined => ideas.find((i) => i.id === id),
    [ideas]
  );

  const add = useCallback(
    async (data: { title: string; content: string; date?: string; imageBase64?: string; tags?: string[] }) => {
      const now = new Date().toISOString();
      const newIdea: Idea = {
        id: crypto.randomUUID(),
        type: 'idea',
        date: data.date ?? now.slice(0, 10),
        createdAt: now,
        updatedAt: now,
        ...data,
      };

      // LocalStorage 저장 (동기)
      const current = storageGet<Idea[]>(KEY) ?? [];
      storageSet(KEY, [newIdea, ...current]);
      setIdeas(loadAllIdeas());

      // Supabase 저장 (await, 로그인 시)
      if (user) {
        await supabase.from('ideas').insert({
          id: newIdea.id,
          user_id: user.id,
          date: newIdea.date,
          title: newIdea.title,
          content: newIdea.content,
          image_base64: newIdea.imageBase64 ?? null,
          tags: newIdea.tags ?? [],
          created_at: now,
          updated_at: now,
        });
      }
    },
    [user]
  );

  const update = useCallback(
    async (id: string, data: Partial<Pick<Idea, 'title' | 'content' | 'date' | 'imageBase64'>>) => {
      const now = new Date().toISOString();
      const current = storageGet<Idea[]>(KEY) ?? [];
      const updated = current.map((i) =>
        i.id === id ? { ...i, ...data, updatedAt: now } : i
      );
      storageSet(KEY, updated);
      setIdeas(loadAllIdeas());

      if (user) {
        await supabase.from('ideas').update({
          title: data.title,
          content: data.content,
          date: data.date,
          image_base64: data.imageBase64 ?? null,
          updated_at: now,
        }).eq('id', id).eq('user_id', user.id);
      }
    },
    [user]
  );

  const remove = useCallback(
    async (id: string) => {
      const current = storageGet<Idea[]>(KEY) ?? [];
      const target = current.find((i) => i.id === id);
      storageSet(KEY, current.filter((i) => i.id !== id));
      setIdeas(loadAllIdeas());

      if (user) {
        await Promise.all([
          supabase.from('ideas').delete().eq('id', id).eq('user_id', user.id),
          deleteImage(target?.imageBase64),
        ]);
      }
    },
    [user]
  );

  return { ideas, getById, add, update, remove, isLoading };
}
