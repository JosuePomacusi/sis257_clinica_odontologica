<script setup lang="ts">
import type { Cita } from '../../models/Cita'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '../../stores'
import { useToast } from 'primevue/usetoast'

const authStore = useAuthStore() // Para obtener el odontólogo logueado
const ENDPOINT = 'citas'

let citas = ref<Cita[]>([]) // Todas las citas
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

let citasFiltradas = computed(() => {
  const filtered = citas.value.filter(cita => {
    // El backend usa 'odontologoId'
    return (cita as any).odontologoId === authStore.user?.id
  })
  // Ordenar por fecha descendente (más recientes primero)
  return filtered.sort((a, b) => {
    return (
      new Date(b.fechaHoraInicio).getTime() -
      new Date(a.fechaHoraInicio).getTime()
    )
  })
}) // Filtra las citas del odontólogo logueado

// Filtrar por búsqueda
const citasBuscadas = computed(() => {
  if (!searchQuery.value) return citasFiltradas.value

  const query = searchQuery.value.toLowerCase()
  return citasFiltradas.value.filter(cita => {
    return (
      cita.paciente.nombre.toLowerCase().includes(query) ||
      cita.paciente.primerApellido.toLowerCase().includes(query) ||
      cita.tratamiento?.nombre.toLowerCase().includes(query) ||
      cita.estado.toLowerCase().includes(query)
    )
  })
})

// Paginación
const totalPages = computed(() =>
  Math.ceil(citasBuscadas.value.length / itemsPerPage.value),
)

const citasPaginadas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return citasBuscadas.value.slice(start, end)
})

function cambiarPagina(pagina: number) {
  if (pagina >= 1 && pagina <= totalPages.value) {
    currentPage.value = pagina
  }
}

function cambiarItemsPorPagina(items: number) {
  itemsPerPage.value = items
  currentPage.value = 1
}

// Computed para calcular el monto total de las citas confirmadas
const totalCobrar = computed(() =>
  citasFiltradas.value.reduce((total, cita) => {
    // Sumar solo si el estado es "Confirmado"
    return cita.estado === 'Confirmado'
      ? total + Number(cita.tratamiento?.precio || 0)
      : total
  }, 0),
)

const toast = useToast() // Instancia de Toast

const emit = defineEmits(['edit'])
const citaDelete = ref<Cita | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)

// Obtener todas las citas desde el backend
async function obtenerLista() {
  citas.value = await http.get(ENDPOINT).then(response => response.data)
}

// Función para cambiar el estado a "Confirmado"
async function confirmarCita(cita: Cita) {
  try {
    await http.patch(`${ENDPOINT}/${cita.id}`, { estado: 'Confirmado' })
    toast.add({
      severity: 'success',
      summary: 'Cita confirmada',
      detail: 'La cita ha sido confirmada con éxito.',
      life: 3000,
    })
    obtenerLista()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo confirmar la cita. Intente nuevamente.',
      life: 3000,
    })
  }
}
// Función para cambiar el estado a "Rechazado"
async function rechazarCita(cita: Cita) {
  try {
    await http.patch(`${ENDPOINT}/${cita.id}`, { estado: 'Rechazado' })
    toast.add({
      severity: 'success',
      summary: 'Cita Rechazada',
      detail: 'La cita ha sido rechazada con éxito.',
      life: 3000,
    })
    obtenerLista()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo rechazar la cita. Intente nuevamente.',
      life: 3000,
    })
  }
}

// Mostrar diálogo de confirmación de eliminación
function mostrarEliminarConfirm(cita: Cita) {
  citaDelete.value = cita
  mostrarConfirmDialog.value = true
}

// Eliminar cita seleccionada
async function eliminar() {
  if (citaDelete.value?.id) {
    await http.delete(`${ENDPOINT}/${citaDelete.value.id}`)
    toast.add({
      severity: 'success',
      summary: 'Cita eliminada',
      detail: 'La cita ha sido eliminada con éxito.',
      life: 3000,
    })
    obtenerLista()
    mostrarConfirmDialog.value = false
  }
}

// Obtener la lista al montar el componente
onMounted(() => {
  obtenerLista()
})

// Función para aplicar clases a las filas según el estado
function getRowClass(data: Cita) {
  if (data.estado === 'Confirmado') return 'confirmado'
  if (data.estado === 'Pendiente') return 'pendiente'
  if (data.estado === 'Rechazado') return 'rechazado'
  return ''
}

// Exponer la función de actualización
defineExpose({ obtenerLista })
</script>

