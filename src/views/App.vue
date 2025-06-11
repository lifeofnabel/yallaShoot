<template>
  <div id="app">
    <div class="page-overlay"></div>
    <header>Yalla Shoot Tool</header>
    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// Hier brauchst du nichts weiter
</script>

<style scoped>
#app {
  position: relative;
  overflow: hidden;
  color: #1a1a1a;

}

/* Dunkelgraues Overlay über die ganze Seite */
.page-overlay {
  content: '';
  position: fixed;
  inset: 0;              /* top/right/bottom/left = 0 */
  background: rgba(0, 0, 0, 0.6);
  pointer-events: none;  /* Klicks gehen durch */
  z-index: 0;
  color: #1a1a1a;

}

/* Alle Contents (Header, main) über Overlay legen */
header,
.page-content {
  position: relative;
  z-index: 1;
  color: #1a1a1a;

}

/* Optional: etwas Transparenz im Content-Hintergrund */
.page-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  min-height: 100vh;
  padding: 2rem 1rem;
  box-sizing: border-box;
  color: #1a1a1a;

}
#app {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  min-height: 100vh;
  margin: 0;
  padding: 0;

}

header {
  background: var(--color-primary-light);
  color: #fff;
  padding: 1rem;
  text-align: center;
  font-size: 1.5rem;
}

main {

  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
