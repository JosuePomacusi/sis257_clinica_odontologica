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
const odontologoLogueado = computed(() => authStore.user)

// Inicializar Toast
const toast = useToast()

// Props y eventos
const props = defineProps({
  mostrar: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

// Estado reactivo
const tratamientos = ref<Tratamiento[]>([]) // Servicios disponibles (no asignados)
const tratamientosAsignados = ref<number[]>([]) // IDs de servicios ya asignados
const tratamientosSeleccionados = ref<number[]>([]) // IDs de servicios seleccionados

// Computed para el estado del diálogo
const dialogVisible = computed({
  get: () => props.mostrar,
  set: async value => {
    if (!value) {
      resetFormulario() // Limpia el formulario al cerrar
      emit('close')
    } else {
      // Recarga los servicios disponibles y asignados al abrir el diálogo
      if (odontologoLogueado.value?.id) {
        // primero cargar los asignados y luego los disponibles (para filtrar correctamente)
        await cargarTratamietosAsignados()
        await cargarTratamientosDisponibles()
      }
    }
  },
})

// Reiniciar el formulario
function resetFormulario() {
  tratamientosSeleccionados.value = [] // Limpia los servicios seleccionados
}

// Cargar servicios disponibles
async function cargarTratamientosDisponibles() {
  try {
    // Obtener todos los tratamientos y filtrar los que ya están asignados
    const response = await http.get('tratamientos')
    const todos = response.data as Tratamiento[]
    const asignadosSet = new Set<number>(tratamientosAsignados.value || [])
    tratamientos.value = todos.filter(t => !asignadosSet.has(t.id))
  } catch (error) {
    console.error('Error al cargar tratamientos disponibles:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Hubo un problema al cargar los tratamientos disponibles.',
      life: 3000,
    })
  }
}

// Cargar servicios ya asignados al odontólogo autenticado
async function cargarTratamietosAsignados() {
  if (!odontologoLogueado.value?.id) return

  try {
    const response = await http.get('odontologos_tratamientos/mis-tratamientos-relaciones')
    tratamientosAsignados.value = response.data.map(
      (item: Odontologo_tratamiento) => item.tratamientoId,
    )
  } catch (error) {
    console.error('Error al cargar tratamientos asignados:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Hubo un problema al cargar los tratamientos asignados.',
      life: 3000,
    })
  }
}

// Guardar relaciones
async function handleSave() {
  try {
    if (tratamientosSeleccionados.value.length === 0) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar al menos un tratamieto.',
        life: 3000,
      })
      return
    }

    // Crear relaciones para cada servicio seleccionado
    await Promise.all(
      tratamientosSeleccionados.value.map(tratamientoId =>
        http.post('odontologos_tratamientos', {
          odontologoId: odontologoLogueado.value?.id ?? 0,
          tratamientoId: tratamientoId,
        }),
      ),
    )

    // Actualizar primero los asignados y luego los disponibles
    await cargarTratamietosAsignados()
    await cargarTratamientosDisponibles()

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Tratamientos añadido correctamente.',
      life: 3000,
    })
    emit('guardar')
    emit('close')
    dialogVisible.value = false
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Error desconocido'
    console.error('Error al guardar relaciones:', errorMessage)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: `Hubo un problema al guardar las relaciones: ${errorMessage}`,
      life: 3000,
    })
  }
}

// Escuchar el evento global de servicio eliminado
const onTratamientoEliminado = async () => {
  await cargarTratamietosAsignados()
  await cargarTratamientosDisponibles()
}
// Cargar servicios disponibles y asignados al odontólogo al montar el componente
onMounted(() => {
  window.addEventListener('tratamientoEliminado', onTratamientoEliminado)
  window.addEventListener('tratamientoCreado', onTratamientoEliminado)
})
// Limpiar los eventos al desmontar el componente
onBeforeUnmount(() => {
  window.removeEventListener('tratamientoEliminado', onTratamientoEliminado)
  window.removeEventListener('tratamientoCreado', onTratamientoEliminado)
})

// Montar datos iniciales
onMounted(async () => {
  if (odontologoLogueado.value?.id) {
    // Cargar primero los asignados y luego los disponibles
    await cargarTratamietosAsignados()
    await cargarTratamientosDisponibles()
  }
})

</script>

<template>
  <Dialog 
    v-model:visible="dialogVisible" 
    header="Relacionar Tratamientos" 
    :modal="true"
    :closable="true"
    :draggable="false"
    class="custom-dialog"
    style="width: 550px; max-width: 95vw"
  >
    <div class="form-container">
      <!-- Odontólogo -->
      <div class="form-field">
        <label class="form-label">
          <i class="pi pi-user-edit"></i>
          Odontólogo
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
          Odontólogo no autenticado
        </div>
      </div>

      <!-- Tratamientos -->
      <div class="form-field">
        <label class="form-label">
          <i class="pi pi-list"></i>
          Tratamientos Disponibles
        </label>
        <div v-if="tratamientos.length" class="tratamientos-list">
          <div 
            v-for="tratamiento in tratamientos" 
            :key="tratamiento.id" 
            class="tratamiento-item"
          >
            <Checkbox 
              v-model="tratamientosSeleccionados" 
              :value="tratamiento.id" 
              :input-id="'tratamiento-' + tratamiento.id"
            />
            <label :for="'tratamiento-' + tratamiento.id" class="tratamiento-label">
              {{ tratamiento.nombre }}
            </label>
          </div>
        </div>
        <div v-else class="alert-warning">
          <i class="pi pi-info-circle"></i>
          No hay tratamientos disponibles para asignar
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <Button 
          label="Cancelar" 
          icon="pi pi-times" 
          severity="secondary" 
          class="btn-cancel"
          @click="$emit('close')" 
        />
        <Button 
          label="Guardar" 
          icon="pi pi-check" 
          class="btn-save"
          @click="handleSave" 
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.custom-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
}

.custom-dialog :deep(.p-dialog-header-icon) {
  color: white;
}

.custom-dialog :deep(.p-dialog-header-icon):hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.custom-dialog :deep(.p-dialog-content) {
  padding: 2rem;
  background-color: #f8f9fa;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-weight: 600;
  color: #bdc3ce;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #b4b9d1;
  font-size: 1rem;
}

.odontologo-info {
  background-color: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #4a5568;
  font-weight: 500;
}

.info-item i {
  color: #667eea;
  font-size: 1.1rem;
}

.tratamientos-list {
  background-color: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tratamiento-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tratamiento-item:hover {
  background-color: #f7fafc;
}

.tratamiento-label {
  flex: 1;
  color: #2d3748;
  font-weight: 500;
  cursor: pointer;
}

.alert-error,
.alert-warning {
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.alert-error {
  background-color: #fee;
  color: #c53030;
  border: 2px solid #fc8181;
}

.alert-warning {
  background-color: #fffbeb;
  color: #b7791f;
  border: 2px solid #fbd38d;
}

.alert-error i,
.alert-warning i {
  font-size: 1.2rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
}

.btn-cancel {
  background-color: #e2e8f0 !important;
  color: #4a5568 !important;
  border: none !important;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: #cbd5e0 !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Scrollbar personalizada */
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

/* Responsive */
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

/* Animaciones */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-container {
  animation: slideIn 0.3s ease-out;
}
</style>
