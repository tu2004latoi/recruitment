import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { setLogLevel } from "firebase/app";
setLogLevel('debug');

const firebaseConfig = {
    apiKey: "AIzaSyD9vGtWHzLAcdA2Mi529Sz45belMrMdEIA",
    authDomain: "recruitment-6b2cd.firebaseapp.com",
    projectId: "recruitment-6b2cd",
    storageBucket: "recruitment-6b2cd.appspot.com",
    messagingSenderId: "882223448187",
    appId: "1:882223448187:web:d6262e9d947b009ac422de",
    measurementId: "G-945B1TBLL7"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Hàm lấy token
export const requestForToken = async () => {
    try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/',
        });

        const token = await getToken(getMessaging(app), {
            vapidKey: 'BNuZIdB2QICp8Wons8xgoldy8fs5BCWqWiA7cxGAE8TgpcjoNhSWKw5dH01nyZMk9H0lkVKjraPyCMIlQkj6zD8',
            serviceWorkerRegistration: registration,
        });

        if (token) {
            console.log('✅ FCM Token:', token);
            localStorage.setItem("fcmToken", token);
        } else {
            console.warn('⚠️ Không lấy được token.');
        }
    } catch (err) {
        console.error('❌ Lỗi lấy token FCM:', err);
    }
};

// Hàm lắng nghe khi đang mở app
export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

// Export messaging nếu cần
export { messaging };
