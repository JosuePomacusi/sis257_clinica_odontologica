<script setup lang="ts">
import type { Especialidad } from '../../models/Odontologo'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'

// --- Definiciones de Tipo ---
// Usamos Omit para asegurar que solo manejamos los datos necesarios para la creación.
type NuevaEspecialidad = Omit<Especialidad, 'id'>

// --- Composición de Vue ---
const toast = useToast()
const isSaving = ref(false) // Controla el estado de guardado (deshabilitar botones, spinner)

// 1. Props y Emits
const props = defineProps({
  // Se usa 'mostrar' para la visibilidad (compatible con el código original)
  mostrar: {
    type: Boolean,
    required: true,
  },
})
const emit = defineEmits<{
  (e: 'guardar'): void // Emitido al guardar exitosamente
  (e: 'update:mostrar', value: boolean): void // Permite usar v-model:mostrar en el padre
}>()

// 2. Estado Reactivo del Formulario
const defaultEspecialidad: NuevaEspecialidad = {
  nombre: '',
  descripcion: '',
}

const especialidad = ref<NuevaEspecialidad>({ ...defaultEspecialidad })

// 3. Propiedad Computada para el Control del Diálogo (v-model)
const dialogVisible = computed({
  get: () => props.mostrar,
  set: (value) => {
    emit('update:mostrar', value)
  },
})

// 4. Lógica de Reinicio del Formulario y Estado
watch(dialogVisible, (visible) => {
  if (!visible) {
    // Resetear el formulario al cerrar el diálogo
    especialidad.value = { ...defaultEspecialidad }
    isSaving.value = false // Asegurar que el estado de guardado se reinicie
  }
})

// 5. Lógica de Validación
function validateForm(): boolean {
  if (!especialidad.value.nombre.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Campo Requerido',
      detail: 'El nombre de la especialidad es obligatorio',
      life: 3000,
    })
    return false
  }
  return true
}

// 6. Lógica de Guardado
async function handleSave() {
  if (!validateForm()) return

  isSaving.value = true // Inicia el estado de guardado

  try {
    const dataToSend = {
      nombre: especialidad.value.nombre.trim(),
      descripcion: especialidad.value.descripcion?.trim() || '',
    }

    await http.post('especialidades', dataToSend)

    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Especialidad "${dataToSend.nombre}" creada correctamente.`,
      life: 3000,
    })

    emit('guardar') // Notifica al padre que se ha guardado
    dialogVisible.value = false // Cierra el diálogo
  } catch (error: any) {
    console.error('Error al guardar la especialidad:', error)
    toast.add({
      severity: 'error',
      summary: 'Error de Creación',
      detail: error?.response?.data?.message || 'No se pudo crear la especialidad. Inténtalo de nuevo.',
      life: 5000, // Aumentamos la vida del mensaje de error
    })
  } finally {
    isSaving.value = false // Finaliza el estado de guardado, incluso si hay error
  }
}

function handleClose() {
  // Función helper para cerrar el diálogo
  dialogVisible.value = false
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    header="Crear Nueva Especialidad"
    :modal="true"
    :closable="!isSaving"
    :draggable="false"
    class="custom-dialog"
    style="width: 500px; max-width: 95vw"
  >
    <form @submit.prevent="handleSave" class="form-container">
      <div class="form-field">
        <label for="nombre" class="form-label">
          <i class="pi pi-heart-fill"></i>
          Nombre de la Especialidad <span class="required-star">*</span>
        </label>
        <InputText
          id="nombre"
          v-model="especialidad.nombre"
          placeholder="Ej: Ortodoncia, Endodoncia, Periodoncia..."
          class="form-input"
          autocomplete="off"
          autofocus
          required
          :disabled="isSaving"
        />
      </div>

      <div class="form-field">
        <label for="descripcion" class="form-label">
          <i class="pi pi-align-left"></i>
          Descripción (Opcional)
        </label>
        <Textarea
          id="descripcion"
          v-model="especialidad.descripcion"
          rows="4"
          placeholder="Describe brevemente esta especialidad"
          class="form-textarea"
          autocomplete="off"
          :disabled="isSaving"
        />
      </div>

      <div class="form-actions">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          class="btn-cancel"
          :disabled="isSaving"
          @click="handleClose"
        />
        <Button
          type="submit"
          :label="isSaving ? 'Guardando...' : 'Crear Especialidad'"
          :icon="isSaving ? 'pi pi-spin pi-spinner' : 'pi pi-check'"
          class="btn-save"
          :disabled="isSaving || !especialidad.nombre.trim()"
        />
      </div>
    </form>
  </Dialog>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS MEJORADOS (Mayor claridad) --- */
/* ------------------------------------------- */

.custom-dialog :deep(.p-dialog-header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
  font-weight: 700;
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
  animation: slideIn 0.3s ease-out; /* Mantenemos la animación */
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #374151; /* Color oscuro para mayor legibilidad (WCAG) */
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #667eea; /* Color de acento en los iconos */
  font-size: 1rem;
}

.required-star {
  color: #ef4444; /* Rojo para el asterisco de requerido */
  font-weight: bold;
  margin-left: 0.25rem;
}

.form-input,
.form-textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #d1d5db; /* Borde más sutil */
  transition: all 0.3s ease;
  padding: 0.75rem 1rem;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0; /* Borde más sutil */
}

.btn-cancel {
  background-color: #f3f4f6 !important;
  color: #4b5563 !important;
  border: none !important;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: #e5e7eb !important;
  transform: translateY(-1px);
}

.btn-save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.4);
}

/* Estado deshabilitado para UX (mejor visibilidad) */
.btn-save[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none !important;
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
</style>