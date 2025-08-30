<template>
  <div class="account-page">
    <div class="account-box">
      <h2 class="mb-4">My Account</h2>
      <p>Welcome, <span class="username">{{ userEmail }}</span>!</p>
      <ul class="account-info">
        <li><strong>Email:</strong> {{ userEmail }}</li>
        <li><strong>Role:</strong> {{ userRole }}</li>
      </ul>
      <button class="btn btn-danger mt-3" @click="logout">Logout</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "AccountView",
  data() {
    return {
      userEmail: localStorage.getItem("currentUserEmail") || "Guest",
      userRole: localStorage.getItem("currentUserRole") || "user"
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("currentUserEmail");
      localStorage.removeItem("currentUserRole");
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped>
.account-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8ffae 0%, #43c6ac 100%);
}
.account-box {
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  min-width: 320px;
  max-width: 400px;
  text-align: center;
}
.username {
  color: #ff9800;
  font-weight: bold;
}
.account-info {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0 0;
  text-align: left;
}
.account-info li {
  margin-bottom: 0.5rem;
}
</style>