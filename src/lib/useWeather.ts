'use client';

import { useState, useEffect } from 'react';

export interface WeatherData {
  city: string;
  temp: number;
  feels_like: number;
  description: string;
  icon: string;
  humidity: number;
  wind_speed: number;
}

export function useWeather() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('위치 서비스가 지원되지 않아요');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
          if (!apiKey) {
            setError('날씨 API 키가 설정되지 않았어요');
            setLoading(false);
            return;
          }
          const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=kr&appid=${apiKey}`
          );
          const json = await res.json();
          setData({
            city: json.name,
            temp: Math.round(json.main.temp),
            feels_like: Math.round(json.main.feels_like),
            description: json.weather[0].description,
            icon: json.weather[0].icon,
            humidity: json.main.humidity,
            wind_speed: json.wind.speed,
          });
        } catch {
          setError('날씨 정보를 불러올 수 없어요');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('위치 권한이 필요해요');
        setLoading(false);
      }
    );
  }, []);

  return { data, loading, error };
}
