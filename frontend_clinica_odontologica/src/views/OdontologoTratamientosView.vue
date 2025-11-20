<script setup lang="ts">
import { ref } from 'vue'
import OdontologoTratamientoSave from '@/components/odontologo_tratamientos/OdontologoTratamientoSave.vue'
import OdontologoTratamientoList from '@/components/odontologo_tratamientos/OdontologoTratamientoList.vue'
import TratamientoSave from '../components/tratamientos/TratamientoSave.vue'
import Button from 'primevue/button'

import { useAuthStore } from '@/stores'

const authStore = useAuthStore()

const mostrarDialog2 = ref<boolean>(false)

const mostrarDialogCreate = ref(false)
const OdontologoTratamientoListRef = ref<InstanceType<
  typeof OdontologoTratamientoList
> | null>(null)

// Función para manejar la creación
function handleCreate() {
  mostrarDialogCreate.value = true
}

// Función para cerrar el diálogo
function handleCloseDialog() {
  mostrarDialogCreate.value = false
}

// Función para actualizar la lista después de guardar
function handleGuardar() {
  if (OdontologoTratamientoListRef.value) {
    OdontologoTratamientoListRef.value.obtenerLista() // Actualiza la lista
  }
  mostrarDialogCreate.value = false
}

function handleCreate2() {
  mostrarDialog2.value = true
}
function handleGuardar2() {
  mostrarDialog2.value = false
  mostrarDialogCreate.value = false
  if (OdontologoTratamientoListRef.value) {
    OdontologoTratamientoListRef.value.obtenerLista()
  }
}
function handleCloseDialog2() {
  mostrarDialog2.value = false
  mostrarDialogCreate.value = false
}

// Nueva función para redirigir a la ruta de tratamientos
function goToTratamientos() {
  window.location.href = '/tratamientos'
}
</script>

<template>
  <div class="container">
    <div class="content-wrapper">
      <h1 class="header">
        Bienvenido!! {{ authStore.user?.name || 'Usuario' }}, estos son tus
        tratamientos.
      </h1>

      <!-- Botones organizados en un contenedor -->
      <div class="button-group">
        <Button
          class="create-button"
          label="Crear tratamiento"
          icon="pi pi-plus"
          @click="handleCreate2"
        />
        <Button
          label="Gestionar tratamientos"
          icon="pi pi-cog"
          class="manage-button"
          @click="goToTratamientos"
        />
        <Button
          label="Añadir tratamiento"
          icon="pi pi-plus-circle"
          class="add-button"
          @click="handleCreate"
        />
      </div>

      <!-- Lista de relaciones -->
      <OdontologoTratamientoList
        ref="OdontologoTratamientoListRef"
        class="list-container"
      />

      <!-- Diálogo de creación -->
      <OdontologoTratamientoSave
        :mostrar="mostrarDialogCreate"
        @guardar="handleGuardar"
        @close="handleCloseDialog"
        class="dialog-container"
      />
      <!-- Diálogo de crear tratamiento -->
      <TratamientoSave
        :mostrar="mostrarDialog2"
        @guardar="handleGuardar2"
        @close="handleCloseDialog2"
      />
    </div>
  </div>
</template>

<style scoped>
/* Contenedor principal */
.container {
  background-color: #2700c1;
  /* Fondo sólido */
  display: flex;
  /* Flexbox para centrar el contenido */
  justify-content: center;
  /* Centra el contenido horizontalmente */
  align-items: flex-start;
  /* Alinea el contenido al inicio vertical */
  padding-top: 200px;
  min-height: 100vh;
  max-width: 100%;
}

/* Contenedor interno */
.content-wrapper {
  background-color: #ffffff;
  /* Fondo blanco para el contenido */
  border-radius: 12px;
  /* Bordes redondeados */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  /* Sombra ligera */
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  text-align: center;
}

/* Título */
.header {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #2c3e50;
  text-align: center;
}

/* Grupo de botones */
.button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Botones */
.create-button {
  background-color: #37810c;
  /* Verde */
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.create-button:hover {
  background-color: #2d690a;
  /* Verde más oscuro */
}

.manage-button {
  background-color: #0056b3;
  /* Azul */
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.manage-button:hover {
  background-color: #004494;
  /* Azul más oscuro */
}

.add-button {
  background-color: #e67e22;
  /* Naranja */
  color: #ffffff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-button:hover {
  background-color: #cf6d1c;
  /* Naranja más oscuro */
}

/* Contenedor de la lista */
.list-container {
  margin-top: 2rem;
}
</style>
