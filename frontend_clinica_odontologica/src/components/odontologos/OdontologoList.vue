<script setup lang="ts">
import type { Odontologo } from '../../models/Odontologo'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import EspecialidadModal from '../especialidades/EspecialidadModal.vue'

// --- Inicialización y Constantes ---
const toast = useToast()
const ENDPOINT = 'odontologos'

// --- Estado Reactivo ---
const odontologos = ref<Odontologo[]>([])
const odontologoDelete = ref<Odontologo | null>(null)
const mostrarConfirmDialog = ref<boolean>(false)
const mostrarModalEspecialidad = ref<boolean>(false)
const isLoading = ref(false) // Nuevo estado para mostrar carga inicial/refrescar
const isDeleting = ref(false) // Nuevo estado para deshabilitar el botón de eliminar

// --- Emits ---
const emit = defineEmits<{
  (e: 'edit', odontologo: Odontologo): void
}>()

// --- Funciones de Lógica ---

/**
 * Obtiene la lista completa de odontólogos desde la API.
 */
async function obtenerLista() {
  isLoading.value = true
  try {
    const response = await http.get(ENDPOINT)
    odontologos.value = response.data || []
  } catch (error) {
    console.error('Error al cargar la lista de odontólogos:', error)
    toast.add({
      severity: 'error',
      summary: 'Error de Carga',
      detail: 'No se pudo obtener el listado de odontólogos.',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

/**
 * Emite el evento 'edit' con los datos del odontólogo.
 * @param odontologo - Odontólogo a editar.
 */
function emitirEdicion(odontologo: Odontologo) {
  emit('edit', odontologo)
}

/**
 * Muestra el diálogo de confirmación para eliminar un odontólogo.
 * @param odontologo - Odontólogo a eliminar.
 */
function mostrarEliminarConfirm(odontologo: Odontologo) {
  odontologoDelete.value = odontologo
  mostrarConfirmDialog.value = true
}

/**
 * Ejecuta la eliminación del odontólogo seleccionado.
 */
async function eliminar() {
  if (!odontologoDelete.value?.id) return

  isDeleting.value = true // Iniciar estado de eliminación

  try {
    await http.delete(`${ENDPOINT}/${odontologoDelete.value.id}`)
    
    toast.add({
      severity: 'success',
      summary: 'Odontólogo Eliminado',
      detail: `El registro de ${odontologoDelete.value.nombre} ha sido eliminado.`,
      life: 3000
    })
    
    // 1. Recargar la lista y 2. Cerrar diálogo
    await obtenerLista()
    mostrarConfirmDialog.value = false

  } catch (error) {
    console.error('Error al eliminar odontólogo:', error)
    toast.add({
      severity: 'error',
      summary: 'Error al Eliminar',
      detail: 'No se pudo eliminar el registro. Verifique dependencias.',
      life: 5000
    })
  } finally {
    isDeleting.value = false // Finalizar estado de eliminación
    odontologoDelete.value = null // Limpiar la referencia
  }
}

// --- Funciones del Modal de Especialidad ---

function abrirModalEspecialidad() {
  mostrarModalEspecialidad.value = true
}

function cerrarModalEspecialidad() {
  mostrarModalEspecialidad.value = false
}

/**
 * Se llama cuando se guarda una especialidad. Recarga la lista de odontólogos.
 */
function especialidadGuardada() {
  obtenerLista()
  // No es necesario cerrar el modal aquí si el modal ya se encarga de emitir 'close' o si simplemente se actualiza la lista.
  // Si el modal EMITE 'close', esta función solo necesita obtenerLista().
  // Si el modal NO EMITE 'close', se cerraría con: mostrarModalEspecialidad.value = false.
  // Usamos 'cerrarModalEspecialidad' para asegurar que el estado se actualice.
  cerrarModalEspecialidad(); 
}

// --- Lifecycle ---
onMounted(() => {
  obtenerLista()
})

defineExpose({ obtenerLista })
</script>

<template>
  <EspecialidadModal
    :mostrar="mostrarModalEspecialidad"
    @guardar="especialidadGuardada"
    @close="cerrarModalEspecialidad"
  />
  
  <div class="dentists-container">
    <div class="table-wrapper">
      <table class="dentists-table">
        <thead>
          <tr>
            <th class="th-number">Nro.</th>
            <th class="th-photo">Foto</th>
            <th>Nombre Completo</th> <th class="hidden-mobile">Primer Apellido</th>
            <th class="hidden-mobile">Segundo Apellido</th>
            <th>Especialidad</th>
            <th class="hidden-mobile">Correo</th>
            <th class="hidden-mobile">Teléfono</th>
            <th class="th-actions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td :colspan="9" class="loading-state">
              <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem; color: #240090;"></i>
              <p>Cargando lista de odontólogos...</p>
            </td>
          </tr>
          <tr v-else-if="odontologos.length === 0">
            <td :colspan="9" class="empty-state">
              <i class="pi pi-info-circle" style="font-size: 1.5rem; color: #6b7280;"></i>
              <p>No se encontraron registros de odontólogos.</p>
            </td>
          </tr>
          
          <tr v-for="(odontologo, index) in odontologos" :key="odontologo.id">
            <td class="td-number">{{ index + 1 }}</td>
            <td class="td-photo">
              <div class="photo-container">
                <img 
                  v-if="odontologo.imagen" 
                  :src="odontologo.imagen" 
                  :alt="`Foto de ${odontologo.nombre}`"
                  class="dentist-photo"
                />
                <div v-else class="photo-placeholder">
                  <i class="pi pi-user"></i>
                </div>
              </div>
            </td>
            <td>
              {{ odontologo.nombre }}
              <span class="visible-mobile text-small">
                {{ odontologo.primerApellido }} {{ odontologo.segundoApellido }}
              </span>
            </td>
            <td class="hidden-mobile">{{ odontologo.primerApellido }}</td>
            <td class="hidden-mobile">{{ odontologo.segundoApellido }}</td>
            <td>
              <span class="specialty-tag">
                {{ odontologo.especialidad?.nombre || 'Sin asignar' }}
              </span>
            </td>
            <td class="hidden-mobile">{{ odontologo.email }}</td>
            <td class="hidden-mobile">{{ odontologo.telefono }}</td>
            <td class="actions-column">
              <div class="actions-wrapper">
                <Button 
                  icon="pi pi-pencil" 
                  aria-label="Editar" 
                  text 
                  class="edit-button p-button-rounded"
                  @click="emitirEdicion(odontologo)" 
                  :disabled="isDeleting"
                />
                <Button 
                  icon="pi pi-trash" 
                  aria-label="Eliminar" 
                  text 
                  class="delete-button p-button-rounded"
                  @click="mostrarEliminarConfirm(odontologo)" 
                  :disabled="isDeleting"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Dialog 
      v-model:visible="mostrarConfirmDialog" 
      header="Confirmar Eliminación" 
      :style="{ width: '400px' }" 
      modal
      :closable="!isDeleting" 
      class="delete-dialog"
    >
      <div class="dialog-content">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #ff9800;"></i>
        <p>
          ¿Estás seguro de que deseas eliminar el registro del odontólogo 
          <strong v-if="odontologoDelete">{{ odontologoDelete.nombre }} {{ odontologoDelete.primerApellido }}</strong>? 
          Esta acción es irreversible.
        </p>
      </div>
      <div class="dialog-footer">
        <Button 
          label="Cancelar" 
          class="p-button-text cancel-button" 
          @click="mostrarConfirmDialog = false" 
          :disabled="isDeleting"
        />
        <Button 
          :label="isDeleting ? 'Eliminando...' : 'Eliminar'" 
          :icon="isDeleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'"
          class="p-button-danger confirm-delete-button" 
          @click="eliminar" 
          :disabled="isDeleting"
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS REFINADOS --- */
/* ------------------------------------------- */

.dentists-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08); /* Sombra más definida */
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
  max-height: calc(100vh - 300px);
}

.dentists-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
}

/* Encabezados */
.dentists-table th {
  background-color: #240090;
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 700; /* Más audaz */
  position: sticky;
  top: 0;
  z-index: 10;
}

.th-number { width: 60px; }
.th-photo { width: 70px; }
.th-actions { width: 100px; }

/* Cuerpo de la Tabla */
.dentists-table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  transition: background-color 0.2s;
  vertical-align: middle;
}

