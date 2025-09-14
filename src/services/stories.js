// src/services/stories.js - Firestore 实现
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, updateDoc, increment, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";

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


// 用户post自己的story
// 用户创建故事
export async function createUserStory(storyData) {
  try {
    const docRef = await addDoc(storiesCol, {
      ...storyData,
      status: "pending", // 待审核状态
      viewCount: 0,
      likeCount: 0,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating story:", error);
    throw error;
  }
}
// 获取用户的故事
export async function fetchUserStories(userId, { size = 10 } = {}) {
  const q = query(
    storiesCol,
    where("authorId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(size)
  );
  const snap = await getDocs(q);
  return mapSnap(snap);
}
// 更新用户故事
export async function updateUserStory(storyId, storyData) {
  try {
    const storyRef = doc(db, "stories", storyId);
    const updateData = {
      ...storyData,
      updatedAt: serverTimestamp(),
      status: 'pending' // 修改后需要重新审核
    };
    await updateDoc(storyRef, updateData);
  } catch (error) {
    console.error("Error updating story:", error);
    throw error;
  }
}

// 删除用户故事
export async function deleteUserStory(storyId) {
  try {
    const storyRef = doc(db, "stories", storyId);
    await deleteDoc(storyRef);
  } catch (error) {
    console.error("Error deleting story:", error);
    throw error;
  }
}

//管理故事
// 获取所有故事（管理员用）
export async function fetchAllStories({ limitCount = 50, status = null } = {}) {
  let q = query(storiesCol, orderBy("createdAt", "desc"));
  
  if (status) {
    q = query(storiesCol, where("status", "==", status), orderBy("createdAt", "desc"));
  }
  
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  
  const snap = await getDocs(q);
  return mapSnap(snap);
}
// 更新故事状态
export async function updateStoryStatus(storyId, status) {
  try {
    const ref = doc(db, "stories", storyId);
    await updateDoc(ref, { 
      status,
      reviewedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating story status:", error);
    throw error;
  }
}
// 删除故事
export async function deleteStory(storyId) {
  try {
    const ref = doc(db, "stories", storyId);
    await deleteDoc(ref);
  } catch (error) {
    console.error("Error deleting story:", error);
    throw error;
  }
}


