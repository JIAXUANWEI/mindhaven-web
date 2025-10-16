<template>
  <div>
  <div class="stories-hero d-flex align-items-center justify-content-center">
  </div>
  <section class="container py-5">

    <div v-if="loading" class="text-center py-5">Loading…</div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

    <div v-else class="row g-4">
      <div class="col-md-4" v-for="s in stories" :key="s.id">
        <StoryCard :story="s" />
      </div>
    </div>
  </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import StoryCard from "../components/StoryCard.vue";
import { fetchLatestStories } from "../services/stories";

const loading = ref(true);
const error = ref("");
const stories = ref([]);

onMounted(async () => {
  try {
    stories.value = await fetchLatestStories({ size: 9 });
    error.value = "";
  } catch (e) {
    console.error(e);
    error.value = "Failed to load stories.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.stories-hero {
  min-height: calc(100vh - 80px);
  padding-top: 80px; /* avoid overlap with fixed navbar */
  background: url('/image-s/story_bg.jpg') center center / cover no-repeat fixed;
}
.text-shadow { text-shadow: 0 6px 18px rgba(0,0,0,0.35); }
</style>


