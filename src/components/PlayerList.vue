<!-- PlayerListPage.vue -->
<template>
  <div class="player-list-page">
    <div class="background-overlay"></div>
    <!-- Controls: Laden, Filter, Sort -->
    <section class="controls">
      <div class="button-row">
        <button class="btn btn-primary" @click="fetchPlayers" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Lädt...' : 'Spieler laden' }}
        </button>
        <router-link to="/add-player">
          <button class="btn btn-secondary">+ Spieler hinzufügen</button>
        </router-link>
      </div>
      <div class="filter-sort-row">
        <div class="filter-group">
          <label for="filterPosition">Position</label>
          <select id="filterPosition" v-model="selectedPosition">
            <option value="">Alle Positionen</option>
            <option v-for="pos in positions" :key="pos.id" :value="pos.shortcut">
              {{ pos.shortcut }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="sortBy">Sortieren</label>
          <select id="sortBy" v-model="sortBy">
            <option value="nameAsc">Name A→Z</option>
            <option value="nameDesc">Name Z→A</option>
            <option value="positionAsc">Position A→Z</option>
            <option value="positionDesc">Position Z→A</option>
            <option value="avgAsc">Rating ↑</option>
            <option value="avgDesc">Rating ↓</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Spieler-Karten -->
    <section class="players-section">
      <div v-if="filteredAndSortedPlayers.length" class="players-grid">
        <div
            v-for="player in filteredAndSortedPlayers"
            :key="player.id"
            class="card-wrapper"
        >
          <router-link :to="`/player/${player.id}`" class="fut-player-card">
            <!-- Card Top -->
            <div class="player-card-top">
              <div class="player-master-info">
                <!-- Rating -->
                <span class="player-rating">
                  {{ player.avgRating !== null ? Math.round(player.avgRating) : 5 }}
                </span>
                <!-- Position -->
                <span class="player-position">
                  {{ player.position || '—' }}
                </span>
                <!-- Flagge -->
                <span class="player-nation-emoji">
                  {{ nationEmoji(player.nation) }}
                </span>
              </div>
              <!-- Bild -->
              <div class="player-picture">
                <img
                    :src="player.profileImage || defaultProfileImage"
                    :alt="player.firstName || 'Spieler'"
                />
              </div>
            </div>
            <!-- Card Bottom -->
            <div class="player-card-bottom">
              <div class="player-info">
                <!-- Name -->
                <div class="player-name">{{ fullName(player) }}</div>
                <!-- Features DRI, PAC, PAS, SHO nebeneinander -->
                <div class="player-features">
                  <div class="feature-item">
                    <span class="player-feature-value">
                      {{ player.DRI ?? 5 }}
                    </span>
                    <span class="player-feature-title">DRI</span>
                  </div>
                  <div class="feature-item">
                    <span class="player-feature-value">
                      {{ player.PAC ?? 5 }}
                    </span>
                    <span class="player-feature-title">PAC</span>
                  </div>
                  <div class="feature-item">
                    <span class="player-feature-value">
                      {{ player.PAS ?? 5 }}
                    </span>
                    <span class="player-feature-title">PAS</span>
                  </div>
                  <div class="feature-item">
                    <span class="player-feature-value">
                      {{ player.SHO ?? 5 }}
                    </span>
                    <span class="player-feature-title">SHO</span>
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      <div v-else class="empty">
        <p class="no-players">Keine Spieler gefunden. Klicke auf ‚Spieler laden‘.</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { db } from '../Firebase/firebaseConfig'
import { collection, getDocs } from 'firebase/firestore'

// Interfaces
interface Player {
  id: string
  firstName: string
  lastName: string
  position: string
  nation?: string
  profileImage?: string
  avgRating: number | null
  PAC?: number
  SHO?: number
  PAS?: number
  DRI?: number
  def?: number
  phy?: number
  skillMoves?: string
  weakFoot?: string
}
interface Position {
  id: string
  shortcut: string
}

// Reactive State
const players = ref<Player[]>([])
const positions = ref<Position[]>([])
const loading = ref(false)
const selectedPosition = ref<string>('')
const sortBy = ref<string>('nameAsc')
const defaultProfileImage = 'https://via.placeholder.com/150'

// Optional: Mapping für Sonderfälle, falls DB-Codes nicht exakt ISO-Alpha-2 sind
const nationMap: Record<string, string> = {
  UK: 'GB',
  EN: 'GB',
  // ggf. weitere Sonderfälle
}
// Optional: Mapping, falls in DB volle Ländernamen stehen
const countryNameToCode: Record<string, string> = {
  GERMANY: 'DE',
  BULGARIA: 'BG',
  FRANCE: 'FR',
  SPAIN: 'ES',
  // ... nach Bedarf ergänzen
}

// Funktion: Formatiere Namen, kürze Vorname >9 Zeichen
const fullName = (p: Player): string => {
  const vor = (p.firstName || '').trim()
  const nach = (p.lastName || '').trim()
  if (!vor && !nach) return ''
  if (vor.length > 9 && nach) {
    const initial = vor.charAt(0).toUpperCase()
    return `${initial}. ${nach}`.toUpperCase()
  }
  const zusamm = [vor, nach].filter(s => s).join(' ')
  return zusamm.toUpperCase()
}

// Funktion: Erzeuge Flag-Emoji
const nationEmoji = (nation?: string): string => {
  if (!nation) return '🏳️'
  const trimmed = nation.trim()
  if (!trimmed) return '🏳️'
  // Prüfen, ob bereits Regional Indicator Symbol vorhanden
  const firstCp = Array.from(trimmed)[0]?.codePointAt(0)
  if (firstCp !== undefined) {
    if (firstCp >= 0x1F1E6 && firstCp <= 0x1F1FF) {
      // Bereits Flag-Emoji
      return trimmed
    }
    // Optional: generisches Emoji, falls DB so speichert
    if (firstCp === 0x1F310) {
      return '🌐'
    }
  }
  // ISO-Code oder Ländername?
  let codeRaw = trimmed.toUpperCase()
  if (countryNameToCode[codeRaw]) {
    codeRaw = countryNameToCode[codeRaw]
  }
  if (nationMap[codeRaw]) {
    codeRaw = nationMap[codeRaw]
  }
  if (codeRaw.length !== 2) {
    return '🏳️'
  }
  const c0 = codeRaw.charCodeAt(0)
  const c1 = codeRaw.charCodeAt(1)
  if (c0 < 65 || c0 > 90 || c1 < 65 || c1 > 90) {
    return '🏳️'
  }
  const BASE = 0x1F1E6
  return String.fromCodePoint(BASE + (c0 - 65), BASE + (c1 - 65))
}

// Fetch Positionen
const fetchPositions = async () => {
  try {
    const snap = await getDocs(collection(db, 'positions'))
    positions.value = snap.docs.map(doc => {
      const data = doc.data() as any
      return {
        id: doc.id,
        shortcut: (data.shortcut || '').toString()
      }
    })
  } catch (err: any) {
    console.error('Fehler Positions-Laden:', err.message || err)
  }
}

// Fetch Spieler + avgRating
const fetchPlayers = async () => {
  loading.value = true
  try {
    // Positionen einmal laden
    if (!positions.value.length) {
      await fetchPositions()
    }
    // Spieler laden
    const snap = await getDocs(collection(db, 'players'))
    const loaded: Player[] = []
    for (const docSnap of snap.docs) {
      const data = docSnap.data() as any
      loaded.push({
        id: docSnap.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        position: data.position || '',
        nation: data.nation || '',
        profileImage: data.profileImage || defaultProfileImage,
        avgRating: null,
        PAC: data.PAC,
        SHO: data.SHO,
        PAS: data.PAS,
        DRI: data.DRI,
        def: data.def,
        phy: data.phy,
        skillMoves: data.skillMoves,
        weakFoot: data.weakFoot,
      })
    }
    // Ratings laden
    const snapR = await getDocs(collection(db, 'ratings'))
    const ratings = snapR.docs.map(d => d.data() as any)
    // Durchschnitt berechnen
    for (const p of loaded) {
      const arr = ratings.filter(r => r.toPlayerId === p.id && typeof r.rating === 'number')
      p.avgRating = arr.length ? arr.reduce((sum, r) => sum + r.rating, 0) / arr.length : null
    }
    players.value = loaded
  } catch (err: any) {
    console.error('Fehler Spieler-Laden:', err.message || err)
  } finally {
    loading.value = false
  }
}

// Computed Filter & Sort
const filteredAndSortedPlayers = computed(() => {
  let list = players.value
  if (selectedPosition.value) {
    list = list.filter(p => p.position === selectedPosition.value)
  }
  const sorted = [...list]
  switch (sortBy.value) {
    case 'nameAsc':
      sorted.sort((a, b) => a.firstName.localeCompare(b.firstName))
      break
    case 'nameDesc':
      sorted.sort((a, b) => b.firstName.localeCompare(a.firstName))
      break
    case 'positionAsc':
      sorted.sort((a, b) => a.position.localeCompare(b.position))
      break
    case 'positionDesc':
      sorted.sort((a, b) => b.position.localeCompare(a.position))
      break
    case 'avgAsc':
      sorted.sort((a, b) => (a.avgRating || 0) - (b.avgRating || 0))
      break
    case 'avgDesc':
      sorted.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
      break
  }
  return sorted
})

onMounted(fetchPlayers)
</script>

<style scoped>
/* Hintergrund-Overlay */
.background-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 96, 95, 0.5);
  z-index: -1;
}
/* Container */
.player-list-page {
  position: relative;
  width: 100%;
  max-width: 1000px;
  margin: 1rem auto;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(6px);
  border-radius: 1rem;
}
/* Controls */
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.button-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  font-size: 0.9rem;
}
.btn-primary {
  background: var(--color2);
  color: #fff;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-primary:hover:not(:disabled) {
  background: var(--color3);
  transform: translateY(-2px);
}
.btn-secondary {
  background: var(--color3);
  color: #fff;
}
.btn-secondary:hover {
  background: var(--color4);
  transform: translateY(-2px);
}
.filter-sort-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  flex-direction: column;
}
.filter-group label {
  font-size: 0.85rem;
  color: #2e3a45;
  margin-bottom: 0.25rem;
}
.filter-group select {
  padding: 0.4rem;
  font-size: 0.9rem;
}
/* Grid: responsive, mindestens 2 Karten nebeneinander auf Mobil */
.players-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
}
@media (min-width: 500px) {
  .players-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}
