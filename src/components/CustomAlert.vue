<template>
  <div v-if="show" class="custom-alert-overlay" @click="handleOverlayClick">
    <div class="custom-alert-modal" @click.stop>
      <div class="alert-header" :class="alertTypeClass">
        <div class="alert-icon">
          <i :class="alertIcon"></i>
        </div>
        <h4 class="alert-title">{{ title }}</h4>
      </div>
      <div class="alert-body">
        <p class="alert-message">{{ message }}</p>
        <div v-if="details" class="alert-details">
          <small class="text-muted">{{ details }}</small>
        </div>
      </div>
      <div class="alert-footer">
        <!-- 确认对话框模式 -->
        <div v-if="isConfirm" class="d-flex gap-2 justify-content-center">
          <button class="btn btn-secondary" @click="handleCancel">
            {{ cancelText }}
          </button>
          <button class="btn btn-danger" @click="handleConfirm">
            {{ confirmText }}
          </button>
        </div>
        <!-- 普通提示模式 -->
        <button v-else class="btn btn-primary" @click="closeAlert">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CustomAlert',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'success',
      validator: value => ['success', 'error', 'warning', 'info', 'confirm'].includes(value)
    },
    title: {
      type: String,
      default: 'Success'
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    confirmText: {
      type: String,
      default: 'OK'
    },
    cancelText: {
      type: String,
      default: 'Cancel'
    },
    isConfirm: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    alertTypeClass() {
      const classes = {
        success: 'alert-success',
        error: 'alert-error',
        warning: 'alert-warning',
        info: 'alert-info',
        confirm: 'alert-warning'
      };
      return classes[this.type];
    },
    alertIcon() {
      const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
        confirm: 'fas fa-exclamation-triangle'
      };
      return icons[this.type];
    }
  },
  methods: {
    closeAlert() {
      this.$emit('close');
    },
    handleConfirm() {
      this.$emit('confirm');
    },
    handleCancel() {
      this.$emit('cancel');
    },
    handleOverlayClick() {
      if (!this.isConfirm) {
        this.closeAlert();
      }
    }
  }
};
</script>

<style scoped>
.custom-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.custom-alert-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
  animation: alertSlideIn 0.3s ease-out;
}

@keyframes alertSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.alert-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
  position: relative;
}

.alert-success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
}

.alert-error {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
}

.alert-warning {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  color: #856404;
}

.alert-info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  color: #0c5460;
}

.alert-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: iconBounce 0.6s ease-out 0.2s both;
}

@keyframes iconBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.alert-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.alert-body {
  padding: 1rem 2rem;
  text-align: center;
}

.alert-message {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: #333;
  line-height: 1.5;
}

.alert-details {
  margin-top: 1rem;
}

.alert-footer {
  padding: 1rem 2rem 2rem;
  text-align: center;
}

.alert-footer .btn {
  background: linear-gradient(135deg, #CCCCCC, #a56817);
  border: none;
  color: white;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.alert-footer .btn:hover {
  background: linear-gradient(135deg, #a56817, #CCCCCC);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.alert-footer .btn-secondary {
  background: #6c757d;
  border: none;
  color: white;
  padding: 10px 25px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 100px;
}

.alert-footer .btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.alert-footer .btn-danger {
  background: linear-gradient(135deg, #dc3545, #c82333);
  border: none;
  color: white;
  padding: 10px 25px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
  min-width: 100px;
}

.alert-footer .btn-danger:hover {
  background: linear-gradient(135deg, #c82333, #dc3545);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}
</style>
