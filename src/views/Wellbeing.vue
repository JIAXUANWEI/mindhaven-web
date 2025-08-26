<template>
  <div class="container my-5">
    <h2>Self Assessment</h2>
    <form @submit.prevent="submitForm" novalidate>
      <div class="mb-3">
        <label for="name" class="form-label">Name *</label>
        <input v-model="form.name" type="text" class="form-control" id="name" required>
        <div v-if="errors.name" class="text-danger">{{ errors.name }}</div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email *</label>
        <input v-model="form.email" type="email" class="form-control" id="email" required>
        <div v-if="errors.email" class="text-danger">{{ errors.email }}</div>
      </div>

      <div class="mb-3">
        <label for="mood" class="form-label">How are you feeling today?</label>
        <select v-model="form.mood" class="form-select">
          <option disabled value="">Please choose...</option>
          <option>😊 Happy</option>
          <option>😐 Neutral</option>
          <option>😔 Sad</option>
        </select>
      </div>

      <button type="submit" class="btn btn-success">Submit</button>
    </form>
  </div>
</template>

<script>
export default {
  name: "WellbeingView",
  data() {
    return {
      form: { name: "", email: "", mood: "" },
      errors: {}
    }
  },
  methods: {
    submitForm() {
      this.errors = {}

      if (!this.form.name) {
        this.errors.name = "Name is required"
      }
      if (!this.form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.form.email)) {
        this.errors.email = "Valid email is required"
      }

      if (Object.keys(this.errors).length === 0) {
        alert("Form submitted successfully!")
        localStorage.setItem("userForm", JSON.stringify(this.form))
      }
    }
  }
}
</script>
