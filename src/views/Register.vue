<template>
  <div class="login-box">
    <h2 class="login-title">Register</h2>
    <form @submit.prevent="register" novalidate>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="iconfont icon-email"></i>
            </span>
            <input v-model="email" type="email" class="form-control" placeholder="Enter your email" required>
          </div>
          <div v-if="errors.email" class="text-danger small">{{ errors.email }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <div class="input-group">
           <span class="input-group-text">
              <i class="iconfont icon-password"></i>
            </span>
            <input v-model="password" type="password" class="form-control" placeholder="Enter your password" required>
          </div>
          <div v-if="errors.password" class="text-danger small">{{ errors.password }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label">Confirm Password</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="iconfont icon-password"></i>
            </span>
            <input v-model="confirmPassword" type="password" class="form-control" placeholder="Confirm your password" required>
          </div>
          <div v-if="errors.confirmPassword" class="text-danger small">{{ errors.confirmPassword }}</div>
        </div>
        <div v-if="formError" class="alert alert-danger py-2 small">
          {{ formError }}
        </div>
        <button type="submit" class="btn btn-primary w-100">Register</button>
        <div class="d-flex justify-content-end mt-2">
          <button type="button" class="btn-link" @click="$emit('open-login')">Already have an account? Login</button>
        </div>
    </form>

    <!-- 注册成功提示  -->
        <div 
        class="toast show align-items-center text-bg-success border-0 position-fixed bottom-0 end-0 m-3"
        role="alert"
        v-if="showSuccess"
        >
        <div class="d-flex">
            <div class="toast-body fs-5 fw-bold text-center">
            🎉 register successful！please login
            </div>
            <button 
            type="button" 
            class="btn-close btn-close-white me-2 m-auto" 
            @click="showSuccess = false">
            </button>
        </div>
        </div>
  </div>
</template>

<script>
import { auth, db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default {
    name: "RegisterView",
    data() {
        return {
            email: "",
            password: "",
            confirmPassword: "",
            errors: {},
            formError: "",
            showSuccess: false 
        };
    },
    methods: {
        async register() {
            this.errors = {};
            this.formError = "";

            // 表单检查
            if (!this.email) {
                this.errors.email = "Email is required";
            } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.email)) {
                this.errors.email = "Invalid email format";
            }

            if (!this.password) {
                this.errors.password = "Password is required";
            } else if (this.password.length < 6) {
                this.errors.password = "Password must be at least 6 characters";
            }else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(this.password)) {
                this.errors.password = "Password must contain both letters and numbers"
            }

            if (this.confirmPassword !== this.password) {
                this.errors.confirmPassword = "Passwords do not match";
            }

            if (Object.keys(this.errors).length > 0) return;

            try {
                // Firebase 注册
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;

                // Firestore 里建一条文档 users/{uid}
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    role: "user",          // 默认角色
                    createdAt: new Date()  // 注册时间
                });

                // 注册成功 → 显示sucess
                this.showSuccess = true;

                // 2秒后跳转到登录页
                setTimeout(() => {
                this.$router.push("/login");
                }, 2000);

            } catch (err) {
                if (err.code === "auth/email-already-in-use") {
                    this.formError = "This email is already registered.";
                } else {
                    this.formError = "Registration failed. Please try again.";
                }
                console.error("Register error:", err);
            }
        }
    }
};
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