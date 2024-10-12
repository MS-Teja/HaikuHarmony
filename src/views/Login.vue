<template>
    <div class="login">
      <AuthForm />
    </div>
  </template>

  <script>
  import AuthForm from '../components/AuthForm.vue';

  export default {
    components: {
      AuthForm
    }
  }
  </script>

<style scoped>
  .login{
    height: 100%;
    margin-top: 150px;
  }

  @media (max-width: 900px) {
    .login {
      margin-top: 100px;
    }
  }
</style>