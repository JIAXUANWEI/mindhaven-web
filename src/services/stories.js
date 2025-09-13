// src/services/stories.js - Firestore 实现
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";

const storiesCol = collection(db, "stories");
// 辅助函数mapSnap：把 Firestore 原始数据转换成你 Vue 组件更容易处理的形式
function mapSnap(snap) {
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
//取 3 条最新的、已审核通过的精选故事
export async function fetchFeaturedStories({ size = 3 } = {}) {
  const q = query(
    storiesCol,
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
    limit(size)
  );
  const snap = await getDocs(q);
  return mapSnap(snap);
}
//取最新的 9 条已审核的故事
export async function fetchLatestStories({ size = 9 } = {}) {
  const q = query(
    storiesCol,
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
    limit(size)
  );
  const snap = await getDocs(q);
  return mapSnap(snap);
}
//根据文档 ID 精确获取一个故事
export async function fetchStoryById(id) {
  const ref = doc(db, "stories", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// 获取故事总数
export async function getStoriesCount() {
  const q = query(storiesCol);
  const snap = await getDocs(q);
  return snap.size;
}

// 记录浏览次数 +1
export async function recordStoryView(storyId) {
  try {
    const ref = doc(db, "stories", storyId);
    await updateDoc(ref, { viewCount: increment(1) });
  } catch (e) {
    console.error("recordStoryView error", e);
  }
}

// 点赞 +1（简单累加，不做去重）
export async function likeStory(storyId, userId = null) {
  try {
    const ref = doc(db, "stories", storyId);
    await updateDoc(ref, { likeCount: increment(1) });
    
    // 记录用户交互（如果提供了userId）
    if (userId) {
      const { recordUserInteraction } = await import('./userInteractions.js');
      await recordUserInteraction(userId, storyId, 'story', 'like');
    }
  } catch (e) {
    console.error("likeStory error", e);
  }
}

// 加载评论：stories/{id}/reviews 子集合，按时间倒序
export async function fetchStoryReviews(storyId, { size = 20 } = {}) {
  const reviewsCol = collection(db, `stories/${storyId}/reviews`);
  const q = query(reviewsCol, orderBy("createdAt", "desc"), limit(size));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 新增评论
export async function addStoryReview(storyId, { author, userId, content }) {
  const reviewsCol = collection(db, `stories/${storyId}/reviews`);
  const docRef = await addDoc(reviewsCol, {
    author: author || "Anonymous",
    userId: userId || null,
    content,
    createdAt: serverTimestamp()
  });
  
  // 记录用户交互（如果提供了userId）
  if (userId) {
    const { recordUserInteraction } = await import('./userInteractions.js');
    await recordUserInteraction(userId, storyId, 'story', 'comment', { 
      content, 
      author,
      reviewId: docRef.id 
    });
  }
  
  return docRef.id;
}