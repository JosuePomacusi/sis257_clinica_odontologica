Sistema de Gestión de Clínica Odontológica

Descripción
Este sistema ayuda a organizar y gestionar toda la información importante de una clínica odontológica. Permite registrar los datos de los pacientes, los odontólogos, los tratamientos que ofrecen y las citas que se agendan. De esta forma, se facilita el manejo de la clínica, asegurando que todo esté en orden y que tanto los pacientes como los profesionales puedan acceder a la información de manera rápida y sencilla.

Estructura de la Base de Datos
Roles(id, nombre_rol).
Pacientes(id, nombre, primer_apellido, segundo_apellido, email, password, telefono, direccion, rol_id).
Odontologos(id, nombre, primer_apellido, segundo_apellido, email, telefono, direccion, especialidad, rol_id).
Especialidades(id, nombre, descripcion).
Tratamientos(id, nombre, descripcion, precio, duracion).
Odontologos_tratamientos(odontologo_id, servicio_id).
Horarios(id, odontologo_id, fecha, hora, disponible).
Citas(id, estado, cliente_id, odontologo_id, servicio_id, fecha_hora_inicio, fecha_hora_fin).
Historiales_medicos(id, diagnostico, tratamiento_aplicado, observaciones, paciente_id, odontologo_id).
Configuraciones(id, clave, valor, descripcion).
Feriados(id, fecha, nombre, recurrente).
