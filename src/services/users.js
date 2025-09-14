// src/services/users.js - 用户管理服务
import { db } from "../firebase";
import { collection, query, getDocs, orderBy, where, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";

const usersCol = collection(db, "users");

// 获取用户总数
export async function getUsersCount() {
  const q = query(usersCol);
  const snap = await getDocs(q);
  return snap.size;
}

// 获取所有用户（管理员用）
export async function fetchAllUsers({ limitCount = 100, role = null } = {}) {
  let q = query(usersCol, orderBy("createdAt", "desc"));
  
  if (role) {
    q = query(usersCol, where("role", "==", role), orderBy("createdAt", "desc"));
  }
  
  if (limitCount) {
    q = query(q, limit(limitCount));
  }
  
  const snap = await getDocs(q);
  const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // 为每个用户获取统计信息
  for (let user of users) {
    try {
      // 获取用户故事数量
      const storiesQuery = query(
        collection(db, "stories"),
        where("authorId", "==", user.id)
      );
      const storiesSnap = await getDocs(storiesQuery);
      user.storiesCount = storiesSnap.size;
      
      // 获取用户点赞和评论数量
      const likesQuery = query(
        collection(db, "userInteractions"),
        where("userId", "==", user.id),
        where("action", "==", "like")
      );
      const likesSnap = await getDocs(likesQuery);
      user.likesCount = likesSnap.size;
      
      const commentsQuery = query(
        collection(db, "userInteractions"),
        where("userId", "==", user.id),
        where("action", "==", "comment")
      );
      const commentsSnap = await getDocs(commentsQuery);
      user.commentsCount = commentsSnap.size;
    } catch (error) {
      console.error(`Error loading stats for user ${user.id}:`, error);
      user.storiesCount = 0;
      user.likesCount = 0;
      user.commentsCount = 0;
    }
  }
  
  return users;
}

// 更新用户角色
export async function updateUserRole(userId, role) {
  try {
    const ref = doc(db, "users", userId);
    await updateDoc(ref, { role });
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

// 删除用户
export async function deleteUser(userId) {
  try {
    const ref = doc(db, "users", userId);
    await deleteDoc(ref);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
