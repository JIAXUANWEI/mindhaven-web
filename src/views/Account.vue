<template>
  <div class="account-page">
    <!-- Show login prompt if not logged in -->
    <div v-if="!isLoggedIn" class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="card">
            <div class="card-body p-5">
              <h3 class="card-title mb-4">Please Login</h3>
              <p class="card-text text-muted mb-4">You need to be logged in to access your account.</p>
              <button class="btn btn-primary btn-lg" @click="openLogin">Login Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Show account content if logged in -->
    <div v-else>
      <!-- Hero with background and user info -->
      <section class="account-hero d-flex align-items-end">
        <div class="container">
          <div class="d-flex align-items-center user-brief">
            <img :src="avatarUrl" alt="avatar" class="avatar me-3" />
            <div>
              <h2 class="display-6 fw-bold text-white mb-0">{{ displayName }}</h2>
              <small class="text-white-50">{{ userEmail }}</small>
            </div>
          </div>
        </div>
      </section>

    <section class="container py-4">
      <!-- Tabs -->
      <div class="account-tabs d-flex align-items-center gap-4 flex-wrap mb-3">
        <button :class="['tab-item', activeTab==='stories' && 'active']" @click="activeTab='stories'">
          <i class="iconfont icon-Book me-1"></i> My Story
        </button>
        <button :class="['tab-item', activeTab==='likes' && 'active']" @click="activeTab='likes'">
          <i class="iconfont icon-like me-1"></i> Recent Likes
        </button>
        <button :class="['tab-item', activeTab==='comments' && 'active']" @click="activeTab='comments'">
          <i class="iconfont icon-reviewArea me-1"></i> Recent Comments
        </button>
        <button :class="['tab-item', activeTab==='mood' && 'active']" @click="activeTab='mood'">
          <i class="iconfont icon-mood"></i> MoodTracker
        </button>
        <button :class="['tab-item', activeTab==='settings' && 'active']" @click="activeTab='settings'">
          <i class="iconfont icon-setting"></i> Settings
        </button>
      </div>

      <!-- Content area (plain white) -->
      <div class="account-main p-3">
        <div v-if="activeTab==='home'">
          <div class="text-muted">Welcome back, {{ displayName }}.</div>
        </div>
        <div v-else-if="activeTab==='stories'">
          <div class="fw-semibold mb-2">Published Stories</div>
          <div class="text-muted">Your stories will appear here.</div>
        </div>

        <div v-else-if="activeTab==='likes'">
          <div v-if="loadingLikes" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="userLikes.length === 0" class="text-muted">
            <i class="iconfont icon-like me-2"></i>No likes yet. Start exploring stories and resources!
          </div>
          <div v-else class="likes-list">
            <div v-for="like in userLikes" :key="like.id" class="like-item mb-3 p-3 border rounded">
              <div class="d-flex align-items-center">
                <div class="me-3">
                  <i class="iconfont icon-like text-danger fs-4"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold">{{ getItemTitle(like) }}</div>
                  <div class="text-muted small">{{ formatDate(like.timestamp) }}</div>
                  <div class="text-muted small">{{ like.itemType === 'story' ? 'Story' : 'Resource' }}</div>
                </div>
                <div>
                  <button class="btn btn-sm btn-outline-primary" @click="viewItem(like)">
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab==='comments'">
          <div class="fw-semibold mb-3">Recent Comments</div>
          <div v-if="loadingComments" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="userComments.length === 0" class="text-muted">
            <i class="iconfont icon-reviewArea me-2"></i>No comments yet. Share your thoughts on stories and resources!
          </div>
          <div v-else class="comments-list">
            <div v-for="comment in userComments" :key="comment.id" class="comment-item mb-3 p-3 border rounded">
              <div class="d-flex">
                <div class="me-3">
                  <i class="iconfont icon-reviewArea text-primary fs-4"></i>
                </div>
                <div class="flex-grow-1">
                  <div class="fw-semibold mb-1">{{ getItemTitle(comment) }}</div>
                  <div class="text-muted small mb-2">{{ formatDate(comment.timestamp) }}</div>
                  <div class="comment-content bg-light p-2 rounded mb-2">
                    "{{ comment.content }}"
                  </div>
                  <div class="text-muted small">{{ comment.itemType === 'story' ? 'Story' : 'Resource' }}</div>
                </div>
                <div>
                  <button class="btn btn-sm btn-outline-primary" @click="viewItem(comment)">
                    View
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="activeTab==='mood'">
          <div class="fw-semibold mb-2">Mood Tracker</div>
          <div class="text-muted">Track your mood here.</div>
        </div>
        <div v-else>
          <div class="fw-semibold mb-2">Settings</div>
          <div class="text-muted">Manage your account preferences.</div>
        </div>
      </div>

      <div class="mt-3 p-3 info-card">
        <div class="row align-items-center">
          <div class="col-md-8">
            <div class="text-white-75">Role: <span class="fw-semibold text-white">{{ userRole }}</span></div>
            <div class="text-white-75">Email: <span class="fw-semibold text-white">{{ userEmail }}</span></div>
          </div>
          <div class="col-md-4 text-md-end mt-3 mt-md-0">
            <button class="btn btn-danger" @click="logout">Logout</button>
          </div>
        </div>
      </div>
    </section>
    </div>
  </div>
