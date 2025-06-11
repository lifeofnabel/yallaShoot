<template>
  <div class="add-player-form">
    <h2>Neuen Spieler hinzufügen</h2>
    <form @submit.prevent="addPlayer">
      <div class="form-group">
        <label for="firstName">Vorname</label>
        <input id="firstName" v-model="newPlayer.firstName" placeholder="Max" required />
      </div>

      <div class="form-group">
        <label for="lastName">Nachname</label>
        <input id="lastName" v-model="newPlayer.lastName" placeholder="Mustermann" required />
      </div>

      <div class="form-group">
        <label for="birthdate">Geburtsdatum</label>
        <input id="birthdate" type="date" v-model="newPlayer.birthdate" required />
      </div>

      <div class="form-group">
        <label for="position">Position</label>
        <select id="position" v-model="newPlayer.position" required>
          <option disabled value="">Position auswählen</option>
          <option v-for="pos in positions" :key="pos.id" :value="pos.shortcut">
            {{ pos.shortcut }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Nation:</label>
        <select v-model="newPlayer.nation" required>
          <option disabled value="">Nation auswählen</option>
          <option value="🇦🇱">🇦🇱 Albanien</option>
          <option value="🇦🇫">🇦🇫 Afghanistan</option>
          <option value="🇦🇷">🇦🇷 Argentinien</option>
          <option value="🇧🇦">🇧🇦 Bosnien und Herzegowina</option>
          <option value="🇧🇷">🇧🇷 Brasilien</option>
          <option value="🇧🇬">🇧🇬 Bulgarien</option>
          <option value="🇨🇱">🇨🇱 Chile</option>
          <option value="🇨🇳">🇨🇳 China</option>
          <option value="🇨🇴">🇨🇴 Kolumbien</option>
          <option value="🇩🇪">🇩🇪 Deutschland</option>
          <option value="🇪🇬">🇪🇬 Ägypten</option>
          <option value="🇪🇷">🇪🇷 Eritrea</option>
          <option value="🇪🇸">🇪🇸 Spanien</option>
          <option value="🇫🇷">🇫🇷 Frankreich</option>
          <option value="🇬🇧">🇬🇧 Großbritannien</option>
          <option value="🇬🇷">🇬🇷 Griechenland</option>
          <option value="🇭🇷">🇭🇷 Kroatien</option>
          <option value="🇮🇳">🇮🇳 Indien</option>
          <option value="🇮🇹">🇮🇹 Italien</option>
          <option value="🇯🇴">🇯🇴 Jordanien</option>
          <option value="🇰🇪">🇰🇪 Kenia</option>
          <option value="🇽🇰">🇽🇰 Kosovo</option>
          <option value="🇱🇧">🇱🇧 Libanon</option>
          <option value="🇱🇾">🇱🇾 Libyen</option>
          <option value="🇲🇦">🇲🇦 Marokko</option>
          <option value="🇲🇪">🇲🇪 Montenegro</option>
          <option value="🇳🇱">🇳🇱 Niederlande</option>
          <option value="🇳🇴">🇳🇴 Norwegen</option>
          <option value="🇵🇰">🇵🇰 Pakistan</option>
          <option value="🇵🇱">🇵🇱 Polen</option>
          <option value="🇵🇹">🇵🇹 Portugal</option>
          <option value="🇷🇴">🇷🇴 Rumänien</option>
          <option value="🇷🇸">🇷🇸 Serbien</option>
          <option value="🇷🇺">🇷🇺 Russland</option>
          <option value="🇸🇦">🇸🇦 Saudi-Arabien</option>
          <option value="🇸🇾">🇸🇾 Syrien</option>
          <option value="🇹🇳">🇹🇳 Tunesien</option>
          <option value="🇹🇷">🇹🇷 Türkei</option>
          <option value="🇺🇦">🇺🇦 Ukraine</option>
          <option value="🇺🇬">🇺🇬 Uganda</option>
          <option value="🇺🇸">🇺🇸 USA</option>
          <option value="🇻🇳">🇻🇳 Vietnam</option>
          <option value="🌐">🌐 Andere</option>
        </select>
      </div>

      <div class="form-group">
        <label for="pin (Remember it!">PIN</label>
        <input id="pin" type="number" v-model="newPlayer.pin" placeholder="1234" required />
      </div>

      <div class="button-group">
        <button class="btn submit" type="submit" :disabled="loading">
          <span v-if="!loading">Speichern</span>
          <span v-else>Lade...</span>
        </button>
        <button class="btn cancel" type="button" @click="goBack">
          Abbrechen
        </button>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { db } from '../Firebase/firebaseConfig'
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'

// Router
const router = useRouter()

// Formularfelder
const newPlayer = ref({
  firstName: '',
  lastName: '',
  birthdate: '',
  position: '',
  nation: '',
  pin: '',
  profileImage: '',    // hier wird später die URL stehen
  avgRating: 0
})

// Lade-Status
const loading = ref(false)

// Positionen aus Firestore
interface Position {
  id: string
  shortcut: string
}
const positions = ref<Position[]>([])

const fetchPositions = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'positions'))
    positions.value = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      shortcut: doc.data().shortcut
    }))
  } catch (error) {
    console.error('Fehler beim Laden der Positionen:', error)
  }
}

// Spieler hinzufügen
const addPlayer = async () => {
  try {
    loading.value = true
    await addDoc(collection(db, 'players'), {
      firstName: newPlayer.value.firstName,
      lastName: newPlayer.value.lastName,
      birthdate: newPlayer.value.birthdate,
      position: newPlayer.value.position,
      nation: newPlayer.value.nation,
      pin: newPlayer.value.pin,
      profileImage: newPlayer.value.profileImage,  // neu
      avgRating: 0
    })
    alert('Spieler erfolgreich hinzugefügt!')
    router.push('/')
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Spielers:', error)
    alert('Fehler beim Hinzufügen des Spielers.')
  } finally {
    loading.value = false
  }
}

// Zurückfunktion
const goBack = () => {
  router.push('/')
}

// Positionen beim Laden abrufen
onMounted(fetchPositions)
</script>

<style scoped>
.add-player-form {
  background: #ffffff;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  max-width: 500px;
  margin: 2rem auto;
  font-family: 'Poppins', sans-serif;
}

.add-player-form h2 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.75rem;
  color: #333333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 1px solid #cccccc;
  border-radius: 8px;
  background: #f9f9f9;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #5a83f7;
  background: #ffffff;
  outline: none;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  flex: 1;
  padding: 12px 0;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
}

.submit {
  background: #5a83f7;
  color: #ffffff;
  border: none;
}

.submit:hover:not(:disabled) {
  background: #496fe1;
}

.submit:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.cancel {
  background: transparent;
  color: #5a83f7;
  border: 2px solid #5a83f7;
}

.cancel:hover {
  background: #5a83f7;
  color: #ffffff;
}

@media (max-width: 600px) {
  .add-player-form {
    padding: 24px 16px;
    margin: 1rem;
  }
  .button-group {
    flex-direction: column;
  }
}
</style>