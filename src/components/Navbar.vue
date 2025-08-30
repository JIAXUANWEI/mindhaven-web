<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">MindHaven</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><router-link class="nav-link" to="/">Home</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/about">About</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/services">Our Service</router-link></li>
          <li class="nav-item"><router-link class="nav-link" to="/wellbeing">My Wellbeing</router-link></li>
        </ul>
        <router-link class="btn btn-dark ms-3" to="/login">Login</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar-brand {
  color:#fff !important;
  font-size: 2rem; /* 增大品牌字体 */
  font-family: 'Pacifico', cursive, 'Comic Sans MS', 'Arial', sans-serif; /* 艺术字字体 */
  letter-spacing: 2px;
  text-shadow: 2px 2px 8px rgba(0,0,0,0.2); /* 艺术字阴影 */
}
.navbar {
  background-color: transparent !important;
}
.nav-item .nav-link{
  color:#fff !important;
  font-size: 1.2rem; /* 增大导航项字体 */
  font-family: 'Segoe UI', 'Arial', sans-serif;
  letter-spacing: 1px;
}
.btn-dark{
  font-size: 1.2rem;
}

</style>