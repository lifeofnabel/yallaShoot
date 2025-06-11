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

      </div>

      <!-- Filter & Sort -->
      <div class="filter-sort-row">
        <div class="form-group">
          <label for="filterPosition">Filter by Position:</label>
          <select id="filterPosition" v-model="selectedPosition">
            <option value="">All Positions</option>
            <option v-for="pos in positions" :key="pos.id" :value="pos.shortcut">
              {{ pos.shortcut }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="sortBy">Sort by:</label>
          <select id="sortBy" v-model="sortBy">
            <option value="nameAsc">Name A-Z</option>
            <option value="nameDesc">Name Z-A</option>
            <option value="positionAsc">Position A-Z</option>
            <option value="positionDesc">Position Z-A</option>
            <option value="avgAsc">AVG ↑</option>
            <option value="avgDesc">AVG ↓</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Spieler-Galerie -->
    <section class="section players-section" v-if="filteredAndSortedPlayers.length">
      <div class="players-grid">
        <router-link
            v-for="player in filteredAndSortedPlayers"
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
                alt="Profile"
                class="player-img"
            />
            <h3 class="player-name">
              {{ player.firstName }} {{ player.lastName }}
            </h3>
            <h4>
              {{ player.nation }}
            </h4>
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
import { ref, computed, onMounted } from 'vue'
import { db } from '../Firebase/firebaseConfig'
import { collection, getDocs } from 'firebase/firestore'

interface Player {
  id: string
  firstName: string
  lastName: string
  position: string
  nation: string
  profileImage?: string
  avgRating: number | null
}

interface Position {
  id: string
  shortcut: string
}

const players = ref<Player[]>([])
const positions = ref<Position[]>([])
const loading = ref(false)
const selectedPosition = ref('')
const sortBy = ref('nameAsc')

// Fetch Players
const fetchPlayers = async () => {
  loading.value = true
  try {
    const playerSnap = await getDocs(collection(db, 'players'))
    const loadedPlayers = playerSnap.docs.map(doc => ({
      id: doc.id,
      firstName: doc.data().firstName,
      lastName: doc.data().lastName,
      position: doc.data().position,
      nation: doc.data().nation || '🌐',
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
    await fetchPositions()
  } catch (e) {
    console.error('Error loading players:', e)
  } finally {
    loading.value = false
  }
}

// Fetch Positions
const fetchPositions = async () => {
  const posSnap = await getDocs(collection(db, 'positions'))
  positions.value = posSnap.docs.map(doc => ({
    id: doc.id,
    shortcut: doc.data().shortcut
  }))
}

// Computed Filtered & Sorted Players
const filteredAndSortedPlayers = computed(() => {
  let result = [...players.value]

  // Filter
  if (selectedPosition.value) {
    result = result.filter(player => player.position === selectedPosition.value)
  }

  // Sort
  switch (sortBy.value) {
    case 'nameAsc':
      result.sort((a, b) => a.firstName.localeCompare(b.firstName))
      break
    case 'nameDesc':
      result.sort((a, b) => b.firstName.localeCompare(a.firstName))
      break
    case 'positionAsc':
      result.sort((a, b) => a.position.localeCompare(b.position))
      break
    case 'positionDesc':
      result.sort((a, b) => b.position.localeCompare(a.position))
      break
    case 'avgAsc':
      result.sort((a, b) => (a.avgRating ?? 0) - (b.avgRating ?? 0))
      break
    case 'avgDesc':
      result.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
      break
  }

  return result
})

onMounted(fetchPlayers)
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

.filter-sort-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--gap);
  justify-content: center;
  margin-top: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.form-group select {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border-color);
  background: #f9f9f9;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px,1fr));
  gap: var(--gap);
}

.fifa-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius);
  background: rgba(255,255,255,0.7);
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
  color: #333;
  margin-bottom: 0.5rem;
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

@media (max-width: 600px) {
  .players-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px,1fr));
  }
  .controls .button-row {
    flex-direction: column;
  }
}
</style>
