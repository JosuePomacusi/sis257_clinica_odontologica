<script setup lang="ts">
import Button from 'primevue/button'
import { ref, computed } from 'vue'
import CitaList from '../components/citas/CitaList.vue'
import CitaSave from '../components/citas/CitaSave.vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore() // Accede al usuario autenticado
const mostrarDialog = ref<boolean>(false)
const CitaListRef = ref<typeof CitaList | null>(null)
const citaEdit = ref<any>(null)

// Filtrar citas solo del cliente autenticado
const pacienteId = computed(() => authStore.user?.id || null) // Obtiene el ID del cliente autenticado

function handleCreate() {
  citaEdit.value = null // Resetea el formulario para crear una nueva cita
  mostrarDialog.value = true
}

function handleEdit(cita: any) {
  if (cita.paciente.id === pacienteId.value) {
    citaEdit.value = cita // Solo permite editar si la cita pertenece al paciente autenticado
    mostrarDialog.value = true
  } else {
    alert('No puedes editar citas de otros pacientes.')
  }
}

function handleCloseDialog() {
  mostrarDialog.value = false
}

function handleGuardar() {
  CitaListRef.value?.obtenerLista() // Actualiza la lista después de guardar o editar
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">
            <i class="pi pi-calendar" style="margin-right: 0.5rem;"></i>
            Citas Programadas
          </h1>
          <Button
            label="Crear Nueva Cita"
            icon="pi pi-plus"
            @click="handleCreate"
            class="create-button"
            severity="success"
          />
        </div>
      </div>

      <div class="list-section">
        <CitaList ref="CitaListRef" :paciente-id="pacienteId" @edit="handleEdit" />
      </div>

      <CitaSave
        :mostrar="mostrarDialog"
        :cita="citaEdit"
        :modoEdicion="!!citaEdit"
        @guardar="handleGuardar"
        @close="handleCloseDialog"
      />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  background: linear-gradient(rgba(39, 0, 193, 0.15), rgba(39, 0, 193, 0.25)),
    #2700c1;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.content-wrapper {
  max-width: 1400px;
  margin: 12% auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #240090;
  margin: 0;
  display: flex;
  align-items: center;
}

.create-button {
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.create-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.list-section {
  flex-grow: 1;
}

/* Responsive styles */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem 0.5rem;
  }

  .header-section {
    border-radius: 0;
    margin: -1rem -0.5rem 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .page-title {
    font-size: 1.5rem;
    justify-content: center;
  }

  .create-button {
    width: 100%;
  }
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-section {
  animation: slideDown 0.3s ease-out;
}
</style>
