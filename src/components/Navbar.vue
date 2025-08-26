<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
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
