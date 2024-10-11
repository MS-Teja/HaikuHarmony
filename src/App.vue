<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-left">
        <router-link to="/" class="nav-logo">Haiku Harmony</router-link>
      </div>
      <div class="navbar-center">
        <form @submit.prevent="performSearch" class="search-form">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search tags..."
            class="search-input"
          >
          <button type="submit" class="search-button">Search</button>
        </form>
      </div>
      <div class="navbar-right">
        <router-link to="/hall-of-fame" class="nav-link">Hall Of Fame</router-link>
        <router-link to="/submit" class="nav-link">Create a Haiku</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
        <div class="account-profile">
          <template v-if="user">
            <div class="account-dropdown" ref="dropdownRef">
              <div @click.stop="toggleDropdown">
                <ProfileImage v-if="user.photoURL" :src="user.photoURL" />
                <span v-else class="account-icon">👤</span>
              </div>
              <div v-if="showDropdown" class="dropdown-content">
                <a @click="navigateToUserPage">{{ user.displayName || user.email }}</a>
                <a href="#" @click.prevent="logout">Logout</a>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link">Sign In</router-link>
          </template>
        </div>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { auth } from './services/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';
import ProfileImage from './components/ProfileImage.vue';

export default {
  components: {
    ProfileImage
  },
  setup() {
    const router = useRouter();
    const user = ref(null);
    const showDropdown = ref(false);
    const dropdownRef = ref(null);
    const searchQuery = ref('');

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ name: 'SearchResults', query: { tags: searchQuery.value } });
      }
    };

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    const closeDropdown = (event) => {
      if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        showDropdown.value = false;
      }
    };

    const navigateToUserPage = () => {
      if (user.value) {
        router.push(`/user/${user.value.uid}`);
        showDropdown.value = false;
      }
    };

    const logout = async () => {
      try {
        await signOut(auth);
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    onMounted(() => {
      auth.onAuthStateChanged((currentUser) => {
        user.value = currentUser;
      });
      document.addEventListener('click', closeDropdown);
    });

    onUnmounted(() => {
      document.removeEventListener('click', closeDropdown);
    });

    return {
      user,
      showDropdown,
      dropdownRef,
      toggleDropdown,
      navigateToUserPage,
      logout,
      searchQuery,
      performSearch
    };
  }
}
</script>

<style scoped>
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.navbar {
  font-family: "Dancing Script", cursive;
  font-optical-sizing: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
}

.navbar-left, .navbar-right, .account-profile {
  display: flex;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-link {
  margin: 0 1rem;
  color: #333;
  text-decoration: none;
}

.account-dropdown {
  position: relative;
  cursor: pointer;
}

.account-icon {
  font-size: 1.5rem;
}

.dropdown-content {
  position: absolute;
  right: 0;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  padding: 0.5rem;
}

.dropdown-content span {
  display: block;
  padding: 0.5rem 0;
}

.dropdown-content a {
  color: #333;
  text-decoration: none;
  display: block;
  padding: 0.5rem 0;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}

.navbar-center {
  display: flex;
  align-items: center;
}

.search-form {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 0.5rem;
  margin-right: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-button {
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>