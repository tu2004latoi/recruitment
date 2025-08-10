// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD9vGtWHzLAcdA2Mi529Sz45belMrMdEIA",
  authDomain: "recruitment-6b2cd.firebaseapp.com",
  projectId: "recruitment-6b2cd",
  storageBucket: "recruitment-6b2cd.appspot.com",
  messagingSenderId: "882223448187",
  appId: "1:882223448187:web:d6262e9d947b009ac422de",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Thông báo khi app tắt:', payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
  });
});
