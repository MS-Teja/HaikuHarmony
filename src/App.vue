<template>
  <div id="app" @click="handleOutsideClick">
    <nav class="navbar">
      <div class="navbar-left">
        <router-link to="/" class="nav-logo">Haiku Harmony</router-link>
      </div>
      <div class="navbar-center" :class="{ 'search-active': isSearchActive }">
        <form @submit.prevent="performSearch" class="search-form group">
          <svg viewBox="0 0 24 24" aria-hidden="true" class="form-search-icon">
            <g>
              <path
                d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"
              ></path>
            </g>
          </svg>
          <input
            v-model="searchQuery"
            class="search-input"
            type="search"
            placeholder="Search Haikus..."
            name="searchbar"
            @keydown.esc="closeSearch"
          />
        </form>
      </div>
      <div class="navbar-right">
        <div class="desktop-menu">
          <router-link to="/hall-of-fame" class="nav-link">Hall Of Fame</router-link>
          <router-link to="/submit" class="nav-link">Create a Haiku</router-link>
          <router-link to="/about" class="nav-link">About</router-link>
        </div>
        <div class="search-icon" @click.stop="toggleSearch">
          <span class="material-symbols-outlined">
            search
          </span>
        </div>
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
        <label class="burger" for="burger">
          <input type="checkbox" id="burger" v-model="isBurgerActive">
          <span></span>
          <span></span>
          <span></span>
        </label>
      </div>
    </nav>
    <div class="mobile-menu" :class="{ 'active': isBurgerActive }" @click.stop>
      <router-link to="/hall-of-fame" class="nav-link mobile-menu-options" @click="closeBurgerMenu">Hall Of Fame</router-link>
      <router-link to="/submit" class="nav-link mobile-menu-options" @click="closeBurgerMenu">Create a Haiku</router-link>
      <router-link to="/about" class="nav-link mobile-menu-options" @click="closeBurgerMenu">About</router-link>
    </div>
    <div class="overlay" :class="{ 'active': isBurgerActive }" @click="closeBurgerMenu"></div>
    <router-view></router-view>
  </div>
</template>

<script>
import { ref,onMounted, onUnmounted } from 'vue';
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
    const isSearchActive = ref(false);
    const isBurgerActive = ref(false);

    const performSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({ name: 'SearchResults', query: { tags: searchQuery.value } });
        closeSearch();
      }
    };

    const toggleSearch = () => {
      isSearchActive.value = !isSearchActive.value;
      if (isSearchActive.value) {
        setTimeout(() => document.querySelector('.search-input').focus(), 100);
      }
    };

    const closeSearch = () => {
      isSearchActive.value = false;
      searchQuery.value = '';
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

    const toggleBurgerMenu = () => {
      isBurgerActive.value = !isBurgerActive.value;
    };

    const closeBurgerMenu = () => {
      isBurgerActive.value = false;
    };

    const handleOutsideClick = (event) => {
      if (isBurgerActive.value && !event.target.closest('.mobile-menu') && !event.target.closest('.burger')) {
        closeBurgerMenu();
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
      performSearch,
      isSearchActive,
      toggleSearch,
      closeSearch,
      isBurgerActive,
      toggleBurgerMenu,
      closeBurgerMenu,
      handleOutsideClick
    };
  }
}
</script>

<style scoped>
.navbar {
  font-family: "Dancing Script", cursive;
  font-optical-sizing: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: relative;
}

