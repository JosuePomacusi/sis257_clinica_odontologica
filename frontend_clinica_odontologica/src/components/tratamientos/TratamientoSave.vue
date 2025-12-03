<script setup lang="ts">

import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { computed, ref, watch } from 'vue'
import { Textarea } from 'primevue'
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast'
import type { Tratamiento } from '@/models/Tratamientos'

const toast = useToast()
const ENDPOINT = 'tratamientos'
const props = defineProps({
  mostrar: Boolean,
  tratamiento: {
    type: Object as () => Tratamiento,
    default: () => ({}) as Tratamiento,
  },
  modoEdicion: Boolean,
})
const emit = defineEmits(['guardar', 'close'])

const dialogVisible = computed({
  get: () => props.mostrar,
  set: value => {
    if (!value) emit('close')
  },
})

const tratamiento = ref<Tratamiento>({ ...props.tratamiento })
watch(
  () => props.mostrar,
  newVal => {
    if (newVal) {
      tratamiento.value = props.modoEdicion
        ? {
          ...props.tratamiento,
          precio: Math.round(props.tratamiento.precio * 100) / 100,
        }
        : ({
          nombre: '',
          descripcion: '',
          precio: 0,
          duracion: 0,
        } as Tratamiento)
    }
  },
)

async function handleSave() {
  try {
    const body = {
      nombre: tratamiento.value.nombre,
      descripcion: tratamiento.value.descripcion,
      precio: tratamiento.value.precio,
      duracion: tratamiento.value.duracion,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${tratamiento.value.id}`, body)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Tratamiento actualizado correctamente.', life: 3000 });
    } else {
      await http.post(ENDPOINT, body)
      toast.add({ severity: 'success', summary: 'Éxito', detail: 'Tratamiento creado correctamente.', life: 3000 });
    }
    // Emitir evento global de servicio creado 
    const event = new CustomEvent('tratamientoCreado')
    window.dispatchEvent(event)


    emit('guardar')
    tratamiento.value = {} as Tratamiento
    dialogVisible.value = false
  } catch (error: any) {
    console.error('Error al guardar el servicio:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el servicio.', life: 3000 })
  }
}
</script>

<template>
  <Toast />
  <div class="card flex justify-center">
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="props.modoEdicion ? 'Editar Tratamiento' : 'Crear Nuevo Tratamiento'" 
      :modal="true"
      :closable="true"
      :draggable="false"
      class="custom-dialog"
      style="width: 550px; max-width: 95vw"
    >
      <div class="form-container">
        <!-- Nombre del Servicio -->
        <div class="form-field">
          <label for="nombre" class="form-label">
            <i class="pi pi-tag"></i>
            Nombre del Servicio
          </label>
          <InputText 
            id="nombre" 
            v-model="tratamiento.nombre" 
            placeholder="Ej: Limpieza dental, Ortodoncia, etc."
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
            v-model="tratamiento.descripcion" 
            placeholder="Describe el tratamiento..."
            autoResize 
            rows="4" 
            class="form-textarea"
            autocomplete="off" 
          />
        </div>

        <!-- Precio y Duración en Grid -->
        <div class="form-grid">
          <!-- Precio -->
          <div class="form-field">
            <label for="precio" class="form-label">
              <i class="pi pi-money-bill"></i>
              Precio (Bs)
            </label>
            <InputNumber 
              id="precio" 
              v-model="tratamiento.precio" 
              placeholder="0.00"
              class="form-input" 
              autocomplete="off"
              :step="0.01" 
              :min="0" 
              :mode="'decimal'" 
              :locale="'es-BO'" 
              :minFractionDigits="2"
              :maxFractionDigits="2"
            />
          </div>

          <!-- Duración -->
          <div class="form-field">
            <label for="duracion" class="form-label">
              <i class="pi pi-clock"></i>
              Duración (Min)
            </label>
            <InputNumber 
              id="duracion" 
              v-model="tratamiento.duracion" 
              placeholder="30"
              class="form-input" 
              autocomplete="off"
              :step="5" 
              :min="0" 
            />
          </div>
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
            label="Guardar" 
            icon="pi pi-check" 
            class="btn-save"
            @click="handleSave" 
          />
        </div>
      </div>
    </Dialog>
  </div>
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
  color: #e3edff;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #dee3fa;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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
  .form-grid {
    grid-template-columns: 1fr;
  }

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
