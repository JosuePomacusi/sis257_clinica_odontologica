<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores' // Acceso al cliente autenticado
import http from '../../plugins/axios'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import type { Paciente } from '@/models/Paciente'


const toast = useToast()

const authStore = useAuthStore() // Obtener el cliente autenticado
const paciente = ref<Paciente | null>(null) // Especificamos que cliente puede ser Cliente o null

const emit = defineEmits(['editar', 'cambiarPassword']) // Ahora incluye 'cambiarPassword'

// Cargar los datos del cliente autenticado desde el backend
async function cargarClienteAutenticado() {
  try {
    paciente.value = await http.get('pacientes/mi-perfil').then(res => res.data)
  } catch (error) {
    console.error('Error al cargar los datos del cliente:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos del cliente.', life: 3000 });
  }
}

// Eliminar la cuenta del usuario autenticado
async function eliminarCuenta() {
  if (confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
    try {
      // Solicitud al backend para eliminar la cuenta
      await http.delete(`pacientes/${paciente.value?.id}`);

      // Cerrar sesión y redirigir al inicio
      authStore.logout(); // Asegúrate de tener un método para cerrar sesión
      toast.add({
        severity: 'success',
        summary: 'Exito',
        detail: `Tu cuenta ha sido eliminada correctamente.`,
        life: 3000,
      });
      window.location.href = '/'; // Redirige al inicio
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la cuenta. Inténtalo de nuevo.', life: 3000 });
    }
  }
}



// Inicializar los datos al montar el componente
onMounted(() => {
  cargarClienteAutenticado()
})
</script>

<template>
  <div>
    <div v-if="paciente" class="card flex flex-column gap-4">
      <div class="flex items-center gap-4 mb-4">
        <label for="nombre" class="font-semibold w-24">Nombre</label>
        <InputText id="nombre" :value="paciente.nombre" disabled class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="primer_apellido" class="font-semibold w-24">Primer <br />
          Apellido</label>
        <InputText id="primer_apellido" :value="paciente.primerApellido" disabled class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="segundo_apellido" class="font-semibold w-24">Segundo Apellido</label>
        <InputText id="segundo_apellido" :value="paciente.segundoApellido" disabled class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="email" class="font-semibold w-24">Correo</label>
        <InputText id="email" :value="paciente.email" disabled class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="telefono" class="font-semibold w-24">Teléfono</label>
        <InputText id="telefono" :value="paciente.telefono" disabled class="flex-auto" />
      </div>
      <div class="flex items-center gap-4 mb-4">
        <label for="direccion" class="font-semibold w-24">Dirección</label>
        <InputText id="direccion" :value="paciente.direccion" disabled class="flex-auto" />
      </div>

      <!-- Botón para abrir el diálogo de edición -->

      <Button label="Editar" icon="pi pi-pencil" class="p-button-text" @click="$emit('editar')" />

      <Button label="Cambiar Contraseña" icon="pi pi-lock" class="p-button-text p-button-danger"
        @click="$emit('cambiarPassword')" />
      <!-- Botón para eliminar la cuenta -->
      <Button label="Eliminar Cuenta" icon="pi pi-trash" class="p-button-text p-button-danger"
        @click="eliminarCuenta" />
    </div>
    <p v-else>Cargando datos del cliente...</p>
  </div>
</template>

<style scoped>
.card {
  max-width: 600px;
  margin: 0 auto;
  padding: 30px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.flex {
  display: flex;
  align-items: center;
}

label {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  width: 180px;
  text-align: start;
}

:deep(.p-inputtext:disabled) {
  background-color: #f8f9fa !important;
  color: #495057 !important;
  -webkit-text-fill-color: #495057 !important;
  opacity: 1 !important;
  cursor: not-allowed;
  border: 1px solid #dee2e6 !important;
}

.p-button-text {
  color: #240090 !important;
  font-weight: bold;
  transition: all 0.3s ease;
}

.p-button-text:hover {
  background-color: rgba(36, 0, 144, 0.1) !important;
  transform: translateY(-2px);
}

.p-button-danger {
  color: #dc3545 !important;
}

.p-button-danger:hover {
  background-color: rgba(220, 53, 69, 0.1) !important;
}
</style>
