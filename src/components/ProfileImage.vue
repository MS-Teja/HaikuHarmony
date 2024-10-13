<template>
    <img
      :src="imageSrc"
      @error="handleImageError"
      :alt="altText"
      class="profile-image"
    >
  </template>

  <script setup>
  import { ref } from 'vue';

  const props = defineProps({
    src: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      default: 'User profile'
    }
  });

  const imageSrc = ref(props.src);
</script>

  <style scoped>
  .profile-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  @media (max-width:900px) {
    .profile-image {
        width: 30px;
        height: 30px;
        margin: 5px;
        margin-left: 8px;
        margin-right: 10px;
    }
  }
  </style>