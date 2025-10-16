<template>
  <div class="admin-resources-page">
    <!-- Header -->
    <div class="AdminResources-hero d-flex align-items-center">
    </div>

    <!-- Resources Table -->
    <div class="container py-5">
      <button @click="showCreateModal = true" class="btn btn-primary btn-lg">
        <i class="iconfont icon-add">Add New Resource</i>
      </button>
      <div class="admin-card">
        <!-- Controls: Column Filters -->
        <div class="p-3">
          <div class="row g-2">
            <div class="col-12 col-md-4">
              <div class="input-group">
                <span class="input-group-text">Title</span>
                <input v-model.trim="filters.title" type="text" class="form-control" placeholder="Filter by title">
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="input-group">
                <span class="input-group-text">Category</span>
                <input v-model.trim="filters.category" type="text" class="form-control" placeholder="Filter by category">
              </div>
            </div>
            <div class="col-12 col-md-4">
              <div class="input-group">
                <span class="input-group-text">Status</span>
                <input v-model.trim="filters.status" type="text" class="form-control" placeholder="Filter by status">
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="input-group">
                <span class="input-group-text">Views</span>
                <input v-model.number="filters.viewsMin" type="number" class="form-control" placeholder="Min">
                <span class="input-group-text">-</span>
                <input v-model.number="filters.viewsMax" type="number" class="form-control" placeholder="Max">
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="input-group">
                <span class="input-group-text">Created</span>
                <input v-model="filters.createdFrom" type="date" class="form-control">
                <span class="input-group-text">-</span>
                <input v-model="filters.createdTo" type="date" class="form-control">
              </div>
            </div>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th style="color: #ffffff;">Title</th>
                <th style="color: #ffffff;">Category</th>
                <th style="color: #ffffff;">Status</th>
                <!-- 只有当条件为真时，才加上 active 类。也就是说：当 sortKey 是 'viewCount'（即当前正按“浏览数”排序）时，最终类名会是：class="sortable text-nowrap active"-->
                <th style="color: #ffffff;" @click="setSort('viewCount')" :class="['sortable','text-nowrap', { active: sortKey === 'viewCount' }]">
                  Views ▲▼
                </th>
                <th style="color: #ffffff;" @click="setSort('createdAt')" :class="['sortable','text-nowrap', { active: sortKey === 'createdAt' }]">
                  Created ▲▼
                </th>
                <th style="color: #ffffff;">Actions</th>
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
              <tr v-else-if="sortedResources.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  No matching resources
                </td>
              </tr>
              <!-- 遍历组件里的计算属性 paginatedResources（分页后的资源数组），每个元素取名为 resource，然后在模板里用 resource.title、resource.category 等来显示 -->
              <tr v-else v-for="resource in paginatedResources" :key="resource.id">
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
                  <!-- btn-group是 Bootstrap 提供的一个按钮分组类,作用是：把多个按钮放在一行，让它们紧密排列成一个“按钮组”，边界相连、圆角衔接，看起来像一个整体工具条。 -->
                  <div class="btn-group" role="group">
                    <button @click="editResource(resource)" class="btn btn-sm btn-outline-primary">
                      <i class="iconfont icon-edit"></i>
                    </button>
                    <button @click="deleteResource(resource.id)" class="btn btn-sm btn-outline-danger">
                      <i class="iconfont icon-delete"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center p-3">
          <div  style="color: #ffffff;">Page {{ currentPage }} of {{ totalPages }}</div>
          <nav aria-label="Page navigation">
            <ul class="pagination mb-0">
              <!-- 当当前页是第一页时（currentPage === 1），让按钮变灰并禁用.Bootstrap 的分页样式中有定义：.page-item.disabled .page-link -->
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">Prev</button>
              </li>
              <li v-for="n in pageNumbers" :key="n" class="page-item" :class="{ active: n === currentPage }">
                <!-- 如果当前页是第n页（n === currentPage），让按钮变成亮色。Bootstrap 的分页样式中有定义：.page-item.active .page-link -->
                <button class="page-link" @click="changePage(n)">{{ n }}</button>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
     <!-- tabindex="-1"这是 HTML 原生属性。让这个元素可以被“聚焦”，并且防止用户用 Tab 键误切换焦点到它内部。 -->
    <div v-if="showCreateModal || showEditModal" class="modal show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ showCreateModal ? 'Create New Resource' : 'Edit Resource' }}</h5>
            <button @click="closeModal" type="button" class="btn-close btn-close-white"></button>
          </div>
          <div class="modal-body">
            <!-- 事件监听（@）+ 修饰符（.prevent） 的组合。它同时做了两件事：1拦截表单的默认提交行为（HTML 原生 <form> 会自动提交）2调用你组件里的方法 saveResource() -->
            <form @submit.prevent="saveResource">
              <div class="row">
                <div class="col-md-8">
                  <div class="mb-3">
                    <label class="form-label">Title *</label>
                    <input v-model="formData.title" type="text" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Excerpt</label>
                    <!-- <textarea> 是 HTML 提供的一个多行文本输入框。 -->
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

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { fetchAllResources, createResource, updateResource, deleteResource as deleteResourceApi } from '../services/resources';

