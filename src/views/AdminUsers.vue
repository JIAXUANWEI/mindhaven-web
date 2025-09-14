<template>
  <div class="admin-users-page">
    <!-- Header -->
    <div class="AdminUsers-hero d-flex align-items-center">
    </div>

    <!-- Users Table -->
    <div class="container py-5">
      <div class="admin-card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3 class="card-title mb-0">User Management</h3>
          <div class="d-flex gap-2">
            <select v-model="roleFilter" class="form-select form-select-sm" @change="loadUsers">
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Stories</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="users.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  No users found
                </td>
              </tr>
              <tr v-else v-for="user in users" :key="user.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img :src="getUserAvatar(user.email)" class="user-avatar me-3" alt="Avatar">
                    <div>
                      <div class="fw-semibold">{{ user.email }}</div>
                      <small class="text-muted">{{ user.displayName || 'No display name' }}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="['badge', getRoleClass(user.role)]">
                    {{ user.role || 'user' }}
                  </span>
                </td>
                <td>{{ user.storiesCount || 0 }}</td>
                <td>{{ user.likesCount || 0 }}</td>
                <td>{{ user.commentsCount || 0 }}</td>
                <td>{{ formatDate(user.createdAt) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button @click="viewUserDetails(user)" class="btn btn-sm btn-outline-info" title="View Details">
                      <i class="iconfont icon-eye"></i>
                    </button>
                    <button v-if="user.role !== 'admin'" @click="toggleUserRole(user)" 
                            class="btn btn-sm btn-outline-warning" title="Toggle Role">
                      <i class="iconfont icon-setting"></i>
                    </button>
                    <button v-if="user.role !== 'admin'" @click="deleteUser(user.id)" 
                            class="btn btn-sm btn-outline-danger" title="Delete User">
                      <i class="iconfont icon-delete"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <div v-if="showDetailsModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">User Details</h5>
            <button @click="closeDetailsModal" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedUser">
              <div class="row mb-3">
                <div class="col-md-3">
                  <img :src="getUserAvatar(selectedUser.email)" class="img-fluid rounded" alt="Avatar">
                </div>
                <div class="col-md-9">
                  <h6>{{ selectedUser.email }}</h6>
                  <p class="text-muted">{{ selectedUser.displayName || 'No display name' }}</p>
                  <span :class="['badge', getRoleClass(selectedUser.role)]">
                    {{ selectedUser.role || 'user' }}
                  </span>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4">
                  <div class="stat-card text-center p-3 border rounded">
                    <h4>{{ selectedUser.storiesCount || 0 }}</h4>
                    <small class="text-muted">Stories</small>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="stat-card text-center p-3 border rounded">
                    <h4>{{ selectedUser.likesCount || 0 }}</h4>
                    <small class="text-muted">Likes Given</small>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="stat-card text-center p-3 border rounded">
                    <h4>{{ selectedUser.commentsCount || 0 }}</h4>
                    <small class="text-muted">Comments</small>
                  </div>
                </div>
              </div>
              <div class="mt-3">
                <strong>Joined:</strong> {{ formatDate(selectedUser.createdAt) }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDetailsModal" type="button" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showDetailsModal" class="modal-backdrop show"></div>
  </div>
</template>

<script>
import { fetchAllUsers, updateUserRole, deleteUser } from '../services/users';

export default {
  name: 'AdminUsers',
  data() {
    return {
      users: [],
      loading: true,
      roleFilter: '',
      showDetailsModal: false,
      selectedUser: null
    }
  },
  async mounted() {
    await this.loadUsers();
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        const options = { limitCount: 100 };
        if (this.roleFilter) {
          options.role = this.roleFilter;
        }
        this.users = await fetchAllUsers(options);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        this.loading = false;
      }
    },
    async toggleUserRole(user) {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      if (confirm(`Are you sure you want to change ${user.email}'s role to ${newRole}?`)) {
        try {
          await updateUserRole(user.id, newRole);
          await this.loadUsers();
        } catch (error) {
          console.error('Error updating user role:', error);
          alert('Failed to update user role');
        }
      }
    },
    async deleteUser(userId) {
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
          await deleteUser(userId);
          await this.loadUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        }
      }
    },
    viewUserDetails(user) {
      this.selectedUser = user;
      this.showDetailsModal = true;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedUser = null;
    },
    getUserAvatar(email) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(email.charAt(0))}&background=4f6&color=fff`;
    },
    getRoleClass(role) {
      return role === 'admin' ? 'bg-danger' : 'bg-primary';
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
.AdminUsers-hero {
  background: url('/AdminUsers.png') center center / cover no-repeat fixed;
  position: relative;
  padding-top: 80px;
  min-height: calc(100vh - 80px);
}

.admin-users-page {
  min-height: 100vh;
  background: rgba(245, 218, 218, 0.39);
}

.admin-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.card-header {
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  color: #ffffff;
  font-weight: 600;
}

.table {
  color: #ffffff;
  margin-bottom: 0;
}

.table th {
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
}

.table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  vertical-align: middle;
}

.table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.form-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.form-select option {
  color: #000000;
  background: #ffffff;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
}
</style>