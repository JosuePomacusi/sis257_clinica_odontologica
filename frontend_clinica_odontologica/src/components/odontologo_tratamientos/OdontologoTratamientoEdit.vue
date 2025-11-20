<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import http from '../../plugins/axios'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import type { Odontologo_tratamiento as Odontologo_tratamiento } from '../../models/Odontologo_tratamiento'
import type { Odontologo } from '../../models/Odontologo'
import type { Tratamiento } from '../../models/Tratamientos'
import Dialog from 'primevue/dialog'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const props = defineProps({
  mostrar: Boolean,
  relacion: {
    type: Object as () => Odontologo_tratamiento,
    default: () => ({ id: 0, odontologo_id: 0, tratamiento_id: 0 }),
  },
  modoEdicion: Boolean,
})

const emit = defineEmits(['guardar', 'close'])

// Controlar la visibilidad del diálogo
const dialogVisible = computed({
  get: () => props.mostrar,
  set: value => {
    if (!value) emit('close')
  },
})

// Datos de odontólogos y servicios
const odontologos = ref<Odontologo[]>([])
const tratamientos = ref<Tratamiento[]>([])

// Relación editable
const relacion = ref({
  id: props.relacion.id,
  odontologo_id: props.relacion.odontologo_id,
  tratamiento_id: props.relacion.tratamiento_id,
})

// Actualizar `relacion` cuando cambie `props.relacion`
watch(
  () => props.relacion,
  newRelacion => {
    relacion.value = { ...newRelacion }
  },
  { immediate: true },
)

// Cargar odontólogos y servicios
async function cargarDatos() {
  const [odontologoResponse, tratamientoResponse] = await Promise.all([
    http.get('odontologos'),
    http.get('tratamientos'),
  ])
  odontologos.value = odontologoResponse.data
  tratamientos.value = tratamientoResponse.data
}

// Guardar cambios
async function handleEditSave() {
  try {
    if (!relacion.value.odontologo_id || !relacion.value.tratamiento_id) {
      toast.add({ severity: 'warn', summary: 'Error', detail: 'Debe seleccionar un odontólogo y un tratamiento', life: 3000 });
      return
    }

    // Crear el cuerpo con el id de la relación y el nuevo servicio
    const body = {
      odontologoId: relacion.value.odontologo_id, // Este no cambia
      tratamientoId: relacion.value.tratamiento_id, // Este sí cambia
    }

    // Enviar el PATCH con el ID de la relación
    await http.patch(`odontologos_tratamientos/${relacion.value.id}`, body)

    // Emitir evento para recargar la lista
    emit('guardar')
    dialogVisible.value = false
  } catch (error: any) {
    console.error(error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Error desconocido', life: 3000 });
    
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    :header="props.modoEdicion ? 'Editar Relación' : 'Crear Nueva Relación'"
    style="width: 30rem"
  >
    <div class="mb-4">
      <label class="font-semibold mb-2">Odontólogo</label>
      <Dropdown
        v-model="relacion.odontologo_id"
        :options="odontologos"
        :disabled="modoEdicion"
        option-label="nombre"
        option-value="id"
        class="w-full"
      />
    </div>
    <div class="mb-4">
      <label class="font-semibold mb-2">tratamiento</label>
      <Dropdown
        v-model="relacion.tratamiento_id"
        :options="tratamientos"
        option-label="nombre"
        option-value="id"
        class="w-full"
      />
    </div>

    <div class="flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        severity="secondary"
        @click="dialogVisible = false"
      />
      <Button label="Guardar" icon="pi pi-save" @click="handleEditSave" />
    </div>
  </Dialog>
</template>
