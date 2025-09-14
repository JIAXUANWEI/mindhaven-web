<template>
  <div class="admin-dashboard">
    <div class="AdminDashboard-hero d-flex align-items-center">
        <div class="admin-stats-vertical">
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalResources || 0 }}</div>
            <div class="stat-label">Resources</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalStories || 0 }}</div>
            <div class="stat-label">Stories</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.totalUsers || 0 }}</div>
            <div class="stat-label">Users</div>
          </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="container py-5">
      <div class="row g-4">
        <!-- Quick Actions -->
        <div class="col-lg-8">
          <div class="admin-card">
            <div class="card-header">
              <h3 class="card-title">Quick Actions</h3>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="action-card" @click="$router.push('/admin/resources')">
                    <span class="">
                      <i class="iconfont icon-book" style="font-size: 28px;"></i>
                    </span>
                    <div class="action-content">
                      <h5>Manage Resources</h5>
                      <p>Create, edit, and organize learning resources</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="action-card" @click="$router.push('/admin/stories')">
                    <span class="">
                      <i class="iconfont icon-Book" style="font-size: 28px;"></i>
                    </span>
                    <div class="action-content">
                      <h5>Manage Stories</h5>
                      <p>Review and moderate user stories</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="action-card" @click="showAnalytics = true">
                    <span class="">
                      <i class="iconfont icon-analysis" style="font-size: 28px;"></i>
                    </span>
                    <div class="action-content">
                      <h5>Analytics</h5>
                      <p>View platform usage and insights</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="action-card" @click="$router.push('/admin/users')">
                    <span>
                      <i class="iconfont icon-ACCOUNT" style="font-size: 28px;"></i>
                    </span>
                    <div class="action-content">
                      <h5>Manage Users</h5>
                      <p>View and manage user accounts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="col-lg-4">
          <div class="admin-card">
            <div class="card-header">
              <h3 class="card-title">Recent Activity</h3>
            </div>
            <div class="card-body">
              <div v-if="loading" class="text-center py-3">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
              <div v-else-if="recentResources.length === 0" class="text-center py-3 text-muted">
                No recent activity
              </div>
              <div v-else class="activity-list">
                <div v-for="resource in recentResources.slice(0, 5)" :key="resource.id" class="activity-item">
                  <div class="activity-icon">
                    <img v-if="resource.coverUrl" :src="resource.coverUrl" alt="resource-cover">
                    <i v-else class="iconfont icon-book" style="font-size: 28px;"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ resource.title }}</div>
                    <div class="activity-meta">
                      <span class="badge" :class="getStatusClass(resource.status)">{{ resource.status }}</span>
                      <span class="activity-date">{{ formatDate(resource.createdAt) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Modal -->
    <div v-if="showAnalytics" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Analytics Dashboard</h5>
            <button @click="showAnalytics = false" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div class="text-center py-5">
              <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
              <h4>Analytics Coming Soon</h4>
              <p class="text-muted">Detailed analytics and reporting features will be available in a future update.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="showAnalytics = false" type="button" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showAnalytics" class="modal-backdrop show"></div>
  </div>
</template>

<script>
import { fetchAllResources, getResourcesCount } from '../services/resources';
import { getStoriesCount } from '../services/stories';
import { getUsersCount } from '../services/users';

export default {
  name: 'AdminDashboard',
  data() {
    return {
      userEmail: '',
      loading: true,
      showAnalytics: false,
      recentResources: [],
      stats: {
        totalResources: 0,
        totalStories: 0,
        totalUsers: 0
      }
    }
  },
  async mounted() {
    this.loadUserData();
    await this.loadDashboardData();
  },
  methods: {
    isImageUrl(url) {
      if (!url || typeof url !== 'string') return false;
      return /(\.png|\.jpe?g|\.gif|\.webp|\.svg)(\?.*)?$/i.test(url);
    },
    loadUserData() {
      const userData = JSON.parse(localStorage.getItem("currentUser") || "{}");
      this.userEmail = userData.email || "Admin";
    },
    async loadDashboardData() {
      this.loading = true;
      try {
        // Load recent resources for the activity list
        this.recentResources = await fetchAllResources({ limitCount: 10 });
        
        // Load statistics in parallel
        const [resourcesCount, storiesCount, usersCount] = await Promise.all([
          getResourcesCount(),
          getStoriesCount(),
          getUsersCount()
        ]);
        
        this.stats.totalResources = resourcesCount;
        this.stats.totalStories = storiesCount;
        this.stats.totalUsers = usersCount;
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        this.loading = false;
      }
    },
    getStatusClass(status) {
      switch (status) {
        case 'published':
          return 'bg-success';
        case 'draft':
          return 'bg-warning';
        case 'archived':
          return 'bg-secondary';
        default:
          return 'bg-light text-dark';
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    }
  }
}
</script>

<style scoped>

/* head */
.AdminDashboard-hero {
  min-height: calc(100vh - 80px);
  padding-top: 80px; /* avoid overlap with fixed navbar */
  background: url('/AdminDashboard_bg.png') center center / cover no-repeat fixed;
  position: relative;
}
.AdminDashboard-hero .container {
  position: relative;
  z-index: 2;
}
.admin-stats-vertical {
  position: absolute;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  z-index: 10;
}
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
}
.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1.0rem 0.5rem;
  min-width: 50px;
  transition: all 0.3s ease;
}
.stat-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-10px);
  box-shadow: 0 10px 30px rgba(178, 77, 245, 0.3);
}

.stat-number {
  font-size: 2.0rem;
  font-weight: bold;
  color: #4facfe;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 0.5rem;
}
.stat-label {
  font-size: 0.9rem;
  color: RGB(194, 30, 86, 0.8);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

/* Quick Actions */
.admin-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  margin-bottom: 2rem;
}

.card-header {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
}

.card-body {
  padding: 2rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 100%;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #4facfe;
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(79, 172, 254, 0.2);
}

.action-content {
  flex: 1;
}

.action-content h5 {
  margin: 0 0 0.5rem 0;
  color: #ffffff;
  font-weight: 600;
}

.action-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}


/* Recent Activity */
.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.activity-item:last-child {
  border-bottom: none;
}
.activity-icon {
  width: 50px;
  height: 50px;
  flex-shrink: 0; 
}
.activity-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  display: flex;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.activity-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}



.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.modal-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}


</style>
