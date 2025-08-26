<template>
  <div class="card h-100 shadow-sm">
    <div class="card-body">
      <h5 class="card-title">{{ program.title }}</h5>
      <h6 class="card-subtitle mb-2 text-muted">{{ program.category }}</h6>
      <p class="card-text">{{ program.summary }}</p>
      <a :href="program.link" class="btn btn-primary" target="_blank">Learn More</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "ResourceCard",
  props: {
    program: Object
  }
}
</script>
