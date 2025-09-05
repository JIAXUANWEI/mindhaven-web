<template>
  <div class="services-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center min-vh-100">
          <div class="col-lg-8 mx-auto text-center">
            <h1 class="display-4 fw-bold text-white mb-4">Our Services</h1>
            <p class="lead text-white mb-4">
              Comprehensive mental health services designed to support your wellbeing journey
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Grid -->
    <section class="py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-lg-4 col-md-6" v-for="service in services" :key="service.id">
            <div class="card h-100 shadow-sm service-card">
              <div class="card-body text-center">
                <div class="service-icon mb-3">
                  <i :class="service.icon" class="display-4 text-primary"></i>
                </div>
                <h5 class="card-title">{{ service.title }}</h5>
                <p class="card-text">{{ service.description }}</p>
                <ul class="list-unstyled">
                  <li v-for="feature in service.features" :key="feature" class="mb-1">
                    <i class="fas fa-check text-success me-2"></i>{{ feature }}
                  </li>
                </ul>
                <button class="btn btn-primary mt-3">Learn More</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Counseling Section -->
    <section id="counseling" class="py-5 bg-light">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <h2>Professional Counseling</h2>
            <p class="lead">One-on-one sessions with licensed mental health professionals</p>
            <ul class="list-unstyled">
              <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Individual therapy sessions</li>
              <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Evidence-based treatment approaches</li>
              <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Flexible scheduling options</li>
              <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Confidential and safe environment</li>
            </ul>
            <button class="btn btn-primary">Book a Session</button>
          </div>
          <div class="col-lg-6">
            <img src="https://via.placeholder.com/500x400" alt="Counseling" class="img-fluid rounded">
          </div>
        </div>
      </div>
    </section>

    <!-- Therapy Section -->
    <section id="therapy" class="py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6 order-lg-2">
            <h2>Specialized Therapy</h2>
            <p class="lead">Targeted therapeutic approaches for specific mental health needs</p>
            <ul class="list-unstyled">
              <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Cognitive Behavioral Therapy (CBT)</li>
              <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Dialectical Behavior Therapy (DBT)</li>
              <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Trauma-focused therapy</li>
              <li class="mb-2"><i class="fas fa-check text-success me-2"></i>Anxiety and depression treatment</li>
            </ul>
            <button class="btn btn-primary">Explore Therapy Options</button>
          </div>
          <div class="col-lg-6 order-lg-1">
            <img src="https://via.placeholder.com/500x400" alt="Therapy" class="img-fluid rounded">
          </div>
        </div>
      </div>
    </section>

    <!-- Support Groups Section -->
    <section id="support" class="py-5 bg-light">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center">
            <h2>Support Groups</h2>
            <p class="lead">Connect with others who understand your journey</p>
            <div class="row g-4 mt-4">
              <div class="col-md-4" v-for="group in supportGroups" :key="group.id">
                <div class="card h-100">
                  <div class="card-body text-center">
                    <h5 class="card-title">{{ group.name }}</h5>
                    <p class="card-text">{{ group.description }}</p>
                    <small class="text-muted">{{ group.schedule }}</small>
                  </div>
                </div>
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
  name: 'ServicesView',
  data() {
    return {
      services: [
        {
          id: 1,
          title: 'Individual Counseling',
          description: 'One-on-one therapy sessions with licensed professionals',
          icon: 'fas fa-user-friends',
          features: ['Personalized treatment plans', 'Flexible scheduling', 'Confidential sessions']
        },
        {
          id: 2,
          title: 'Group Therapy',
          description: 'Supportive group sessions for shared experiences',
          icon: 'fas fa-users',
          features: ['Peer support', 'Shared learning', 'Community building']
        },
        {
          id: 3,
          title: 'Online Sessions',
          description: 'Convenient virtual therapy from the comfort of your home',
          icon: 'fas fa-video',
          features: ['Secure platform', 'Same quality care', 'Flexible timing']
        }
      ],
      supportGroups: [
        {
          id: 1,
          name: 'Anxiety Support',
          description: 'Weekly meetings for individuals dealing with anxiety',
          schedule: 'Tuesdays 7:00 PM'
        },
        {
          id: 2,
          name: 'Depression Recovery',
          description: 'Support group for those on their recovery journey',
          schedule: 'Thursdays 6:30 PM'
        },
        {
          id: 3,
          name: 'General Wellness',
          description: 'Open group for general mental health discussions',
          schedule: 'Saturdays 10:00 AM'
        }
      ]
    }
  }
}
</script>

<style scoped>
.services-page {
  padding-top: 80px; /* Account for fixed navbar */
}

.hero-section {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.service-card {
  transition: transform 0.3s ease;
  border: none;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-icon {
  color: #0f3460;
}

.card {
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
