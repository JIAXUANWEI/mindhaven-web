<template>
  <div class="card h-100 shadow-sm story-card">
    <img v-if="story.coverUrl" :src="story.coverUrl" class="card-img-top" alt="" />
    <div class="card-body">
      <div class="d-flex align-items-center mb-2">
        <img v-if="story.avatarUrl" :src="story.avatarUrl" class="rounded-circle me-2" style="width:32px;height:32px;object-fit:cover;" />
        <small class="text-muted">{{ story.authorName || 'Anonymous' }}</small>
      </div>
      <h5 class="card-title">{{ story.title }}</h5>
      <p class="card-text text-secondary">{{ story.excerpt }}</p>
      <router-link :to="`/stories/${story.id}`" class="btn btn-dark btn-sm">Read More</router-link>
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
</style>
