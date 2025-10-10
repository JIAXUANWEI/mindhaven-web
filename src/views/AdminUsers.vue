<template>
  <div class="admin-users-page">
    <!-- Header -->
    <div class="AdminUsers-hero d-flex align-items-center">
    </div>

    <!-- Users Table -->
    <div class="container py-5">
      <div class="admin-card">
        <div class="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <h3 class="card-title mb-0">User Management</h3>
          <div class="w-100">
            <div class="row g-2">
              <div class="col-12 col-md-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Email</span>
                  <input v-model.trim="filters.email" type="text" class="form-control" placeholder="Filter by email">
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Role</span>
                  <input v-model.trim="filters.role" type="text" class="form-control" placeholder="user/admin">
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Stories</span>
                  <input v-model.number="filters.storiesMin" type="number" class="form-control" placeholder="Min">
                  <span class="input-group-text">-</span>
                  <input v-model.number="filters.storiesMax" type="number" class="form-control" placeholder="Max">
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Likes</span>
                  <input v-model.number="filters.likesMin" type="number" class="form-control" placeholder="Min">
                  <span class="input-group-text">-</span>
                  <input v-model.number="filters.likesMax" type="number" class="form-control" placeholder="Max">
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Comments</span>
                  <input v-model.number="filters.commentsMin" type="number" class="form-control" placeholder="Min">
                  <span class="input-group-text">-</span>
                  <input v-model.number="filters.commentsMax" type="number" class="form-control" placeholder="Max">
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="input-group input-group-sm">
                  <span class="input-group-text">Joined</span>
                  <input v-model="filters.joinedFrom" type="date" class="form-control">
                  <span class="input-group-text">-</span>
                  <input v-model="filters.joinedTo" type="date" class="form-control">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th @click="setSort('storiesCount')" :class="['sortable','text-nowrap', { active: sortKey === 'storiesCount' }]">Stories <span>▲▼</span></th>
                <th>Likes</th>
                <th>Comments</th>
                <th @click="setSort('createdAt')" :class="['sortable','text-nowrap', { active: sortKey === 'createdAt' }]">Joined <span>▲▼</span></th>
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
              <tr v-else-if="sortedUsers.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  No matching users
                </td>
              </tr>
              <tr v-else v-for="user in paginatedUsers" :key="user.id">
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
    <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center p-3">
          <div>Page {{ currentPage }} of {{ totalPages }}</div>
          <nav aria-label="User pagination">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Prev</button>
              </li>
              <li v-for="n in pageNumbers" :key="n" class="page-item" :class="{ active: n === currentPage }">
                <button class="page-link" @click="changePage(n)">{{ n }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
              </li>
            </ul>
          </nav>
        </div>
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
      showDetailsModal: false,
      selectedUser: null,
      // Filters / Sort / Pagination state
      filters: {
        email: '',
        role: '',
        storiesMin: null,
        storiesMax: null,
        likesMin: null,
        likesMax: null,
        commentsMin: null,
        commentsMax: null,
        joinedFrom: '', // yyyy-MM-dd
        joinedTo: ''    // yyyy-MM-dd
      },
      sortKey: 'createdAt',
      sortAsc: false,
      currentPage: 1,
      pageSize: 5
    }
  },
  async mounted() {
    await this.loadUsers();
  },
  computed: {
    filteredUsers() {
      const f = this.filters;
      const fromTs = f.joinedFrom ? new Date(f.joinedFrom).setHours(0,0,0,0) : null;
      const toTs = f.joinedTo ? new Date(f.joinedTo).setHours(23,59,59,999) : null;
      const getNum = (v) => (typeof v === 'number' && !isNaN(v)) ? v : null;
      const sMin = getNum(f.storiesMin), sMax = getNum(f.storiesMax);
      const lMin = getNum(f.likesMin), lMax = getNum(f.likesMax);
      const cMin = getNum(f.commentsMin), cMax = getNum(f.commentsMax);
      return this.users.filter(u => {
        const email = (u.email || '').toLowerCase();
        const name = (u.displayName || '').toLowerCase();
        const role = (u.role || 'user').toLowerCase();
        const stories = Number(u.storiesCount || 0);
        const likes = Number(u.likesCount || 0);
        const comments = Number(u.commentsCount || 0);
        const createdVal = u.createdAt;
        const createdDate = createdVal?.toDate ? createdVal.toDate() : (createdVal ? new Date(createdVal) : null);
        const createdTs = createdDate ? createdDate.getTime() : null;

        if (f.email && !email.includes(f.email.toLowerCase())) return false;
        if (f.role && !role.includes(f.role.toLowerCase())) return false;
        if (sMin !== null && stories < sMin) return false;
        if (sMax !== null && stories > sMax) return false;
        if (lMin !== null && likes < lMin) return false;
        if (lMax !== null && likes > lMax) return false;
        if (cMin !== null && comments < cMin) return false;
        if (cMax !== null && comments > cMax) return false;
        if (fromTs !== null && (createdTs === null || createdTs < fromTs)) return false;
        if (toTs !== null && (createdTs === null || createdTs > toTs)) return false;
        // Optional: name search
        if (f.name && !name.includes((f.name || '').toLowerCase())) return false;
        return true;
      });
    },
    sortedUsers() {
      const key = this.sortKey;
      const asc = this.sortAsc ? 1 : -1; // default desc for createdAt
      const arr = [...this.filteredUsers];
      const getVal = (u) => {
        if (key === 'createdAt') {
          const v = u.createdAt;
          const d = v?.toDate ? v.toDate() : (v ? new Date(v) : null);
          return d ? d.getTime() : 0;
        }
        if (key === 'storiesCount') return Number(u.storiesCount || 0);
        return 0;
      };
      return arr.sort((a, b) => {
        const va = getVal(a);
        const vb = getVal(b);
        if (va < vb) return -asc;
        if (va > vb) return asc;
        return 0;
      });
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.sortedUsers.length / this.pageSize));
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.sortedUsers.slice(start, start + this.pageSize);
    },
    pageNumbers() {
      const pages = this.totalPages;
      const nums = [];
      for (let i = 1; i <= pages; i++) nums.push(i);
      return nums;
    }
  },
  watch: {
    filters: {
      handler() { this.currentPage = 1; },
      deep: true
    }
  },
  methods: {
    async loadUsers() {
      this.loading = true;
      try {
        const options = { limitCount: 100 };
        this.users = await fetchAllUsers(options);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        this.loading = false;
      }
    },
    setSort(key) {
      if (this.sortKey === key) {
        this.sortAsc = !this.sortAsc;
      } else {
        this.sortKey = key;
        this.sortAsc = key === 'createdAt' ? false : true;
      }
      this.currentPage = 1;
    },
    changePage(n) {
      if (n < 1 || n > this.totalPages) return;
      this.currentPage = n;
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
.admin-users-page {
  min-height: 100vh;
  background: url('/AdminUsers.png') center center / cover no-repeat fixed;
}
.AdminUsers-hero {
  position: relative;
  padding-top: 80px;
  min-height: calc(100vh - 80px);
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

.sortable {
  cursor: pointer;
  user-select: none;
}
</style>
