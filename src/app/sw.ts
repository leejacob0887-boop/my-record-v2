import { defaultCache } from "@serwist/next/worker";
import { Serwist, NetworkOnly, CacheFirst, ExpirationPlugin } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | { revision: string | null; url: string })[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    // Supabase API — Network Only (오프라인 시 실패 허용)
    {
      matcher: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: new NetworkOnly(),
    },
    // CDN 폰트 — Cache First (1년 캐시)
    {
      matcher: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
      handler: new CacheFirst({
        cacheName: "cdn-fonts",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
