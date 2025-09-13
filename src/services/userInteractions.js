// src/services/userInteractions.js - 用户交互记录服务
import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  addDoc,
  serverTimestamp
} from "firebase/firestore";

const interactionsCol = collection(db, "userInteractions");

// 记录用户交互（点赞、评论等）
// export async function 定义一个异步函数并导出，供其他模块调用
export async function recordUserInteraction(userId, itemId, itemType, action, additionalData = {}) {
  try {
    const docRef = await addDoc(interactionsCol, {
      userId,
      itemId, // 故事ID或资源ID
      itemType, // 'story' 或 'resource'
      action, // 'like', 'comment', 'view'
      ...additionalData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error recording user interaction:", error);
    throw error;
  }
}

// 获取用户的点赞记录
export async function fetchUserLikes(userId, { limitCount = 20 } = {}) {
  try {
    const q = query(
      interactionsCol,
      where("userId", "==", userId),
      where("action", "==", "like"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching user likes:", error);
    return [];
  }
}

// 获取用户的评论记录
export async function fetchUserComments(userId, { limitCount = 20 } = {}) {
  try {
    const q = query(
      interactionsCol,
      where("userId", "==", userId),
      where("action", "==", "comment"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching user comments:", error);
    return [];
  }
}

// 获取用户的所有交互记录
export async function fetchUserInteractions(userId, { limitCount = 50 } = {}) {
  try {
    const q = query(
      interactionsCol,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching user interactions:", error);
    return [];
  }
}

// 检查用户是否已经点赞过某个项目
export async function hasUserLiked(userId, itemId, itemType) {
  try {
    const q = query(
      interactionsCol,
      where("userId", "==", userId),
      where("itemId", "==", itemId),
      where("itemType", "==", itemType),
      where("action", "==", "like")
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("Error checking user like status:", error);
    return false;
  }
}
