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

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from "../firebase.js";
import { signInWithEmailAndPassword } from "firebase/auth"; 
import { doc, getDoc } from "firebase/firestore"; 

const router = useRouter();
const emit = defineEmits(['open-register', 'login-success']);

const email = ref("");
const password = ref("");
const remember = ref(false);
const errors = ref({});
const formError = ref("");
const showPassword = ref(false);

async function login() {
  errors.value = {};
  formError.value = "";

  if (!email.value) {
    errors.value.email = "Email is required";
  } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value)) {
    errors.value.email = "Invalid email format";
  } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password.value)) {
    errors.value.password = "Password must contain both letters and numbers";
  }

  if (!password.value) {
    errors.value.password = "Password is required";
  } else if (password.value.length < 6) {
    errors.value.password = "Password must be at least 6 characters";
  }

  if (Object.keys(errors.value).length > 0) return;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const role = userData.role;
      localStorage.setItem("currentUser", JSON.stringify({ email: user.email, role }));
      window.dispatchEvent(new CustomEvent('user-role-updated', { detail: { email: user.email, role } }));

      if (role === "admin") {
        router.push("/admin");
      }
      emit("login-success");
    } else {
      throw new Error("User document not found in Firestore");
    }
  } catch (err) {
    formError.value = "Invalid email or password";
    console.error("Login error:", err);
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
