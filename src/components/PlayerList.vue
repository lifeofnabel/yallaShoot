<template>
  <div class="player-list-page">
    <!-- Steuerungs-Sektion -->
    <section class="section controls">
      <div class="button-row">
        <button @click="fetchPlayers" :disabled="loading">
          {{ loading ? 'Loading...' : 'Load Players' }}
        </button>
        <router-link to="/add-player">
          <button class="btn-secondary">
            Add Player
          </button>
        </router-link>
        <router-link to="/rate" class="btn-secondary" :class="{ disabled: loading }">
          <button :disabled="loading">
            Ratings
          </button>
        </router-link>
      </div>
    </section>

    <!-- Spieler-Galerie -->
    <section class="section players-section" v-if="players.length">
      <div class="players-grid">
        <router-link
            v-for="player in players"
            :key="player.id"
            :to="`/player/${player.id}`"
            class="player-card fifa-card"
        >
          <div class="card-header">
            <span class="card-position">{{ player.position }}</span>
          </div>
          <div class="card-body">
            <img
                :src="player.profileImage || '/placeholder.png'"
                alt="Profilbild"
                class="player-img"
            />
            <h3 class="player-name">{{ player.firstName }} {{ player.lastName }}</h3>
          </div>
          <div class="card-footer">
            <span class="player-rating">
              AVG: {{ player.avgRating !== null ? player.avgRating.toFixed(1) : '—' }}
            </span>
          </div>
        </router-link>
      </div>
    </section>

    <!-- Kein Spieler -->
    <section class="section empty" v-else-if="!loading">
      <p class="no-players">No Player Found! Click on „Load Players“.</p>
    </section>

    <!-- Footer -->
    <section class="section footer">
      <router-link to="/admin" class="admin-link">
        Admin Login
      </router-link>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from '../Firebase/firebaseConfig'
import { collection, getDocs } from 'firebase/firestore'

interface Player {
  id: string
  firstName: string
  lastName: string
  position: string
  profileImage?: string
  avgRating: number | null
}

const players = ref<Player[]>([])
const loading = ref(false)

const fetchPlayers = async () => {
  loading.value = true
  try {
    const playerSnap = await getDocs(collection(db, 'players'))
    const loadedPlayers = playerSnap.docs.map(doc => ({
      id: doc.id,
      firstName: doc.data().firstName,
      lastName: doc.data().lastName,
      position: doc.data().position,
      profileImage: doc.data().profileImage || '',
      avgRating: null
    })) as Player[]

    const ratingsSnap = await getDocs(collection(db, 'ratings'))
    const ratingsData = ratingsSnap.docs.map(doc => doc.data())

    for (const player of loadedPlayers) {
      const playerRatings = ratingsData.filter(r => r.toPlayerId === player.id && typeof r.rating === 'number')
      if (playerRatings.length > 0) {
        const total = playerRatings.reduce((sum, r) => sum + r.rating, 0)
        player.avgRating = total / playerRatings.length
      } else {
        player.avgRating = null
      }
    }

    players.value = loadedPlayers
  } catch (e) {
    console.error('Error loading players:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:root {
  --font: 'Poppins', sans-serif;
  --bg-page: #e2e8f0;
  --panel-bg: #ffffff;
  --border-color: #cbd5e0;
  --primary: #00b894;
  --primary-hover: #019374;
  --secondary: #6c5ce7;
  --secondary-hover: #5a4ac2;
  --hover: #496fe1;
  --shadow: rgba(0,0,0,0.1);
  --radius: 1rem;
  --gap: 1.5rem;
}

.player-list-page {
  padding: 2rem 1rem;
  background: var(--bg-page);
  min-height: 100vh;
  font-family: var(--font);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.section {
  background: var(--panel-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: var(--gap);
  box-shadow: 0 4px 12px var(--shadow);
}

.controls .button-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  justify-content: center;
}
.controls button {
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
}
.controls button:hover:not(:disabled) {
  background: var(--hover);
  transform: translateY(-2px);
}
.controls button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px,1fr));
  gap: var(--gap);
}

.empty .no-players {
  text-align: center;
  color: #718096;
  font-size: 1rem;
}

.footer {
  text-align: center;
}
.admin-link {
  display: inline-block;
  margin-top: 1rem;
  color: #718096;
  text-decoration: none;
  font-size: 0.9rem;
}
.admin-link:hover {
  color: #5a83f7;
}

.fifa-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius);
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(8px);
  transition: transform 0.3s, box-shadow 0.3s;
}
.fifa-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px var(--shadow);
}

.card-header {
  background: #75b9ff;
  padding: 0.5rem;
  text-align: center;
}
.card-position {
  font-weight: 700;
  color: #2e2e2e;
}

.card-body {
  flex-grow: 1;
  padding: 1rem;
  text-align: center;
}
.player-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 1rem;
  border: 3px solid #e5c07b;
}
.player-name {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.player-role {
  color: #4a5568;
  margin-bottom: 0.75rem;
}

.card-footer {
  background: #f7fafc;
  padding: 0.75rem;
  text-align: center;
}
.player-rating {
  font-weight: 700;
  color: var(--primary);
}

@media (max-width: 600px) {
  .players-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px,1fr));
  }
  .controls .button-row {
    flex-direction: column;
  }
  .controls .btn-secondary:hover:not(:disabled) {
    background: var(--secondary-hover);
    transform: translateY(-2px);
  }
}
</style>
