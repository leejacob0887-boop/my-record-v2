'use client';

import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { uploadImage } from '@/lib/storageUpload';

interface ImagePickerProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export default function ImagePicker({ value, onChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('사진 크기가 너무 큽니다. 20MB 이하 사진을 선택해주세요.');
      e.target.value = '';
      return;
    }
    if (!user) {
      alert('로그인 후 사진을 업로드할 수 있습니다.');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, user.id);
      onChange(url);
    } catch {
      alert('사진 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-700 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-1.5 disabled:opacity-50"
        >
          {uploading ? '업로드 중...' : '📷 사진 선택'}
        </button>
        {value && !uploading && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-sm text-gray-400 hover:text-red-400"
          >
            삭제
          </button>
        )}
      </div>
      {value && (
        <img
          src={value}
          alt="선택한 사진"
          className="w-full max-h-48 object-cover rounded-lg border border-gray-100 dark:border-gray-700"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
