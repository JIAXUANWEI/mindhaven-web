<template>
  <div class="container my-5">
    <h2 class="mb-4">Our Resources</h2>
    <div class="row g-4">
      <div v-for="p in programs" :key="p.id" class="col-md-4">
        <ResourceCard :program="p" />
      </div>
    </div>
  </div>
</template>

<script>
import ResourceCard from '@/components/ResourceCard.vue'
import programs from '@/assets/data/programs.json'

export default {
  name: "ResourcesView",
  components: { ResourceCard },
  data() {
    return {
      programs
    }
  }
}
</script>