</template>

<script>
import { auth } from '../firebase.js';
import { signOut } from 'firebase/auth';
import { fetchUserLikes, fetchUserComments } from '../services/userInteractions.js';
import { fetchStoryById } from '../services/stories.js';
import { fetchResourceById } from '../services/resources.js';

export default {
  name: "AccountView",
  data() {
    return {
      userEmail: "Guest",
      userRole: "user",
      displayName: "User",
      avatarUrl: "https://ui-avatars.com/api/?name=U&background=4f6&color=fff",
      activeTab: 'home',
      isLoggedIn: false,
      userLikes: [],
      userComments: [],
      loadingLikes: false,
      loadingComments: false,
      itemTitles: {} // 缓存项目标题
    };
  },
  computed: {
    isAdmin() {
      return this.userRole === 'admin';
    }
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'likes' && this.isLoggedIn) {
        this.loadUserLikes();
      } else if (newTab === 'comments' && this.isLoggedIn) {
        this.loadUserComments();
      }
    }
  },
  mounted() {
    this.checkAuthStatus();
    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.loadUserData();
      }
    });
  },
  methods: {
    checkAuthStatus() {
      const user = auth.currentUser;
      this.isLoggedIn = !!user;
      if (user) {
        this.loadUserData();
      }
    },
    loadUserData() {
      const userData = JSON.parse(localStorage.getItem("currentUser") || "{}");
      this.userEmail = userData.email || "Guest";
      this.userRole = userData.role || "user";
      // enrich profile
      const u = auth.currentUser;
      if (u) {
        this.displayName = u.displayName || (this.userEmail.split('@')[0]);
        this.avatarUrl = u.photoURL || this.avatarUrl;
      } else {
        this.displayName = this.userEmail.split('@')[0] || 'User';
      }
    },
    openLogin() {
      // Trigger global event to open login modal
      window.dispatchEvent(new Event('open-login'));
    },
    async logout() {
      try {
        await signOut(auth);
        localStorage.removeItem("currentUser");
        this.$router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
    async loadUserLikes() {
      if (!this.isLoggedIn) return;
      
      this.loadingLikes = true;
      try {
        const user = auth.currentUser;
        const likes = await fetchUserLikes(user.uid, { limitCount: 20 });
        this.userLikes = likes;
        
        // 预加载项目标题
        for (const like of likes) {
          await this.loadItemTitle(like.itemId, like.itemType);
        }
      } catch (error) {
        console.error("Error loading user likes:", error);
      } finally {
        this.loadingLikes = false;
      }
    },
    async loadUserComments() {
      if (!this.isLoggedIn) return;
      
      this.loadingComments = true;
      try {
        const user = auth.currentUser;
        const comments = await fetchUserComments(user.uid, { limitCount: 20 });
        this.userComments = comments;
        
        // 预加载项目标题
        for (const comment of comments) {
          await this.loadItemTitle(comment.itemId, comment.itemType);
        }
      } catch (error) {
        console.error("Error loading user comments:", error);
      } finally {
        this.loadingComments = false;
      }
    },
    async loadItemTitle(itemId, itemType) {
      if (this.itemTitles[itemId]) return this.itemTitles[itemId];
      
      try {
        let item = null;
        if (itemType === 'story') {
          item = await fetchStoryById(itemId);
        } else if (itemType === 'resource') {
          item = await fetchResourceById(itemId);
        }
        
        if (item) {
          this.itemTitles[itemId] = item.title || 'Untitled';
          return this.itemTitles[itemId];
        }
      } catch (error) {
        console.error("Error loading item title:", error);
      }
      
      this.itemTitles[itemId] = 'Unknown Item';
      return this.itemTitles[itemId];
    },
    getItemTitle(interaction) {
      return this.itemTitles[interaction.itemId] || 'Loading...';
    },
    formatDate(timestamp) {
      if (!timestamp) return 'Unknown date';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    viewItem(interaction) {
      if (interaction.itemType === 'story') {
        this.$router.push(`/stories/${interaction.itemId}`);
      } else if (interaction.itemType === 'resource') {
        this.$router.push(`/resources/${interaction.itemId}`);
      }
    }
  }
};
</script>

<style scoped>
.account-page { min-height: 100vh; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); }
.account-hero { height: 240px; background: url('/Account_bg.png') center center / cover no-repeat; position: relative; }
.account-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%); }
.user-brief { position: relative; z-index: 1; padding-bottom: 20px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(255,255,255,0.8); }
.account-tabs { color: #fff; }
.tab-item { background: transparent; border: none; color: #fff; font-weight: 700; display: flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 8px; }
.tab-item.active { background: rgba(255,255,255,0.15); }
.account-main { background: #ffffff; border-radius: 12px; }
.info-card { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); border-radius: 14px; }
</style>