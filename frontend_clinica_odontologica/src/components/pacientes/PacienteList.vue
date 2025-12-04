<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../../stores'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dialog from 'primevue/dialog' // Necesario para la confirmación elegante
import { useToast } from 'primevue/usetoast'
import type { Paciente } from '@/models/Paciente'

// --- Inicialización y Stores ---
const toast = useToast()
const authStore = useAuthStore()

// --- Estado Reactivo ---
const paciente = ref<Paciente | null>(null)
const isLoading = ref(true) // Estado de carga para mejor UX
const mostrarConfirmDialog = ref(false) // Controla el diálogo de confirmación de eliminación
const isDeleting = ref(false) // Estado para deshabilitar el botón durante la eliminación

// --- Emits ---
const emit = defineEmits<{
  (e: 'editar'): void
  (e: 'cambiarPassword'): void
}>()

// --- Funciones de Lógica ---

/**
 * Carga los datos del paciente autenticado desde el backend.
 */
async function cargarClienteAutenticado() {
  isLoading.value = true
  try {
    const response = await http.get('pacientes/mi-perfil')
    paciente.value = response.data as Paciente // Tipado explícito de la respuesta
  } catch (error) {
    console.error('Error al cargar los datos del cliente:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los datos de su perfil.',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

/**
 * Abre el diálogo de confirmación para eliminar la cuenta.
 */
function confirmarEliminarCuenta() {
  mostrarConfirmDialog.value = true
}

/**
 * Ejecuta la eliminación de la cuenta del usuario autenticado.
 */
async function eliminarCuenta() {
  if (!paciente.value?.id) return // Asegurar que el ID exista

  isDeleting.value = true
  try {
    // Solicitud al backend para eliminar la cuenta
    await http.delete(`pacientes/${paciente.value.id}`)

    // Cerrar sesión y redirigir
    authStore.logout() // Método para limpiar el estado de autenticación
    
    toast.add({
      severity: 'success',
      summary: 'Éxito',
      detail: `Su cuenta ha sido eliminada correctamente.`,
      life: 3000,
    })
    
    // Pequeño retardo para asegurar que el toast se muestre antes de la redirección
    setTimeout(() => {
        window.location.href = '/'
    }, 500) 

  } catch (error) {
    console.error('Error al eliminar cuenta:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo eliminar la cuenta. Inténtalo de nuevo.',
      life: 5000,
    })
  } finally {
    isDeleting.value = false
    mostrarConfirmDialog.value = false
  }
}

// Inicializar los datos al montar el componente
onMounted(() => {
  cargarClienteAutenticado()
})
</script>

<template>
  <div class="profile-wrapper">
    <div v-if="isLoading" class="loading-state">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #240090;"></i>
      <p>Cargando datos de perfil...</p>
    </div>

    <div v-else-if="paciente" class="card profile-card">
      <h2 class="section-title">Información de Perfil</h2>
      <div class="field-grid">
        <div class="field-item">
          <label for="nombre">Nombre</label>
          <InputText id="nombre" :value="paciente.nombre" disabled />
        </div>
        <div class="field-item">
          <label for="primer_apellido">Primer Apellido</label>
          <InputText id="primer_apellido" :value="paciente.primerApellido" disabled />
        </div>
        <div class="field-item">
          <label for="segundo_apellido">Segundo Apellido</label>
          <InputText id="segundo_apellido" :value="paciente.segundoApellido" disabled />
        </div>
        <div class="field-item">
          <label for="email">Correo Electrónico</label>
          <InputText id="email" :value="paciente.email" disabled />
        </div>
        <div class="field-item">
          <label for="telefono">Teléfono</label>
          <InputText id="telefono" :value="paciente.telefono" disabled />
        </div>
        <div class="field-item field-full-width">
          <label for="direccion">Dirección</label>
          <InputText id="direccion" :value="paciente.direccion" disabled />
        </div>
      </div>
      
      <div class="action-buttons-group">
        <Button label="Editar Perfil" icon="pi pi-user-edit" class="p-button-primary" @click="$emit('editar')" />

        <Button label="Cambiar Contraseña" icon="pi pi-lock" class="p-button-warning"
          @click="$emit('cambiarPassword')" />
          
        <Button 
          label="Eliminar Cuenta" 
          icon="pi pi-trash" 
          class="p-button-danger p-button-outlined"
          @click="confirmarEliminarCuenta" 
        />
      </div>
    </div>
    
    <p v-else-if="!isLoading">No se encontraron datos de perfil.</p>


    <Dialog
      v-model:visible="mostrarConfirmDialog"
      header="Confirmar Eliminación de Cuenta"
      :style="{ width: '400px' }"
      :modal="true"
      :closable="!isDeleting"
      class="delete-dialog"
    >
      <div class="dialog-content-body">
        <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: #ff9800;"></i>
        <p>
          Esta acción es **irreversible**. ¿Está seguro de que desea eliminar permanentemente su cuenta?
        </p>
      </div>
      <div class="dialog-footer-actions">
        <Button
          label="Cancelar"
          severity="secondary"
          @click="mostrarConfirmDialog = false"
          :disabled="isDeleting"
        />
        <Button
          :label="isDeleting ? 'Eliminando...' : 'Sí, Eliminar'"
          :icon="isDeleting ? 'pi pi-spin pi-spinner' : 'pi pi-trash'"
          severity="danger"
          @click="eliminarCuenta"
          :disabled="isDeleting"
        />
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS REFINADOS --- */
/* ------------------------------------------- */

.profile-wrapper {
  padding: 1rem;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  padding: 30px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #240090;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 0.75rem;
    margin-bottom: 1.5rem;
}

.field-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem 2rem;
    margin-bottom: 2rem;
}

.field-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field-full-width {
    grid-column: 1 / -1; /* Ocupa todo el ancho en el grid */
}

label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #4b5563;
}

