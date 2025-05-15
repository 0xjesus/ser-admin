<template>
  <div>
    <div class="mb-5">
      <h1 class="text-2xl font-bold text-gray-900">Reportes</h1>
      <p class="text-gray-600 mt-1">
        Genera y descarga reportes de contactos, reservas y conversaciones.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Reporte de Contactos -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">Contactos</h2>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <p class="text-gray-600 mb-4">
          Descarga un listado completo de todos los contactos con sus detalles y estadísticas.
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select v-model="contactsFilter.status" class="input">
            <option value="">Todos</option>
            <option value="PROSPECT">Prospectos</option>
            <option value="LEAD">Leads</option>
            <option value="OPPORTUNITY">Oportunidades</option>
            <option value="CUSTOMER">Clientes</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input type="date" v-model="contactsFilter.fromDate" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input type="date" v-model="contactsFilter.toDate" class="input" />
          </div>
        </div>

        <button @click="downloadReport('contacts')" class="btn-primary w-full">
          Descargar Excel
        </button>
      </div>

      <!-- Reporte de Reservas -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">Reservas</h2>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-gray-600 mb-4">
          Genera un reporte detallado de todas las reservas registradas en el sistema.
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select v-model="bookingsFilter.status" class="input">
            <option value="">Todos</option>
            <option value="PENDING">Pendientes</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="CANCELLED">Canceladas</option>
            <option value="COMPLETED">Completadas</option>
            <option value="NO_SHOW">No presentó</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input type="date" v-model="bookingsFilter.fromDate" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input type="date" v-model="bookingsFilter.toDate" class="input" />
          </div>
        </div>

        <button @click="downloadReport('bookings')" class="btn-primary w-full">
          Descargar Excel
        </button>
      </div>

      <!-- Reporte de Conversaciones -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">Conversaciones</h2>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <p class="text-gray-600 mb-4">
          Obtén métricas y detalles completos de las conversaciones con los contactos.
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select v-model="conversationsFilter.status" class="input">
            <option value="">Todos</option>
            <option value="ACTIVE">Activas</option>
            <option value="INACTIVE">Inactivas</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input type="date" v-model="conversationsFilter.fromDate" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input type="date" v-model="conversationsFilter.toDate" class="input" />
          </div>
        </div>

        <button @click="downloadReport('conversations')" class="btn-primary w-full">
          Descargar Excel
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import api from './api'

export default {
  name: 'Reports',
  setup() {
    const contactsFilter = ref({
      status: '',
      fromDate: '',
      toDate: ''
    })

    const bookingsFilter = ref({
      status: '',
      fromDate: '',
      toDate: ''
    })

    const conversationsFilter = ref({
      status: '',
      fromDate: '',
      toDate: ''
    })

    const downloadReport = (type) => {
      let params = { type }

      switch (type) {
        case 'contacts':
          params = { ...params, ...contactsFilter.value }
          break
        case 'bookings':
          params = { ...params, ...bookingsFilter.value }
          break
        case 'conversations':
          params = { ...params, ...conversationsFilter.value }
          break
      }

      api.downloadReport(params)
    }

    return {
      contactsFilter,
      bookingsFilter,
      conversationsFilter,
      downloadReport
    }
  }
}
</script>
