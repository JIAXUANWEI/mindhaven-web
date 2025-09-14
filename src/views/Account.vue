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
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="fw-semibold">My Stories</div>
            <button class="btn btn-primary btn-sm" @click="showStoryForm = true">
              <i class="iconfont icon-write me-1"></i>Write New Story
            </button>
          </div>

          <!-- Story Form Modal -->
          <div v-if="showStoryForm" class="story-form-overlay">
            <div class="story-form-modal">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h5 class="mb-0">{{ editingStoryId ? 'Edit Your Story' : 'Share Your Story' }}</h5>
                <button class="btn-close" @click="cancelStoryForm"></button>
              </div>
              <form @submit.prevent="submitStory">
                <div class="mb-3">
                  <label class="form-label">Title *</label>
                  <input v-model="newStory.title" type="text" class="form-control" required maxlength="100">
                </div>
                <div class="mb-3">
                  <label class="form-label">Brief Description</label>
                  <textarea v-model="newStory.excerpt" class="form-control" rows="2" maxlength="200" 
                            placeholder="A short summary of your story..."></textarea>
                </div>
                <div class="mb-3">
                  <label class="form-label">Your Story *</label>
                  <textarea v-model="newStory.content" class="form-control" rows="8" required 
                            placeholder="Share your experience, thoughts, or journey..."></textarea>
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="submittingStory">
                    <span v-if="submittingStory" class="spinner-border spinner-border-sm me-2"></span>
                    {{ submittingStory ? (editingStoryId ? 'Updating...' : 'Publishing...') : (editingStoryId ? 'Update Story' : 'Publish Story') }}
                  </button>
                  <button type="button" class="btn btn-secondary" @click="cancelStoryForm">Cancel</button>
                </div>
              </form>
            </div>
          </div>

          <!-- User Stories List -->
          <div v-if="loadingUserStories" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
          <div v-else-if="userStories.length === 0" class="text-muted text-center py-4">
            <i class="iconfont icon-Book fs-1 mb-3 d-block"></i>
            <p>You haven't published any stories yet.</p>
            <p class="small">Share your experiences and connect with others!</p>
          </div>
          <div v-else class="user-stories-list">
            <div v-for="story in userStories" :key="story.id" class="story-item mb-3 p-3 border rounded">
              <div class="d-flex">
                <div class="flex-grow-1">
                  <h6 class="fw-semibold mb-1">{{ story.title }}</h6>
                  <p class="text-muted small mb-2" v-if="story.excerpt">{{ story.excerpt }}</p>
                  <div class="d-flex align-items-center gap-3 small text-muted">
                    <span>{{ formatDate(story.createdAt) }}</span>
                    <span class="badge" :class="getStatusBadgeClass(story.status)">
                      {{ getStatusText(story.status) }}
                    </span>
                    <span><i class="iconfont icon-eye me-1"></i>{{ story.viewCount || 0 }}</span>
                    <span><i class="iconfont icon-like me-1"></i>{{ story.likeCount || 0 }}</span>
                  </div>
                </div>
                <div class="ms-3">
                  <div class="btn-group" role="group">
                    <button v-if="story.status === 'approved'" class="btn btn-sm btn-outline-primary" 
                            @click="viewStory(story.id)"><i class="iconfont icon-eye"></i></button>
                    <button v-else class="btn btn-sm btn-outline-secondary" disabled>Pending</button>
                    <button class="btn btn-sm btn-outline-warning" @click="editStory(story)">
                      <i class="iconfont icon-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteStory(story.id)">
                      <i class="iconfont icon-delete"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                    <i class="iconfont icon-eye"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="activeTab==='comments'">
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
                </div>
                <div>
                  <button class="btn btn-sm btn-outline-primary" @click="viewItem(comment)">
                    <i class="iconfont icon-eye"></i>
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

    </section>
    </div>
  </div>
  <!-- Custom Alert -->
  <CustomAlert
    :show="alert.show"
    :type="alert.type"
    :title="alert.title"
    :message="alert.message"
    :details="alert.details"
    :is-confirm="alert.isConfirm"
    :confirm-text="alert.confirmText"
    :cancel-text="alert.cancelText"
    @close="closeAlert"
    @confirm="handleAlertConfirm"
    @cancel="closeAlert"
  />
</template>

<script>
import { auth } from '../firebase.js';
import { signOut } from 'firebase/auth';
import { fetchUserLikes, fetchUserComments } from '../services/userInteractions.js';
import { fetchStoryById, createUserStory, fetchUserStories, updateUserStory, deleteUserStory } from '../services/stories.js';
import { fetchResourceById } from '../services/resources.js';
import CustomAlert from '../components/CustomAlert.vue';

