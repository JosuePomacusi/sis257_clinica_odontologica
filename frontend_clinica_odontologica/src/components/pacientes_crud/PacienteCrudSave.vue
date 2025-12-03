<script setup lang="ts">
import Password from 'primevue/password'

import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'
import type { Paciente } from '@/models/Paciente'

const toast = useToast()
const ENDPOINT = 'pacientes'
const props = defineProps({
  mostrar: Boolean,
  paciente: {
    type: Object as () => Paciente,
    default: () => ({}) as Paciente,
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

const paciente = ref<Paciente>({ ...props.paciente })
watch(
  () => props.paciente,
  newVal => {
    paciente.value = { ...newVal }
  },
)

async function handleSave() {
  try {
    const body = {
      nombre: paciente.value.nombre,
      primerApellido: paciente.value.primerApellido,
      segundoApellido: paciente.value.segundoApellido,
      email: paciente.value.email,
      password: paciente.value.password,
      telefono: paciente.value.telefono,
      direccion: paciente.value.direccion,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${paciente.value.id}`, body)
      toast.add({
        severity: 'success',
        summary: 'Paciente actualizado',
        detail: 'Los datos del paciente se han actualizado correctamente',
        life: 3000,
      })
    } else {
      await http.post(ENDPOINT, body)
      toast.add({
        severity: 'success',
        summary: 'Paciente creado',
        detail: 'El paciente se ha creado correctamente',
        life: 3000,
      })
    }
    emit('guardar')
    paciente.value = {} as Paciente
    dialogVisible.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error?.response?.data?.message ||
        'Ocurrió un error al procesar la solicitud',
      life: 5000,
    })
  }
}
</script>

<template>
  <Toast />
  <div class="card flex justify-center">
    <Dialog
      v-model:visible="dialogVisible"
      :modal="true"
      :closable="true"
      :draggable="false"
      class="custom-dialog"
      style="width: 600px; max-width: 95vw"
    >
      <template #header>
        <span class="dialog-header-text">
          {{ props.modoEdicion ? 'Editar Paciente' : 'Crear Nuevo Paciente' }}
        </span>
      </template>

      <div class="form-container">
        <!-- Información Personal -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="pi pi-user"></i>
            Información Personal
          </h3>

          <div class="form-grid-3">
            <!-- Nombre -->
            <div class="form-field">
              <label for="nombre" class="form-label">
                <i class="pi pi-user"></i>
                Nombre
              </label>
              <InputText
                id="nombre"
                v-model="paciente.nombre"
                placeholder="Ingrese el nombre"
                class="form-input"
                autocomplete="off"
                autofocus
              />
            </div>

            <!-- Primer Apellido -->
            <div class="form-field">
              <label for="primer_apellido" class="form-label">
                Primer Apellido
              </label>
              <InputText
                id="primer_apellido"
                v-model="paciente.primerApellido"
                placeholder="Primer apellido"
                class="form-input"
                autocomplete="off"
              />
            </div>

            <!-- Segundo Apellido -->
            <div class="form-field">
              <label for="segundo_apellido" class="form-label">
                Segundo Apellido
              </label>
              <InputText
                id="segundo_apellido"
                v-model="paciente.segundoApellido"
                placeholder="Segundo apellido"
                class="form-input"
                autocomplete="off"
              />
            </div>
          </div>
        </div>

        <!-- Información de Contacto -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="pi pi-phone"></i>
            Información de Contacto
          </h3>

          <div class="form-grid-2">
            <!-- Correo -->
            <div class="form-field">
              <label for="email" class="form-label">
                <i class="pi pi-envelope"></i>
                Correo
              </label>
              <InputText
                id="email"
                v-model="paciente.email"
                placeholder="ejemplo@correo.com"
                class="form-input"
                autocomplete="off"
              />
            </div>

            <!-- Teléfono -->
            <div class="form-field">
              <label for="telefono" class="form-label">
                <i class="pi pi-phone"></i>
                Teléfono
              </label>
              <InputText
                id="telefono"
                v-model="paciente.telefono"
                placeholder="+591 12345678"
                class="form-input"
                autocomplete="off"
              />
            </div>
          </div>

          <!-- Dirección -->
          <div class="form-field">
            <label for="direccion" class="form-label">
              <i class="pi pi-map-marker"></i>
              Dirección
            </label>
            <InputText
              id="direccion"
              v-model="paciente.direccion"
              placeholder="Ingrese la dirección"
              class="form-input"
              autocomplete="off"
            />
          </div>
        </div>

        <!-- Contraseña -->
        <div class="form-section" v-if="!props.modoEdicion">
          <h3 class="section-title">
            <i class="pi pi-lock"></i>
            Seguridad
          </h3>

          <div class="form-field">
            <label for="password" class="form-label">
              <i class="pi pi-lock"></i>
              Contraseña
            </label>
            <Password
              id="password"
              v-model="paciente.password"
              :toggleMask="true"
              :feedback="true"
              placeholder="Ingrese una contraseña"
              class="form-input"
              autocomplete="off"
              weakLabel="Débil"
              mediumLabel="Media"
              strongLabel="Fuerte"
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
  color: white !important;
  padding: 1.5rem;
  border-radius: 12px 12px 0 0;
}

.dialog-header-text {
  color: white !important;
  font-size: 1.25rem;
  font-weight: 600;
}

.custom-dialog :deep(.p-dialog-header-icon) {
  color: white !important;
}

.custom-dialog :deep(.p-dialog-header-icon):hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.custom-dialog :deep(.p-dialog-content) {
  padding: 2rem;
  background-color: #f8f9fa;
  max-height: 70vh;
  overflow-y: auto;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #667eea;
  font-size: 1.2rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.form-field:last-child {
  margin-bottom: 0;
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
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

/* Estilos globales para todos los inputs */
:deep(.p-inputtext) {
  color: #2d3748 !important;
  background-color: white !important;
  -webkit-text-fill-color: #2d3748 !important;
}

:deep(input) {
  color: #2d3748 !important;
  background-color: white !important;
  -webkit-text-fill-color: #2d3748 !important;
}

:deep(textarea) {
  color: #2d3748 !important;
  background-color: white !important;
}

/* Estilos específicos para Password component */
:deep(.p-password input) {
  color: #2d3748 !important;
  background-color: white !important;
  -webkit-text-fill-color: #2d3748 !important;
}

:deep(.p-password .p-inputtext) {
  color: #2d3748 !important;
  background-color: white !important;
  -webkit-text-fill-color: #2d3748 !important;
}

:deep(.p-password input[type='password']) {
  color: #2d3748 !important;
  -webkit-text-fill-color: #2d3748 !important;
}

/* Placeholders */
:deep(.p-inputtext::placeholder),
:deep(input::placeholder) {
  color: #9ca3af !important;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:hover {
  border-color: #cbd5e0;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

.p-inputtext:disabled {
  background-color: #f5f5f5;
  color: #9e9e9e;
  border-color: #e0e0e0;
}

/* Scrollbar personalizada */
.custom-dialog :deep(.p-dialog-content)::-webkit-scrollbar {
  width: 8px;
}

.custom-dialog :deep(.p-dialog-content)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-dialog :deep(.p-dialog-content)::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 4px;
}

.custom-dialog :deep(.p-dialog-content)::-webkit-scrollbar-thumb:hover {
  background: #764ba2;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid-2,
  .form-grid-3 {
    grid-template-columns: 1fr;
  }

  .custom-dialog :deep(.p-dialog-content) {
    padding: 1.5rem;
  }

  .form-section {
    padding: 1rem;
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
