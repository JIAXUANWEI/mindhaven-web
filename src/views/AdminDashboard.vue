<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="admin-header">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="display-4 fw-bold text-white mb-2">Admin Dashboard</h1>
            <p class="text-white-50 mb-0">Welcome back, {{ userEmail }}! Manage your platform efficiently.</p>
          </div>
          <div class="col-md-4 text-end">
            <div class="admin-stats">
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
                    <div class="action-icon">
                      <i class="fas fa-book"></i>
                    </div>
                    <div class="action-content">
                      <h5>Manage Resources</h5>
                      <p>Create, edit, and organize learning resources</p>
                    </div>
                    <div class="action-arrow">
                      <i class="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="action-card" @click="$router.push('/stories')">
                    <div class="action-icon">
                      <i class="fas fa-comments"></i>
                    </div>
                    <div class="action-content">
                      <h5>Manage Stories</h5>
                      <p>Review and moderate user stories</p>
                    </div>
                    <div class="action-arrow">
                      <i class="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="action-card" @click="showAnalytics = true">
                    <div class="action-icon">
                      <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="action-content">
                      <h5>Analytics</h5>
                      <p>View platform usage and insights</p>
                    </div>
                    <div class="action-arrow">
                      <i class="fas fa-arrow-right"></i>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="action-card" @click="$router.push('/account')">
                    <div class="action-icon">
                      <i class="fas fa-user-cog"></i>
                    </div>
                    <div class="action-content">
                      <h5>Account Settings</h5>
                      <p>Manage your admin account</p>
                    </div>
                    <div class="action-arrow">
                      <i class="fas fa-arrow-right"></i>
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
                    <i class="fas fa-book"></i>
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

      <!-- System Status -->
      <div class="row mt-4">
        <div class="col-12">
          <div class="admin-card">
            <div class="card-header">
              <h3 class="card-title">System Status</h3>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="status-item">
                    <div class="status-indicator success"></div>
                    <div class="status-content">
                      <div class="status-title">Database</div>
                      <div class="status-subtitle">Online</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="status-item">
                    <div class="status-indicator success"></div>
                    <div class="status-content">
                      <div class="status-title">Authentication</div>
                      <div class="status-subtitle">Active</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="status-item">
                    <div class="status-indicator success"></div>
                    <div class="status-content">
                      <div class="status-title">Storage</div>
                      <div class="status-subtitle">Available</div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="status-item">
                    <div class="status-indicator success"></div>
                    <div class="status-content">
                      <div class="status-title">API</div>
                      <div class="status-subtitle">Responsive</div>
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
import { fetchAllResources } from '../services/resources';

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
    loadUserData() {
      const userData = JSON.parse(localStorage.getItem("currentUser") || "{}");
      this.userEmail = userData.email || "Admin";
    },
    async loadDashboardData() {
      this.loading = true;
      try {
        // Load recent resources
        this.recentResources = await fetchAllResources({ limitCount: 10 });
        this.stats.totalResources = this.recentResources.length;
        
        // TODO: Load stories and users data when services are available
        this.stats.totalStories = 0;
        this.stats.totalUsers = 0;
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
.admin-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
}

.admin-header {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%);
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.admin-stats {
  display: flex;
  gap: 2rem;
  justify-content: flex-end;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #4facfe;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 1px;
}

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

.action-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #ffffff;
  flex-shrink: 0;
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

.action-arrow {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
  flex-shrink: 0;
}

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
  width: 40px;
  height: 40px;
  background: rgba(79, 172, 254, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4facfe;
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
}

.activity-title {
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

.status-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.success {
  background: #28a745;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
}

.status-content {
  flex: 1;
}

.status-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.25rem;
}

.status-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
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

.badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.spinner-border {
  border-width: 0.2em;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .admin-stats {
    justify-content: center;
    gap: 1rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .action-card {
    flex-direction: column;
    text-align: center;
  }
  
  .action-arrow {
    display: none;
  }
}
</style>