export default {
  name: "AccountView",
  components: {
    CustomAlert
  },
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
      userStories: [],
      loadingLikes: false,
      loadingComments: false,
      loadingUserStories: false,
      itemTitles: {},
      // Story form
      showStoryForm: false,
      submittingStory: false,
      editingStoryId: null, // 添加编辑状态
      newStory: {
        title: '',
        excerpt: '',
        content: '',
        coverUrl: ''
      },
      alert: {
        show: false,
        type: 'success',
        title: '',
        message: '',
        details: '',
        isConfirm: false,
        confirmText: 'OK',
        cancelText: 'Cancel',
        action: null,
        storyId: null
      }
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
      } else if (newTab === 'stories' && this.isLoggedIn) {
        this.loadUserStories();
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
    },
    async loadUserStories() {
      if (!this.isLoggedIn) return;
      
      this.loadingUserStories = true;
      try {
        const user = auth.currentUser;
        this.userStories = await fetchUserStories(user.uid, { size: 20 });
      } catch (error) {
        console.error("Error loading user stories:", error);
      } finally {
        this.loadingUserStories = false;
      }
    },
    async submitStory() {
      if (!this.newStory.title.trim() || !this.newStory.content.trim()) return;
      
      this.submittingStory = true;
      try {
        const user = auth.currentUser;
        const storyData = {
          title: this.newStory.title.trim(),
          excerpt: this.newStory.excerpt.trim() || '',
          content: this.newStory.content.trim(),
          coverUrl: this.newStory.coverUrl.trim() || '',
          authorName: user.displayName || user.email.split('@')[0],
          authorId: user.uid,
          authorEmail: user.email
        };
        
        if (this.editingStoryId) {
          await updateUserStory(this.editingStoryId, storyData);
          this.showAlert(
            'success',
            'Story Updated! 📝',
            'Your story has been successfully updated.',
            'It will be reviewed again before publication.'
          );
        } else {
          await createUserStory(storyData);
          this.showAlert(
            'success',
            'Story Published! 🎉',
            'Your story has been submitted successfully!',
            'Our team will review it shortly and publish it once approved.'
          );
        }
        
        this.cancelStoryForm();
        await this.loadUserStories();
        
      } catch (error) {
        console.error("Error submitting story:", error);
        this.showAlert(
          'error',
          'Submission Failed 😞',
          'Failed to submit your story.',
          'Please check your connection and try again.'
        );
      } finally {
        this.submittingStory = false;
      }
    },
    cancelStoryForm() {
      this.showStoryForm = false;
      this.editingStoryId = null;
      this.newStory = {
        title: '',
        excerpt: '',
        content: '',
        coverUrl: ''
      };
    },
    editStory(story) {
      this.editingStoryId = story.id;
      this.newStory = {
        title: story.title,
        excerpt: story.excerpt || '',
        content: story.content,
        coverUrl: story.coverUrl || ''
      };
      this.showStoryForm = true;
    },
    deleteStory(storyId) {
      this.showConfirmAlert(
        'Delete Story? 🗑️',
        'Are you sure you want to delete this story?',
        'This action cannot be undone and will permanently remove your story.',
        'delete',
        storyId
      );
    },
    async performDeleteStory(storyId) {
      try {
        await deleteUserStory(storyId);
        this.showAlert(
          'success',
          'Story Deleted 🗑️',
          'Your story has been successfully deleted.',
          'This action cannot be undone.'
        );
        await this.loadUserStories();
      } catch (error) {
        console.error("Error deleting story:", error);
        this.showAlert(
          'error',
          'Deletion Failed 😞',
          'Failed to delete your story.',
          'Please try again later.'
        );
      }
    },
    getStatusText(status) {
      const statusMap = {
        'pending': 'Under Review',
        'approved': 'Published',
        'rejected': 'Rejected'
      };
      return statusMap[status] || status;
    },
    getStatusBadgeClass(status) {
      const classMap = {
        'pending': 'bg-warning',
        'approved': 'bg-success',
        'rejected': 'bg-danger'
      };
      return classMap[status] || 'bg-secondary';
    },
    viewStory(storyId) {
      this.$router.push(`/stories/${storyId}`);
    },
    showAlert(type, title, message, details = '', isConfirm = false, confirmText = 'OK', cancelText = 'Cancel') {
      this.alert = {
        show: true,
        type,
        title,
        message,
        details,
        isConfirm,
        confirmText,
        cancelText,
        action: null,
        storyId: null
      };
    },
    showConfirmAlert(title, message, details, action, storyId = null) {
      this.alert = {
        show: true,
        type: 'confirm',
        title,
        message,
        details,
        isConfirm: true,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        action,
        storyId
      };
    },
    closeAlert() {
      this.alert.show = false;
      this.alert.action = null;
      this.alert.storyId = null;
    },
    async handleAlertConfirm() {
      if (this.alert.action === 'delete' && this.alert.storyId) {
        await this.performDeleteStory(this.alert.storyId);
      }
      this.closeAlert();
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

.btn-primary {
  background: linear-gradient(135deg, #CCCCCC, #bb761c);
  border: none;
  color: #ffffff;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #bb761c, #CCCCCC);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
  color: #ffffff;
}
.story-form-overlay {position: fixed;top: 0;left: 0;right: 0;bottom: 0;background: rgba(0, 0, 0, 0.5);display: flex;align-items: center;justify-content: center;z-index: 1050;}
.story-form-modal {background: white;border-radius: 8px;padding: 2rem;width: 90%;max-width: 600px;max-height: 90vh;overflow-y: auto;}
.story-item {transition: all 0.2s ease;}
.story-item:hover {box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);}
.user-stories-list {max-height: 500px;overflow-y: auto;}
</style>
