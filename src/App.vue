<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar -->
    <nav class="bg-slate-50 shadow">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <span class="text-xl font-bold text-blue-600">Admin</span>
            </div>
          </div>

          <!-- Menú de navegación -->
          <div class="flex items-center">
            <div class="flex space-x-4">
              <router-link to="/" class="px-3 py-2 text-sm font-medium" :class="$route.path === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'">
                Contactos
              </router-link>
              <router-link to="/bookings" class="px-3 py-2 text-sm font-medium" :class="$route.path === '/bookings' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'">
                Reservas
              </router-link>
              <router-link to="/reports" class="px-3 py-2 text-sm font-medium" :class="$route.path === '/reports' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'">
                Reportes
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenido principal -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
