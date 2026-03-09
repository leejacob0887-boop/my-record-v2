'use client';

import { useRef } from 'react';

interface ImagePickerProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
}

export default function ImagePicker({ value, onChange }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert('사진 크기가 너무 큽니다. 1.5MB 이하 사진을 선택해주세요.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm text-blue-500 hover:text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5"
        >
          📷 사진 선택
        </button>
        {value && (
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
          className="w-full max-h-48 object-cover rounded-lg border border-gray-100"
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
