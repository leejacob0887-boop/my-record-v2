'use client';

import { X, Wind, Droplets, Thermometer } from 'lucide-react';
import { useWeather } from '@/lib/useWeather';

interface Props {
  onClose: () => void;
}

export default function WeatherSheet({ onClose }: Props) {
  const { data, loading, error } = useWeather();

  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <span className="text-base font-bold text-gray-800 dark:text-gray-100">오늘 날씨</span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
          aria-label="닫기"
        >
          <X size={14} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      <div className="px-5 py-6 pb-8">
        {loading && (
          <div className="flex flex-col items-center py-8 gap-3">
            <div className="w-8 h-8 border-2 border-[#0F6E56] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">날씨 정보를 불러오는 중...</p>
          </div>
        )}
        {error && (
          <div className="flex flex-col items-center py-8 gap-2">
            <p className="text-sm text-gray-400">{error}</p>
            <p className="text-xs text-gray-300">설정에서 위치 권한을 허용해주세요</p>
          </div>
        )}
        {data && !loading && (
          <div className="bg-gradient-to-br from-[#0F6E56] to-[#1D9E75] rounded-2xl p-6 text-white">
            <p className="text-base font-semibold opacity-90">{data.city}</p>
            <div className="flex items-center gap-4 mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                alt={data.description}
                width={64}
                height={64}
              />
              <div>
                <p className="text-5xl font-bold">{data.temp}°</p>
                <p className="text-sm opacity-80 mt-1 capitalize">{data.description}</p>
              </div>
            </div>
            <div className="flex gap-5 mt-5 text-sm opacity-80">
              <div className="flex items-center gap-1.5">
                <Thermometer size={14} />
                <span>체감 {data.feels_like}°</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets size={14} />
                <span>습도 {data.humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Wind size={14} />
                <span>{data.wind_speed}m/s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
