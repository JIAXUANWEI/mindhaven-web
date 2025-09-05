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

          <!-- Services 下拉菜单 -->
           <!-- nav-item dropdown：应用 Bootstrap 的样式，让它显示为带下拉功能的菜单."dropdown-menu"：Bootstrap 样式，定义下拉菜单的外观.dropdown-item"：Bootstrap 样式，表示这是下拉菜单里的一个选项 -->
            <!-- @mouseenter="showDropdown('services')"：Vue 事件绑定，鼠标移入时调用showDropdown('services') 方法，显示下拉菜单,鼠标移出时调用 hideDropdown('services') 方法，隐藏下拉菜单 -->
             
          <li class="nav-item dropdown" @mouseenter="showDropdown('services')" @mouseleave="hideDropdown('services')">
            <a class="nav-link dropdown-toggle" href="#" role="button" @click.prevent="toggleDropdown('services')" @keydown.enter="toggleDropdown('services')">
              Our Service
            </a>
            <ul class="dropdown-menu" :class="{ show: activeDropdown === 'services' }" @keydown.esc="hideDropdown('services')">
              <li><router-link class="dropdown-item" to="/services" @click="hideDropdown('services')">All Services</router-link></li>
              <li><router-link class="dropdown-item" to="/services#professionals" @click="hideDropdown('services')">Get support from professionals</router-link></li>
              <li><router-link class="dropdown-item" to="/services#resource" @click="hideDropdown('services')">Learn by resource</router-link></li>
              <li><router-link class="dropdown-item" to="/services#Listen" @click="hideDropdown('services')">Listen to others</router-link></li>
            </ul>
          </li>

          <!-- Wellbeing 下拉菜单 -->
          <li class="nav-item dropdown" @mouseenter="showDropdown('wellbeing')" @mouseleave="hideDropdown('wellbeing')">
            <a class="nav-link dropdown-toggle" href="#" role="button" @click.prevent="toggleDropdown('wellbeing')" @keydown.enter="toggleDropdown('wellbeing')">
              My Wellbeing
            </a>
            <ul class="dropdown-menu" :class="{ show: activeDropdown === 'wellbeing' }" @keydown.esc="hideDropdown('wellbeing')">
              <li><router-link class="dropdown-item" to="/wellbeing" @click="hideDropdown('wellbeing')">Self Assessment</router-link></li>
              <li><router-link class="dropdown-item" to="/wellbeing#tracking" @click="hideDropdown('wellbeing')">Mood Tracking</router-link></li>
            </ul>
          </li>
        </ul>
        <router-link class="btn btn-dark ms-3" to="/login">Login</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  data() {
    return {
      activeDropdown: null
    }
  },
  methods: {
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
    }
  }
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