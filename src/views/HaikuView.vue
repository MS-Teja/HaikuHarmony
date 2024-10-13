<template>
  <div class="haiku-view container" v-if="haiku">
    <div class="haiku-card">
      <div class="haiku-image-container">
        <img
            v-lazy="{
              src: getImageSrc(haiku.image),
              loading: '/images/loading-placeholder.webp',
              error: '/images/error-placeholder.webp'
            }"
          :alt="haiku.text"
        >
        <div class="haiku-text-overlay">
          <p v-for="(line, index) in haiku.text.split('\n')" :key="index">{{ line }}</p>
        </div>
      </div>
      <div class="haiku-footer">
          <div class="author" @click.stop="navigateToUserPage(haiku.userId)">
            <img
              v-if="haiku.photoURL"
              :src="haiku.photoURL"
              :alt="haiku.displayName"
              class="author-avatar"
              @error="handleAvatarError(haiku)"
            >
            <div v-else class="author-avatar-placeholder">{{ getInitials(haiku.displayName) }}</div>
            <span>{{ haiku.displayName || 'Anonymous' }}</span>
          </div>
          <div class="haiku-actions">
            <button class="like-btn" @click.stop="toggleLike(haiku)">
              <div class="heart-container" title="Like">
                <input
                  type="checkbox"
                  class="checkbox"
                  :id="'like-' + haiku.id"
                  :checked="haiku.liked"
                  @change="toggleLike(haiku)"
                >
                <div class="svg-container">
                    <svg viewBox="0 0 24 24" class="svg-outline" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z">
                      </path>
                    </svg>
                    <svg viewBox="0 0 24 24" class="svg-filled" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Z">
                        </path>
                    </svg>
                    <svg class="svg-celebrate" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <polygon points="10,10 20,20"></polygon>
                        <polygon points="10,50 20,50"></polygon>
                        <polygon points="20,80 30,70"></polygon>
                        <polygon points="90,10 80,20"></polygon>
                        <polygon points="90,50 80,50"></polygon>
                        <polygon points="80,80 70,70"></polygon>
                    </svg>
                </div>
              </div>
              <p> {{ haiku.likes }} </p>
            </button>
            <button class="share-btn" @click.stop="shareHaiku(haiku.id)">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#686868"><path d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z"/></svg>
            </button>
          </div>
        </div>
          <div class="tags">
            <span v-for="tag in haiku.tags" :key="tag" class="tag" @click.stop="searchByTag(tag)">{{ tag }}</span>
          </div>
      </div>
    </div>
  <div v-else class="loading">
    <div class="typing-indicator">
        <div class="typing-circle"></div>
        <div class="typing-circle"></div>
        <div class="typing-circle"></div>
        <div class="typing-shadow"></div>
        <div class="typing-shadow"></div>
        <div class="typing-shadow"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { auth, db } from '../services/firebase';
