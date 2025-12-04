<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import http from '../../plugins/axios'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import type { Odontologo_tratamiento as Odontologo_tratamiento } from '../../models/Odontologo_tratamiento'
import type { Odontologo } from '../../models/Odontologo'
import type { Tratamiento } from '../../models/Tratamientos'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const props = defineProps({
  mostrar: Boolean,
  relacion: {
    type: Object as () => Odontologo_tratamiento,
    default: () => ({ id: 0, odontologoId: 0, tratamientoId: 0 }),
  },
  modoEdicion: Boolean,
})

const emit = defineEmits(['guardar', 'close'])

// Controlar la visibilidad del diálogo
const dialogVisible = computed({
  get: () => props.mostrar,
  set: value => {
    if (!value) emit('close')
  },
})

// Datos de odontólogos y servicios
const odontologos = ref<Odontologo[]>([])
const tratamientos = ref<Tratamiento[]>([])

// Relación editable
const relacion = ref({
  id: props.relacion.id,
  odontologoId: props.relacion.odontologoId,
  tratamientoId: props.relacion.tratamientoId,
})

// Actualizar `relacion` cuando cambie `props.relacion`
watch(
  () => props.relacion,
  newRelacion => {
    relacion.value = { ...newRelacion }
  },
  { immediate: true },
)

// Cargar odontólogos y servicios
async function cargarDatos() {
  const [odontologoResponse, tratamientoResponse] = await Promise.all([
    http.get('odontologos'),
    http.get('tratamientos'),
  ])
  odontologos.value = odontologoResponse.data
  tratamientos.value = tratamientoResponse.data
}

// Guardar cambios
async function handleEditSave() {
  try {
    if (!relacion.value.odontologoId || !relacion.value.tratamientoId) {
      toast.add({ severity: 'warn', summary: 'Error', detail: 'Debe seleccionar un odontólogo y un tratamiento', life: 3000 });
      return
    }

    // Crear el cuerpo con el id de la relación y el nuevo servicio
    const body = {
      odontologoId: relacion.value.odontologoId, // Este no cambia
      tratamientoId: relacion.value.tratamientoId, // Este sí cambia
    }

    // Enviar el PATCH con el ID de la relación
    await http.patch(`odontologos_tratamientos/${relacion.value.id}`, body)

    // Emitir evento para recargar la lista
    emit('guardar')
    dialogVisible.value = false
  } catch (error: any) {
    console.error(error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error desconocido', life: 3000 });

  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Relación' : 'Crear Nueva Relación'"
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
          <i class="pi pi-user"></i>
          Odontólogo
        </label>
        <Dropdown
          v-model="relacion.odontologoId"
          :options="odontologos"
          :disabled="modoEdicion"
          option-label="nombre"
          option-value="id"
          placeholder="Seleccione un odontólogo"
          class="form-dropdown"
        />
      </div>

      <!-- Tratamiento -->
      <div class="form-field">
        <label class="form-label">
          <i class="pi pi-heart"></i>
          Tratamiento
        </label>
        <Dropdown
          v-model="relacion.tratamientoId"
          :options="tratamientos"
          option-label="nombre"
          option-value="id"
          placeholder="Seleccione un tratamiento"
          class="form-dropdown"
        />
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          class="btn-cancel"
          @click="dialogVisible = false"
        />
        <Button
          label="Guardar"
          icon="pi pi-check"
          class="btn-save"
          @click="handleEditSave"
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
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #667eea;
  font-size: 1rem;
}

.form-dropdown {
  width: 100%;
}

.form-dropdown :deep(.p-dropdown) {
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.form-dropdown :deep(.p-dropdown:hover) {
  border-color: #cbd5e0;
}

.form-dropdown :deep(.p-dropdown:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
