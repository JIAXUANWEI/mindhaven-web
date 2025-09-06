// src/services/stories.js - Firestore 实现
import { db } from "../firebase";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";

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