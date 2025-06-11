import { createRouter, createWebHistory } from 'vue-router'
import PlayerList from '../components/PlayerList.vue'
import AddPlayer from '../components/AddPlayer.vue'
import PlayerDetail from '../components/PlayerDetail.vue'
import RatingPage from '../components/RatingPage.vue'
import AdminPage from '../components/AdminPage.vue'

const routes = [
    { path: '/', name: 'Home', component: PlayerList },
    { path: '/add-player', name: 'AddPlayer', component: AddPlayer },
    { path: '/player/:id', name: 'PlayerDetail', component: PlayerDetail, props: true },
    { path: '/rate', name: 'RatingPage', component: RatingPage },
    { path: '/admin', name: 'AdminPage', component: AdminPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
