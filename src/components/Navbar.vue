<template>
  <nav class="navbar navbar-expand-lg">
    <div class="container">
      <router-link class="navbar-brand fw-bold" to="/">MindHaven</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><router-link class="nav-link" to="/">Home</router-link></li>          
          <li class="nav-item"><router-link class="nav-link" to="/about">About</router-link></li>
          <!-- 只有非管理员用户才显示 Account 链接 -->
          <li v-if="!isAdmin" class="nav-item"><router-link class="nav-link" to="/account">Account</router-link></li>

          <!-- Services 下拉菜单 -->
          <li class="nav-item dropdown" @mouseenter="showDropdown('services')" @mouseleave="hideDropdown('services')">
            <a class="nav-link dropdown-toggle" href="#" role="button" @click.prevent="toggleDropdown('services')" @keydown.enter="toggleDropdown('services')">
              Our Service
            </a>
            <ul class="dropdown-menu" :class="{ show: activeDropdown === 'services' }" @keydown.esc="hideDropdown('services')">
              <li><router-link class="dropdown-item" to="/services" @click="hideDropdown('services')">All Services</router-link></li>
              <li><router-link class="dropdown-item" to="/services#professionals" @click="hideDropdown('services')">Get support from professionals</router-link></li>
              <li><router-link class="dropdown-item" to="/resources" @click="hideDropdown('services')">Learn by resource</router-link></li>
              <li><router-link class="dropdown-item" to="/stories" @click="hideDropdown('services')">Listen to others</router-link></li>
            </ul>
          </li>

          <!-- Admin 下拉菜单 (仅管理员可见) -->
          <li v-if="isAdmin" class="nav-item dropdown" @mouseenter="showDropdown('admin')" @mouseleave="hideDropdown('admin')">
            <a class="nav-link dropdown-toggle" href="#" role="button" @click.prevent="toggleDropdown('admin')" @keydown.enter="toggleDropdown('admin')">
              Admin
            </a>
            <ul class="dropdown-menu" :class="{ show: activeDropdown === 'admin' }" @keydown.esc="hideDropdown('admin')">
              <li><router-link class="dropdown-item" to="/admin" @click="hideDropdown('admin')">Dashboard</router-link></li>
              <li><router-link class="dropdown-item" to="/admin/resources" @click="hideDropdown('admin')">Manage Resources</router-link></li>
              <li><router-link class="dropdown-item" to="/admin/stories" @click="hideDropdown('admin')">Manage Stories</router-link></li>
              <li><router-link class="dropdown-item" to="/admin/users" @click="hideDropdown('admin')">Manage Users</router-link></li>
            </ul>
          </li>
        </ul>
        
        <!-- 登录/用户状态 -->
        <div v-if="!isLoggedIn" class="d-flex">
          <button class="btn btn-dark me-2" @click="openLogin">Login</button>
        </div>
        <div v-else class="d-flex align-items-center">
          <span class="text-white me-3">Welcome, {{ userEmail }}</span>
          <button @click="logout" class="btn btn-outline-light">Logout</button>
        </div>
      </div>
    </div>
  </nav>

  <!-- Login Modal -->
  <div v-if="showLoginModal" class="modal show d-block" tabindex="-1" @keydown.esc="closeLogin">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="text-end">
          <button type="button" class="btn-close" @click="closeLogin"></button>
        </div>
        <div class="modal-body">
          <Login @open-register="() => { closeLogin(); openRegister(); }" @login-success="closeLogin" />
        </div>
      </div>
    </div>
  </div>
  <div v-if="showLoginModal" class="modal-backdrop show" @click="closeLogin"></div>

  <!-- Register Modal -->
  <div v-if="showRegisterModal" class="modal show d-block" tabindex="-1" @keydown.esc="closeRegister">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="text-end">
          <button type="button" class="btn-close" @click="closeRegister"></button>
        </div>
        <div class="modal-body">
          <Register @open-login="() => { closeRegister(); openLogin(); }" />
        </div>
      </div>
    </div>
  </div>
  <div v-if="showRegisterModal" class="modal-backdrop show" @click="closeRegister"></div>