.td-number {
  color: #6b7280;
  font-weight: 600;
}

.dentists-table tbody tr:hover {
  background-color: #f3f4f6; /* Cambio de color al pasar el mouse */
}

/* Celdas de Foto */
.td-photo { padding: 0.5rem !important; }

.photo-container {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 2px solid #667eea; /* Borde de acento */
}

.dentist-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  background-color: #e5e7eb;
  color: #9ca3af;
  font-size: 1.2rem;
}

/* Tag de Especialidad */
.specialty-tag {
  background-color: #e0f2fe; /* Azul claro */
  color: #0b99e4; /* Azul */
  padding: 0.3rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem; /* Más pequeño para mejor fit */
  font-weight: 600;
}

/* Acciones */
.actions-column { padding: 0.5rem !important; }

.actions-wrapper {
  display: flex;
  gap: 0.2rem; /* Espaciado ajustado */
  justify-content: center;
}

.edit-button { color: #059669 !important; } /* Verde más fuerte */
.delete-button { color: #ef4444 !important; } /* Rojo más fuerte */

.edit-button:hover,
.delete-button:hover {
  background-color: #e5e7eb !important;
}

/* Diálogo de Eliminación */
.delete-dialog :deep(.p-dialog-header) {
    border-bottom: none;
}
.dialog-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 0;
  text-align: left;
}
.dialog-content i {
  color: #f97316; /* Naranja */
}
.dialog-footer {
  /* Mantener estilos originales */
}
.confirm-delete-button {
    background-color: #ef4444 !important;
    border-color: #ef4444 !important;
}

/* Mensajes de Estado (Carga/Vacío) */
.loading-state, .empty-state {
  text-align: center;
  padding: 2rem;
  font-weight: 500;
  color: #4b5563;
  gap: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: italic;
}

/* Responsive */

.visible-mobile { display: none; }
.text-small { font-size: 0.8rem; color: #6b7280; display: block; }

@media (max-width: 768px) {
  .dentists-container { border-radius: 0; }
  .table-wrapper { max-height: calc(100vh - 200px); }
  .dentists-table { min-width: auto; } /* Permitir que la tabla se ajuste al 100% del contenedor si es posible */
  
  /* Ocultar columnas menos críticas en móvil */
  .hidden-mobile { display: none; }
  
  /* Mostrar apellidos en móvil */
  .visible-mobile { display: inline; }

  /* Reducir padding en móvil */
  .dentists-table th, .dentists-table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>