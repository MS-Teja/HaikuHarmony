<template>
  <div class="about-page">
    <router-link to="/home">
      <div class="hero-section">
        <h1 class="title">Haiku Harmony</h1>
        <p class="subtitle">Where words dance and images sing</p>
      </div>
      <div class="feature-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card" @mouseover="feature.hover = true" @mouseleave="feature.hover = false">
          <div class="feature-icon" :class="{ 'hover': feature.hover }">{{ feature.icon }}</div>
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </div>
    </router-link>

    <div class="cta-section">
      <h2>Ready to craft your masterpiece?</h2>
      <router-link to="/submit" class="cta-button">Create Your Haiku</router-link>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const features = ref([
      {
        icon: '✍️',
        title: 'Create and Share',
        description: 'Compose haikus with our intuitive interface and share them globally.',
        hover: false
      },
      {
        icon: '🎨',
        title: 'Daily Themes',
        description: 'Get inspired by our daily themes and prompts for your haiku creation.',
        hover: false
      },
      {
        icon: '❤️',
        title: 'Like and Interact',
        description: 'Engage with fellow poets by liking and sharing their haikus.',
        hover: false
      },
      {
        icon: '🏆',
        title: 'Hall of Fame',
        description: 'See the most popular haikus in our prestigious gallery.',
        hover: false
      },
      {
        icon: '🔍',
        title: 'Search and Discover',
        description: 'Explore new content easily with our powerful tag-based search.',
        hover: false
      },
      {
        icon: '👤',
        title: 'User Profiles',
        description: 'Dive into a poet\'s collection on their personalized profile page.',
        hover: false
      },
      {
        icon: '🔐',
        title: 'Secure Authentication',
        description: 'Access all features safely with our secure sign-in process.',
        hover: false
      },
      {
        icon: '📱',
        title: 'Responsive Design',
        description: 'Enjoy Haiku Harmony seamlessly across all your devices.',
        hover: false
      }
    ]);

    return { features };
  }
}
</script>

<style scoped>
.about-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: #333;
  background-color: #fff;
}

.hero-section {
  text-align: center;
  margin-bottom: 4rem;
  padding: 4rem 0;
  background: linear-gradient(45deg, #f3f3f3, #fff);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.title {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: fadeInUp 1s ease-out;
}

.subtitle {
  font-size: 1.5rem;
  color: #666;
  animation: fadeInUp 1s ease-out 0.5s both;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.feature-card {
  background-color: #f9f9f9;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
}

.feature-icon.hover {
  transform: scale(1.1);
}

.feature-card h3 {
  margin-bottom: 0.5rem;
}

.cta-section {
  text-align: center;
  margin-top: 4rem;
  padding: 4rem 0;
  background: linear-gradient(45deg, #f3f3f3, #fff);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.cta-section h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  background-color: #333;
  color: #fff;
  text-decoration: none;
  border-radius: 50px;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.cta-button:hover {
  background-color: #555;
  transform: scale(1.05);
}

a {
  text-decoration: none;
  color: #666;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 868px) {
  .feature-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 3rem;
  }

  .subtitle {
    font-size: 1.2rem;
  }

  .hero-section {
    min-height: 25vh;
  }
}

@media (min-width: 2000px) {
  .about-page{
    min-width: 80vw;
  }

  .title {
    font-size: 10rem;
  }

  .subtitle {
    font-size: 3rem;
  }

  .feature-grid{
    gap: 8rem;
    grid-template-columns: repeat(auto-fit, minmax(1000px, 1fr));
  }

  .feature-card h3 {
    font-size: 3rem;
  }

  .feature-card p {
    font-size: 2rem;
  }
}
</style>