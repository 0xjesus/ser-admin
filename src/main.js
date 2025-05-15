import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'  // Mantener esta línea ya que ahora style.css contiene todo
// Importar las páginas
import Contacts from './components/Contacts.vue'
import Bookings from './components/Bookings.vue'
import Reports from './components/Reports.vue'

// Crear el router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Contacts },
    { path: '/bookings', component: Bookings },
    { path: '/reports', component: Reports }
  ]
})

// Crear la aplicación
const app = createApp(App)
app.use(router)
app.mount('#app')
