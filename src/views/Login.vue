<template>
  <div class="login-page d-flex align-items-center justify-content-center">
    <div class="login-box shadow-lg p-4 rounded bg-white">
      <h2 class="text-center mb-4 fw-bold">Login to MindHaven 
      </h2>
      
      <form @submit.prevent="login" novalidate>
        <!-- Email -->
        <div class="mb-3">
          <label class="form-label">Email</label>
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
          <label class="form-label">Password</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="iconfont icon-password"></i>
            </span>
            <input 
              v-model="password" 
              type="password" 
              class="form-control" 
              placeholder="Enter your password"
              required
            >
          </div>
          <div v-if="errors.password" class="text-danger small">{{ errors.password }}</div>
        </div>

        <!-- Remember Me -->
        <div class="form-check mb-3">
          <input v-model="remember" type="checkbox" class="form-check-input" id="rememberMe">
          <label class="form-check-label" for="rememberMe">Remember me</label>
        </div>
        <!-- register -->
        <div class="text-center mt-3">
  <router-link to="/register">Don't have an account? Register</router-link>
        </div>

        <!-- Error Message -->
        <div v-if="formError" class="alert alert-danger py-2 small">
          {{ formError }}
        </div>

        <!-- Submit -->
        <button type="submit" class="btn btn-primary w-100">
          <i class="iconfont icon-login"></i> Login
        </button>
      </form>

    </div>
  </div>
</template>

<script>
import { auth, db } from "../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore"; 

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      remember: false,
      errors: {},
      formError: ""
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
        //  Firebase 登录
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const user = userCredential.user;

        //  默认角色 user（如果不用 Firestore 管理角色，可以直接写死）
        let role = "user";

        //  如果你在 Firestore 里存了 role，就取出来
        const docRef = doc(db, "users", user.uid);//创建一个指向 Firestore 文档的“引用 (Reference)”。db → Firestore 数据库对象。"users" → 集合名字（相当于数据库表）。user.uid → 这个用户的唯一 ID，作为文档 ID。
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          role = docSnap.data().role || "user";
        }
        //  把用户信息保存到浏览器本地存储
        localStorage.setItem("currentUser", JSON.stringify({ email: user.email, role }));//localStorage.setItem(key, value) → 存一条数据。JSON.stringify → 把对象转成字符串，方便存储。

        //  跳转
        this.$router.push(role === "admin" ? "/admin" : "/account");

      } catch (err) {
        this.formError = "Invalid email or password";
        console.error("Login error:", err);
      }


    },


    }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(to right, #74ebd5, #ACB6E5);
}

.login-box {
  width: 100%;
  max-width: 400px;
}

.input-group-text {
  background: #f8f9fa;
}

button {
  font-weight: bold;
}

.form-label {
  display: block;
  text-align: left;
  width: 100%;
  margin-bottom: 0.25rem;
}
</style>
