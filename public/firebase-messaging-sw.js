importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyAP-5NFHMr3m2yAq9mIdF_ZElbjJspiRwY',
  authDomain: 'notia-8df73.firebaseapp.com',
  projectId: 'notia-8df73',
  storageBucket: 'notia-8df73.firebasestorage.app',
  messagingSenderId: '959573627832',
  appId: '1:959573627832:web:78f8a5983af33bb658f54d',
})

const messaging = firebase.messaging()

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? '알림'
  const body = payload.notification?.body ?? ''
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: 'notia-reminder',
    renotify: true,
  })
})