</template>

<script>
import { auth } from '../firebase.js';
import { signOut } from 'firebase/auth';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

export default {
  name: 'Navbar',
  data() {
    return {
      activeDropdown: null,
      isLoggedIn: false,
      userEmail: '',
      isAdmin: false,
      showLoginModal: false,
      showRegisterModal: false
    }
  },
  mounted() {
    this.checkAuthStatus();
    // 监听认证状态变化
    auth.onAuthStateChanged((user) => {
      this.isLoggedIn = !!user;
      if (user) {
        this.userEmail = user.email;
        this.checkUserRole();
      } else {
        this.userEmail = '';
        this.isAdmin = false;
      }
    });
    // 监听全局事件以在其它组件触发登录/注册弹窗
    window.addEventListener('open-login', this.openLogin);
    window.addEventListener('open-register', this.openRegister);
    // 监听用户角色更新事件
    window.addEventListener('user-role-updated', this.handleRoleUpdate);
  },
  beforeUnmount() {
    window.removeEventListener('open-login', this.openLogin);
    window.removeEventListener('open-register', this.openRegister);
    window.removeEventListener('user-role-updated', this.handleRoleUpdate);
  },
  methods: {
    checkAuthStatus() {
      const user = auth.currentUser;
      this.isLoggedIn = !!user;
      if (user) {
        this.userEmail = user.email;
        this.checkUserRole();
      }
    },
    checkUserRole() {
      const userData = JSON.parse(localStorage.getItem("currentUser") || "{}");
      this.isAdmin = userData.role === "admin";
    },
    async logout() {
      try {
        await signOut(auth);
        localStorage.removeItem("currentUser");
        this.$router.push("/");
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
    showDropdown(dropdownName) {
      this.activeDropdown = dropdownName;
    },
    hideDropdown(dropdownName) {
      // 延迟隐藏，给用户时间移动到下拉菜单
      setTimeout(() => {
        if (this.activeDropdown === dropdownName) {
          this.activeDropdown = null;
        }
      }, 100);
    },
    toggleDropdown(dropdownName) {
      //是否this.activeDropdown === dropdownName，是的话activeDropdown为空，否则赋值dropdownName
      this.activeDropdown = this.activeDropdown === dropdownName ? null : dropdownName;
    },
    openLogin() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
      this.showLoginModal = true;
    },
    closeLogin() {
      this.showLoginModal = false;
    },
    openRegister() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
      this.showRegisterModal = true;
    },
    closeRegister() {
      this.showRegisterModal = false;
    },
    handleRoleUpdate(event) {
      const { email, role } = event.detail;
      this.userEmail = email;
      this.isAdmin = role === 'admin';
      this.isLoggedIn = true;
    }
  },
  components: { Login, Register }
}
</script>

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
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 1000;
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

/* 下拉菜单样式 */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 50%, rgba(15, 52, 96, 0.95) 100%);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1001;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  color: #ffffff !important;
  padding: 12px 20px;
  text-decoration: none;
  display: block;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  color: #ffffff !important;
  transform: translateX(5px);
}

.dropdown-toggle::after {
  margin-left: 8px;
  border-top: 0.3em solid #ffffff;
  border-right: 0.3em solid transparent;
  border-bottom: 0;
  border-left: 0.3em solid transparent;
}
.modal-content {
  padding: 2rem;
}
/* 响应式设计 */
@media (max-width: 991.98px) {
  .dropdown-menu {
    position: static;
    opacity: 1;
    visibility: visible;
    transform: none;
    box-shadow: none;
    background: rgba(0, 0, 0, 0.1);
    border: none;
    border-radius: 0;
  }
  
  .dropdown-item {
    padding: 8px 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}

</style>
