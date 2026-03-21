'use client';

import { useState, useCallback, useEffect } from 'react';
import { Moment, LinkPreview } from './types';
import { storageGet, storageSet } from './storage';
import { supabase } from './supabase';
import { deleteImage } from './storageUpload';
import { useAuth } from '@/context/AuthContext';

const KEY = 'moments_list';

function loadAllMoments(): Moment[] {
  const all = storageGet<Moment[]>(KEY) ?? [];
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function mapFromDB(row: Record<string, unknown>): Moment {
  return {
    id: row.id as string,
    type: 'moment',
    date: row.date as string,
    text: row.text as string,
    imageBase64: (row.image_base64 as string) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    linkPreview: (row.link_preview as LinkPreview) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useMoments() {
  const { user, loading } = useAuth();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      storageSet(KEY, []);
      setMoments([]);
      setIsLoading(false);
      return;
    }
    supabase
      .from('moments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(mapFromDB);
          setMoments(mapped);
          storageSet(KEY, mapped);
        }
        setIsLoading(false);
      }, () => setIsLoading(false));
  }, [user, loading]);

  const getByDate = useCallback(
    (date: string): Moment[] => moments.filter((m) => m.date === date),
    [moments]
  );

  const getById = useCallback(
    (id: string): Moment | undefined => moments.find((m) => m.id === id),
    [moments]
  );

  const add = useCallback(
    async (data: { text: string; date: string; imageBase64?: string; tags?: string[]; linkPreview?: LinkPreview }) => {
      const now = new Date().toISOString();
      const newMoment: Moment = {
        id: crypto.randomUUID(),
        type: 'moment',
        createdAt: now,
        updatedAt: now,
        ...data,
      };

      // LocalStorage 저장 (동기)
      const current = storageGet<Moment[]>(KEY) ?? [];
      storageSet(KEY, [newMoment, ...current]);
      setMoments(loadAllMoments());

      // Supabase 저장 (await, 로그인 시)
      if (user) {
        await supabase.from('moments').insert({
          id: newMoment.id,
          user_id: user.id,
          date: newMoment.date,
          text: newMoment.text,
          image_base64: newMoment.imageBase64 ?? null,
          tags: newMoment.tags ?? [],
          link_preview: newMoment.linkPreview ?? null,
          created_at: now,
          updated_at: now,
        });
      }
    },
    [user]
  );

  const update = useCallback(
    async (id: string, data: Partial<Pick<Moment, 'text' | 'imageBase64' | 'date'>>) => {
      const now = new Date().toISOString();
      const current = storageGet<Moment[]>(KEY) ?? [];
      const updated = current.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: now } : m
      );
      storageSet(KEY, updated);
      setMoments(loadAllMoments());

      if (user) {
        await supabase.from('moments').update({
          text: data.text,
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
      const current = storageGet<Moment[]>(KEY) ?? [];
      const target = current.find((m) => m.id === id);
      storageSet(KEY, current.filter((m) => m.id !== id));
      setMoments(loadAllMoments());

      if (user) {
        await Promise.all([
          supabase.from('moments').delete().eq('id', id).eq('user_id', user.id),
          deleteImage(target?.imageBase64),
        ]);
      }
    },
    [user]
  );

  return { moments, getByDate, getById, add, update, remove, isLoading };
}
