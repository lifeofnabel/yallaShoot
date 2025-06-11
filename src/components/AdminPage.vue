<template>
  <div class="admin-page">
    <h2>Adminbereich</h2>
    <div v-if="!accessGranted" class="pin-login">
      <p>Bitte Admin-PIN eingeben:</p>
      <input
          type="password"
          v-model="pinInput"
          maxlength="4"
          placeholder="PIN"
      />
      <button @click="verifyPin">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>

    <div v-else>
      <h3>Round erstellen</h3>
      <div class="form-group">
        <label>Datum:</label>
        <input type="date" v-model="date" required />
      </div>
      <div class="form-group">
        <label>Uhrzeit:</label>
        <input type="time" v-model="time" required />
      </div>
      <div class="form-group">
        <label>
          <input type="checkbox" v-model="allPlayers" />
          Alle Spieler hinzufügen
        </label>
      </div>

      <!-- Falls nicht alle Spieler, Checkbox-Liste -->
      <div v-if="!allPlayers" class="player-list">
        <h4>Spieler auswählen:</h4>
        <div class="player-checkbox" v-for="player in allPlayersList" :key="player.id">
          <label>
            <input
                type="checkbox"
                :value="player.id"
                v-model="selectedPlayers"
            />
            {{ player.firstName }} {{ player.lastName }}
          </label>
        </div>
      </div>

      <button @click="createRound">Round erstellen</button>
      <p v-if="success" class="success">{{ success }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from '../Firebase/firebaseConfig'
import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  doc
} from 'firebase/firestore'

// Admin-PIN
const pinInput = ref('')
const accessGranted = ref(false)
const error = ref('')

// Round-Daten
const date = ref('')
const time = ref('')
const allPlayers = ref(true)
const allPlayersList = ref<any[]>([])  // Alle Spieler aus Firestore
const selectedPlayers = ref<string[]>([])
const success = ref('')

// Admin-PIN prüfen
async function verifyPin() {
  const adminDoc = await getDoc(doc(db, 'players', '4GOaTryHmgPGSjr1EjfN'))
  if (!adminDoc.exists()) {
    error.value = 'Admin-Spieler nicht gefunden.'
    return
  }
  const correctPin = adminDoc.data().pin
  if (pinInput.value.toString() === correctPin.toString()) {
    accessGranted.value = true
    error.value = ''
    await loadPlayers()  // Spieler beim Login laden
  } else {
    error.value = 'PIN falsch.'
  }
}

// Spieler laden
async function loadPlayers() {
  const snap = await getDocs(collection(db, 'players'))
  allPlayersList.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// Round erstellen
async function createRound() {
  success.value = ''
  const playerIds: string[] = []

  if (allPlayers.value) {
    // Alle Spieler hinzufügen
    allPlayersList.value.forEach(player => playerIds.push(player.id))
  } else {
    // Nur ausgewählte Spieler hinzufügen
    playerIds.push(...selectedPlayers.value)
  }

  // PINs generieren
  const pins = playerIds.map(() =>
      String(Math.floor(1000 + Math.random() * 9000))
  )
  const pinUsed = pins.map(() => false)

  await addDoc(collection(db, 'rounds'), {
    date: date.value,
    time: time.value,
    playerIds,
    pins,
    pinUsed
  })

  success.value = 'Round erfolgreich erstellt!'
  date.value = ''
  time.value = ''
  selectedPlayers.value = []
}
</script>

<style scoped>
.admin-page {
  max-width: 500px;
  margin: 2rem auto;
  background: #ffffff;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
}
h2 {
  text-align: center;
  margin-bottom: 1rem;
}
.pin-login {
  text-align: center;
}
.pin-login input {
  width: 120px;
  padding: 0.5rem;
  margin: 0.5rem 0;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  text-align: center;
}
.pin-login button {
  background: #5a83f7;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
}
.error {
  color: red;
  margin-top: 0.5rem;
}
.success {
  color: green;
  margin-top: 1rem;
  text-align: center;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  font-weight: 600;
}
.form-group input[type="date"],
.form-group input[type="time"] {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
}

/* Player Auswahl */
.player-list {
  margin: 1rem 0;
}
.player-list h4 {
  margin-bottom: 0.5rem;
}
.player-checkbox {
  background: #f9f9f9;
  padding: 0.5rem;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ddd;
}
.player-checkbox label {
  font-weight: 500;
}

/* Buttons */
button {
  background: #00b894;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}
button:hover {
  background: #019374;
}
</style>
