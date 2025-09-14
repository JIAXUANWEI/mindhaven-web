<template>
  <div class="resource-detail-page">
    <!-- Hero Section with Cover Image -->
    <section v-if="resource" class="resource-hero" :style="{ 
      backgroundImage: resource.coverUrl ? `url(${resource.coverUrl})` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
    }">
        <div class="hero-overlay"></div>
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto text-center">
              <h1 class="display-4 fw-bold text-white mb-4 text-shadow">{{ resource.title }}</h1>
              <div class="d-flex align-items-center justify-content-center mb-4">
                <div class="text-white">
                  <div class="fw-semibold">
                    <i class="fas fa-tag me-2"></i>{{ resource.category }}
                  </div>
                  <small class="opacity-75">
                    <i class="fas fa-eye me-1"></i>{{ resource.viewCount || 0 }} views
                  </small>
                </div>
              </div>
              <p v-if="resource.excerpt" class="lead text-white text-shadow">{{ resource.excerpt }}</p>
            </div>
          </div>
        </div>
    </section>

    <!-- Resource Content Section -->
    <section v-if="resource" class="resource-content">
        <div class="container">
          <div class="row">
            <div class="col-lg-8 mx-auto">
              <div class="resource-card">
                <div class="resource-body">
                  <div class="content" v-html="formattedContent"></div>
                </div>
              </div>
            
            <!-- Action Buttons -->
            <div class="text-center mt-5">
              <router-link to="/resources" class="btn btn-primary btn-lg">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Resources
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <section v-else-if="loading" class="resource-content">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center py-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading resource...</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Error State -->
    <section v-else class="resource-content">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto">
            <div class="alert alert-warning text-center" role="alert">
              <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
              <h4>Resource not found</h4>
              <p>The resource you're looking for doesn't exist or has been removed.</p>
              <router-link to="/resources" class="btn btn-warning">
                <i class="fas fa-arrow-left me-2"></i>
                Back to Resources
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { fetchResourceById, recordResourceView } from "../services/resources";

export default {
  name: "ResourceDetail",
  data(){ 
    return { 
      resource: null, 
      loading: true 
    }; 
  },
  computed: {
    formattedContent() {
      if (!this.resource || !this.resource.content) return '';
      
      let content = this.resource.content;
      
      // 如果有link字段，将其作为图片插入到内容中
      if (this.resource.link) {
        // 在内容末尾添加图片
        content += `\n\n<img src="${this.resource.link}" alt="Resource illustration" class="resource-image" />`;
      }
      
      // 将换行符转换为HTML换行
      content = content.replace(/\n/g, '<br>');
      
      return content;
    }
  },
  async mounted(){
    const id = this.$route.params.id;
    try {
      this.resource = await fetchResourceById(id);
      if (this.resource) {
        // 记录用户查看资源
        await recordResourceView(id);
      }
    } catch (error) {
      console.error('Error loading resource:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.resource-detail-page {
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

.resource-hero {
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

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.6) 100%);
  z-index: 1;
}

.resource-hero .container {
  position: relative;
  z-index: 2;
}



.resource-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: #ffffff;
  min-height: 100vh;
  padding: 4rem 0;
}

.resource-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
}

.resource-card:hover {
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 255, 255, 0.3);
}

.resource-body {
  padding: 3rem;
}

.content { 
  font-size: 1.1rem;
  line-height: 1.8;
  color: #e8f4fd;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  text-align: left;
}

.resource-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  margin: 2rem 0;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.text-shadow { 
  text-shadow: 0 6px 18px rgba(0,0,0,0.35); 
}

.btn-primary {
  background: linear-gradient(135deg, #CCCCCC, #a56817);
  border: none;
  color: #ffffff;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.btn-primary:hover {
  background: linear-gradient(135deg, #a56817, #CCCCCC);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
  color: #ffffff;
}

.btn-success {
  background: linear-gradient(135deg, #28a745, #20c997);
  border: none;
  color: #ffffff;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 50px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.btn-success:hover {
  background: linear-gradient(135deg, #20c997, #28a745);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .resource-hero {
    min-height: 50vh;
  }
  
  .resource-hero h1 {
    font-size: 2.5rem;
  }
  
  .resource-body {
    padding: 2rem 1.5rem;
  }
  
  .content {
    font-size: 1rem;
    line-height: 1.6;
  }
}

@media (max-width: 576px) {
  .resource-hero h1 {
    font-size: 2rem;
  }
  
  .resource-body {
    padding: 1.5rem 1rem;
  }
}
</style>
