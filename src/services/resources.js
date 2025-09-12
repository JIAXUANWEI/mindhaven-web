// 资源文档结构
// {
//   id: "resource_001", // 自动生成的文档ID
//   title: "Healthy Eating Workshop",
//   category: "Nutrition", // 分类：Nutrition, Fitness, Wellbeing, Mental Health, etc.
//   excerpt
//   content
//   link: "https://example.org/workshop1",
//   coverUrl: "https://example.org/image.jpg", // 资源封面图片
//   status: "published", // 状态：draft, published, archived
//   priority: 1, // 显示优先级 (1-10)
//   viewCount: 0, // 浏览次数
//   likeCount: 0, // 点赞数
//   createdAt: Timestamp, // 创建时间
// }
// // 分类文档结构
// {
//   id: "categories1",
//   name: "Nutrition",
//   description: "关于营养和健康饮食的资源",
//   icon: "🍎", // 图标
//   order: 1, // 显示顺序
//   isActive: true, // 是否启用
//   resourceCount: 15, // 该分类下的资源数量
// }
// // 用户与资源的交互记录
// {
//   id: "interaction_001",
//   userId: "user_123",
//   resourceId: "resource_001",
//   action: "view", // 操作类型：view, like, bookmark, share
//   timestamp: Timestamp,
// } 
// src/services/resources.js - Firestore 实现
import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp
} from "firebase/firestore";

const resourcesCol = collection(db, "resources");
const categoriesCol = collection(db, "categories");

// 辅助函数：将 Firestore 数据转换为组件需要的格式
function mapResourceSnap(snap) {
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// 获取已发布的资源列表
export async function fetchPublishedResources({ 
  category = null, 
  limitCount = 20
} = {}) {
  let q;
  
  if (category) {
    // 按分类获取资源
    q = query(
      resourcesCol,
      where("status", "==", "published"),
      where("category", "==", category),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
  } else {
    // 获取所有已发布资源
    q = query(
      resourcesCol,
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
  }
  
  const snap = await getDocs(q);
  return mapResourceSnap(snap);
}

// 根据ID获取资源详情
export async function fetchResourceById(id) {
  const ref = doc(db, "resources", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// 获取所有分类
export async function fetchResourceCategories() {
  const q = query(
    categoriesCol,
    where("isActive", "==", true),
    orderBy("order", "asc")
  );
  const snap = await getDocs(q);
  return mapResourceSnap(snap);
}

// 记录用户查看资源
export async function recordResourceView(resourceId) {
  try {
    const resourceRef = doc(db, "resources", resourceId);
    await updateDoc(resourceRef, {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error("Error recording resource view:", error);
  }
}

// 管理员功能：创建资源
export async function createResource(resourceData) {
  const docRef = await addDoc(resourcesCol, {
    ...resourceData,
    status: "published",
    viewCount: 0,
    likeCount: 0,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

// 管理员功能：更新资源
export async function updateResource(id, updateData) {
  const ref = doc(db, "resources", id);
  await updateDoc(ref, {
    ...updateData,
    updatedAt: serverTimestamp()
  });
}

// 管理员功能：删除资源
export async function deleteResource(id) {
  const ref = doc(db, "resources", id);
  await deleteDoc(ref);
}

// 管理员功能：获取所有资源（包括草稿和已归档）
export async function fetchAllResources({ limitCount = 100 } = {}) {
  const q = query(
    resourcesCol,
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return mapResourceSnap(snap);
}

// 获取资源总数
export async function getResourcesCount() {
  const q = query(resourcesCol);
  const snap = await getDocs(q);
  return snap.size;
}

// 获取精选资源（用于首页显示）
export async function fetchFeaturedResources({ size = 3 } = {}) {
  // 首先尝试获取高优先级的资源
  let q = query(
    resourcesCol,
    where("status", "==", "published"),
    where("priority", ">", 5),
    orderBy("priority", "desc"),
    limit(size)
  );
  let snap = await getDocs(q);
  let resources = mapResourceSnap(snap);
  
  // 如果没有足够的高优先级资源，获取最新的已发布资源
  if (resources.length < size) {
    const remaining = size - resources.length;
    q = query(
      resourcesCol,
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(remaining)
    );
    snap = await getDocs(q);
    const additionalResources = mapResourceSnap(snap);
    resources = [...resources, ...additionalResources];
  }
  
  return resources;
}
