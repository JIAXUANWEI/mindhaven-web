<template>
  <div class="card h-100 shadow-sm resource-card">
    <img v-if="resource.coverUrl" :src="resource.coverUrl" class="card-img-top" alt="Resource cover" />
    <div class="card-body d-flex flex-column">
      <h5 class="card-title">{{ resource.title }}</h5>
      <h6 class="card-subtitle mb-2">
        <span class="badge bg-secondary">
          <i class="fas fa-tag me-1"></i>{{ resource.category }}
        </span>
      </h6>
      <p class="card-text flex-grow-1">{{ resource.excerpt || resource.content?.substring(0, 100) + '...' }}</p>
      <div class="d-flex justify-content-between align-items-center mt-auto">
        <span class="badge bg-secondary">
          <i class="iconfont icon-eye me-1"></i>{{ resource.viewCount || 0 }} views
        </span>
        <router-link :to="`/resources/${resource.id}`" class="btn btn-primary btn-sm">
          <i class="fas fa-book-open me-1"></i>Read More
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { recordResourceView } from "../services/resources";

export default {
  name: "ResourceCard",
  props: {
    resource: {
      type: Object,
      required: true
    }
  },
  methods: {
    async handleView() {
      if (this.resource.id) {
        await recordResourceView(this.resource.id);
      }
    }
  }
}
</script>

<style scoped>
.resource-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.resource-card .card-img-top {
  height: 200px;
  object-fit: cover;
}

.resource-card .btn-primary {
  background: linear-gradient(135deg, #CCCCCC, #a56817);
  border: none;
  color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}


.resource-card .btn-primary:hover {
  background: linear-gradient(135deg, #a56817, #CCCCCC);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
  color: #ffffff;
}

</style>
