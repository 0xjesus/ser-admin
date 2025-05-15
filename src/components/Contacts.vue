<template>
  <div>
    <!-- Encabezado -->
    <div class="mb-5 space-y-4 sm:space-y-0 sm:flex sm:flex-row sm:justify-between sm:items-center">
      <h1 class="text-2xl font-bold text-gray-900">Contactos</h1>

      <!-- Controles de filtrado y exportación -->
      <div class="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
        <div class="relative">
          <input
            type="text"
            v-model="filters.search"
            @input="debouncedSearch"
            placeholder="Buscar contacto..."
            class="input sm:w-64 pl-10"
          />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <div class="flex gap-2 items-center">
          <select v-model="filters.status" @change="fetchContacts" class="input">
            <option value="">Todos</option>
            <option value="PROSPECT">Prospectos</option>
            <option value="LEAD">Leads</option>
            <option value="OPPORTUNITY">Oportunidades</option>
            <option value="CUSTOMER">Clientes</option>
            <option value="INACTIVE">Inactivos</option>
          </select>

          <button @click="downloadContacts" class="btn-primary whitespace-nowrap flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <span class="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="card flex justify-center items-center py-12 animate-pulse">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      <p class="ml-3 text-gray-600 font-medium">Cargando contactos...</p>
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
          <button @click="fetchContacts" class="mt-2 text-sm text-red-700 underline">Reintentar</button>
        </div>
      </div>
    </div>

    <!-- Data for mobile (card view) and desktop (table view) -->
    <div v-else>
      <!-- Mobile view (card-based layout) -->
      <div class="sm:hidden space-y-4">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          class="card p-4 hover:shadow-md transition-all"
        >
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-medium text-gray-900">{{ contact.name || 'Sin nombre' }}</h3>
            <span :class="getStatusBadgeClass(contact.status)">
              {{ getStatusLabel(contact.status) }}
            </span>
          </div>

          <div class="text-sm space-y-2">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>{{ contact.phoneNumber }}</span>
            </div>

            <div v-if="contact.email" class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>{{ contact.email }}</span>
            </div>

            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
              </svg>
              <span class="text-xs text-gray-500">{{ formatDate(contact.lastContactAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop view (table layout) -->
      <div class="hidden sm:block card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="table-header flex items-center">
                  <span>Nombre</span>
                  <button @click="toggleSort('name')" class="ml-1 opacity-60 hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </th>
                <th class="table-header">Teléfono</th>
                <th class="table-header hidden md:table-cell">Email</th>
                <th class="table-header hidden md:table-cell">Estado</th>
                <th class="table-header hidden md:table-cell flex items-center">
                  <span>Último Contacto</span>
                  <button @click="toggleSort('lastContactAt')" class="ml-1 opacity-60 hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="bg-slate-50 divide-y divide-gray-200">
              <tr v-for="contact in contacts" :key="contact.id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="table-cell font-medium">
                  {{ contact.name || 'Sin nombre' }}
                </td>
                <td class="table-cell">{{ contact.phoneNumber }}</td>
                <td class="table-cell hidden md:table-cell">{{ contact.email || '-' }}</td>
                <td class="table-cell hidden md:table-cell">
                  <span :class="getStatusBadgeClass(contact.status)">
                    {{ getStatusLabel(contact.status) }}
                  </span>
                </td>
                <td class="table-cell hidden md:table-cell">
                  {{ formatDate(contact.lastContactAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination for both mobile and desktop -->
      <div v-if="pagination.totalPages > 1" class="mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <!-- Mobile pagination -->
        <div class="sm:hidden px-4 py-3 flex items-center justify-between">
          <button
            @click="prevPage"
            :disabled="pagination.page === 1"
            :class="pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''"
            class="btn-secondary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            Anterior
          </button>

          <span class="text-sm text-gray-700">
            {{ pagination.page }} / {{ pagination.totalPages }}
          </span>

          <button
            @click="nextPage"
            :disabled="pagination.page === pagination.totalPages"
            :class="pagination.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''"
            class="btn-primary flex items-center"
          >
            Siguiente
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>

        <!-- Desktop pagination -->
        <div class="hidden sm:flex sm:items-center sm:justify-between px-4 py-3">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando <span class="font-medium">{{ (pagination.page - 1) * pagination.limit + 1 }}</span> a <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span> de <span class="font-medium">{{ pagination.total }}</span> resultados
            </p>
          </div>

          <div class="flex items-center">
            <button
              @click="setPage(1)"
              :disabled="pagination.page === 1"
              :class="pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''"
              class="btn-secondary rounded-l-md px-2 py-1 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </button>

            <button
              @click="prevPage"
              :disabled="pagination.page === 1"
              :class="pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : ''"
              class="btn-secondary px-2 py-1 text-sm border-l-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <span class="px-4 py-1 border border-gray-300 bg-slate-50 text-gray-700 text-sm border-l-0">
              {{ pagination.page }} / {{ pagination.totalPages }}
            </span>

            <button
              @click="nextPage"
              :disabled="pagination.page === pagination.totalPages"
              :class="pagination.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''"
              class="btn-secondary px-2 py-1 text-sm border-l-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>

            <button
              @click="setPage(pagination.totalPages)"
              :disabled="pagination.page === pagination.totalPages"
              :class="pagination.page === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : ''"
              class="btn-secondary rounded-r-md px-2 py-1 text-sm border-l-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
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
  name: 'Contacts',
  setup() {
    const contacts = ref([])
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
      sortBy: 'lastContactAt',
      sortOrder: 'desc'
    })

    // Timer para debounce de búsqueda
    let searchTimer = null

    // Cargar contactos
    const fetchContacts = async () => {
      loading.value = true
      error.value = null

      try {
        const params = {
          page: pagination.value.page,
          limit: pagination.value.limit,
          ...filters.value
        }

        // Simular un pequeño retraso para mostrar el estado de carga (en producción, eliminar)
        // await new Promise(resolve => setTimeout(resolve, 800))

        const response = await api.getContacts(params)
        contacts.value = response.data.data.contacts
        pagination.value = response.data.data.pagination
      } catch (err) {
        console.error('Error al cargar contactos:', err)
        error.value = 'Error al cargar los contactos. Por favor, intenta de nuevo.'
      } finally {
        loading.value = false
      }
    }

    // Búsqueda con debounce
    const debouncedSearch = () => {
      clearTimeout(searchTimer)
      searchTimer = setTimeout(() => {
        pagination.value.page = 1
        fetchContacts()
      }, 500)
    }

    // Paginación
    const nextPage = () => {
      if (pagination.value.page < pagination.value.totalPages) {
        pagination.value.page++
        fetchContacts()
      }
    }

    const prevPage = () => {
      if (pagination.value.page > 1) {
        pagination.value.page--
        fetchContacts()
      }
    }

    const setPage = (page) => {
      pagination.value.page = page
      fetchContacts()
    }

    // Toggle sorting
    const toggleSort = (field) => {
      if (filters.value.sortBy === field) {
        // Invertir orden
        filters.value.sortOrder = filters.value.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        // Cambiar campo de ordenamiento
        filters.value.sortBy = field
        filters.value.sortOrder = 'asc'
      }
      fetchContacts()
    }

    // Descargar contactos
    const downloadContacts = () => {
      api.downloadReport({
        type: 'contacts',
        ...filters.value
      })
    }

    // Formatear fecha
    const formatDate = (dateString) => {
      if (!dateString) return '-'

      const date = new Date(dateString)
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
    }

    // Obtener clase de badge según estado
    const getStatusBadgeClass = (status) => {
      const map = {
        'PROSPECT': 'badge-blue',
        'LEAD': 'badge-yellow',
        'OPPORTUNITY': 'badge-purple',
        'CUSTOMER': 'badge-green',
        'INACTIVE': 'badge-red',
        'DISQUALIFIED': 'badge-red'
      }

      return map[status] || 'badge-blue'
    }

    // Obtener texto de estado
    const getStatusLabel = (status) => {
      const map = {
        'PROSPECT': 'Prospecto',
        'LEAD': 'Lead',
        'OPPORTUNITY': 'Oportunidad',
        'CUSTOMER': 'Cliente',
        'INACTIVE': 'Inactivo',
        'DISQUALIFIED': 'Descartado'
      }

      return map[status] || status
    }

    // Cargar datos al montar el componente
    onMounted(() => {
      fetchContacts()
    })

    return {
      contacts,
      loading,
      error,
      pagination,
      filters,
      fetchContacts,
      debouncedSearch,
      nextPage,
      prevPage,
      setPage,
      toggleSort,
      downloadContacts,
      formatDate,
      getStatusBadgeClass,
      getStatusLabel
    }
  }
}
</script>