@media (min-width: 800px) {
  .players-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
.card-wrapper {
  display: flex;
  justify-content: center;
}
/* Card */
.fut-player-card {
  position: relative;
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-image: url("https://www.fifarosters.com/assets/cards/fifa24/templates/hd-special.png");
  background-size: cover;
  padding: 2rem 0;
  color: inherit;
  overflow: hidden;
  transition: transform 0.2s;
  text-decoration: none;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.fut-player-card:hover {
  transform: translateY(-4px);
}
/* Card Top */
.player-card-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #e9cc74;
  padding: 0 1rem;
  margin-top: 1rem;
}
.player-master-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 300;
  text-transform: uppercase;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}
.player-rating {
  font-size: 1.6rem;
}
.player-position {
  font-size: 2rem;
}
@media(min-width:600px) {
  .player-position {
    font-size: 3rem;
  }
}
.player-nation-emoji {
  font-size: 1.2rem;
}
/* Bild */
.player-picture {
  width: 100px;
  height: 100px;
  margin: 0.5rem auto;
  overflow: hidden;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
}
.player-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* Card Bottom */
.player-card-bottom {
  background: rgba(0,0,0,0.2);
  padding: 0.4rem 0.8rem;
}
.player-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}
.player-name {
  font-size: 1rem;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
  word-break: break-word;
  text-align: center;
}
.player-features {
  display: flex;
  gap: 0.5rem;
}
.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.player-feature-value {
  font-size: 0.9rem;
  font-weight: 700;
}
.player-feature-title {
  font-size: 0.65rem;
  opacity: 0.8;
}
/* Spinner */
.spinner {
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid rgba(0,0,0,0.2);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  margin-right: 0.5rem;
}
@keyframes spin { to { transform: rotate(360deg); } }
/* Empty */
.empty {
  text-align: center;
  padding: 1.5rem;
  color: #2e3a45;
  font-size: 0.9rem;
}
</style>
