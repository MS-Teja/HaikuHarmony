<template>
  <div class="submit">
    <HaikuForm v-if="isAuthenticated" />
    <div v-else class="login">
      <p>Please log in to submit a haiku.</p>
      <router-link to="/login">Log In</router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import HaikuForm from '../components/HaikuForm.vue';
import { auth } from '../services/firebase';

export default {
  components: {
    HaikuForm
  },
  setup() {
    const isAuthenticated = ref(false);

    onMounted(() => {
      auth.onAuthStateChanged(user => {
        isAuthenticated.value = !!user;
      });
    });

    return { isAuthenticated };
  }
}
</script>

<style scoped>
  .login{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin-top: 40px;
  }
</style>