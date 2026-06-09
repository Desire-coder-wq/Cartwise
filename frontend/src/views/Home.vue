<template>
  <div class="home">
    <div class="hero">
      <div class="hero-content">
        <h1 class="bounce-in">🛒 CartWise</h1>
        <p class="tagline bounce-in" style="animation-delay: 0.1s">Your Smart Shopping Companion</p>
        <p class="description bounce-in" style="animation-delay: 0.2s">
          Organize your grocery shopping with ease. Track items, manage your budget, 
          and never forget what you need to buy again!
        </p>
        <div class="cta-buttons bounce-in" style="animation-delay: 0.3s">
          <router-link to="/register" class="btn btn-primary pulse">Get Started</router-link>
          <router-link to="/login" class="btn btn-secondary">Login</router-link>
        </div>
      </div>
      <div class="hero-image bounce-in" style="animation-delay: 0.4s">
        <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80" alt="Grocery Shopping" />
        <div class="floating-items">
          <span class="float-item" style="animation-delay: 0s">🍎</span>
          <span class="float-item" style="animation-delay: 0.5s">🥖</span>
          <span class="float-item" style="animation-delay: 1s">🥛</span>
          <span class="float-item" style="animation-delay: 1.5s">🧀</span>
          <span class="float-item" style="animation-delay: 2s">🥦</span>
        </div>
      </div>
    </div>
    
    <div class="features">
      <h2 class="bounce-in">Why Choose CartWise?</h2>
      <div class="feature-grid">
        <div class="feature-card bounce-in" style="animation-delay: 0.1s">
          <div class="feature-icon wiggle">📝</div>
          <h3>Easy to Use</h3>
          <p>Simple and intuitive interface to manage your shopping list effortlessly.</p>
        </div>
        <div class="feature-card bounce-in" style="animation-delay: 0.2s">
          <div class="feature-icon wiggle">💰</div>
          <h3>Track Budget</h3>
          <p>Keep track of your spending and stay within your budget.</p>
        </div>
        <div class="feature-card bounce-in" style="animation-delay: 0.3s">
          <div class="feature-icon wiggle">📊</div>
          <h3>Smart Categories</h3>
          <p>Organize items by categories for faster shopping.</p>
        </div>
        <div class="feature-card bounce-in" style="animation-delay: 0.4s">
          <div class="feature-icon wiggle">📱</div>
          <h3>Access Anywhere</h3>
          <p>Access your shopping list from any device, anytime.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  overflow-x: hidden;
}

.hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60px 10%;
  gap: 60px;
  min-height: 80vh;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
}

.hero-content {
  flex: 1;
  max-width: 600px;
}

.hero-content h1 {
  font-size: 3.5em;
  color: #1F2937;
  margin-bottom: 10px;
}

.tagline {
  font-size: 1.5em;
  color: #F59E0B;
  margin-bottom: 20px;
  font-weight: 600;
}

.description {
  font-size: 1.1em;
  color: #666;
  line-height: 1.6;
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  gap: 15px;
}

.btn {
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.3s, box-shadow 0.3s;
  display: inline-block;
}

.btn-primary {
  background: linear-gradient(135deg, #F59E0B 0%, #F97316 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(245, 158, 11, 0.4);
}

.btn-secondary {
  background: white;
  color: #F59E0B;
  border: 2px solid #F59E0B;
}

.btn-secondary:hover {
  background: #F59E0B;
  color: white;
}

.hero-image {
  flex: 1;
  max-width: 600px;
  position: relative;
}

.hero-image img {
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.floating-items {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.float-item {
  position: absolute;
  font-size: 2.5em;
  animation: floatBounce 3s infinite ease-in-out;
}

.float-item:nth-child(1) { top: 10%; left: 10%; }
.float-item:nth-child(2) { top: 20%; right: 15%; }
.float-item:nth-child(3) { bottom: 30%; left: 5%; }
.float-item:nth-child(4) { bottom: 20%; right: 10%; }
.float-item:nth-child(5) { top: 50%; left: 50%; }

@keyframes floatBounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.features {
  padding: 80px 10%;
  background: white;
}

.features h2 {
  text-align: center;
  font-size: 2.5em;
  color: #1F2937;
  margin-bottom: 50px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%);
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  border: 2px solid transparent;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(245, 158, 11, 0.2);
  border-color: #F59E0B;
}

.feature-icon {
  font-size: 3em;
  margin-bottom: 15px;
  display: inline-block;
}

.feature-card h3 {
  font-size: 1.5em;
  color: #1F2937;
  margin-bottom: 10px;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* Animations */
.bounce-in {
  animation: bounceIn 0.8s ease-out forwards;
  opacity: 0;
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  60% {
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.wiggle {
  animation: wiggle 2s infinite ease-in-out;
}

@keyframes wiggle {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

@media (max-width: 968px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 40px 5%;
  }
  
  .hero-content h1 {
    font-size: 2.5em;
  }
  
  .cta-buttons {
    justify-content: center;
  }
  
  .hero-image {
    max-width: 100%;
  }
  
  .floating-items {
    display: none;
  }
}
</style>
