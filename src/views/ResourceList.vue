<template>
  <div>
    <div class="resources-hero d-flex align-items-center justify-content-center">
    </div>
    <section class="container py-5">
      <div v-if="loading" class="text-center py-5">Loading…</div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>

      <div v-else class="row g-4">
        <div class="col-md-4" v-for="r in resources" :key="r.id">
          <ResourceCard :resource="r" />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ResourceCard from "../components/ResourceCard.vue";
import { fetchPublishedResources } from "../services/resources";

export default {
  name: "ResourceListView",
  components: { ResourceCard },
  data() {
    return { loading: true, error: "", resources: [] };
  },
  async mounted() {
    try {
      this.resources = await fetchPublishedResources({ limitCount: 50 });
      this.error = "";
    } catch (e) {
      console.error(e);
      this.error = "Failed to load resources.";
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.resources-hero {
  min-height: calc(100vh - 80px);
  padding-top: 80px; /* avoid overlap with fixed navbar */
  background: url('/image-s/resource_bg.jpg') center center / cover no-repeat fixed;
}
.text-shadow { text-shadow: 0 6px 18px rgba(0,0,0,0.35); }
</style>
