<!-- authorName
content
createdAt
excerpt
avatarUrl
coverUrl
status -->
<template>
  <div class="story-detail-page">
    <!-- Floating Actions -->
    <div class="floating-actions">
      <button class="fab" :class="{ 'liked': isLiked }" @click="handleLike" title="Like">
        <i class="iconfont icon-like"></i>
      </button>
      <button class="fab" @click="scrollToReviews" title="Reviews">
        <i class="iconfont icon-reviewArea"></i>
      </button>
      <button class="fab" @click="goPublish" title="Share your story">
        <i class="iconfont icon-write"></i>
      </button>
    </div>
    <!-- Hero Section with Cover Image -->
     <!-- 用story对象是否存在来决定是否显示。动态绑定内联样式：根据 story.coverUrl 是否存在，设置背景图片；否则使用渐变背景。 -->
    <section v-if="story" class="story-hero" :style="{ 
      backgroundImage: story.coverUrl ? `url(${story.coverUrl})` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
    }">

        <div class="container text-center text-white">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h1 class="display-4 fw-bold mb-4 text-shadow">{{ story.title }}</h1>
              <div class="d-flex align-items-center justify-content-center mb-4">
                <img v-if="story.avatarUrl" :src="story.avatarUrl" class="rounded-circle me-3" style="width:50px;height:50px;object-fit:cover;" />
                <div>
                  <div class="fw-semibold">{{ story.authorName || 'Anonymous' }}</div>
                  <small class="opacity-75">{{ dateText }}</small>
                </div>
              </div>
              <p v-if="story.excerpt" class="lead text-shadow">{{ story.excerpt }}</p>
            </div>
          </div>
        </div>
    </section>

    <!-- Story Content Section -->
    <section v-if="story" class="story-content">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="story-card">
              <div class="story-body">
                <div class="content">{{ story.content }}</div>
              </div>
              <div class="story-stats d-flex align-items-center justify-content-between px-4 pb-3">
                <div>
                  <span class="stat me-4"><i class="iconfont icon-eye me-2"></i>{{ story.viewCount || 0 }} views</span>
                  <span class="stat"><i class="iconfont icon-like me-2"></i>{{ story.likeCount || 0 }} likes</span>
                </div>
              </div>
              <div class="px-4 pb-4" ref="reviewsSection">
                <h5 class="mb-3">Reviews</h5>
                <div v-if="reviews.length === 0" class="text-muted small mb-3">No reviews yet.</div>
                <div v-else class="list-group mb-3">
                  <div v-for="r in reviews" :key="r.id" class="list-group-item bg-transparent text-white border-secondary">
                    <div class="small opacity-75">{{ r.author || 'Anonymous' }} · {{ formatDate(r.createdAt) }}</div>
                    <div>{{ r.content }}</div>
                  </div>
                </div>
                <form @submit.prevent="submitReview" class="d-flex gap-2">
                  <input v-model="newReview" type="text" class="form-control" :placeholder="isLoggedIn ? 'Write a review...' : 'Login is required to comment'" required>
                  <button class="btn btn-primary" type="submit">Post</button>
                </form>
              </div>
            </div>
            
            <!-- Back to Stories Button -->
            <div class="text-center mt-5">
              <router-link to="/stories" class="btn btn-primary btn-lg">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Stories
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <section v-else-if="loading" class="story-content">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden"><i class="iconfont icon-loading">Loading...</i></span>
            </div>
            <p class="mt-3 text-muted"><i class="iconfont icon-loading"></i>Loading story...</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section v-else class="story-content">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="alert alert-warning text-center" role="alert">
              <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
              <h4>Story not found</h4>
              <p>The story you're looking for doesn't exist or has been removed.</p>
              <router-link to="/stories" class="btn btn-warning">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Stories
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchStoryById, recordStoryView, toggleStoryLike, fetchStoryReviews, addStoryReview } from "../services/stories";
import { hasUserLiked } from "../services/userInteractions";
import { auth } from "../firebase";

const route = useRoute();
const router = useRouter();

const story = ref(null);
const loading = ref(true);
const reviews = ref([]);
const newReview = ref("");
const isLoggedIn = ref(false);
const isLiked = ref(false);
const reviewsSection = ref(null);

const dateText = computed(() => {
  if (!story.value?.createdAt) return "";
  const d = story.value.createdAt.toDate ? story.value.createdAt.toDate() : new Date(story.value.createdAt);
  return d.toLocaleDateString();
});

