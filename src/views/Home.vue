<template>
  <div>
    <!-- Hero Section -->
    <section class="container text-center py-5">
      <h1 class="fw-bold">MindHaven</h1>
      <p class="lead">Get support now</p>
      <button class="btn btn-dark">GO</button>
    </section>

    <!-- Listen to Others -->
    <section class="bg-light py-5">
      <div class="container text-center">
        <h2 class="mb-4">LISTEN TO OTHERS</h2>
        <div class="row g-4">
          <div class="col-md-4" v-for="n in 3" :key="n">
            <div class="card h-100 shadow-sm">
              <img src="https://via.placeholder.com/150" class="card-img-top rounded-circle p-3" />
              <div class="card-body">
                <p class="card-text">Story preview text here...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Learn by Resources -->
    <section class="container py-5 d-flex align-items-center">
      <img src="https://via.placeholder.com/250x150" class="img-fluid me-4" />
      <div>
        <h2>LEARN BY RESOURCES</h2>
        <p>Explore resources about mental health, wellbeing, and relationships.</p>
      </div>
    </section>

    <!-- Get Support -->
    <section class="bg-light py-5">
      <div class="container text-center">
        <h2 class="mb-4">GET SUPPORT FROM PROFESSIONALS</h2>
        <div class="row g-4">
          <div class="col-md-4" v-for="(support, i) in supports" :key="i">
            <div class="card h-100 shadow-sm p-3">
              <img src="https://via.placeholder.com/150" class="card-img-top rounded-circle" />
              <div class="card-body">
                <h5>{{ support.title }}</h5>
                <button class="btn btn-dark">{{ support.button }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      supports: [
        { title: "Crisis Hotlines", button: "CRISIS HOTLINES" },
        { title: "Local Services", button: "LOCAL SERVICES" },
        { title: "Online Counselling", button: "ONLINE COUNSELLING" }
      ]
    }
  }
}
</script>