import { doc, updateDoc, increment, getDoc, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore';

export default {
  setup() {
    const route = useRoute();
    const haiku = ref(null);
    const pinataGateway = ref('');
    const imageLoadError = ref(false);
    const errorMessage = ref('');
    const isAuthenticated = ref(false);
    const router = useRouter();

    const getImageSrc = (imageHash) => {
      const url = `https://${pinataGateway.value}/ipfs/${imageHash}`;
      console.log('Constructed image URL:', url);
      return url;
    };

    const handleImageError = (event) => {
      imageLoadError.value = true;
      errorMessage.value = `Error loading image: ${event.target.src}`;
      console.error('Image load error:', event);
    };

    const fetchHaiku = async () => {
      try {
        const response = await fetch(`/.netlify/functions/fetchHaiku?id=${route.params.id}`);
        if (!response.ok) throw new Error('Failed to fetch haiku');
        const data = await response.json();

        console.log('Fetched haiku data:', data);
        console.log('Haiku object:', data.haiku);
        console.log('Pinata Gateway:', data.pinataGateway);

        haiku.value = data.haiku;
        pinataGateway.value = data.pinataGateway;

        // Log the constructed image URL
        console.log('Image URL:', getImageSrc(haiku.value.image));

        // Fetch likes
        const likesDoc = await getDoc(doc(db, 'likes', route.params.id));
        if (likesDoc.exists()) {
          const likesData = likesDoc.data();
          haiku.value.likes = likesData.count;
          haiku.value.liked = auth.currentUser && likesData.users.includes(auth.currentUser.uid);
        } else {
          haiku.value.likes = 0;
          haiku.value.liked = false;
        }
      } catch (error) {
        console.error('Error fetching haiku:', error);
        errorMessage.value = `Failed to fetch haiku: ${error.message}`;
      }
    };

    const fetchLikesForHaiku = async () => {
      const likesRef = doc(db, 'likes', haiku.value.id);
      const likesDoc = await getDoc(likesRef);
      if (likesDoc.exists()) {
        const data = likesDoc.data();
        haiku.value.likes = data.count;
        haiku.value.liked = isAuthenticated.value && data.users.includes(auth.currentUser.uid);
      }
    };

    const imageError = () => {
      imageLoadError.value = true;
    };

    const likeHaiku = async () => {
      if (!isAuthenticated.value) {
        alert('Please log in to like a haiku');
        return;
      }

      if (haiku.value.liked) return;
      try {
        const likesRef = doc(db, 'likes', haiku.value.id);
        const likesDoc = await getDoc(likesRef);

        if (likesDoc.exists()) {
          const data = likesDoc.data();
          if (data.users.includes(auth.currentUser.uid)) {
            console.log('User has already liked this haiku');
            return;
          }
          await updateDoc(likesRef, {
            count: increment(1),
            users: arrayUnion(auth.currentUser.uid)
          });
        } else {
          await setDoc(likesRef, {
            count: 1,
            users: [auth.currentUser.uid]
          });
        }

        haiku.value.likes++;
        haiku.value.liked = true;
      } catch (error) {
        console.error('Error liking haiku:', error);
        alert('Failed to like haiku. Please try again.');
      }
    };

    const shareHaiku = async () => {
      const shareUrl = window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Check out this haiku!',
            url: shareUrl,
          });
        } catch (error) {
          console.error('Error sharing haiku:', error);
          fallbackShare(shareUrl);
        }
      }
    };

    const toggleLike = async () => {
      if (!isAuthenticated.value) {
        alert('Please log in to like a haiku');
        return;
      }

      const isLiking = !haiku.value.liked;

      // Optimistic update
      haiku.value.liked = isLiking;
      haiku.value.likes += isLiking ? 1 : -1;

      try {
        const likesRef = doc(db, 'likes', haiku.value.id);
        const likesDoc = await getDoc(likesRef);

        if (likesDoc.exists()) {
          await updateDoc(likesRef, {
            count: increment(isLiking ? 1 : -1),
            users: isLiking
              ? arrayUnion(auth.currentUser.uid)
              : arrayRemove(auth.currentUser.uid)
          });
        } else if (isLiking) {
          await setDoc(likesRef, {
            count: 1,
            users: [auth.currentUser.uid]
          });
        }
      } catch (error) {
        console.error('Error updating like:', error);
        // Revert optimistic update
        haiku.value.liked = !isLiking;
        haiku.value.likes += isLiking ? -1 : 1;
        alert('Failed to update like. Please try again.');
      }
    };

    const navigateToUserPage = (userId) => {
      router.push(`/user/${userId}`);
    };

    const handleAvatarError = (haiku) => {
      haiku.photoURL = null;  // This will trigger the placeholder to show
    };

    const getInitials = (name) => {
      return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
    };

    const searchByTag = (tag) => {
      router.push({
        name: 'SearchResults',
        query: { tags: tag }
      });
    };

    onMounted(() => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        isAuthenticated.value = !!user;
        fetchHaiku();
      });
      return () => unsubscribe();
    });

    onMounted(fetchHaiku);

    watch(() => route.params.id, fetchHaiku);

    return { haiku,
      pinataGateway,
      imageLoadError,
      imageError,
      likeHaiku,
      shareHaiku,
      isAuthenticated,
      toggleLike,
      getImageSrc,
      handleImageError,
      errorMessage,
      navigateToUserPage,
      handleAvatarError,
      getInitials,
      searchByTag
     };
  }
}
</script>

<style scoped>
.haiku-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.haiku-card {
  max-width: 500px;
  width: 100%;
}
</style>