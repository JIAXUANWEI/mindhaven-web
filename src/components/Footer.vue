<template>
  <footer class="modern-footer">
    <div class="container">
      <div class="row align-items-center py-5">
        <!-- 左侧联系信息 -->
        <div class="col-lg-6">
          <div class="contact-section">
            <h5 class="footer-title mb-4">Get in Touch</h5>
            <div class="contact-info">
              <div class="contact-item mb-3">
                <i class="bi bi-envelope-fill me-3"></i>
                <a href="mailto:jwei0062@student.monash.edu" class="contact-link">jwei0062@student.monash.edu</a>
              </div>
              <div class="social-links mt-4">
                <a href="https://facebook.com/mindhaven" class="social-link me-4" target="_blank">
                  <i class="iconfont icon-facebook"></i>
                  <span class="ms-2">Facebook</span>
                </a>
                <a href="https://instagram.com/mindhaven" class="social-link" target="_blank">
                  <i class="iconfont icon-instagram-fill"></i>
                  <span class="ms-2">Instagram</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧Logo -->
        <div class="col-lg-6 text-lg-end">
          <div class="logo-section">
            <div class="brand-logo">
              <h1 class="logo-text">MindHaven</h1>
              <p class="logo-tagline">Your Journey to Mental Wellness</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="row align-items-center">
          <div class="col-md-6 text-md-start">
            <p class="copyright-text mb-0">&copy; 2024 MindHaven. All rights reserved.</p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="footer-nav">
              <p class="copyright-text mb-0">Privacy Policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.modern-footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: #ecf0f1;
  position: relative;
  overflow: hidden;
}

.modern-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}

.footer-title {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  margin-left: -25rem;
}

.contact-item {
  display: flex;
  align-items: center;
  font-size: 1rem;
}

.contact-item i {
  color: #3498db;
  font-size: 1.2rem;
}

.contact-link {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-link:hover {
  color: #3498db;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  color: #bdc3c7;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.social-link:hover {
  color: #3498db;
  transform: translateY(-2px);
}

.social-link i {
  font-size: 1.3rem;
}

.logo-section {
  text-align: center;
}

.brand-logo {
  display: inline-block;
}

.logo-text {
  font-family: 'Pacifico', cursive, 'Comic Sans MS', 'Arial', sans-serif;
  font-size: 3rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 10px rgba(0,0,0,0.3);
  letter-spacing: 2px;
}

.logo-tagline {
  font-size: 1rem;
  color: #95a5a6;
  font-style: italic;
  margin-bottom: 0;
  letter-spacing: 1px;
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 1rem;
  margin-top: 1rem;
}

.copyright-text {
  color: #95a5a6;
  font-size: 0.9rem;
}

.footer-nav-link {
  color: #95a5a6;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-nav-link:hover {
  color: #3498db;
}


</style>
