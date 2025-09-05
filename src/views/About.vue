<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center min-vh-100">
          <div class="col-lg-6">
            <h1 class="display-4 fw-bold text-white mb-4">About MindHaven</h1>
            <p class="lead text-white mb-4">
              We are dedicated to providing comprehensive mental health support and resources 
              to help individuals on their journey to better wellbeing.
            </p>
            <router-link to="/services" class="btn btn-primary btn-lg">Our Services</router-link>
          </div>
          <div class="col-lg-6">
            <div class="hero-image">
              <img src="https://via.placeholder.com/500x400" alt="About MindHaven" class="img-fluid rounded">
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section id="mission" class="py-5 bg-light">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center">
            <h2 class="mb-4">Our Mission</h2>
            <p class="lead">
              To create a safe, supportive environment where individuals can access quality mental health resources, 
              connect with professionals, and build resilience for a healthier future.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section id="team" class="py-5">
      <div class="container">
        <h2 class="text-center mb-5">Our Team</h2>
        <div class="row g-4">
          <div class="col-md-4" v-for="member in teamMembers" :key="member.id">
            <div class="card h-100 shadow-sm">
              <img :src="member.image" class="card-img-top" :alt="member.name">
              <div class="card-body text-center">
                <h5 class="card-title">{{ member.name }}</h5>
                <p class="card-text text-muted">{{ member.role }}</p>
                <p class="card-text">{{ member.description }}</p>
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
  name: 'AboutView',
  data() {
    return {
      teamMembers: [
        {
          id: 1,
          name: 'Dr. Sarah Johnson',
          role: 'Clinical Director',
          description: 'Licensed psychologist with 15+ years of experience in mental health counseling.',
          image: 'https://via.placeholder.com/300x300'
        },
        {
          id: 2,
          name: 'Michael Chen',
          role: 'Therapist',
          description: 'Specialized in cognitive behavioral therapy and anxiety management.',
          image: 'https://via.placeholder.com/300x300'
        },
        {
          id: 3,
          name: 'Emily Rodriguez',
          role: 'Support Coordinator',
          description: 'Dedicated to connecting individuals with the right resources and support.',
          image: 'https://via.placeholder.com/300x300'
        }
      ]
    }
  }
}
</script>

<style scoped>
.about-page {
  padding-top: 80px; /* Account for fixed navbar */
}

.hero-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-image img {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.card {
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}
</style>
