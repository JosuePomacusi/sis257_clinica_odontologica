<script setup lang="ts">
import type { Odontologo } from '../../models/Odontologo'
import http from '../../plugins/axios'
import Button from 'primevue/button'
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast' // Añadir toast para feedback

// --- Inicialización y Constantes ---
const toast = useToast()
const ENDPOINT = 'odontologos'

// --- Estado Reactivo ---
const odontologos = ref<Odontologo[]>([])
const isLoading = ref(false) // Nuevo estado para control de carga

// --- Emits ---
const emit = defineEmits<{
    (e: 'edit', odontologo: Odontologo): void
    (e: 'delete', odontologo: Odontologo): void // Añadir emit para eliminación
}>()

// --- Funciones de Lógica ---

/**
 * Obtiene la lista completa de odontólogos desde la API.
 */
async function obtenerLista() {
    isLoading.value = true
    try {
        const response = await http.get(ENDPOINT)
        odontologos.value = response.data || []
    } catch (error) {
        console.error('Error al cargar la lista de odontólogos:', error)
        toast.add({
            severity: 'error',
            summary: 'Error de Carga',
            detail: 'No se pudo obtener el listado de odontólogos.',
            life: 5000,
        })
    } finally {
        isLoading.value = false
    }
}

/**
 * Emite el evento 'edit' con los datos del odontólogo.
 * @param odontologo - Odontólogo a editar.
 */
function emitirEdicion(odontologo: Odontologo) {
    emit('edit', odontologo)
}

/**
 * Emite el evento 'delete' con los datos del odontólogo.
 * @param odontologo - Odontólogo a eliminar.
 */
function emitirEliminacion(odontologo: Odontologo) {
    emit('delete', odontologo)
}

// --- Lifecycle ---
onMounted(() => {
    obtenerLista()
})

defineExpose({ obtenerLista })
</script>

<template>
    <div class="dentists-container">
        <div v-if="isLoading" class="loading-state">
            <i class="pi pi-spin pi-spinner" style="font-size: 2.5rem; color: #240090;"></i>
            <p>Cargando información de odontólogos...</p>
        </div>

        <div v-else-if="odontologos.length === 0" class="empty-state">
            <i class="pi pi-info-circle" style="font-size: 2.5rem; color: #9ca3af;"></i>
            <p>No se encontraron registros de odontólogos.</p>
        </div>
        
        <div v-else class="cards-grid">
            <div
                class="card-wrapper"
                v-for="odontologo in odontologos"
                :key="odontologo.id"
            >
                <div class="card shadow-sm h-100">
                    <div class="card-header">
                        <div class="photo-container">
                            <img 
                                v-if="odontologo.imagen" 
                                :src="odontologo.imagen" 
                                :alt="`Foto de Dr. ${odontologo.nombre}`"
                                class="dentist-photo"
                            />
                            <div v-else class="photo-placeholder">
                                <i class="pi pi-user"></i>
                            </div>
                        </div>
                        <h5 class="card-title">
                            <strong>Dr(a). {{ odontologo.nombre }} {{ odontologo.primerApellido }}</strong>
                        </h5>
                    </div>
                    
                    <div class="card-body">
                        <div class="specialty">
                            <i class="pi pi-briefcase"></i>
                            {{ odontologo.especialidad?.nombre || 'Especialidad No Asignada' }}
                        </div>

                        <div class="contact-info">
                            <div class="info-item">
                                <i class="pi pi-at"></i>
                                <span>{{ odontologo.email }}</span>
                            </div>
                            <div class="info-item">
                                <i class="pi pi-phone"></i>
                                <span>{{ odontologo.telefono }}</span>
                            </div>
                            <div class="info-item">
                                <i class="pi pi-id-card"></i>
                                <span>Licencia: {{ odontologo.licencia || 'N/A' }}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card-footer">
                        <Button 
                            icon="pi pi-pencil" 
                            label="Editar" 
                            severity="info"
                            class="p-button-sm p-button-text edit-button"
                            @click="emitirEdicion(odontologo)" 
                        />
                        <Button 
                            icon="pi pi-trash" 
                            label="Eliminar" 
                            severity="danger"
                            class="p-button-sm p-button-text delete-button"
                            @click="emitirEliminacion(odontologo)" 
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* ------------------------------------------- */
/* --- ESTILOS REFINADOS --- */
/* ------------------------------------------- */

.dentists-container {
    width: 100%;
    padding: 1rem;
    background-color: #f7f9fc; /* Fondo claro */
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    overflow-y: auto;
    max-height: calc(100vh - 150px);
    display: flex;
    justify-content: center;
}

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px; /* Limitar ancho para mejor visualización */
}

.card {
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(36, 0, 144, 0.15);
}

.card-header {
    background: linear-gradient(90deg, #240090 0%, #4a148c 100%);
    color: white;
    padding: 1.5rem 1rem 1rem 1rem;
    border-bottom: none;
    text-align: center;
    position: relative;
    padding-top: 50px; /* Espacio para la foto */
}

.card-title {
    color: white;
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    line-height: 1.2;
}

.photo-container {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    position: absolute;
    top: -40px; /* Mover arriba del header */
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid white;
    box-shadow: 0 0 0 2px #240090;
}

.dentist-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.photo-placeholder {
    width: 100%;
    height: 100%;
    background-color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 2rem;
}

.card-body {
    padding: 1.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    text-align: center;
}

.specialty {
    color: #240090;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 0.5rem;
    background: rgba(36, 0, 144, 0.1);
    border-radius: 20px;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.contact-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
    border-top: 1px solid #f0f0f0;
    text-align: left;
}

.info-item {
    font-size: 0.9rem;
    color: #4b5563;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.info-item i {
    color: #764ba2;
}

.card-footer {
    display: flex;
    justify-content: space-around;
    padding: 0.75rem;
    border-top: 1px solid #e5e7eb;
}

/* Botones de acción */
.edit-button, .delete-button {
    font-weight: 600;
}

.edit-button { color: #059669 !important; }
.delete-button { color: #ef4444 !important; }

/* Estados de Carga y Vacío */
.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  width: 100%;
  font-weight: 500;
  color: #4b5563;
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
    .dentists-container { padding: 0.5rem; }
    .cards-grid { grid-template-columns: 1fr; gap: 1rem; }
}
</style>