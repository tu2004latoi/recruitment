const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");
const fs = require("fs");

// Đường dẫn file service account
const SERVICE_ACCOUNT_PATH = "./firebase-service-account.json";

// Project ID trong Firebase Console
const PROJECT_ID = "recruitment-6b2cd";

// FCM token bạn lấy từ client
const FCM_TOKEN = "d9NxlizY33al8h_9mDPk6A:APA91bH0MBm0edZ3sAhM2LkiTkLIC59ObvR4RN1jmRMWVIKsNYtZjEBungHfsXA-Gc4cUNkOCC7d_O1AxF7qNwRpWj7Ml_Sn2MJeC-pjWopzvkY1jq_Sjz0";
// Hàm lấy access token từ service account
async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

// Hàm gửi notification qua FCM HTTP v1
async function sendNotification() {
  const accessToken = await getAccessToken();

  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

  const message = {
    message: {
      token: FCM_TOKEN,
      notification: {
        title: "🔥 Thông báo thử nghiệm",
        body: "Xin chào từ Firebase Cloud Messaging!",
      },
    },
  };

  const response = await axios.post(url, message, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  console.log("✅ Gửi thành công:", response.data);
}

sendNotification().catch((err) => {
  console.error("❌ Gửi thất bại:", err.response?.data || err.message);
});
