import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  

const firebaseConfig = {
  apiKey: "AIzaSyCCi0cW7rMnADIOmOdUL1fKDvUn2YMHXTw",
  authDomain: "mindhaven-web-4bd8f.firebaseapp.com",
  projectId: "mindhaven-web-4bd8f",
  storageBucket: "mindhaven-web-4bd8f.firebasestorage.app",
  messagingSenderId: "821693510080",
  appId: "1:821693510080:web:95e6d6674ff53fc8161825",
  measurementId: "G-WQH0JTY3QJ"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 导出 auth 对象
export const auth = getAuth(app);       //导出 auth
export const db = getFirestore(app);    // 导出 db