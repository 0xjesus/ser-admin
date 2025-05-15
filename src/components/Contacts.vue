<template>
  <div>
    <div class="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 class="text-2xl font-bold text-gray-900">Contactos</h1>

      <div class="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          v-model="filters.search"
          @input="debouncedSearch"
          placeholder="Buscar contacto..."
          class="input sm:w-64"
        />

        <div class="flex gap-2">
          <select v-model="filters.status" @change="fetchContacts" class="input">
            <option value="">Todos</option>
            <option value="PROSPECT">Prospectos</option>
            <option value="LEAD">Leads</option>
            <option value="OPPORTUNITY">Oportunidades</option>
            <option value="CUSTOMER">Clientes</option>
            <option value="INACTIVE">Inactivos</option>
          </select>

          <button @click="downloadContacts" class="btn-primary whitespace-nowrap">
            Exportar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="card flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="ml-2">Cargando contactos...</p>
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

    <!-- Data table (responsive) -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="table-header">Nombre</th>
              <th class="table-header">Teléfono</th>
              <th class="table-header hidden md:table-cell">Email</th>
              <th class="table-header hidden md:table-cell">Estado</th>
              <th class="table-header hidden md:table-cell">Último Contacto</th>
            </tr>
          </thead>
          <tbody class="bg-slate-50 divide-y divide-gray-200">
            <tr v-for="contact in contacts" :key="contact.id" class="hover:bg-gray-50">
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
      downloadContacts,
      formatDate,
      getStatusBadgeClass,
      getStatusLabel
    }
  }
}
</script>
