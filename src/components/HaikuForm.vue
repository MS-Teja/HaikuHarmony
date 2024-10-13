<template>
  <div class="haiku-container">
    <div class="haiku-form">
      <h2>俳句を作る<span>Create a Haiku</span></h2>
      <form @submit.prevent="submitHaiku">
        <div class="input-group">
          <input v-model="line1" placeholder="First line (5 syllables)" required>
          <input v-model="line2" placeholder="Second line (7 syllables)" required>
          <input v-model="line3" placeholder="Third line (5 syllables)" required>
        </div>
        <select v-model="selectedImageId" required>
          <option value="" disabled>Select a background</option>
          <option value="1">Subtle Mist Over Rolling Hills</option>
          <option value="2">Faint Watercolor Sky with Light Clouds</option>
          <option value="3">Soft Reflection on a Quiet Lake</option>
          <option value="4">Abstract Bamboo Shadows on a Pale Wall</option>
          <option value="5">Bare Branches Against a Faded Winter Sky</option>
          <option value="6">Light Fog Over Distant Mountains</option>
          <option value="7">Subtle Blossom Petals in the Breeze</option>
          <option value="8">Soft Rain Falling Over a Quiet Garden</option>
        </select>
        <input v-model="tags" placeholder="Tags (comma-separated)" required>
        <button type="submit" :disabled="!isFormValid || isSubmitting">
          {{ isSubmitting ? 'Submitting...' : 'Submit' }}
        </button>
      </form>
      <p v-if="message" :class="{ 'success': isSuccess, 'error': !isSuccess }">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useUserStore } from '../stores/user';

export default {
  setup() {
    const line1 = ref('');
    const line2 = ref('');
    const line3 = ref('');
    const selectedImageId = ref('');
    const tags = ref('');
    const message = ref('');
    const isSuccess = ref(false);
    const isSubmitting = ref(false);
    const userStore = useUserStore();

    const isFormValid = computed(() => {
      return line1.value.trim() && line2.value.trim() && line3.value.trim() && selectedImageId.value && tags.value.trim();
    });

    const submitHaiku = async () => {
      if (isSubmitting.value) return;

      isSubmitting.value = true;
      message.value = '';

      try {
        const haikuText = `${line1.value}\n${line2.value}\n${line3.value}`;
        const response = await fetch('/.netlify/functions/uploadToPinata', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: haikuText,
            selectedImage: selectedImageId.value,
            userId: userStore.user.uid,
            displayName: userStore.user.displayName,
            photoURL: userStore.user.photoURL,
            tags: tags.value.split(',').map(tag => tag.trim())
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to submit haiku');
        }

        const result = await response.json();
        console.log('Haiku submitted successfully:', result);

        // Reset form
        line1.value = '';
        line2.value = '';
        line3.value = '';
        selectedImageId.value = '';
        tags.value = '';

        message.value = 'Haiku submitted successfully!';
        isSuccess.value = true;

      } catch (error) {
        console.error('Error submitting haiku:', error);
        message.value = 'Failed to submit haiku. Please try again.';
        isSuccess.value = false;
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      line1, line2, line3, selectedImageId, tags, submitHaiku, isFormValid, message, isSuccess, isSubmitting
    };
  }
}
</script>

<style scoped>
.haiku-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  background: linear-gradient(135deg, #e6e6e6, #f0f0f0, #ffffff);
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

.haiku-form {
  width: 90%;
  max-width: 400px;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
}

h2 {
  font-weight: 300;
  font-size: 1.8rem;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  color: #333;
}

h2 span {
  display: block;
  font-size: 1rem;
  margin-top: 0.5rem;
  color: #666;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-bottom: 1px solid #ddd;
  background-color: transparent;
  transition: border-color 0.3s ease;
  color: #292929;
  transform: translate(-3%);
  font-size: 0.8rem;
}

input:focus, select:focus {
  outline: none;
  border-color: #333;
}

button {
  padding: 0.75rem;
  background-color: #333;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #444;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success, .error {
  text-align: center;
  margin-top: 1rem;
  padding: 0.5rem;
}

.success {
  color: #2e7d32;
}

.error {
  color: #c62828;
}

@media (max-width: 480px) {
  .haiku-form {
    padding: 1.5rem;
  }
}
</style>