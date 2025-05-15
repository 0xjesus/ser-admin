<template>
  <div>
    <div class="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Reservas</h1>

      <div class="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          v-model="filters.search"
          @input="debouncedSearch"
          placeholder="Buscar reserva..."
          class="input sm:w-64"
        />

        <div class="grid grid-cols-2 sm:flex gap-2">
          <select v-model="filters.status" @change="fetchBookings" class="input">
            <option value="">Todos</option>
            <option value="PENDING">Pendientes</option>
            <option value="CONFIRMED">Confirmadas</option>
            <option value="CANCELLED">Canceladas</option>
            <option value="COMPLETED">Completadas</option>
            <option value="NO_SHOW">No presentó</option>
          </select>

          <button @click="downloadBookings" class="btn-primary whitespace-nowrap">
            Exportar
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros de fecha -->
    <div class="card flex flex-col sm:flex-row gap-4 mb-5">
      <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-grow">
        <label class="flex flex-col">
          <span class="text-sm font-medium text-gray-700 mb-1">Desde:</span>
          <input
            type="date"
            v-model="filters.fromDate"
            @change="fetchBookings"
            class="input"
          />
        </label>

        <label class="flex flex-col">
          <span class="text-sm font-medium text-gray-700 mb-1">Hasta:</span>
          <input
            type="date"
            v-model="filters.toDate"
            @change="fetchBookings"
            class="input"
          />
        </label>
      </div>

      <div class="flex items-end">
        <button @click="clearDateFilters" class="btn-secondary h-10">
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="card flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="ml-2">Cargando reservas...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="card bg-red-50 border-l-4 border-red-500 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
          <button @click="fetchBookings" class="mt-2 text-sm text-red-700 underline">Reintentar</button>
        </div>
      </div>
    </div>

    <!-- Data table (responsive) -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="table-header">Servicio</th>
              <th class="table-header">Fecha y Hora</th>
              <th class="table-header">Cliente</th>
              <th class="table-header">Estado</th>
              <th class="table-header hidden md:table-cell">Notas</th>
            </tr>
          </thead>
          <tbody class="bg-slate-50 divide-y divide-gray-200">
            <tr v-for="booking in bookings" :key="booking.id" class="hover:bg-gray-50">
              <td class="table-cell font-medium">{{ booking.serviceName }}</td>
              <td class="table-cell">{{ formatDateTime(booking.dateTime) }}</td>
              <td class="table-cell">
                <div>{{ booking.contact?.name || 'Sin nombre' }}</div>
                <div class="text-xs text-gray-500">{{ booking.contact?.phoneNumber }}</div>
              </td>
              <td class="table-cell">
                <span :class="getStatusBadgeClass(booking.status)">
                  {{ getStatusLabel(booking.status) }}
                </span>
              </td>
              <td class="table-cell hidden md:table-cell">
                <div class="max-w-xs truncate">{{ booking.notes || '-' }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="flex-1 flex justify-between sm:hidden">
          <button @click="prevPage" :disabled="pagination.page === 1" class="btn-secondary">Anterior</button>
          <button @click="nextPage" :disabled="pagination.page === pagination.totalPages" class="btn-primary">Siguiente</button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> a <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> de <span class="font-medium">{{ pagination.total }}</span> resultados
            </p>
          </div>
          <div>
            <nav class="inline-flex rounded-md shadow-sm -space-x-px">
              <button @click="setPage(1)" :disabled="pagination.page === 1" class="btn-secondary rounded-l-md px-2">
                Primera
              </button>
              <button @click="prevPage" :disabled="pagination.page === 1" class="btn-secondary px-2">
                &laquo;
              </button>
              <span class="px-4 py-2 border border-gray-300 bg-slate-50 text-gray-700">
                {{ pagination.page }} / {{ pagination.totalPages }}
              </span>
              <button @click="nextPage" :disabled="pagination.page === pagination.totalPages" class="btn-secondary px-2">
                &raquo;
              </button>
              <button @click="setPage(pagination.totalPages)" :disabled="pagination.page === pagination.totalPages" class="btn-secondary rounded-r-md px-2">
                Última
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from './api'

export default {
  name: 'Bookings',
  setup() {
    const bookings = ref([])
    const loading = ref(true)
    const error = ref(null)
    const pagination = ref({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0
    })
    const filters = ref({
      search: '',
      status: '',
      fromDate: '',
      toDate: '',
      sortBy: 'dateTime',
      sortOrder: 'desc'
    })

    // Timer para debounce de búsqueda
    let searchTimer = null

    // Cargar reservas
    const fetchBookings = async () => {
      loading.value = true
      error.value = null

      try {
        const params = {
          page: pagination.value.page,
          limit: pagination.value.limit,
          ...filters.value
        }

        const response = await api.getBookings(params)
        bookings.value = response.data.data.bookings
        pagination.value = response.data.data.pagination
      } catch (err) {
        console.error('Error al cargar reservas:', err)
        error.value = 'Error al cargar las reservas. Por favor, intenta de nuevo.'
      } finally {
        loading.value = false
      }
    }

    // Búsqueda con debounce
    const debouncedSearch = () => {
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        pagination.value.page = 1
        fetchBookings()
      }, 500)
    }

    // Paginación
    const nextPage = () => {
      if (pagination.value.page < pagination.value.totalPages) {
        pagination.value.page++
        fetchBookings()
      }
    }

    const prevPage = () => {
      if (pagination.value.page > 1) {
        pagination.value.page--
        fetchBookings()
      }
    }

    const setPage = (page) => {
      pagination.value.page = page
      fetchBookings()
    }

    // Limpiar filtros de fecha
    const clearDateFilters = () => {
      filters.value.fromDate = ''
      filters.value.toDate = ''
      fetchBookings()
    }

    // Descargar reservas
    const downloadBookings = () => {
      api.downloadReport({
        type: 'bookings',
        ...filters.value
      })
    }

    // Formatear fecha y hora
    const formatDateTime = (dateString) => {
      if (!dateString) return '-'

      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
    }

    // Obtener clase de badge según estado
    const getStatusBadgeClass = (status) => {
      const map = {
        'PENDING': 'badge-yellow',
        'CONFIRMED': 'badge-blue',
        'CANCELLED': 'badge-red',
        'COMPLETED': 'badge-green',
        'NO_SHOW': 'badge-red'
      }

      return map[status] || 'badge-blue'
    }

    // Obtener texto de estado
    const getStatusLabel = (status) => {
      const map = {
        'PENDING': 'Pendiente',
        'CONFIRMED': 'Confirmada',
        'CANCELLED': 'Cancelada',
        'COMPLETED': 'Completada',
        'NO_SHOW': 'No presentó'
      }

      return map[status] || status
    }

    // Cargar datos al montar el componente
    onMounted(() => {
      fetchBookings()
    })

    return {
      bookings,
      loading,
      error,
      pagination,
      filters,
      fetchBookings,
      debouncedSearch,
      nextPage,
      prevPage,
      setPage,
      clearDateFilters,
      downloadBookings,
      formatDateTime,
      getStatusBadgeClass,
      getStatusLabel
    }
  }
}
</script>
