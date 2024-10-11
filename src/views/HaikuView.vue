<template>
  <div class="haiku-view" v-if="haiku">
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
          <div class="tags">
            <span v-for="tag in haiku.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="haiku-actions">
            <button class="like-btn" @click.stop="toggleLike(haiku)">
              ❤️ {{ haiku.likes }}
            </button>
            <button class="share-btn" @click.stop="shareHaiku(haiku.id)">🔗</button>
          </div>
        </div>
      </div>
    </div>
  <div v-else>Loading...</div>
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
      } else {
        fallbackShare(shareUrl);
      }
    };

    const fallbackShare = async (url) => {
      try {
        await navigator.clipboard.writeText(url);
        alert('Haiku link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Failed to copy link. Please try again.');
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
      getInitials
     };
  }
}
</script>

<style scoped>
.haiku-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.haiku-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.haiku-image-container {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 Aspect Ratio */
}

.haiku-image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.haiku-text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px;
}

.haiku-text-overlay p {
  margin: 5px 0;
  font-size: 18px;
  font-weight: bold;
}

.haiku-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.author {
  font-size: 0.9em;
  color: #666;
}

.haiku-actions button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #e8eaed;
  margin-left: 10px;
}

.like-btn.liked {
  color: #ff4081;
}

.like-btn svg, .share-btn svg {
  margin-right: 5px;
}

.image-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
}
</style>