<script setup lang="ts">
import type { Odontologo, Especialidad } from '../../models/Odontologo'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch, onMounted } from 'vue'
import EspecialidadModal from '../especialidades/EspecialidadModal.vue'

const toast = useToast()

const ENDPOINT = 'odontologos'
const props = defineProps({
  mostrar: Boolean,
  odontologo: {
    type: Object as () => Odontologo,
    default: () => ({}) as Odontologo,
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

const odontologo = ref<Odontologo>({ ...props.odontologo })
const especialidades = ref<Especialidad[]>([])
const especialidadSeleccionada = ref<number | null>(null)
const mostrarModalEspecialidad = ref<boolean>(false)

watch(
  () => props.odontologo,
  newVal => {
    if (newVal) {
      odontologo.value = { ...newVal }
      especialidadSeleccionada.value = newVal.especialidad?.id || null
    } else {
      odontologo.value = {} as Odontologo
      especialidadSeleccionada.value = null
    }
  },
)

watch(dialogVisible, visible => {
  if (visible) {
    if (props.odontologo) {
      especialidadSeleccionada.value = props.odontologo.especialidad?.id || null
    } else {
      especialidadSeleccionada.value = null
    }
  }
})

async function obtenerEspecialidades() {
  try {
    const response = await http.get('especialidades')
    especialidades.value = response.data
  } catch (error) {
    console.error('Error al cargar especialidades:', error)
  }
}

function abrirModalEspecialidad() {
  mostrarModalEspecialidad.value = true
}

function cerrarModalEspecialidad() {
  mostrarModalEspecialidad.value = false
}

function especialidadGuardada() {
  obtenerEspecialidades()
  mostrarModalEspecialidad.value = false
}

onMounted(() => {
  obtenerEspecialidades()
})

async function handleSave() {
  try {
    // Validar que especialidadId sea un número válido
    if (!especialidadSeleccionada.value) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe seleccionar una especialidad',
        life: 3000,
      })
      return
    }

    // Validar que la URL de la imagen no exceda 255 caracteres
    if (odontologo.value.imagen && odontologo.value.imagen.length > 255) {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'La URL de la imagen debe tener máximo 255 caracteres',
        life: 3000,
      })
      return
    }

    const body = {
      nombre: odontologo.value.nombre,
      primerApellido: odontologo.value.primerApellido,
      segundoApellido: odontologo.value.segundoApellido,
      especialidadId: parseInt(especialidadSeleccionada.value.toString(), 10),
      email: odontologo.value.email,
      telefono: odontologo.value.telefono,
      direccion: odontologo.value.direccion,
      imagen: odontologo.value.imagen || '',
      ...(odontologo.value.password && !props.modoEdicion
        ? { password: odontologo.value.password }
        : {}),
    }

    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${odontologo.value.id}`, body)
      toast.add({
        severity: 'success',
        summary: 'Odontologo actualizado',
        detail: 'Los datos del odontologo se han actualizado correctamente',
        life: 3000,
      })
    } else {
      await http.post(ENDPOINT, body)
      toast.add({
        severity: 'success',
        summary: 'Odontologo Creado',
        detail: 'El odontologo se ha creado correctamente',
        life: 3000,
      })
    }
    emit('guardar')
    odontologo.value = {} as Odontologo
    especialidadSeleccionada.value = null
    dialogVisible.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail:
        error?.response?.data?.message || 'No se pudo guardar el odontólogo',
      life: 3000,
    })
  }
}
</script>

<template>
  <Toast />
  <EspecialidadModal
    :mostrar="mostrarModalEspecialidad"
    @guardar="especialidadGuardada"
    @close="cerrarModalEspecialidad"
  />
  <div class="card flex justify-center">
    <Dialog
      v-model:visible="dialogVisible"
      :modal="true"
      :closable="true"
      :draggable="false"
      class="custom-dialog"
      style="width: 650px; max-width: 95vw"
    >
      <template #header>
        <span class="dialog-header-text">
          {{
            props.modoEdicion ? 'Editar Odontólogo' : 'Crear Nuevo Odontólogo'
          }}
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
                v-model="odontologo.nombre"
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
                v-model="odontologo.primerApellido"
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
                v-model="odontologo.segundoApellido"
                placeholder="Segundo apellido"
                class="form-input"
                autocomplete="off"
              />
            </div>
          </div>
        </div>

        <!-- Información Profesional -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="pi pi-briefcase"></i>
            Información Profesional
          </h3>

          <!-- Especialidad -->
          <div class="form-field">
            <label for="especialidad" class="form-label">
              <i class="pi pi-heart-fill"></i>
              Especialidad
            </label>
            <div class="flex gap-2">
              <Select
                id="especialidad"
                v-model="especialidadSeleccionada"
                :options="especialidades"
                optionLabel="nombre"
                optionValue="id"
                placeholder="Seleccione una especialidad"
                class="flex-1 form-dropdown"
              />
              <Button
                type="button"
                icon="pi pi-plus"
                severity="success"
                class="btn-add-specialty"
                @click="abrirModalEspecialidad"
                v-tooltip.top="'Nueva especialidad'"
              />
            </div>
          </div>

          <!-- Contraseña -->
          <div class="form-field" v-if="!props.modoEdicion">
            <label for="password" class="form-label">
              <i class="pi pi-lock"></i>
              Contraseña
            </label>
            <Password
              id="password"
              v-model="odontologo.password"
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
                v-model="odontologo.email"
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
                v-model="odontologo.telefono"
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
              v-model="odontologo.direccion"
              placeholder="Ingrese la dirección"
              class="form-input"
              autocomplete="off"
            />
          </div>
        </div>

        <!-- URL de Imagen -->
        <div class="form-section">
          <h3 class="section-title">
            <i class="pi pi-image"></i>
            Fotografía
          </h3>

          <div class="form-field">
            <label for="imagen" class="form-label">
              <i class="pi pi-link"></i>
              URL de la Foto
            </label>
            <InputText
              id="imagen"
              v-model="odontologo.imagen"
              placeholder="https://ejemplo.com/foto.jpg"
              class="form-input"
              autocomplete="off"
              maxlength="255"
            />
            <small class="form-hint"
              >Ingrese la URL de la imagen (máximo 255 caracteres)</small
            >

            <!-- Preview de la imagen -->
            <div v-if="odontologo.imagen" class="image-preview-container">
              <img
                :src="odontologo.imagen"
                alt="Preview"
                class="image-preview"
                @error="e => ((e.target as HTMLImageElement).src = '')"
              />
            </div>
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
  color: rgb(255, 255, 255) !important;
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
  background-color: #ffffff;
  max-height: 70vh;
  overflow-y: auto;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background-color: rgb(50, 50, 50);
  padding: 1.5rem;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: #ffffff;
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
  color: #ffffff;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label i {
  color: #ffffff;
  font-size: 0.9rem;
}

.form-input,
.form-dropdown {
  width: 100%;
  border-radius: 8px;
  border: 2px solid #000000;
  transition: all 0.3s ease;
}

/* Forzar color de texto oscuro en todos los inputs */
.form-input :deep(.p-inputtext),
.form-input :deep(input),
.form-input :deep(textarea),
.form-input :deep(.p-password-input),
.form-input :deep(.p-password input),
.form-input :deep(.p-password .p-inputtext),
.form-dropdown :deep(.p-select-label),
.form-dropdown :deep(.p-dropdown-label) {
  color: #000000 !important;
  background-color: white !important;
}

/* Estilos específicos para Password component */
:deep(.p-password input) {
  color: #000000 !important;
  background-color: white !important;
  -webkit-text-fill-color: #000000 !important;
}

:deep(.p-password .p-inputtext) {
  color: #000000 !important;
  background-color: white !important;
  -webkit-text-fill-color: #000000 !important;
}

/* Forzar color de los caracteres enmascarados de la contraseña */
:deep(.p-password input[type='password']) {
  color: #000000 !important;
  -webkit-text-fill-color: #000000 !important;
  text-security: disc !important;
  -webkit-text-security: disc !important;
}

.form-input :deep(.p-inputtext::placeholder),
.form-input :deep(input::placeholder),
.form-input :deep(.p-password input::placeholder) {
  color: #9ca3af !important;
}

.form-input:focus,
.form-dropdown:focus {
  border-color: #000000;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:hover,
.form-dropdown:hover {
  border-color: #040404;
}

.form-hint {
  color: #ffffff;
  font-size: 0.85rem;
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

.btn-add-specialty {
  border-radius: 8px !important;
  transition: all 0.3s ease;
}

.btn-add-specialty:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.image-preview-container {
  margin-top: 1rem;
  width: 150px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
