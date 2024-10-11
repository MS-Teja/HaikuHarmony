<template>
  <div class="search-results">
    <h1>Search Results for: {{ searchTags.join(', ') }}</h1>
    <div v-if="loading" class="loading">Searching haikus...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="haikus.length === 0" class="no-results">No haikus found matching your search.</div>
    <div v-else class="haiku-grid">
      <div v-for="haiku in haikus" :key="haiku.id" class="haiku-card">
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
            <img :src="haiku.photoURL" :alt="haiku.displayName" class="author-avatar">
            <span>{{ haiku.displayName || 'Anonymous' }}</span>
          </div>
          <div class="tags">
            <span v-for="tag in haiku.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="haiku-actions">
            <button class="like-btn" @click.stop="toggleLike(haiku)" :disabled="!isAuthenticated">
              ❤️ {{ haiku.likes }}
            </button>
            <button class="share-btn" @click.stop="shareHaiku(haiku.id)">🔗</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { auth, db } from '../services/firebase';
  import { doc, updateDoc, increment, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore'

  export default {
    setup() {
      const route = useRoute();
      const router = useRouter();
      const haikus = ref([]);
      const pinataGateway = ref('');
      const loading = ref(true);
      const error = ref(null);
      const searchTags = ref([]);
      const isAuthenticated = ref(false);

      const getImageSrc = (imageHash) => {
        return `https://${pinataGateway.value}/ipfs/${imageHash}`;
      };

      const fetchSearchResults = async () => {
        loading.value = true;
        error.value = null;
        const tags = route.query.tags;
        if (!tags) {
          error.value = "No search tags provided";
          loading.value = false;
          return;
        }
        searchTags.value = tags.split(',').map(tag => tag.trim());

        try {
          const response = await fetch(`/.netlify/functions/searchHaikus?tags=${tags}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          haikus.value = data.haikus.map(haiku => ({
            ...haiku,
            likes: 0,
            liked: false,
            imageError: false,
            authorImageError: false
          }));
          pinataGateway.value = data.pinataGateway;

        // Fetch likes for each haiku
        await Promise.all(haikus.value.map(fetchLikesForHaiku));
        } catch (err) {
          console.error("Error fetching search results:", err);
          error.value = `Failed to load search results: ${err.message}. Please try again.`;
        } finally {
          loading.value = false;
        }
      };

      const fetchLikesForHaiku = async (haiku) => {
        const likesRef = doc(db, 'likes', haiku.id);
        const likesDoc = await getDoc(likesRef);
        if (likesDoc.exists()) {
          const data = likesDoc.data();
          haiku.likes = data.count;
          haiku.liked = isAuthenticated.value && data.users.includes(auth.currentUser.uid);
        }
      };

      const imageError = (id) => {
        const haiku = haikus.value.find(h => h.id === id);
        if (haiku) {
          haiku.imageError = true;
        }
      };

    const authorImageError = (id) => {
      const haiku = haikus.value.find(h => h.id === id);
      if (haiku) {
        haiku.authorImageError = true;
      }
    };

      const likeHaiku = async (id) => {
      if (!isAuthenticated.value) {
        alert('Please log in to like a haiku');
        return;
      }

      try {
        const likesRef = doc(db, 'likes', id);
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

        const haiku = haikus.value.find(h => h.id === id);
        if (haiku) {
          haiku.likes++;
          haiku.liked = true;
        }
      } catch (error) {
        console.error('Error liking haiku:', error);
        alert('Failed to like haiku. Please try again.');
      }
    };

      const navigateToHaiku = (haikuId) => {
        router.push(`/haiku/${haikuId}`);
        };

      const shareHaiku = async (haikuId) => {
        const shareUrl = `${window.location.origin}/haiku/${haikuId}`;

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

      const toggleLike = async (haiku) => {
        if (!isAuthenticated.value) {
          alert('Please log in to like a haiku');
          return;
        }

        const isLiking = !haiku.liked;

        // Optimistic update
        haiku.liked = isLiking;
        haiku.likes += isLiking ? 1 : -1;

        try {
          const likesRef = doc(db, 'likes', haiku.id);
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
          haiku.liked = !isLiking;
          haiku.likes += isLiking ? -1 : 1;
          alert('Failed to update like. Please try again.');
        }
      };

      const navigateToUserPage = (userId) => {
        router.push(`/user/${userId}`);
      };


      onMounted(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          isAuthenticated.value = !!user;
          fetchSearchResults();
        });
        return () => unsubscribe();
      });

      watch(() => route.query.tags, fetchSearchResults);

      return {
        haikus,
        pinataGateway,
        loading,
        error,
        searchTags,
        getImageSrc,
        imageError,
        authorImageError,
        likeHaiku,
        shareHaiku,
        isAuthenticated,
        toggleLike,
        navigateToHaiku,
        navigateToUserPage
      };
    }
  }
</script>

<style scoped>
.author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}
.tag {
  background-color: #f0f0f0;
  padding: 2px 5px;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 0.8em;
}

.author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}
.tag {
  background-color: #f0f0f0;
  padding: 2px 5px;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 0.8em;
}

.like-btn.liked {
  color: #ff4081;
}

.like-btn, .share-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #e8eaed;
}

.like-btn svg, .share-btn svg {
  margin-right: 5px;
}

.search-results {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 10px;
}

.theme {
  font-size: 1.2em;
  text-align: center;
  margin-bottom: 30px;
}

.haiku-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.haiku-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
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
  /* object-fit: cover; */
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
  font-size: 1.2em;
  margin-left: 10px;
}

.loading, .error {
  text-align: center;
  margin-top: 50px;
  font-size: 1.2em;
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