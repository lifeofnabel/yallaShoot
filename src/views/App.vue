<!-- App.vue -->
<template>
  <div id="app">
    <div class="page-overlay"></div>
    <header class="app-header">
      <img src="/src/assets/icon.webp" alt="Yalla Shoot Tool Logo" class="app-logo" />

      <h1>SOCCER N & Y</h1>
    </header>
    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// Leeres Script
</script>

<style scoped>
/* Farbpalette und Grund-Variablen */
:root {
  --color1: #08605f;
  --color2: #177e89;
  --color3: #598381;
  --color4: #8e936d;
  --color5: #a2ad59;
  --radius: 1rem;
  /* Gradient über alle Farben */
  --gradient: linear-gradient(135deg, var(--color1) 0%, var(--color2) 25%, var(--color3) 50%, var(--color4) 75%, var(--color5) 100%);
  --text-light: #fff;
  --text-dark: #1a1a1a;
}
.app-logo {
  max-height: 100px; /* z.B. 40px hoch */
  width: auto;
}
.app-header img + span { margin-left: 0.5rem; font-size: 1.25rem; color: var(--text-dark); }

#app {
  position: relative;
  min-height: 100vh;
  background: var(--gradient);
  font-family: 'Poppins', sans-serif;
  color: var(--text-light);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.page-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: none;
  z-index: 1;
}

.app-header {
  position: relative;
  z-index: 2;
  padding: 1rem;
  text-align: center;
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: var(--text-dark);
  backdrop-filter: blur(8px);
}

.page-content {
  position: inherit;
  z-index: 2;
  flex: 1;
  backdrop-filter: blur(3px);
  box-sizing: border-box;
  overflow-y: auto;
}

@media (max-width: 600px) {
  .app-header {
    font-size: 1.25rem;
    padding: 0.75rem;
  }
  .page-content {
  }
}
</style>
