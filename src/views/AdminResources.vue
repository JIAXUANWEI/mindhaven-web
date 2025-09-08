<template>
  <div class="admin-resources-page">
    <!-- Header -->
    <div class="admin-header">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h1 class="display-5 fw-bold text-white mb-0">Resource Management</h1>
            <p class="text-white-50 mb-0">Manage your learning resources</p>
          </div>
          <div class="col-md-6 text-end">
            <button @click="showCreateModal = true" class="btn btn-primary btn-lg">
              <i class="fas fa-plus me-2"></i>Add New Resource
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resources Table -->
    <div class="container py-5">
      <div class="admin-card">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Views</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="resources.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  No resources found
                </td>
              </tr>
              <tr v-else v-for="resource in resources" :key="resource.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img v-if="resource.coverUrl" :src="resource.coverUrl" 
                         class="resource-thumb me-3" alt="Cover">
                    <div>
                      <div class="fw-semibold">{{ resource.title }}</div>
                      <small class="text-muted">{{ resource.excerpt?.substring(0, 50) }}...</small>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge bg-secondary">{{ resource.category }}</span>
                </td>
                <td>
                  <span :class="['badge', resource.status === 'published' ? 'bg-success' : 'bg-warning']">
                    {{ resource.status }}
                  </span>
                </td>
                <td>{{ resource.viewCount || 0 }}</td>
                <td>{{ formatDate(resource.createdAt) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button @click="editResource(resource)" class="btn btn-sm btn-outline-primary">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteResource(resource.id)" class="btn btn-sm btn-outline-danger">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showCreateModal ? 'Create New Resource' : 'Edit Resource' }}</h5>
            <button @click="closeModal" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveResource">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">Title *</label>
                    <input v-model="formData.title" type="text" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Excerpt</label>
                    <textarea v-model="formData.excerpt" class="form-control" rows="3"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Content *</label>
                    <textarea v-model="formData.content" class="form-control" rows="6" required></textarea>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Category *</label>
                    <select v-model="formData.category" class="form-select" required>
                      <option value="">Select Category</option>
                      <option value="MENTAL HEALTH CONDITION">Mental Health Condition</option>
                      <option value="RELATIONSHIPS & SOCIAL SKILLS">Relationships & Social Skills</option>
                      <option value="WELLBEING">Wellbeing</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Cover Image URL</label>
                    <input v-model="formData.coverUrl" type="url" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Link URL</label>
                    <input v-model="formData.link" type="url" class="form-control">
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Status</label>
                    <select v-model="formData.status" class="form-select">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Priority (1-10)</label>
                    <input v-model.number="formData.priority" type="number" min="1" max="10" class="form-control">
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button @click="closeModal" type="button" class="btn btn-secondary">Cancel</button>
            <button @click="saveResource" type="button" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ showCreateModal ? 'Create' : 'Update' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showCreateModal || showEditModal" class="modal-backdrop show"></div>
  </div>
</template>

<script>
import { fetchAllResources, createResource, updateResource, deleteResource } from '../services/resources';

export default {
  name: 'AdminResources',
  data() {
    return {
      resources: [],
      loading: true,
      showCreateModal: false,
      showEditModal: false,
      saving: false,
      editingResource: null,
      formData: {
        title: '',
        excerpt: '',
        content: '',
        category: '',
        coverUrl: '',
        link: '',
        status: 'draft',
        priority: 5
      }
    }
  },
  async mounted() {
    await this.loadResources();
  },
  methods: {
    async loadResources() {
      this.loading = true;
      try {
        this.resources = await fetchAllResources({ limitCount: 100 });
      } catch (error) {
        console.error('Error loading resources:', error);
      } finally {
        this.loading = false;
      }
    },
    editResource(resource) {
      this.editingResource = resource;
      this.formData = { ...resource };
      this.showEditModal = true;
    },
    async deleteResource(id) {
      if (confirm('Are you sure you want to delete this resource?')) {
        try {
          await deleteResource(id);
          await this.loadResources();
        } catch (error) {
          console.error('Error deleting resource:', error);
        }
      }
    },
    closeModal() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.editingResource = null;
      this.resetForm();
    },
    resetForm() {
      this.formData = {
        title: '',
        excerpt: '',
        content: '',
        category: '',
        coverUrl: '',
        link: '',
        status: 'draft',
        priority: 5
      };
    },
    async saveResource() {
      this.saving = true;
      try {
        if (this.showCreateModal) {
          await createResource(this.formData);
        } else {
          await updateResource(this.editingResource.id, this.formData);
        }
        await this.loadResources();
        this.closeModal();
      } catch (error) {
        console.error('Error saving resource:', error);
      } finally {
        this.saving = false;
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
.admin-resources-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
}

.admin-header {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%);
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.admin-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
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

.resource-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  border: none;
  color: #ffffff;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  transform: translateY(-2px);
  color: #ffffff;
}

.btn-outline-primary {
  border-color: #4facfe;
  color: #4facfe;
  background: transparent;
}

.btn-outline-primary:hover {
  background: #4facfe;
  border-color: #4facfe;
  color: #ffffff;
}

.btn-outline-danger {
  border-color: #dc3545;
  color: #dc3545;
  background: transparent;
}

.btn-outline-danger:hover {
  background: #dc3545;
  border-color: #dc3545;
  color: #ffffff;
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

.form-control, .form-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.form-control:focus, .form-select:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #4facfe;
  box-shadow: 0 0 0 0.2rem rgba(79, 172, 254, 0.25);
  color: #ffffff;
}

.form-control::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.badge {
  font-size: 0.75rem;
}

.spinner-border {
  border-width: 0.2em;
}
</style>
