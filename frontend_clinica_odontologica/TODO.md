# TODO: Rename cliente to paciente and servicio to tratamiento

## Folder Renames
- [ ] Rename src/components/clientes/ to src/components/pacientes/
- [ ] Rename src/components/servicios/ to src/components/tratamientos/
- [ ] Rename src/components/clientes_crud/ to src/components/pacientes_crud/
- [ ] Rename src/components/odontologo_servicios/ to src/components/odontologo_tratamientos/
- [ ] Rename src/components/components/clientes/ to src/components/components/pacientes/
- [ ] Rename src/components/components/servicios/ to src/components/components/tratamientos/
- [ ] Rename src/components/components/clientes_crud/ to src/components/components/pacientes_crud/
- [ ] Rename src/components/components/odontologo_servicios/ to src/components/components/odontologo_tratamientos/

## File Renames
- [ ] Rename ClienteList.vue to PacienteList.vue (in pacientes/)
- [ ] Rename ClienteSave.vue to PacienteSave.vue
- [ ] Rename ClienteSaveFormulario.vue to PacienteSaveFormulario.vue
- [ ] Rename CambiarPasswordDialog.vue to CambiarPasswordDialog.vue (same)
- [ ] Rename ClienteCrudSave.vue to PacienteCrudSave.vue (in pacientes_crud/)
- [ ] Rename ClientesCrudList.vue to PacientesCrudList.vue
- [ ] Rename ServicioList.vue to TratamientoList.vue (in tratamientos/)
- [ ] Rename ServicioSave.vue to TratamientoSave.vue
- [ ] Rename OdontologoServicioEdit.vue to OdontologoTratamientoEdit.vue (in odontologo_tratamientos/)
- [ ] Rename OdontologoServicioList.vue to OdontologoTratamientoList.vue
- [ ] Rename OdontologoServicioSave.vue to OdontologoTratamientoSave.vue
- [ ] Rename ClienteCrearCuentaView.vue to PacienteCrearCuentaView.vue (in views/)
- [ ] Rename ClienteCrudView.vue to PacienteCrudView.vue
- [ ] Rename ClienteView.vue to PacienteView.vue
- [ ] Rename ServiciosView.vue to TratamientosView.vue
- [ ] Rename OdontologoServiciosView.vue to OdontologoTratamientosView.vue
- [ ] Rename Cliente.ts to Paciente.ts (in models/)
- [ ] Rename Servicios.ts to Tratamientos.ts
- [ ] Rename Odontologo_servicio.ts to Odontologo_tratamiento.ts
- [ ] Rename useServicios.ts to useTratamientos.ts (in composables/)

## Code Replacements
- [ ] Replace all "cliente" with "paciente" in code (variables, strings, etc.)
- [ ] Replace all "Cliente" with "Paciente" (class names, types)
- [ ] Replace all "servicio" with "tratamiento"
- [ ] Replace all "Servicio" with "Tratamiento"
- [ ] Replace all "servicios" with "tratamientos" (plural)
- [ ] Replace all "Servicios" with "Tratamientos"

## Router Updates
- [ ] Update paths: /clientes to /pacientes, /servicios to /tratamientos, /cliente-crear-cuenta to /paciente-crear-cuenta, etc.
- [ ] Update route names: clientes to pacientes, servicios to tratamientos, etc.
- [ ] Update meta roles: 'cliente' to 'paciente'

## Import Updates
- [ ] Update all import statements to reflect new file names and paths
- [ ] Update references in components, views, etc.

## Dependent Updates
- [ ] Update any hardcoded strings in templates (e.g., "cliente" in HTML)
- [ ] Update API endpoints if they change (but assuming backend stays same, just frontend)
- [ ] Update composables and stores references