<template>
  <div class="citas-container">
    <!-- Barra de búsqueda y controles -->
    <div class="search-controls">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por paciente, tratamiento o estado..."
          class="search-input"
        />
      </div>
      <div class="items-control">
        <label>Mostrar:</label>
        <select
          v-model.number="itemsPerPage"
          @change="cambiarItemsPorPagina(itemsPerPage)"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
        <span>registros</span>
      </div>
    </div>

    <!-- Tabla con paginación -->
    <div class="table-wrapper">
      <table class="citas-table">
        <thead>
          <tr>
            <th>Nro.</th>
            <th>Paciente</th>
            <th>Tratamiento</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Fecha y Hora</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(cita, index) in citasPaginadas"
            :key="cita.id"
            :class="{
              confirmado: cita.estado === 'Confirmado',
              pendiente: cita.estado === 'Pendiente',
              rechazado: cita.estado === 'Rechazado',
            }"
          >
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>
              {{ cita.paciente.nombre }} {{ cita.paciente.primerApellido }}
            </td>
            <td>{{ cita.tratamiento?.nombre }}</td>
            <td>
              <span class="precio-tag">{{ cita.tratamiento?.precio }} Bs.</span>
            </td>
            <td>
              <span :class="'estado-badge estado-' + cita.estado.toLowerCase()">
                {{ cita.estado }}
              </span>
            </td>
            <td>
              <div class="fecha-info">
                <div class="fecha-inicio">
                  {{ new Date(cita.fechaHoraInicio).toLocaleString() }}
                </div>
                <div class="hora-fin">
                  hasta {{ new Date(cita.fechaHoraFin).toLocaleString() }}
                </div>
              </div>
            </td>
            <td>
              <div class="actions-wrapper">
                <Button
                  v-if="cita.estado === 'Pendiente'"
                  icon="pi pi-check"
                  label="Confirmar"
                  size="small"
                  severity="success"
                  @click="confirmarCita(cita)"
                />
                <Button
                  v-if="cita.estado === 'Pendiente'"
                  icon="pi pi-times"
                  label="Rechazar"
                  size="small"
                  severity="danger"
                  @click="rechazarCita(cita)"
                />
                <Button
                  icon="pi pi-trash"
                  aria-label="Eliminar"
                  text
                  class="delete-button"
                  @click="mostrarEliminarConfirm(cita)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="citasPaginadas.length === 0">
            <td colspan="7" class="no-data">No se encontraron citas</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Controles de paginación -->
    <div class="pagination-container">
      <div class="pagination-info">
        Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} a
        {{ Math.min(currentPage * itemsPerPage, citasBuscadas.length) }} de
        {{ citasBuscadas.length }} registros
      </div>
      <div class="pagination-buttons">
        <button
          @click="cambiarPagina(1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="pi pi-angle-double-left"></i>
        </button>
        <button
          @click="cambiarPagina(currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="pi pi-angle-left"></i>
        </button>
        <span class="page-numbers">
          <button
            v-for="page in totalPages"
            :key="page"
            @click="cambiarPagina(page)"
            :class="['page-btn', { active: currentPage === page }]"
          >
            {{ page }}
          </button>
        </span>
        <button
          @click="cambiarPagina(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="pi pi-angle-right"></i>
        </button>
        <button
          @click="cambiarPagina(totalPages)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="pi pi-angle-double-right"></i>
        </button>
      </div>
    </div>
    <!-- Mostrar total de precios confirmados -->
    <div class="total-container">
      <p>
        Monto Total de Cobrar:
        <strong>{{ totalCobrar }} Bs.</strong>
      </p>
    </div>
    <!-- Diálogo de confirmación para eliminar -->
    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación"
      :style="{ width: '25rem' }"
    >
      <p>¿Estás seguro de que deseas eliminar esta cita?</p>
      <div class="flex justify-end gap-2">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          @click="mostrarConfirmDialog = false"
        />
        <Button type="button" label="Eliminar" @click="eliminar" />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.citas-container {
  background-color: white;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
}

.search-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  flex: 1;
  min-width: 250px;
}

.search-box i {
  color: #6b7280;
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
}

.items-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.items-control select {
  padding: 0.4rem 0.8rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.citas-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
}

.citas-table th {
  background-color: #240090;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
}

.citas-table th:first-child {
  border-top-left-radius: 8px;
}

.citas-table th:last-child {
  border-top-right-radius: 8px;
}

.citas-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.citas-table tbody tr:hover {
  background-color: #f8fafc;
}

.no-data {
  text-align: center;
  color: #6b7280;
  padding: 2rem !important;
  font-style: italic;
}

.actions-wrapper {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
}

.delete-button {
  color: #dc2626 !important;
}

.delete-button:hover {
  background-color: #f1f5f9 !important;
}

/* Paginación */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  flex-wrap: wrap;
  gap: 1rem;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.9rem;
}

.pagination-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.page-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #240090;
}

.page-btn.active {
  background-color: #240090;
  color: white;
  border-color: #240090;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.total-container {
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  text-align: right;
}

.total-container p {
  font-size: 1.125rem;
  margin: 0;
  color: #1f2937;
}

.total-container strong {
  font-size: 1.5rem;
  color: #240090;
}

/* Estilos para badges */
.estado-badge,
.precio-tag {
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  display: inline-block;
}

.estado-confirmado {
  background-color: #d4edda;
  color: #155724;
}

.estado-pendiente {
  background-color: #fff3cd;
  color: #856404;
}

.estado-rechazado {
  background-color: #f8d7da;
  color: #721c24;
}

.precio-tag {
  background-color: #ecfdf5;
  color: #047857;
}

/* Estilos para filas según estado */
.confirmado {
  background-color: #f1f9f1 !important;
}

.pendiente {
  background-color: #fffbf0 !important;
}

.rechazado {
  background-color: #fef5f5 !important;
}

/* Estilos para fechas */
.fecha-info {
  line-height: 1.4;
}

.fecha-inicio {
  font-size: 0.9rem;
  color: #1f2937;
  font-weight: 500;
}

.hora-fin {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .citas-container {
    padding: 1rem;
    border-radius: 0;
  }

  .actions-wrapper {
    flex-direction: column;
  }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.citas-container {
  animation: fadeIn 0.3s ease-out;
}
</style>
