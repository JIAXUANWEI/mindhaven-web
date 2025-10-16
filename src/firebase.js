import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore";  


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1KRMnbioqe4N-W3L3hFG5HrObcyBk15s",
  authDomain: "fit5032-mindhaven-web.firebaseapp.com",
  projectId: "fit5032-mindhaven-web",
  storageBucket: "fit5032-mindhaven-web.firebasestorage.app",
  messagingSenderId: "838632980183",
  appId: "1:838632980183:web:e555831e12966933c2ba92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 导出 auth、db 对象
export const auth = getAuth(app);
export const db = getFirestore(app);
export const projectId = firebaseConfig.projectId;
export const functionsClient = getFunctions(app, 'us-central1');


