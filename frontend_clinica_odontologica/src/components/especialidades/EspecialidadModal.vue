<script setup lang="ts">
import type { Especialidad } from '../../models/Odontologo'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'

const toast = useToast()

const props = defineProps({
  mostrar: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: value => {
    if (!value) emit('close')
  },
})

const especialidad = ref<Partial<Especialidad>>({
  nombre: '',
  descripcion: '',
})

watch(dialogVisible, visible => {
  if (!visible) {
    especialidad.value = { nombre: '', descripcion: '' }
  }
})

async function handleSave() {
  try {
    if (!especialidad.value.nombre?.trim()) {
      toast.add({
        severity: 'warn',
        summary: 'Campo requerido',
        detail: 'El nombre de la especialidad es obligatorio',
        life: 3000,
      })
      return
    }

    await http.post('especialidades', {
      nombre: especialidad.value.nombre,
      descripcion: especialidad.value.descripcion || '',
    })

    toast.add({
      severity: 'success',
      summary: 'Especialidad Creada',
      detail: 'La especialidad se ha creado correctamente',
      life: 3000,
    })

    emit('guardar')
    especialidad.value = { nombre: '', descripcion: '' }
    dialogVisible.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error?.response?.data?.message || 'No se pudo crear la especialidad',
      life: 3000,
    })
  }
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    header="Nueva Especialidad"
    :modal="true"
    :closable="true"
    :draggable="false"
    class="custom-dialog"
    style="width: 500px; max-width: 95vw"
  >
    <div class="form-container">
      <!-- Nombre -->
      <div class="form-field">
        <label for="nombre" class="form-label">
          <i class="pi pi-heart-fill"></i>
          Nombre de la Especialidad *
        </label>
        <InputText
          id="nombre"
          v-model="especialidad.nombre"
          placeholder="Ej: Ortodoncia, Endodoncia, Periodoncia..."
          class="form-input"
          autocomplete="off"
          autofocus
        />
      </div>

      <!-- Descripción -->
      <div class="form-field">
        <label for="descripcion" class="form-label">
          <i class="pi pi-align-left"></i>
          Descripción
        </label>
        <Textarea
          id="descripcion"
          v-model="especialidad.descripcion"
          rows="4"
          placeholder="Describe brevemente esta especialidad (opcional)"
          class="form-textarea"
          autocomplete="off"
        />
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <Button
          type="button"
          label="Cancelar"
          icon="pi pi-times"
          severity="secondary"
          class="btn-cancel"
          @click="dialogVisible = false"
        />
        <Button
          type="button"
          label="Crear Especialidad"
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
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #bac1cd;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #b6baca;
  font-size: 1rem;
}

.form-input,
.form-textarea {
  width: 100%;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:hover,
.form-textarea:hover {
  border-color: #cbd5e0;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  padding: 0.75rem;
  font-family: inherit;
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
