<script setup lang="ts">
import Button from 'primevue/button'
import { ref } from 'vue'
import OdontologoList from '../components/odontologos/OdontologoList.vue'
import OdontologoSave from '../components/odontologos/OdontologoSave.vue'
import EspecialidadModal from '../components/especialidades/EspecialidadModal.vue'
// Importar tipo de dato del modelo de Odontologo para tipado estricto
import type { Odontologo } from '../../models/Odontologo'
// Importar tipo de la instancia del componente de lista para el ref
import type OdontologoListType from '../components/odontologos/OdontologoList.vue'

// --- Tipado de Referencia ---
// Aseguramos que OdontologoListRef es del tipo del componente, lo cual nos permite llamar obtenerLista()
type OdontologoListInstance = InstanceType<typeof OdontologoListType>

// --- Estado Reactivo ---
const mostrarDialog = ref<boolean>(false) // Controla el modal de Guardar/Editar Odontólogo
const mostrarModalEspecialidad = ref<boolean>(false) // Controla el modal de Especialidades
const OdontologoListRef = ref<OdontologoListInstance | null>(null) // Referencia al componente de lista
const odontologoEdit = ref<Odontologo | null>(null) // Objeto para edición

// --- Lógica de Odontólogos (CRUD) ---

/**
 * Prepara el modal para crear un nuevo odontólogo.
 */
function handleCreate() {
  odontologoEdit.value = null // Limpiar objeto para modo creación
  mostrarDialog.value = true
}

/**
 * Prepara el modal para editar un odontólogo existente.
 * @param odontologo - Objeto Odontologo a editar.
 */
function handleEdit(odontologo: Odontologo) {
  odontologoEdit.value = odontologo // Asignar objeto para modo edición
  mostrarDialog.value = true
}

/**
 * Cierra el modal de Guardar/Editar Odontólogo.
 */
function handleCloseDialog() {
  mostrarDialog.value = false
}

/**
 * Se ejecuta al guardar un odontólogo (crear o editar).
 * Recarga la lista de odontólogos en el componente hijo.
 */
function handleGuardar() {
  OdontologoListRef.value?.obtenerLista()
  handleCloseDialog() // Opcional: El componente hijo debería encargarse de emitir 'close', pero lo aseguramos aquí.
}

// --- Lógica de Especialidades ---

function abrirModalEspecialidad() {
  mostrarModalEspecialidad.value = true
}

function cerrarModalEspecialidad() {
  mostrarModalEspecialidad.value = false
}

/**
 * Se ejecuta al guardar una Especialidad.
 * Recarga la lista de odontólogos (por si la lista necesita actualizar la especialidad).
 */
function especialidadGuardada() {
  OdontologoListRef.value?.obtenerLista()
  cerrarModalEspecialidad()
}
</script>

<template>
  <div class="page-container">
    <div class="content-wrapper">
      <div class="header-section">
        <div class="header-content">
          <h1 class="page-title">
            <i class="pi pi-users page-icon"></i>
            Gestión de Odontólogos
          </h1>
          <div class="action-buttons">
            <Button
              label="Nueva Especialidad"
              icon="pi pi-briefcase"
              @click="abrirModalEspecialidad"
              class="specialty-button"
              severity="info"
            />
            <Button
              label="Agregar Odontólogo"
              icon="pi pi-plus-circle" @click="handleCreate"
              class="create-button"
              severity="success"
            />
          </div>
        </div>
      </div>

      <div class="list-section">
        <OdontologoList ref="OdontologoListRef" @edit="handleEdit" />
      </div>

      <OdontologoSave
        :mostrar="mostrarDialog"
        :odontologo="odontologoEdit"
        :modoEdicion="!!odontologoEdit"
        @guardar="handleGuardar"
        @close="handleCloseDialog"
      />

      <EspecialidadModal
        :mostrar="mostrarModalEspecialidad"
        @guardar="especialidadGuardada"
        @close="cerrarModalEspecialidad"
      />
    </div>
  </div>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS REFINADOS --- */
/* ------------------------------------------- */

.page-container {
  /* Fondo con imagen y degradado */
  background-image: linear-gradient(rgba(36, 0, 144, 0.1), rgba(36, 0, 144, 0.2)),
    url('@/assets/images/slider/slider-1.png');
  background-size: cover;
  background-attachment: fixed; /* Hace que el fondo se mantenga fijo al desplazar */
  background-position: center;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.content-wrapper {
  max-width: 1400px;
  /* Eliminar margin: 12% auto; para que el contenido fluya verticalmente */
  margin: 0 auto;
  padding-top: 2rem; /* Separación de la parte superior */
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-section {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1); /* Sombra más pronunciada */
  padding: 1.5rem;
  position: sticky; /* Fija el encabezado al hacer scroll */
  top: 1rem; /* Deja un margen superior */
  z-index: 100;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 700;
  color: #240090;
  margin: 0;
  display: flex;
  align-items: center;
}

.page-icon {
    font-size: 1.75rem;
    margin-right: 0.5rem;
    color: #4a148c;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.create-button,
.specialty-button {
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.create-button:hover,
.specialty-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.list-section {
  flex-grow: 1;
  padding-bottom: 2rem; /* Asegurar espacio al final de la lista */
}

/* Responsive styles */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem 0; /* Eliminar padding lateral para el fondo */
  }
  
  .content-wrapper {
    padding-top: 0;
    margin: 0;
    width: 100%;
  }

  .header-section {
    border-radius: 0;
    /* Ajuste de margen para que ocupe todo el ancho */
    margin: 0 0 1rem 0;
    top: 0; /* Fijar al borde superior */
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .page-title {
    font-size: 1.4rem;
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .create-button,
  .specialty-button {
    width: 100%;
  }
}

/* Animations */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-section {
  animation: slideDown 0.3s ease-out;
}
</style>