async function handleLike() {
  if (!story.value) return;
  if (!isLoggedIn.value) {
    window.dispatchEvent(new Event('open-login'));
    return;
  }
  try {
    const current = auth.currentUser;
    const result = await toggleStoryLike(story.value.id, current.uid);
    isLiked.value = result.liked;
    story.value.likeCount = result.likeCount;
  } catch (e) {
    console.error('Like operation failed:', e);
  }
}

async function checkUserLikeStatus() {
  if (!isLoggedIn.value || !story.value) return;
  try {
    const current = auth.currentUser;
    isLiked.value = await hasUserLiked(current.uid, story.value.id, 'story');
  } catch (e) {
    console.error('Error checking like status:', e);
  }
}

async function submitReview() {
  const text = newReview.value && newReview.value.trim();
  if (!text || !story.value) return;
  if (!isLoggedIn.value) {
    window.dispatchEvent(new Event('open-login'));
    return;
  }
  try {
    const current = auth.currentUser;
    const author = current?.displayName || current?.email || 'Anonymous';
    const id = await addStoryReview(story.value.id, { content: text, author, userId: current?.uid });
    reviews.value.unshift({ id, author, content: text, createdAt: new Date() });
    newReview.value = "";
  } catch (e) { console.error(e); }
}

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString();
}

function scrollToReviews() {
  const el = reviewsSection.value;
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goPublish() {
  router.push('/stories');
}

function goLogin() {
  window.dispatchEvent(new Event('open-login'));
}

let unsubscribeAuth = null;
onMounted(async () => {
  const id = route.params.id;
  try {
    story.value = await fetchStoryById(id);
    if (story.value) {
      await recordStoryView(id);
      story.value.viewCount = (story.value.viewCount || 0) + 1;
      reviews.value = await fetchStoryReviews(id, { size: 20 });
    }
  } catch (error) {
    console.error('Error loading story:', error);
  } finally {
    loading.value = false;
  }

  isLoggedIn.value = !!auth.currentUser;
  const maybeUnsub = auth.onAuthStateChanged?.(async (u) => {
    isLoggedIn.value = !!u;
    if (u && story.value) {
      await checkUserLikeStatus();
    } else {
      isLiked.value = false;
    }
  });
  if (typeof maybeUnsub === 'function') unsubscribeAuth = maybeUnsub;

  if (isLoggedIn.value && story.value) {
    await checkUserLikeStatus();
  }
});

onBeforeUnmount(() => {
  if (unsubscribeAuth) unsubscribeAuth();
});
</script>

<style scoped>
.story-detail-page {
  padding-top: 0; /* Remove padding to let navbar overlay */
  margin: 0;
  padding-left: 0;
  padding-right: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

.story-hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}



.story-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  min-height: 100vh;
  padding: 4rem 0;
}

.story-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
}

.story-card:hover {
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}

.story-body {
  padding: 3rem;
}
.story-stats { border-top: 1px solid rgba(255,255,255,0.15); }
.list-group-item { backdrop-filter: blur(4px); }

.stat {
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 600;
}

/* Floating actions */
.floating-actions {
  position: fixed;
  top: 40%;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1030;
}
.fab {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
}
.fab:hover { background: rgba(255,255,255,0.25); transform: translateY(-2px); }

.fab.liked {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  transform: scale(1.1);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.fab.liked:hover {
  background: linear-gradient(135deg, #ee5a52, #ff6b6b);
  transform: scale(1.15);
}

.fab.liked .icon-like {
  animation: heartbeat 0.6s ease-in-out;
}

@keyframes heartbeat {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.content { 
  white-space: pre-wrap; 
  font-size: 1.1rem;
  line-height: 1.8;
  color: #e8f4fd;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.text-shadow { 
  text-shadow: 0 6px 18px rgba(0,0,0,0.35); 
}

.btn-primary {
  background: linear-gradient(135deg, #CCCCCC, #a56817);
  border: none;
  color: #ffffff;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #a56817, #CCCCCC);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
  color: #ffffff;
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107, #ff8f00);
  border: none;
  color: #ffffff;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.btn-warning:hover {
  background: linear-gradient(135deg, #ff8f00, #ffc107);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
  color: #ffffff;
}

.alert-warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #ffffff;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
}

.spinner-border {
  border-width: 0.3em;
}


</style>