.navbar-left, .navbar-right {
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

.search-icon {
  display: none;
  cursor: pointer;
  margin-top: 5px;
}

.burger {
  position: relative;
  width: 30px;
  height: 22.5px;
  background: transparent;
  cursor: pointer;
  display: none;
  z-index: 1001;
}

.burger::after {
  content: '';
  position: absolute;
  top: 100%; /* Position it right at the bottom of the burger */
  left: 0;
  right: 0;
  height: 5px; /* Extend 5px below */
  cursor: pointer;
}

.burger-wrapper {
  position: relative;
  display: inline-block;
}

.burger input {
  display: none;
}

.burger span {
  display: block;
  position: absolute;
  height: 4px;
  width: 100%;
  background: rgb(34, 34, 34);
  border-radius: 9px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: .25s ease-in-out;
}

.burger span:nth-of-type(1) {
  top: 0px;
  transform-origin: left center;
}

.burger span:nth-of-type(2) {
  top: 50%;
  transform: translateY(-50%);
  transform-origin: left center;
}

.burger span:nth-of-type(3) {
  top: 100%;
  transform-origin: left center;
  transform: translateY(-100%);
}

.burger input:checked ~ span:nth-of-type(1) {
  transform: rotate(45deg);
  top: 6px;
  left: 5px;
}

.burger input:checked ~ span:nth-of-type(2) {
  width: 0%;
  opacity: 0;
}

.burger input:checked ~ span:nth-of-type(3) {
  transform: rotate(-45deg);
  top: 28px;
  left: 5px;
}


.mobile-menu {
  display: none;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
  z-index: 998;
}

.overlay.active {
  opacity: 1;
  visibility: visible;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.group {
  display: flex;
  line-height: 28px;
  align-items: center;
  position: relative;
  width: 300px;
  margin-left: 200px;
}

.search-input {
  font-family: "cormorant", "Montserrat", sans-serif;
  width: 100%;
  height: 35px;
  padding-left: 2.5rem;
  padding-top:1.5px;
  padding-bottom:1px;
  box-shadow: 0 0 0 1.5px #2b2c37, 0 0 25px -17px #000;
  border: 0;
  border-radius: 12px;
  background-color: white;
  outline: none;
  color: #bdbecb;
  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);
  cursor: text;
  z-index: 0;
}

.search-input::placeholder {
  color: #000000;
}

.search-input:hover {
  box-shadow: 0 0 0 2.5px #2f303d, 0px 0px 25px -15px #000;
}

.search-input:active {
  transform: scale(0.95);
}

.search-input:focus {
  box-shadow: 0 0 0 2.5px #2f303d;
}

.form-search-icon {
  position: absolute;
  left: 1rem;
  fill: #000000;
  width: 1rem;
  height: 1rem;
  pointer-events: none;
  z-index: 1;
}

@media (max-width: 1259px){
  .group {
    margin-left: 150;
  }
}

@media (max-width: 1145px) {
  .group {
    margin-left: 100px;
  }
}

@media (max-width: 1029px) {
  .group {
    margin-left: 50px;
  }
}

@media (max-width: 981px) {
  .group {
    margin-left: 50px;
  }

  .search-input {
    width: 80%;
  }

  .navbar-center{
    width: 300px;
  }
}

@media (max-width: 931px) {
  .navbar-center{
    width: 250px;
  }
}

@media (max-width: 882px) {
  .navbar-center{
    width: 200px;
  }
}

@media (max-width: 846px) {
  .group {
    margin-left: 0px;
  }

  .search-input {
    width: 100%;
  }

  .navbar-center{
    width: 80%;
    align-self: center;
    transform: translateX(8%)
  }

  .navbar {
    padding: 1rem;
  }

  .desktop-menu {
    display: none;
  }

  .burger {
    display: block;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    right: -290px;
    width: 250px;
    height: 100vh;
    background-color: #ffffff;
    transition: right 0.3s ease-in-out;
    z-index: 1000;
  }

  .mobile-menu.active {
    right: 0;
  }

  .mobile-menu .burger.close {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .mobile-menu-options {
    margin-right: 0;
    margin-left: 0;
    padding-left: 20px;
    padding-top: 15px;
    padding-bottom: 15px;
    border-radius: 8px;
  }

  .mobile-menu-options:hover {
    background-color: #e7e7e7;
  }

  .mobile-menu-options:first-child {
    margin-top: 100px;
  }

  .navbar-center {
    display: none;
  }

  .navbar-center.search-active {
    display: flex;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 1rem;
  }

  .search-form {
    width: 100%;
  }

  .search-input {
    width: 100%;
    margin-right: 0;
  }

  .search-button {
    display: none;
  }

  .search-icon {
    display: block;
    padding-bottom: 2px;
  }

  .account-profile {
    margin: 0 0.5rem;
  }
}
@media (max-width: 400px) {
    .account-profile {
      margin: 0;
  }
}
</style>