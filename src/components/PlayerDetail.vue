<template>
  <div class="detail-page">
    <button class="back" @click="goBack">← back</button>
    <div class="card">
      <h2>Player Page</h2>

      <!-- PIN-Login -->
      <div v-if="!authenticated" class="pin-login">
        <label for="pin-input">Enter your pin:</label>
        <input
            id="pin-input"
            type="password"
            v-model="enteredPin"
            @keyup.enter="checkPin"
            placeholder="PIN"
        />
        <button @click="checkPin">Login</button>
        <p v-if="pinError" class="error">{{ pinError }}</p>
      </div>

      <!-- Bild Upload & Vorschau -->
      <div v-else>
        <!-- Profilbild -->
        <div class="form-group">
          <label for="profileImage">Profile Image</label>
          <input
              id="profileImage"
              type="file"
              @change="handleImageUpload"
              accept="image/*"
          />
          <div v-if="player.profileImage" class="preview-circle">
            <img :src="player.profileImage" alt="Vorschau" />
          </div>
        </div>

        <!-- Nation -->
        <div class="form-group">
          <label for="nation">Nation</label>
          <select id="nation" v-model="player.nation" required>
            <option disabled value="">Choose Flag</option>
            <option
                v-for="f in flags"
                :key="f.id"
                :value="f.flag"
            >
              {{ f.flag }} {{ f.name }}
            </option>
          </select>
        </div>

        <!-- Formular -->
        <form @submit.prevent="updatePlayer">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input id="firstName" v-model="player.firstName" required />
          </div>
          <div class="form-group">
            <label for="lastName">Surename</label>
            <input id="lastName" v-model="player.lastName" required />
          </div>
          <div class="form-group">
            <label for="birthdate">Birthday</label>
            <input id="birthdate" type="date" v-model="player.birthdate" required />
          </div>
          <div class="form-group">
            <label for="position">Position</label>
            <select id="position" v-model="player.position" required>
              <option disabled value="">Position wählen</option>
              <option
                  v-for="pos in positions"
                  :key="pos.id"
                  :value="pos.shortcut"
              >
                {{ pos.shortcut }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="pin">PIN</label>
            <input id="pin" type="number" v-model="player.pin" required />
          </div>

          <div class="button-group">
            <button type="submit" class="btn save" :disabled="loading">
              {{ loading ? 'Saving…' : 'Save' }}
            </button>
            <button type="button" class="btn delete" @click="deletePlayer">
              Delete
            </button>
          </div>
        </form>

        <!-- News & PIN Bereich -->
        <div class="news-box">
          <h3>Your Pins & Rounds:</h3>
          <ul>
            <li v-for="runde in rounds" :key="runde.id">
              <strong>{{ runde.date }} at {{ runde.time }}</strong>
              <div v-if="getPlayerPin(runde) !== '—'">
                PIN: <span class="pin">{{ getPlayerPin(runde) }}</span>
                <button @click="copyRoundPin(getPlayerPin(runde))" class="copy-btn">
                  Copy
                </button>
              </div>
              <div v-else>
                No PIN assigned for this round.
              </div>
            </li>
          </ul>
          <router-link to="/rate" class="btn-rate">
            To Review Page
          </router-link>
          <router-link to="/" class="btn-rate">
            To Main Page
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '../Firebase/firebaseConfig'
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs
} from 'firebase/firestore'

// Routing
const route = useRoute()
const router = useRouter()
const id = route.params.id as string

// State
const player = ref<any>({})
const loading = ref(false)
const positions = ref<{ id: string; shortcut: string }[]>([])
const rounds = ref<any[]>([])
const flags = ref<{ id: string; flag: string; name: string }[]>([])

// PIN Login
const enteredPin = ref('')
const authenticated = ref(false)
const pinError = ref('')

// Fetch Data
async function fetchPlayer() {
  const snap = await getDoc(doc(db, 'players', id))
  if (snap.exists()) {
    player.value = { id: snap.id, ...snap.data() }
  } else {
    router.push('/')
  }
}

async function fetchPositions() {
  const snap = await getDocs(collection(db, 'positions'))
  positions.value = snap.docs.map(d => ({
    id: d.id,
    shortcut: d.data().shortcut
  }))
}

async function fetchRounds() {
  const snap = await getDocs(collection(db, 'rounds'))
  rounds.value = snap.docs.map(d => ({
    id: d.id,
    date: d.data().date,
    time: d.data().time,
    pins: d.data().pins || [],
    playerIds: d.data().playerIds || []
  }))
}

async function fetchFlags() {
  const snap = await getDocs(collection(db, 'flags'))
  flags.value = snap.docs.map(doc => ({
    id: doc.id,
    flag: doc.data().flag,
    name: doc.data().name
  }))
}

onMounted(async () => {
  await fetchPlayer()
  await fetchPositions()
  await fetchRounds()
  await fetchFlags()
})

// PIN Check
function checkPin() {
  if (enteredPin.value === String(player.value.pin)) {
    authenticated.value = true
    pinError.value = ''
  } else {
    pinError.value = 'Incorrect PIN!'
  }
}

// Image Upload
async function handleImageUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const form = new FormData()
  form.append('image', file)
  loading.value = true
  try {
    const res = await fetch(
        'https://api.imgbb.com/1/upload?key=b9e14dec9a999e3f16b2538f05c5f9d7',
        { method: 'POST', body: form }
    )
    const json = await res.json()
    player.value.profileImage = json.data.url
  } finally {
    loading.value = false
  }
}

// Update & Delete
async function updatePlayer() {
  loading.value = true
  await updateDoc(doc(db, 'players', id), { ...player.value })
  loading.value = false
  alert('Changes saved!')
}

async function deletePlayer() {
  if (!confirm('Really delete?')) return
  await deleteDoc(doc(db, 'players', id))
  router.push('/')
}

function goBack() {
  router.back()
}

// PIN aus Runde holen
function getPlayerPin(runde: any) {
  const index = runde.playerIds.indexOf(player.value.id)
  return index !== -1 ? runde.pins[index] : '—'
}

function copyRoundPin(pin: string) {
  navigator.clipboard.writeText(pin)
  alert('PIN copied!')
}
</script>


<style scoped>
.detail-page {
  padding: 2rem 1rem;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Poppins', sans-serif;
}

.back {
  background: transparent;
  border: none;
  color: #5a83f7;
  cursor: pointer;
  margin-bottom: 1rem;
}

.card {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.card h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.pin-login {
  text-align: center;
}

.pin-login input {
  width: 100%;
  padding: 0.75rem;
  margin: 1rem 0;
  border-radius: 0.75rem;
  background: #f9f9f9;
}

.pin-login button {
  background: #5a83f7;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.75rem;
  background: #f9f9f9;
  border: 1px solid #ccc;
}

.preview-circle {
  width: 200px;
  height: 200px;
  margin: 1rem auto;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ccc;
}

.preview-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.save {
  background: #5a83f7;
  color: #fff;
}

.delete {
  background: #e53e3e;
  color: #fff;
}

.news-box {
  margin-top: 2rem;
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.news-box h3 {
  margin-bottom: 1rem;
  color: #333;
}

.news-box ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.news-box li {
  background: #fff;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
}

.pin {
  font-weight: 600;
  color: #5a83f7;
}

.copy-btn {
  margin-left: 1rem;
  background: #5a83f7;
  color: #fff;
  padding: 0.3rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

.btn-rate {
  display: block;
  margin-top: 1rem;
  background: #6c5ce7;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
}

.btn-rate:hover {
  background: #5a4ac2;
}
</style>
