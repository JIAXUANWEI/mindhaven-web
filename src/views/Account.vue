<template>
  <div class="account-page">
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
          <i class="iconfont icon-Story me-1"></i> My Story
        </button>
        <button :class="['tab-item', activeTab==='likes' && 'active']" @click="activeTab='likes'">
          <i class="iconfont icon-like me-1"></i> Recent Likes
        </button>
        <button :class="['tab-item', activeTab==='comments' && 'active']" @click="activeTab='comments'">
          <i class="iconfont icon-reviewArea me-1"></i> Recent Comments
        </button>
        <button :class="['tab-item', activeTab==='mood' && 'active']" @click="activeTab='mood'">
          <i class="fas fa-heartbeat me-1"></i> MoodTracker
        </button>
        <button :class="['tab-item', activeTab==='settings' && 'active']" @click="activeTab='settings'">
          <i class="fas fa-cog me-1"></i> Settings
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
          <div class="fw-semibold mb-2">Recent Likes</div>
          <div class="text-muted">Items you liked recently.</div>
        </div>
        <div v-else-if="activeTab==='comments'">
          <div class="fw-semibold mb-2">Recent Comments</div>
          <div class="text-muted">Your latest comments.</div>
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
</template>

<script>
import { auth } from '../firebase.js';
import { signOut } from 'firebase/auth';

export default {
  name: "AccountView",
  data() {
    return {
      userEmail: "Guest",
      userRole: "user",
      displayName: "User",
      avatarUrl: "https://ui-avatars.com/api/?name=U&background=4f6&color=fff",
      activeTab: 'home'
    };
  },
  computed: {
    isAdmin() {
      return this.userRole === 'admin';
    }
  },
  mounted() {
    this.loadUserData();
  },
  methods: {
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
    async logout() {
      try {
        await signOut(auth);
        localStorage.removeItem("currentUser");
        this.$router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
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