<script setup lang="ts">
import Password from 'primevue/password'

import http from '../../plugins/axios'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { computed, ref, watch } from 'vue'
import type { Paciente } from '@/models/Paciente'

const toast = useToast()
const ENDPOINT = 'pacientes'
const props = defineProps({
  mostrar: Boolean,
  paciente: {
    type: Object as () => Paciente,
    default: () => ({}) as Paciente,
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

const paciente = ref<Paciente>({ ...props.paciente })
watch(
  () => props.paciente,
  newVal => {
    paciente.value = { ...newVal }
  },
)

async function handleSave() {
  try {
    const body = {
      nombre: paciente.value.nombre,
      primerApellido: paciente.value.primerApellido,
      segundoApellido: paciente.value.segundoApellido,
      email: paciente.value.email,
      password: paciente.value.password,
      telefono: paciente.value.telefono,
      direccion: paciente.value.direccion,
    }
    if (props.modoEdicion) {
      await http.patch(`${ENDPOINT}/${paciente.value.id}`, body)
      toast.add({
        severity: 'success',
        summary: 'Paciente actualizado',
        detail: 'Los datos del paciente se han actualizado correctamente',
        life: 3000
      })
    } else {
      await http.post(ENDPOINT, body)
      toast.add({
        severity: 'success',
        summary: 'Paciente creado',
        detail: 'El paciente se ha creado correctamente',
        life: 3000
      })
    }
    emit('guardar')
    paciente.value = {} as Paciente
    dialogVisible.value = false
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error?.response?.data?.message || 'Ocurrió un error al procesar la solicitud',
      life: 5000
    })
  }
}
</script>

<template>
  <Toast />
  <div class="card flex justify-center">
    <Dialog
      v-model:visible="dialogVisible"
      :header="props.modoEdicion ? 'Editar' : 'Crear'"
      style="width: 25rem"
    >
      <div class="p-fluid">
        <!-- Nombre -->
        <div class="p-field mb-4">
          <label for="nombre" class="font-semibold">Nombre</label>
          <InputText
            id="nombre"
            v-model="paciente.nombre"
            autocomplete="off"
            autofocus
          />
        </div>

        <!-- Primer Apellido -->
        <div class="p-field mb-4">
          <label for="primer_apellido" class="font-semibold">Primer Apellido</label>
          <InputText
            id="primer_apellido"
            v-model="paciente.primerApellido"
            autocomplete="off"
          />
        </div>

        <!-- Segundo Apellido -->
        <div class="p-field mb-4">
          <label for="segundo_apellido" class="font-semibold">Segundo Apellido</label>
          <InputText
            id="segundo_apellido"
            v-model="paciente.segundoApellido"
            autocomplete="off"
          />
        </div>

        <!-- Correo -->
        <div class="p-field mb-4">
          <label for="email" class="font-semibold">Correo</label>
          <InputText
            id="email"
            v-model="paciente.email"
            autocomplete="off"
          />
        </div>

        <!-- Contraseña -->
        <div class="p-field mb-4">
          <label for="password" class="font-semibold">Contraseña</label>
          <Password
            id="password"
            v-model="paciente.password"
            :disabled="props.modoEdicion"
            :toggleMask="!props.modoEdicion"
            :feedback="!props.modoEdicion"
            autocomplete="off"
            weakLabel="Débil"
            mediumLabel="Media"
            strongLabel="Fuerte"
          />
        </div>

        <!-- Teléfono -->
        <div class="p-field mb-4">
          <label for="telefono" class="font-semibold">Teléfono</label>
          <InputText
            id="telefono"
            v-model="paciente.telefono"
            autocomplete="off"
          />
        </div>

        <!-- Dirección -->
        <div class="p-field mb-4">
          <label for="direccion" class="font-semibold">Dirección</label>
          <InputText
            id="direccion"
            v-model="paciente.direccion"
            autocomplete="off"
          />
        </div>

        <!-- Botones -->
        <div class="flex justify-end gap-2">
          <Button
            type="button"
            label="Cancelar"
            icon="pi pi-times"
            severity="secondary"
            @click="dialogVisible = false"
          ></Button>
          <Button
            type="button"
            label="Guardar"
            icon="pi pi-save"
            @click="handleSave"
          ></Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style scoped>
.p-inputtext:disabled {
  background-color: #f5f5f5;
  color: #9e9e9e;
  border-color: #e0e0e0;
}
</style>