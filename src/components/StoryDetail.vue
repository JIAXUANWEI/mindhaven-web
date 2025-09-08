<!-- authorName
content
createdAt
excerpt
avatarUrl
coverUrl
status -->
<template>
  <div class="story-detail-page">
    <!-- Hero Section with Cover Image -->
     <!-- 用story对象是否存在来决定是否显示。动态绑定内联样式：根据 story.coverUrl 是否存在，设置背景图片；否则使用渐变背景。 -->
    <section v-if="story" class="story-hero" :style="{ 
      backgroundImage: story.coverUrl ? `url(${story.coverUrl})` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
    }">

        <div class="container text-center text-white">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <h1 class="display-4 fw-bold mb-4 text-shadow">{{ story.title }}</h1>
              <div class="d-flex align-items-center justify-content-center mb-4">
                <img v-if="story.avatarUrl" :src="story.avatarUrl" class="rounded-circle me-3" style="width:50px;height:50px;object-fit:cover;" />
                <div>
                  <div class="fw-semibold">{{ story.authorName || 'Anonymous' }}</div>
                  <small class="opacity-75">{{ dateText }}</small>
                </div>
              </div>
              <p v-if="story.excerpt" class="lead text-shadow">{{ story.excerpt }}</p>
            </div>
          </div>
        </div>
    </section>

    <!-- Story Content Section -->
    <section v-if="story" class="story-content">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="story-card">
              <div class="story-body">
                <div class="content">{{ story.content }}</div>
              </div>
            </div>
            
            <!-- Back to Stories Button -->
            <div class="text-center mt-5">
              <router-link to="/stories" class="btn btn-primary btn-lg">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Stories
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <section v-else-if="loading" class="story-content">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden"><i class="iconfont icon-loading">Loading...</i></span>
            </div>
            <p class="mt-3 text-muted"><i class="iconfont icon-loading"></i>Loading story...</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section v-else class="story-content">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="alert alert-warning text-center" role="alert">
              <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
              <h4>Story not found</h4>
              <p>The story you're looking for doesn't exist or has been removed.</p>
              <router-link to="/stories" class="btn btn-warning">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Stories
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { fetchStoryById } from "../services/stories";

export default {
  name: "StoryDetail",
  data(){ 
    return { 
      story: null, 
      loading: true 
    }; 
  },
  computed: {
    dateText(){
      if (!this.story?.createdAt) return "";
      const d = this.story.createdAt.toDate ? this.story.createdAt.toDate() : new Date(this.story.createdAt);
      return d.toLocaleDateString();
    }
  },
  async mounted(){
    const id = this.$route.params.id;
    try {
      this.story = await fetchStoryById(id);
    } catch (error) {
      console.error('Error loading story:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.story-detail-page {
  padding-top: 0; /* Remove padding to let navbar overlay */
  margin: 0;
  padding-left: 0;
  padding-right: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
}

.story-hero {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}



.story-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  min-height: 100vh;
  padding: 4rem 0;
}

.story-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
}

.story-card:hover {
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}

.story-body {
  padding: 3rem;
}

.content { 
  white-space: pre-wrap; 
  font-size: 1.1rem;
  line-height: 1.8;
  color: #e8f4fd;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.text-shadow { 
  text-shadow: 0 6px 18px rgba(0,0,0,0.35); 
}

.btn-primary {
  background: linear-gradient(135deg, #CCCCCC, #666666);
  border: none;
  color: #ffffff;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #006699, #CCCCCC);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
  color: #ffffff;
}

.btn-warning {
  background: linear-gradient(135deg, #ffc107, #ff8f00);
  border: none;
  color: #ffffff;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
}

.btn-warning:hover {
  background: linear-gradient(135deg, #ff8f00, #ffc107);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 193, 7, 0.4);
  color: #ffffff;
}

.alert-warning {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border: 1px solid rgba(255, 193, 7, 0.3);
  color: #ffffff;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
}

.spinner-border {
  border-width: 0.3em;
}


</style>