/* Modificación de estilos de PrimeVue InputText deshabilitado */
:deep(.p-inputtext:disabled) {
  background-color: #f3f4f6 !important;
  color: #1f2937 !important;
  font-weight: 500;
  opacity: 1 !important;
  cursor: default;
  border: 1px solid #e5e7eb !important;
  border-radius: 8px;
}

/* Botones de acción */
.action-buttons-group {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding-top: 1.5rem;
    border-top: 1px solid #f0f0f0;
    justify-content: flex-end; /* Alinear a la derecha */
}

.p-button-primary {
  background-color: #240090 !important;
  border-color: #240090 !important;
}
.p-button-primary:hover {
    background-color: #4a148c !important;
    border-color: #4a148c !important;
}

.p-button-warning {
    background-color: #ffc107 !important;
    border-color: #ffc107 !important;
    color: #333 !important;
}
.p-button-warning:hover {
    background-color: #e0a800 !important;
    border-color: #e0a800 !important;
}

/* Estilo para botón peligroso Outlined (Eliminar) */
.p-button-danger.p-button-outlined {
    background: transparent !important;
    color: #dc3545 !important;
    border: 1px solid #dc3545 !important;
    font-weight: 600;
}
.p-button-danger.p-button-outlined:hover {
    background-color: rgba(220, 53, 69, 0.1) !important;
    color: #a71d2a !important;
}

/* Mensaje de Carga */
.loading-state {
  text-align: center;
  padding: 2rem;
  font-weight: 500;
  color: #4b5563;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Estilos del Diálogo de Confirmación */
.delete-dialog {
    border-radius: 12px;
}
.dialog-content-body {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  text-align: left;
  color: #333;
}
.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

/* Responsive */
@media (max-width: 600px) {
    .profile-card {
        padding: 20px;
    }
    .field-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
    .action-buttons-group {
        flex-direction: column;
        gap: 0.75rem;
    }
}
</style>