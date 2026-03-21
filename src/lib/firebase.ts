import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)

export function getFirebaseMessaging() {
  if (typeof window === 'undefined') return null
  try {
    return getMessaging(app)
  } catch {
    return null
  }
}

export async function requestFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null

    const messaging = getFirebaseMessaging()
    if (!messaging) return null

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.warn('[FCM] VAPID key not set. Set NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local')
      return null
    }

    // 구형 Serwist SW가 남아있으면 제거 (bad-precaching-response 방지)
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      for (const reg of regs) {
        const url = reg.active?.scriptURL ?? reg.installing?.scriptURL ?? ''
        if (!url.includes('firebase-messaging-sw')) {
          await reg.unregister()
        }
      }
    }

    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg })
    return token || null
  } catch (e) {
    console.error('[FCM] getToken failed:', e)
    return null
  }
}

export function listenForegroundMessages(callback: (title: string, body: string) => void) {
  const messaging = getFirebaseMessaging()
  if (!messaging) return () => {}
  return onMessage(messaging, (payload) => {
    const title = payload.notification?.title ?? '알림'
    const body = payload.notification?.body ?? ''
    callback(title, body)
  })
}
