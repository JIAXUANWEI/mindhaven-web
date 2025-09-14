<template>
  <div class="card h-100 shadow-sm story-card">
    <img v-if="story.coverUrl" :src="story.coverUrl" class="card-img-top" alt="" />
    <div class="card-body">
      <img v-if="story.avatarUrl" :src="story.avatarUrl" class="rounded-circle me-2" style="width:32px;height:32px;object-fit:cover;" />
      <h5 class="card-title mb-0 me-2">{{ story.title }}</h5>
      <small class="text-start">{{ story.authorName || 'Anonymous' }}</small>
      <p class="card-text text-secondary">{{ story.excerpt }}</p>
      <router-link :to="`/stories/${story.id}`" class="btn btn-primary btn-sm">Read More</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "StoryCard",
  props: { story: { type: Object, required: true } }
};
</script>

<style scoped>
.story-card img.card-img-top {
  height: 180px;
  object-fit: cover;
}

.story-card .btn-primary {
  background: linear-gradient(135deg, #CCCCCC, #a56817);
  border: none;
  color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.story-card .btn-primary:hover {
  background: linear-gradient(135deg, #a56817, #CCCCCC);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
  color: #ffffff;
}
</style>
