<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import http from '../../plugins/axios'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores' // Store para autenticación
import type { Tratamiento } from '@/models/Tratamientos'
import type { Odontologo_tratamiento } from '@/models/Odontologo_tratamiento'

// Obtener el odontólogo autenticado
const authStore = useAuthStore()
const toast = useToast()
const odontologoLogueado = computed(() => authStore.user)

// --- Estados Reactivos ---
const tratamientos = ref<Tratamiento[]>([]) // Servicios disponibles (no asignados)
const tratamientosAsignados = ref<number[]>([]) // IDs de servicios ya asignados
const tratamientosSeleccionados = ref<number[]>([]) // IDs de servicios seleccionados a asignar
const isLoading = ref(false) // Estado para carga de datos iniciales
const isSaving = ref(false) // Estado para el botón de guardar

// Props y eventos
const props = defineProps({
  mostrar: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

// Reiniciar el formulario
function resetFormulario() {
  tratamientosSeleccionados.value = [] // Limpia los servicios seleccionados
  tratamientos.value = [] // Opcional: limpiar la lista, se recarga al abrir
  tratamientosAsignados.value = [] // Limpiar IDs asignados
  isSaving.value = false // Resetear estado de guardado
  isLoading.value = false // Resetear estado de carga
}

// Cargar servicios ya asignados al odontólogo autenticado (IDs)
async function cargarTratamietosAsignados() {
  if (!odontologoLogueado.value?.id) return

  try {
    const response = await http.get('odontologos_tratamientos/mis-tratamientos-relaciones')
    // Mapeamos solo el ID del tratamiento
    tratamientosAsignados.value = response.data.map(
      (item: Odontologo_tratamiento) => item.tratamientoId,
    )
  } catch (error) {
    console.error('Error al cargar tratamientos asignados:', error)
    toast.add({
      severity: 'error',
      summary: 'Error de Asignados',
      detail: 'Hubo un problema al cargar los tratamientos que ya tiene.',
      life: 3000,
    })
  }
}

// Cargar y filtrar servicios disponibles
async function cargarTratamientosDisponibles() {
  try {
    // Obtener todos los tratamientos
    const response = await http.get('tratamientos')
    const todos = response.data as Tratamiento[]
    
    // Filtrar aquellos que NO están en la lista de asignados
    const asignadosSet = new Set<number>(tratamientosAsignados.value || [])
    tratamientos.value = todos.filter(t => !asignadosSet.has(t.id))
  } catch (error) {
    console.error('Error al cargar tratamientos disponibles:', error)
    toast.add({
      severity: 'error',
      summary: 'Error de Disponibles',
      detail: 'Hubo un problema al cargar la lista de tratamientos disponibles.',
      life: 3000,
    })
  }
}

// Función unificada de carga
async function cargarDatos() {
  if (!odontologoLogueado.value?.id) return

  isLoading.value = true
  try {
    // La secuencia es clave: Asignados -> Disponibles
    await cargarTratamietosAsignados()
    await cargarTratamientosDisponibles()
  } finally {
    isLoading.value = false
  }
}


// Computed para el estado del diálogo (mejor manejo del v-model)
const dialogVisible = computed({
  get: () => props.mostrar,
  set: async value => {
    emit('update:mostrar', value)
    if (!value) {
      resetFormulario() // Limpia el formulario al cerrar
    } else {
      // Recarga los servicios disponibles y asignados al abrir el diálogo
      await cargarDatos()
    }
  },
})

// Guardar relaciones
async function handleSave() {
  if (tratamientosSeleccionados.value.length === 0) {
    toast.add({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'Debe seleccionar al menos un tratamiento.',
      life: 3000,
    })
    return
  }

  isSaving.value = true // Iniciar estado de guardado

  try {
    const odontologoId = odontologoLogueado.value?.id ?? 0
    if (odontologoId === 0) {
        throw new Error('Odontólogo no autenticado. ID es 0.')
    }

    // Usar Promise.all para enviar todas las peticiones en paralelo
    const promises = tratamientosSeleccionados.value.map(tratamientoId =>
      http.post('odontologos_tratamientos', {
        odontologoId: odontologoId,
        tratamientoId: tratamientoId,
      }),
    )

    await Promise.all(promises)

    // Recargar datos y notificar éxito
    await cargarDatos() // Recarga ambas listas para reflejar el cambio en el modal
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Tratamientos añadidos correctamente.',
      life: 3000,
    })
    
    emit('guardar') // Evento para que el padre recargue la lista de tratamientos asignados
    dialogVisible.value = false // Cierra el diálogo a través del computed setter

  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || 'Error desconocido al guardar las relaciones.'
    console.error('Error al guardar relaciones:', errorMessage)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Hubo un problema: ${errorMessage}`,
      life: 5000,
    })
  } finally {
    isSaving.value = false
  }
}

// Escuchar el evento global de servicio eliminado o creado (para recargar las listas)
const onGlobalTratamientoChange = async () => {
    if (props.mostrar) {
        // Solo recargar si el modal está abierto, si no, se recarga automáticamente al abrir.
        await cargarDatos()
    }
}

// --- Lifecycle Hooks ---
onMounted(() => {
  window.addEventListener('tratamientoEliminado', onGlobalTratamientoChange)
  window.addEventListener('tratamientoCreado', onGlobalTratamientoChange)
  // La carga inicial al montar solo es necesaria si el modal está abierto por defecto, 
  // pero el setter del computed ya maneja la carga cuando `mostrar` cambia a true.
})

onBeforeUnmount(() => {
  window.removeEventListener('tratamientoEliminado', onGlobalTratamientoChange)
  window.removeEventListener('tratamientoCreado', onGlobalTratamientoChange)
})

</script>

<template>
  <Dialog 
    v-model:visible="dialogVisible" 
    header="Relacionar Tratamientos" 
    :modal="true"
    :closable="!isSaving"
    :draggable="false"
    class="custom-dialog"
    style="width: 550px; max-width: 95vw"
  >
    <div class="form-container">
      <div class="form-field">
        <label class="form-label">
          <i class="pi pi-user-edit"></i>
          Odontólogo Logueado
        </label>
        <div v-if="odontologoLogueado" class="odontologo-info">
          <div class="info-item">
            <i class="pi pi-user"></i>
            <span>{{ odontologoLogueado.name || 'Nombre no disponible' }}</span>
          </div>
          <div class="info-item">
            <i class="pi pi-envelope"></i>
            <span>{{ odontologoLogueado.email || 'Email no disponible' }}</span>
          </div>
        </div>
        <div v-else class="alert-error">
          <i class="pi pi-exclamation-circle"></i>
          Odontólogo no autenticado. No se puede asignar.
        </div>
      </div>

      <div class="form-field">
        <label class="form-label">
          <i class="pi pi-list"></i>
          Tratamientos Disponibles
        </label>

        <div v-if="isLoading" class="tratamientos-list loading-state">
            <i class="pi pi-spin pi-spinner" style="font-size: 1.5rem; color: #667eea;"></i>
            <p>Cargando lista de tratamientos...</p>
        </div>

        <div v-else-if="tratamientos.length" class="tratamientos-list">
          <div 
            v-for="tratamiento in tratamientos" 
            :key="tratamiento.id" 
            class="tratamiento-item"
            @click="
              // Permitir seleccionar haciendo clic en todo el item
              (tratamientosSeleccionados.includes(tratamiento.id)) 
                ? tratamientosSeleccionados = tratamientosSeleccionados.filter(id => id !== tratamiento.id) 
                : tratamientosSeleccionados.push(tratamiento.id)
            "
          >
            <Checkbox 
              v-model="tratamientosSeleccionados" 
              :value="tratamiento.id" 
              :input-id="'tratamiento-' + tratamiento.id"
              :disabled="isSaving"
            />
            <label :for="'tratamiento-' + tratamiento.id" class="tratamiento-label">
              {{ tratamiento.nombre }}
            </label>
            <span class="tratamiento-price">({{ tratamiento.precio }} Bs.)</span>
          </div>
        </div>
        
        <div v-else class="alert-warning">
          <i class="pi pi-info-circle"></i>
          No hay tratamientos disponibles para asignar. Todos ya están en su lista.
        </div>
      </div>

      <div class="form-actions">
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          severity="secondary" 
          class="btn-cancel"
          :disabled="isSaving"
          @click="dialogVisible = false" 
        />
        <Button 
          :label="isSaving ? 'Guardando...' : 'Guardar'" 
          :icon="isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-check'" 
          class="btn-save"
          :disabled="isSaving || tratamientosSeleccionados.length === 0 || !odontologoLogueado"
          @click="handleSave" 
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS REFINADOS --- */
/* ------------------------------------------- */

.custom-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
  font-weight: 700;
}

.custom-dialog :deep(.p-dialog-content) {
  padding: 2rem;
  background-color: #f8f9fa;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: slideIn 0.3s ease-out;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-weight: 700;
  color: #4b5563; /* Color oscuro para accesibilidad */
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #667eea;
  font-size: 1.1rem;
}

/* Info del Odontólogo */
.odontologo-info {
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4a5568;
  font-weight: 500;
  font-size: 0.9rem;
}

.info-item i {
  color: #764ba2;
  font-size: 1.1rem;
}

/* Lista de Tratamientos */
.tratamientos-list {
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  max-height: 300px;
  min-height: 100px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.loading-state {
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #667eea;
    font-weight: 600;
}

.tratamiento-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-bottom: 1px dashed #f0f0f0;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.tratamiento-item:last-child {
    border-bottom: none;
}

.tratamiento-item:hover {
  background-color: #f3f4f6;
}

.tratamiento-label {
  flex: 1;
  color: #2d3748;
  font-weight: 600;
  cursor: pointer;
}

.tratamiento-price {
    font-size: 0.85rem;
    color: #6b7280;
    font-style: italic;
}

/* Alertas */
.alert-error,
.alert-warning {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.alert-error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}

.alert-warning {
  background-color: #fffbeb;
  color: #d97706;
  border: 1px solid #fcd34d;
}

.alert-error i,
.alert-warning i {
  font-size: 1.2rem;
}

/* Acciones y Botones */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.btn-cancel {
  background-color: #e2e8f0 !important;
  color: #4a5568 !important;
  border: none !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: #cbd5e0 !important;
  transform: translateY(-1px);
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none !important;
}

/* Scrollbar personalizada (mantener) */
.tratamientos-list::-webkit-scrollbar {
  width: 8px;
}

.tratamientos-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.tratamientos-list::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.tratamientos-list::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}

/* Responsive (mantener) */
@media (max-width: 768px) {
  .custom-dialog :deep(.p-dialog-content) {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-save {
    width: 100%;
  }
}
</style>