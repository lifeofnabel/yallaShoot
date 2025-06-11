<template>
  <div class="rating-page">
    <div class="card">
      <h2>Spieler bewerten</h2>

      <!-- Spieltag-Auswahl -->
      <div class="form-group">
        <label for="round-select">Wähle einen Spieltag:</label>
        <select id="round-select" v-model="selectedRoundId" required>
          <option disabled value="">Spieltag auswählen</option>
          <option v-for="round in rounds" :key="round.id" :value="round.id">
            {{ round.date }} – {{ round.time }}
          </option>
        </select>
      </div>

      <!-- PIN-Login -->
      <div class="form-group">
        <label for="pin-input">Dein PIN:</label>
        <input
            id="pin-input"
            type="password"
            v-model="enteredPin"
            placeholder="PIN"
        />
        <button @click="checkPin" class="btn-primary">
          Login
        </button>
        <p v-if="pinError" class="error">{{ pinError }}</p>
      </div>

      <!-- Bewertungsformular -->
      <div v-if="authenticated && selectedRoundId" class="rating-section">
        <h3>Bewerte deine Mitspieler</h3>
        <div
            class="player-rating-card"
            v-for="player in playersToRate"
            :key="player.id"
        >
          <img
              :src="player.profileImage || '/placeholder.png'"
              alt="Profil"
              class="player-img"
          />
          <div class="player-info">
            <h4>{{ player.firstName }} {{ player.lastName }}</h4>
            <select v-model="ratings[player.id]" required>
              <option disabled value="">Bewertung auswählen</option>
              <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>
        </div>
        <button class="btn-primary" @click="submitRatings" :disabled="loading">
          {{ loading ? 'Speichern…' : 'Bewertungen abschicken' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '../Firebase/firebaseConfig'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc
} from 'firebase/firestore'
import { useRouter } from 'vue-router'

// State
const rounds = ref<any[]>([])
const selectedRoundId = ref('')
const enteredPin = ref('')
const pinError = ref('')
const authenticated = ref(false)
const playersToRate = ref<any[]>([])
const ratings = ref<{ [playerId: string]: number }>({})
const loading = ref(false)
const router = useRouter()

// Runden abrufen
async function fetchRounds() {
  const snap = await getDocs(collection(db, 'rounds'))
  rounds.value = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

// PIN Check & Auth
async function checkPin() {
  if (!selectedRoundId.value) {
    pinError.value = 'Bitte wähle zuerst einen Spieltag aus.'
    return
  }

  const roundDoc = await getDoc(doc(db, 'rounds', selectedRoundId.value))
  if (!roundDoc.exists()) {
    pinError.value = 'Spieltag nicht gefunden.'
    return
  }

  const roundData = roundDoc.data()
  const pins: string[] = roundData.pins || []
  const pinUsed: boolean[] = roundData.pinUsed || []
  const playerIds: string[] = roundData.playerIds || []

  const index = pins.indexOf(enteredPin.value)
  if (index === -1) {
    pinError.value = 'PIN ungültig!'
    return
  }
  if (pinUsed[index]) {
    pinError.value = 'PIN wurde bereits verwendet.'
    return
  }

  authenticated.value = true
  pinError.value = ''
  await loadPlayers(playerIds, playerIds[index])
}

// Spieler abrufen
async function loadPlayers(allPlayerIds: string[], selfPlayerId: string) {
  const snap = await getDocs(collection(db, 'players'))
  const allPlayers = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))

  // Spieler ohne sich selbst
  playersToRate.value = allPlayers.filter(p => allPlayerIds.includes(p.id) && p.id !== selfPlayerId)
}

// Bewertungen abschicken
async function submitRatings() {
  loading.value = true
  try {
    const promises = Object.entries(ratings.value).map(([toId, rating]) =>
        addDoc(collection(db, 'ratings'), {
          fromPin: enteredPin.value,
          toPlayerId: toId,
          rating: rating,
          roundId: selectedRoundId.value
        })
    )
    await Promise.all(promises)

    // PIN auf benutzt setzen
    const roundRef = doc(db, 'rounds', selectedRoundId.value)
    const roundDoc = await getDoc(roundRef)
    if (roundDoc.exists()) {
      const roundData = roundDoc.data()
      const pins = roundData.pins || []
      const pinUsed = roundData.pinUsed || []

      const index = pins.indexOf(enteredPin.value)
      if (index !== -1) {
        pinUsed[index] = true
        await updateDoc(roundRef, { pinUsed })
      }
    }

    alert('Bewertungen erfolgreich gespeichert!')
    router.push('/')
  } catch (e) {
    console.error('Fehler beim Speichern:', e)
    alert('Fehler beim Speichern.')
  } finally {
    loading.value = false
  }
}

// Init
onMounted(fetchRounds)
</script>

<style scoped>
.rating-page {
  padding: 2rem 1rem;
  max-width: 700px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
}
.card {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  font-weight: 500;
  display: block;
  margin-bottom: 0.25rem;
}
.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 0.75rem;
  background: #f9f9f9;
}
.form-group button {
  background: #5a83f7;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
}
.form-group button:hover {
  background: #496fe1;
}
.error {
  color: red;
  font-size: 0.9rem;
}
.rating-section {
  margin-top: 2rem;
}
.rating-section h3 {
  text-align: center;
  margin-bottom: 1rem;
}
.player-rating-card {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 0.75rem;
  padding: 0.75rem;
  background: #f9f9f9;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}
.player-img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 1rem;
  border: 2px solid #5a83f7;
}
.player-info {
  flex: 1;
}
.player-info h4 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}
.player-info select {
  margin-top: 0.5rem;
}
.btn-primary {
  background: #5a83f7;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  width: 100%;
}
.btn-primary:hover {
  background: #496fe1;
}
</style>
