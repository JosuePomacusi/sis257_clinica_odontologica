odontologos(id,nombre,primer_apellido,segundo_apellido,email,telefono,direccion,especialidad,rol_id)
pacientes(id,nombre,primer_apellido,segundo_apellido,email,password,telefono,direccion,rol_id)
tratamientos(id,nombre,descripcion,precio,duracion)
roles(id,nombre_rol)
odontologos_servicios(odontologo_id,tratamiento_id)
horarios(id,odontologo_id,fecha,hora,disponible)
citas(id,estado,paciente_id,odontologo_id,fecha_hora_inicio,fecha_hora_fin)

Descripcion
Este sistema ayuda a organizar y gestionar toda la información importante de una clínica odontológica. Permite registrar los datos de los pacientes, los odontólogos, los tratamientos que ofrecen y las citas que se agendan. De esta forma, se facilita el manejo de la clínica, asegurando que todo esté en orden y que tanto los pacientes como los profesionales puedan acceder a la información de manera rápida y sencilla.
