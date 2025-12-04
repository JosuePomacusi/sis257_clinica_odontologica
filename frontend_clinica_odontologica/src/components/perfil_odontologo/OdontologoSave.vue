<script setup lang="ts">
import type { Odontologo, Especialidad } from '../../models/Odontologo';
import { ref, watch, onMounted } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Select from 'primevue/select';
import http from '../../plugins/axios';

// Props: Odontologo a editar y modo edición
const props = defineProps({
  odontologo: {
    type: Object as () => Odontologo,
    default: () => ({} as Odontologo),
  },

    default: true, // Por defecto está en modo edición
  },
});

// Evento para emitir al guardar
const emit = defineEmits(['guardar', 'cancelar']);

// Estado local del odontologo (clonado desde las props)
const odontologo = ref<Odontologo>({ ...props.odontologo });
const especialidades = ref<Especialidad[]>([]);
const especialidadSeleccionada = ref<number | null>(null);

// Sincronizar cambios si las props cambian
watch(
  () => props.odontologo,
  (newVal) => {
    odontologo.value = { ...newVal };
    especialidadSeleccionada.value = newVal.especialidad?.id || null;
  },
);

// Cargar especialidades
async function obtenerEspecialidades() {
  try {
    const response = await http.get('especialidades');
    especialidades.value = response.data;
  } catch (error) {
    console.error('Error al cargar especialidades:', error);
  }
}

onMounted(() => {
  obtenerEspecialidades();
  especialidadSeleccionada.value = props.odontologo.especialidad?.id || null;
});

// Función para reiniciar los valores originales
function cancelarEdicion() {
  emit('cancelar'); // Emitir evento de cancelación al padre
  odontologo.value = { ...props.odontologo }; // Reiniciar los valores
}

// Función para guardar los cambios
function guardar() {
  const odontologoActualizado = {
    ...odontologo.value,
    especialidadId: especialidadSeleccionada.value
  };
  emit('guardar', odontologoActualizado); // Emitir el odontologo actualizado al padre
}
</script>


<template>
  <div class="card flex flex-column gap-4">
    <!-- Nombre -->
    <div class="form-group">
      <label for="nombre" class="font-semibold w-24">Nombre</label>
      <InputText
        id="nombre"
        v-model="odontologo.nombre"
        class="flex-auto"
        autocomplete="off"
      />
    </div>

    <!-- Primer Apellido -->
    <div class="form-group">
      <label for="primer_apellido" class="font-semibold w-24">Primer Apellido</label>
      <InputText
        id="primer_apellido"
        v-model="odontologo.primerApellido"
        class="flex-auto"
        autocomplete="off"
      />
    </div>

    <!-- Segundo Apellido -->
    <div class="form-group">
      <label for="segundo_apellido" class="font-semibold w-24">Segundo Apellido</label>
      <InputText
        id="segundo_apellido"
        v-model="odontologo.segundoApellido"
        class="flex-auto"
        autocomplete="off"
      />
    </div>

    <!-- Correo Electrónico -->
    <div class="form-group">
      <label for="email" class="font-semibold w-24">Correo</label>
      <InputText
        id="email"
        v-model="odontologo.email"
        class="flex-auto"
        autocomplete="off"
      />
    </div>

    <!-- Especialidad -->
    <div class="form-group">
      <label for="especialidad" class="font-semibold w-24">Especialidad</label>
      <Select
        id="especialidad"
        v-model="especialidadSeleccionada"
        :options="especialidades"
        optionLabel="nombre"
        optionValue="id"
        placeholder="Seleccione una especialidad"
        class="flex-auto"
      />
    </div>

    <!-- Teléfono -->
    <div class="form-group">
      <label for="telefono" class="font-semibold w-24">Teléfono</label>
      <InputText
        id="telefono"
        v-model="odontologo.telefono"
        class="flex-auto"
        autocomplete="off"
      />
    </div>

    <!-- Dirección -->
    <div class="form-group">
      <label for="direccion" class="font-semibold w-24">Dirección</label>
      <InputText
        id="direccion"
        v-model="odontologo.direccion"
        class="flex-auto"
        autocomplete="off"
      />
    </div>

    <!-- URL de Imagen -->
    <div class="form-group">
      <label for="imagen" class="font-semibold w-24">URL Imagen</label>
      <InputText
        id="imagen"
        v-model="odontologo.imagen"
        class="flex-auto"
        autocomplete="off"
        placeholder="https://ejemplo.com/foto.jpg"
        maxlength="255"
      />
    </div>

    <!-- Preview de la imagen -->
    <div v-if="odontologo.imagen" class="image-preview-wrapper">
      <img :src="odontologo.imagen" alt="Preview" class="image-preview" @error="(e) => (e.target as HTMLImageElement).src = ''" />
    </div>

    <!-- Botones de acción -->
    <div class="button-group flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        class="p-button-text"
        @click="cancelarEdicion"
      />
      <Button
        label="Guardar"
        icon="pi pi-save"
        class="p-button-primary"
        @click="guardar"
      />
    </div>
  </div>
</template>



<style scoped>
.card {
  max-width: 600px;
  margin: 0 auto;
  padding: 25px;
  border: none;
  border-radius: 12px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Agrupación de formulario */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 1.25rem;
}

label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

:deep(.p-inputtext),
:deep(.p-select) {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.95rem;
  color: #2c3e50 !important;
  -webkit-text-fill-color: #2c3e50 !important;
  background-color: #ffffff !important;
  opacity: 1 !important;
  transition: all 0.3s ease;
}

:deep(.p-inputtext:focus),
:deep(.p-select:focus) {
  border-color: #240090;
  box-shadow: 0 0 0 0.2rem rgba(36, 0, 144, 0.15);
  outline: none;
}

:deep(.p-select .p-select-label) {
  color: #2c3e50 !important;
  -webkit-text-fill-color: #2c3e50 !important;
}

:deep(.p-select-option) {
  color: #2c3e50 !important;
}

/* Preview de imagen */
.image-preview-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.image-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #240090;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Botones */
.button-group {
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

:deep(.p-button-primary) {
  background-color: #240090 !important;
  border-color: #240090 !important;
  padding: 10px 24px;
  color:white !important;
  font-weight: 600;
  transition: all 0.3s ease;
}

:deep(.p-button-primary:hover) {
  background-color: #1a0066 !important;
  border-color: #1a0066 !important;
  transform: translateY(-1px);
}

:deep(.p-button-text) {
  color: #6c757d !important;
  padding: 10px 24px;
  font-weight: 600;
}

:deep(.p-button-text:hover) {
  background-color: #f8f9fa !important;
  color: #495057 !important;
}
</style>
  
