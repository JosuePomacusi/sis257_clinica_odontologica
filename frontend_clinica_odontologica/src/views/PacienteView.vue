<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import http from '../plugins/axios'
import Toast from 'primevue/toast' // Importar Toast
import PacienteList from '../components/pacientes/PacienteList.vue'
import PacienteSave from '../components/pacientes/PacienteSave.vue'
import CambiarPasswordDialog from '../components/pacientes/CambiarPasswordDialog.vue'
import Dialog from 'primevue/dialog'
import type { Paciente } from '../models/Paciente' // Importar el modelo

// --- Estado Global/Servicios ---
const toast = useToast()

// --- Estado Reactivo ---
const paciente = ref<Paciente | null>(null) // Datos del paciente autenticado
const isLoading = ref(false) // Nuevo estado para indicar la carga
const mostrarDialog = ref(false) // Controla el modal de Editar Perfil
const mostrarDialogPassword = ref(false) // Controla el modal de Cambiar Contraseña

// --- Funciones de Lógica de la Aplicación ---

/**
 * Carga los datos del paciente autenticado desde el backend.
 */
async function cargarPacienteAutenticado() {
  isLoading.value = true
  try {
    const response = await http.get('pacientes/mi-perfil')
    paciente.value = response.data
    // Se elimina el toast de éxito para la carga, ya que el usuario ya ve la información.
  } catch (error) {
    console.error('Error al cargar los datos del paciente:', error)
    toast.add({
      severity: 'error',
      summary: 'Error de Carga',
      detail: 'No se pudieron cargar los datos de su perfil.',
      life: 5000,
    })
  } finally {
    isLoading.value = false
  }
}

/**
 * Llama a la API para cambiar la contraseña.
 * @param passwordActual - Contraseña actual del usuario.
 * @param nuevaPassword - Nueva contraseña.
 */
async function cambiarPassword(passwordActual: string, nuevaPassword: string) {
  try {
    // La API debe devolver un mensaje de éxito o un error 4xx.
    const response = await http.post('pacientes/cambiar-password', {
      passwordActual,
      nuevaPassword,
    })
    
    mostrarDialogPassword.value = false // Cerrar el diálogo
    
    // Asumimos que la respuesta.data contiene el mensaje de éxito del servidor.
    toast.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: response.data?.message || 'Contraseña actualizada correctamente.', 
      life: 3000 
    })
  } catch (error: any) {
    console.error('Error al cambiar la contraseña:', error)
    // Usar el mensaje de error del servidor si está disponible
    const errorMessage = error.response?.data?.message || 'No se pudo cambiar la contraseña. Verifique su contraseña actual.'
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: errorMessage, 
      life: 5000 
    })
  }
}

/**
 * Llama a la API para actualizar los datos del paciente.
 * @param pacienteActualizado - Objeto Paciente con los datos modificados.
 */
async function guardarCambios(pacienteActualizado: Paciente) {
  try {
    // Usamos el ID del paciente logueado (más seguro que confiar en el ID del objeto)
    await http.patch(`pacientes/${paciente.value?.id}`, pacienteActualizado) 
    
    // Actualizar los datos locales con la copia de los datos enviados (o los datos de la API si los retorna)
    paciente.value = { ...pacienteActualizado } 
    
    mostrarDialog.value = false // Cerrar el diálogo
    toast.add({ 
      severity: 'success', 
      summary: 'Éxito', 
      detail: 'Datos actualizados correctamente.', 
      life: 3000 
    })
  } catch (error) {
    console.error('Error al guardar los cambios:', error)
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: 'No se pudieron guardar los cambios. Inténtelo de nuevo.', 
      life: 5000 
    })
  }
}

// --- Lifecycle ---
onMounted(() => {
  cargarPacienteAutenticado()
})
</script>

<template>
  <div class="profile-page-background">
    <Toast /> <div class="content-container">
      <h1 class="title">
          <i class="pi pi-user-edit title-icon"></i> Mi Perfil
      </h1>
      
      <div v-if="isLoading" class="loading-state">
          <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem; color: #240090;"></i>
          <p>Obteniendo datos de su perfil...</p>
      </div>

      <PacienteList
        v-else-if="paciente"
        :paciente="paciente"
        @editar="mostrarDialog = true"
        @cambiarPassword="mostrarDialogPassword = true"
      />
      
      <p v-else-if="!isLoading">No se pudo cargar el perfil del paciente.</p>

      <Dialog
        v-model:visible="mostrarDialog"
        header="Editar Perfil"
        :style="{ width: '35rem' }"
        modal
      >
        <PacienteSave
          :paciente="paciente ? { ...paciente } : undefined"
          :modoEdicion="true"
          @guardar="guardarCambios"
          @close="mostrarDialog = false" />
      </Dialog>

      <Dialog
        v-model:visible="mostrarDialogPassword"
        header="Cambiar Contraseña"
        :style="{ width: '30rem' }"
        modal
      >
        <CambiarPasswordDialog
          @guardar="cambiarPassword"
          @cerrar="mostrarDialogPassword = false"
        />
      </Dialog>
    </div>
  </div>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS REFINADOS --- */
/* ------------------------------------------- */

.profile-page-background {
  background-color: #240090; /* Usamos el color principal de la marca/clínica */
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;
}

.content-container {
  background: white; /* Fondo blanco sólido (mejor que semitransparente) */
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  padding: 2.5rem;
  width: 100%;
  max-width: 800px; /* Ancho máximo centrado en el contenido */
  margin-top: 100px; /* Espaciado superior para centrar mejor el contenido */
  animation: fadeIn 0.5s ease-out;
}

.title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #240090;
  text-align: center;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.title-icon {
    color: #4a148c;
    font-size: 2rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  font-weight: 600;
  color: #4b5563;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 600px) {
  .profile-page-background {
    padding: 1rem 0.5rem;
  }
  .content-container {
    padding: 1.5rem;
    margin-top: 50px;
  }
  .title {
    font-size: 1.8rem;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>