// src/services/users.js - 用户管理服务
import { db } from "../firebase";
import { collection, query, getDocs } from "firebase/firestore";

const usersCol = collection(db, "users");

// 获取用户总数
export async function getUsersCount() {
  const q = query(usersCol);
  const snap = await getDocs(q);
  return snap.size;
}

// 获取所有用户（管理员功能）
export async function getAllUsers() {
  const q = query(usersCol);
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
