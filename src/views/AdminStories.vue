<template>
  <div class="admin-stories-page">
    <!-- Header -->
    <div class="AdminStories-hero d-flex align-items-center">
    </div>

    <!-- Stories Table -->
    <div class="container py-5">
      <div class="admin-card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h3 class="card-title mb-0">Story Management</h3>
          <div class="d-flex gap-2">
            <select v-model="statusFilter" class="form-select form-select-sm" @change="loadStories">
              <option value="">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Views</th>
                <th>Likes</th>
                <th>Created</th>
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
              <tr v-else-if="stories.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  No stories found
                </td>
              </tr>
              <tr v-else v-for="story in stories" :key="story.id">
                <td>
                  <div class="d-flex align-items-center">
                    <img v-if="story.coverUrl" :src="story.coverUrl" 
                         class="story-thumb me-3" alt="Cover">
                    <div>
                      <div class="fw-semibold">{{ story.title }}</div>
                      <small class="text-muted">{{ story.excerpt?.substring(0, 50) }}...</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div>
                    <div class="fw-semibold">{{ story.authorName }}</div>
                    <small class="text-muted">{{ story.authorEmail }}</small>
                  </div>
                </td>
                <td>
                  <span :class="['badge', getStatusClass(story.status)]">
                    {{ getStatusText(story.status) }}
                  </span>
                </td>
                <td>{{ story.viewCount || 0 }}</td>
                <td>{{ story.likeCount || 0 }}</td>
                <td>{{ formatDate(story.createdAt) }}</td>
                <td>
                  <div class="btn-group" role="group">
                    <button @click="viewStory(story)" class="btn btn-sm btn-outline-info" title="View">
                      <i class="iconfont icon-eye"></i>
                    </button>
                    <button v-if="story.status === 'pending'" @click="approveStory(story.id)" 
                            class="btn btn-sm btn-outline-success" title="Approve">
                      <i class="iconfont icon-check"></i>
                    </button>
                    <button v-if="story.status === 'pending'" @click="rejectStory(story.id)" 
                            class="btn btn-sm btn-outline-warning" title="Reject">
                      <i class="iconfont icon-close"></i>
                    </button>
                    <button @click="deleteStory(story.id)" class="btn btn-sm btn-outline-danger" title="Delete">
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

    <!-- View Story Modal -->
    <div v-if="showViewModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ viewingStory?.title }}</h5>
            <button @click="closeViewModal" type="button" class="btn-close"></button>
          </div>
          <div class="modal-body">
            <div v-if="viewingStory">
              <div class="mb-3">
                <strong>Author:</strong> {{ viewingStory.authorName }} ({{ viewingStory.authorEmail }})
              </div>
              <div class="mb-3" v-if="viewingStory.excerpt">
                <strong>Excerpt:</strong>
                <p class="mt-1">{{ viewingStory.excerpt }}</p>
              </div>
              <div class="mb-3">
                <strong>Content:</strong>
                <div class="mt-1 p-3 bg-light rounded" style="max-height: 300px; overflow-y: auto;">
                  {{ viewingStory.content }}
                </div>
              </div>
              <div class="row">
                <div class="col-md-6">
                  <strong>Status:</strong> 
                  <span :class="['badge', getStatusClass(viewingStory.status)]">
                    {{ getStatusText(viewingStory.status) }}
                  </span>
                </div>
                <div class="col-md-6">
                  <strong>Created:</strong> {{ formatDate(viewingStory.createdAt) }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button v-if="viewingStory?.status === 'pending'" @click="approveStory(viewingStory.id)" 
                    class="btn btn-success">Approve</button>
            <button v-if="viewingStory?.status === 'pending'" @click="rejectStory(viewingStory.id)" 
                    class="btn btn-warning">Reject</button>
            <button @click="closeViewModal" type="button" class="btn btn-secondary">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showViewModal" class="modal-backdrop show"></div>
  </div>
</template>

<script>
import { fetchAllStories, updateStoryStatus, deleteStory } from '../services/stories';

export default {
  name: 'AdminStories',
  data() {
    return {
      stories: [],
      loading: true,
      statusFilter: '',
      showViewModal: false,
      viewingStory: null
    }
  },
  async mounted() {
    await this.loadStories();
  },
  methods: {
    async loadStories() {
      this.loading = true;
      try {
        const options = { limitCount: 100 };
        if (this.statusFilter) {
          options.status = this.statusFilter;
        }
        this.stories = await fetchAllStories(options);
      } catch (error) {
        console.error('Error loading stories:', error);
      } finally {
        this.loading = false;
      }
    },
    async approveStory(storyId) {
      try {
        await updateStoryStatus(storyId, 'approved');
        await this.loadStories();
        if (this.viewingStory?.id === storyId) {
          this.viewingStory.status = 'approved';
        }
      } catch (error) {
        console.error('Error approving story:', error);
        alert('Failed to approve story');
      }
    },
    async rejectStory(storyId) {
      try {
        await updateStoryStatus(storyId, 'rejected');
        await this.loadStories();
        if (this.viewingStory?.id === storyId) {
          this.viewingStory.status = 'rejected';
        }
      } catch (error) {
        console.error('Error rejecting story:', error);
        alert('Failed to reject story');
      }
    },
    async deleteStory(storyId) {
      if (confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
        try {
          await deleteStory(storyId);
          await this.loadStories();
          if (this.viewingStory?.id === storyId) {
            this.closeViewModal();
          }
        } catch (error) {
          console.error('Error deleting story:', error);
          alert('Failed to delete story');
        }
      }
    },
    viewStory(story) {
      this.viewingStory = story;
      this.showViewModal = true;
    },
    closeViewModal() {
      this.showViewModal = false;
      this.viewingStory = null;
    },
    getStatusClass(status) {
      switch (status) {
        case 'approved':
          return 'bg-success';
        case 'pending':
          return 'bg-warning';
        case 'rejected':
          return 'bg-danger';
        default:
          return 'bg-secondary';
      }
    },
    getStatusText(status) {
      const statusMap = {
        'pending': 'Pending Review',
        'approved': 'Approved',
        'rejected': 'Rejected'
      };
      return statusMap[status] || status;
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
.AdminStories-hero {
  background: url('/AdminStories_bg.png') center center / cover no-repeat fixed;
  position: relative;
  padding-top: 80px;
  min-height: calc(100vh - 80px);
}

.admin-stories-page {
  min-height: 100vh;
  background: url('/AdminStories_bg.png') center center / cover no-repeat fixed;
}

.admin-card {
  background: rgba(255, 255, 255);
  backdrop-filter: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: none;
  overflow: hidden;
}

.card-header {
  background: rgba(255, 255, 255);
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  color: #0a0808;
  font-weight: 600;
}

.table {
  color: #0a0808;
  margin-bottom: 0;
  background: transparent;
}

.table th {
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  background: transparent;
}

.table td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  vertical-align: middle;
  background: transparent;
}

.table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

.story-thumb {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.form-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #1a1414;
}

.form-select option {
  color: #000000;
  background: #ffffff;
}

.badge {
  font-size: 0.75rem;
}
</style>