const resources = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const saving = ref(false);
const editingResource = ref(null);

const filters = reactive({
  title: '',
  category: '',
  status: '',
  viewsMin: null,
  viewsMax: null,
  createdFrom: '',
  createdTo: ''
});

const sortKey = ref('createdAt');
const sortAsc = ref(false);
const currentPage = ref(1);
const pageSize = ref(5);

const formData = reactive({
  title: '',
  excerpt: '',
  content: '',
  category: '',
  coverUrl: '',
  link: '',
  status: 'draft',
  priority: 5
});

async function loadResources() {
  loading.value = true;
  try {
    resources.value = await fetchAllResources({ limitCount: 100 });
  } catch (error) {
    console.error('Error loading resources:', error);
  } finally {
    loading.value = false;
  }
}

onMounted(loadResources);

const filteredResources = computed(() => {
  const f = filters;
  const fromTs = f.createdFrom ? new Date(f.createdFrom).setHours(0,0,0,0) : null;
  const toTs = f.createdTo ? new Date(f.createdTo).setHours(23,59,59,999) : null;
  const minViews = typeof f.viewsMin === 'number' && !isNaN(f.viewsMin) ? f.viewsMin : null;
  const maxViews = typeof f.viewsMax === 'number' && !isNaN(f.viewsMax) ? f.viewsMax : null;
  return resources.value.filter(r => {
    const title = (r.title || '').toLowerCase();
    const category = (r.category || '').toLowerCase();
    const status = (r.status || '').toLowerCase();
    const views = Number(r.viewCount || 0);
    const createdVal = r.createdAt;
    const createdDate = createdVal?.toDate ? createdVal.toDate() : (createdVal ? new Date(createdVal) : null);
    const createdTs = createdDate ? createdDate.getTime() : null;

    if (f.title && !title.includes(f.title.toLowerCase())) return false;
    if (f.category && !category.includes(f.category.toLowerCase())) return false;
    if (f.status && !status.includes(f.status.toLowerCase())) return false;
    if (minViews !== null && views < minViews) return false;
    if (maxViews !== null && views > maxViews) return false;
    if (fromTs !== null && (createdTs === null || createdTs < fromTs)) return false;
    if (toTs !== null && (createdTs === null || createdTs > toTs)) return false;
    return true;
  });
});

const sortedResources = computed(() => {
  const key = sortKey.value;
  const asc = sortAsc.value ? 1 : -1;
  const arr = [...filteredResources.value];
  const getVal = (r) => {
    if (key === 'createdAt') {
      const v = r.createdAt;
      const d = v?.toDate ? v.toDate() : (v ? new Date(v) : null);
      return d ? d.getTime() : 0;
    }
    if (key === 'viewCount') return Number(r.viewCount || 0);
    return (r[key] || '').toString().toLowerCase();
  };
  return arr.sort((a, b) => {
    const va = getVal(a);
    const vb = getVal(b);
    if (va < vb) return -asc;
    if (va > vb) return asc;
    return 0;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(sortedResources.value.length / pageSize.value)));

const paginatedResources = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sortedResources.value.slice(start, start + pageSize.value);
});

const pageNumbers = computed(() => {
  const pages = totalPages.value;
  const nums = [];
  for (let i = 1; i <= pages; i++) nums.push(i);
  return nums;
});

watch(filters, () => { currentPage.value = 1; }, { deep: true });

function setSort(key) {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = key === 'createdAt' ? false : true;
  }
  currentPage.value = 1;
}

function changePage(n) {
  if (n < 1 || n > totalPages.value) return;
  currentPage.value = n;
}

function editResource(resource) {
  editingResource.value = resource;
  Object.assign(formData, resource);
  showEditModal.value = true;
}

async function deleteResource(id) {
  if (confirm('Are you sure you want to delete this resource?')) {
    try {
      await deleteResourceApi(id);
      await loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  }
}

function resetForm() {
  Object.assign(formData, {
    title: '', excerpt: '', content: '', category: '', coverUrl: '', link: '', status: 'draft', priority: 5
  });
}

function closeModal() {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingResource.value = null;
  resetForm();
}

async function saveResource() {
  saving.value = true;
  try {
    if (showCreateModal.value) {
      await createResource(formData);
    } else if (editingResource.value) {
      await updateResource(editingResource.value.id, formData);
    }
    await loadResources();
    closeModal();
  } catch (error) {
    console.error('Error saving resource:', error);
  } finally {
    saving.value = false;
  }
}

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString();
}
</script>

<style scoped>

.admin-resources-page {
  min-height: 100vh;
  background: url('/AdminResources.png') center center / cover no-repeat fixed;

}
.AdminResources-hero {
  position: relative;
  padding-top: 80px; /* avoid overlap with fixed navbar */
  min-height: calc(100vh - 80px);
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
  background: linear-gradient(135deg, #CCCCCC, #006372);
  border: none;
  color: #ffffff;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #006372, #CCCCCC);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
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

/* Ensure native dropdown list items are readable */
.form-select option {
  color: #000000;
  background: #ffffff;
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

.sortable {
  cursor: pointer;
  user-select: none;
}
</style>
