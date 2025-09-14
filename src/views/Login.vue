<template>
  <div class="login-box">
    <h2 class="login-title">Login</h2>
    <form @submit.prevent="login" novalidate>
        <!-- Email -->
        <div class="mb-3">
          <label class="visually-hidden">Email</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="iconfont icon-email"></i>
            </span>
            <input 
              v-model="email" 
              type="email" 
              class="form-control" 
              placeholder="Enter your email"
              required
            >
          </div>
          <div v-if="errors.email" class="text-danger small">{{ errors.email }}</div>
        </div>

        <!-- Password -->
        <div class="mb-3">
          <label class="visually-hidden">Password</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="iconfont icon-password"></i>
            </span>
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'"
              class="form-control" 
              placeholder="Enter your password"
              required
            >
            <button type="button" class="btn btn-eye" @click="showPassword = !showPassword">
              <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
            </button>
          </div>
          <div v-if="errors.password" class="text-danger small">{{ errors.password }}</div>
        </div>

        <!-- Remember + Links -->
        <div class="d-flex align-items-center justify-content-between mb-3 small text-muted">
          <div class="form-check m-0">
            <input v-model="remember" type="checkbox" class="form-check-input" id="rememberMe">
            <label class="form-check-label" for="rememberMe">Remember me</label>
          </div>
          <div class="link-group">
            <button type="button" class="btn-link" @click="$emit('open-register')">Sign up</button>
            <span class="mx-2">|</span>
            <button type="button" class="btn-link" disabled>Forgot password</button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="formError" class="alert alert-danger py-2 small">
          {{ formError }}
        </div>

        <!-- Submit -->
        <button type="submit" class="btn btn-primary w-100">
          <i class="iconfont icon-login"></i> Login
        </button>

        <!-- Register Link -->
        <div class="text-center mt-3">
          <p class="mb-0 text-muted">Don't have an account? 
            <button type="button" class="btn-link p-0" @click="$emit('open-register')">
              Sign up here
            </button>
          </p>
        </div>
    </form>
  </div>
</template>

<script>
import { auth, db } from "../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth"; 
import { doc, getDoc, setDoc } from "firebase/firestore"; 

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      remember: false,
      errors: {},
      formError: "",
      showPassword: false
    }
  },
  methods: {
     async login() {
      this.errors = {}
      this.formError = ""

      // 表单检查
      if (!this.email) {
        this.errors.email = "Email is required"
      } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email)) {
        this.errors.email = "Invalid email format"
      }else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(this.password)) {
        this.errors.password = "Password must contain both letters and numbers"
      }

      if (!this.password) {
        this.errors.password = "Password is required"
      } else if (this.password.length < 6) {
        this.errors.password = "Password must be at least 6 characters"
      }

      // 如果有错误，终止提交
      if (Object.keys(this.errors).length > 0) return

       try {
        // Firebase 登录
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        // 获取 Firestore 用户文档
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const role = userData.role; // 直接取出 role（必然存在）

          // 保存到本地存储
          localStorage.setItem("currentUser", JSON.stringify({ email: user.email, role }));

          // 跳转
          this.$router.push(role === "admin" ? "/admin" : "/");

          // 关闭登录弹窗
          this.$emit("login-success");
        } else {
          // 理论上不会发生，除非数据库缺少用户文档
          throw new Error("User document not found in Firestore");
        }
      } catch (err) {
        this.formError = "Invalid email or password";
        console.error("Login error:", err);
      }


    },


    }
}
</script>

<style scoped>
.login-box {
  width: 100%;
  max-width: 400px;
}

.login-title { text-align:center; font-weight:700; margin-bottom:24px; letter-spacing:1px; }
.input-group-text {
  background: #f8f9fa;
}
.btn-eye { border: 0; background: transparent; color: #888; padding: 0 12px; }

button {
  font-weight: bold;
}

.btn-primary { background-color: #FF8C00 !important; border-color: #FF8C00 !important; }

.form-label {
  display: block;
  text-align: left;
  width: 100%;
  margin-bottom: 0.25rem;
}
</style>
