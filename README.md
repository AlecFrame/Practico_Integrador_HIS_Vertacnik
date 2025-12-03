## Sistema de Gestión Hospitalaria – HIS 2025

Proyecto final – Web II – Universidad de La Punta
Autor: Walter Alexander Vertacnik

## 🏥 Descripción del Sistema

El proyecto es un Sistema de Gestión Hospitalaria (HIS) que permite manejar el flujo de internación de pacientes, incluyendo:

* Gestión de infraestructura hospitalaria (Unidades, Alas, Habitaciones, Camas)
* Registro de pacientes y usuarios
* Admisiones (ingreso del paciente al hospital)
* Evaluaciones de Enfermería y Médicas
* Alta Hospitalaria (cierre de la internación)
* Control de roles y permisos según el personal
* Sesiones, vistas en Pug y persistencia con MySQL/Sequelize
* Auditoria de acciones realizadas en el sistema
* Todo el sistema funciona según un flujo clínico real donde cada rol tiene permisos específicos.

## 🚀 Tecnologías utilizadas

- Node.js + Express
- Sequelize (ORM)
- MySQL 8
- Pug (template engine)
- Express-session
- Multer (para subir avatar del usuario)
- bcrypt (para hashes de clave)

## 🧱 Modelos y Campos Principales

El sistema utiliza 11 modelos principales:

1. Usuario
    Datos del usuario del sistema
    Roles disponibles: admin, recepcion, enfermeria, medico

2. Paciente
    Datos personales del paciente
    Relación 1:N con Admisiones

3. Admisión
    Contiene información del ingreso del paciente:
    fechaIngreso
    tipoIngreso: cita | derivacion | emergencia
    motivoInternacion
    estado: activa | cancelada | finalizada

    FK → Paciente
    FK → Cama
    FK → Usuario que admite

4. Infraestructura
    Unidad → tiene muchas Alas
    Ala → tiene muchas Habitaciones
    Habitacion → tiene muchas Camas
    Cama → puede tener muchas Admisiones

5. Evaluación de Enfermería
    Signos vitales (JSON)
    Alergias, medicación, síntomas, plan de cuidados

    FK → Admision
    FK → Usuario (enfermero)

6. Evaluación Médica
    Diagnóstico, indicaciones, medicación, terapias

    FK → Admision
    FK → Usuario (médico)

7. Alta Hospitalaria
    Diagnóstico final
    Indicaciones del alta
    Seguimiento futuro

    FK → Admisión
    FK → Médico responsable

## 🔗 Relaciones entre los modelos

* Infraestructura:
    Unidad 1:N Ala
    Ala 1:N Habitacion
    Habitacion 1:N Cama
    Cama 1:N Admision

* Pacientes:
    Paciente 1:N Admision
    Admisiones:
    Admision N:1 Paciente
    Admision N:1 Cama
    Admision N:1 Usuario (admitidoPor)

* Evaluaciones:
    Admision 1:N EvaluacionEnfermeria
    Admision 1:N EvaluacionMedica
    Usuario 1:N EvaluacionEnfermeria
    Usuario 1:N EvaluacionMedica

* Alta:
    Admision 1:N AltaHospitalaria
    Usuario (médico) 1:N AltaHospitalaria

## 🔐 Roles del Sistema y Permisos

El sistema funciona con 4 roles principales:

💼 ADMIN

✔ Administrar usuarios
✔ Gestionar pacientes
✔ Gestionar infraestructura (Unidades, Alas, Habitaciones, Camas)
✔ Ver todas las auditorias
✔ Ver listado de admisiones
❌ No ve evaluaciones
❌ No ve detalles clínicos
❌ No genera altas

🧑‍💼 RECEPCIÓN

✔ Crear y cancelar admisiones
✔ Gestionar pacientes
✔ Ver listado administrativo de admisiones
❌ No ve evaluaciones
❌ No ve detalles clínicos
❌ No genera altas

👩‍⚕️ ENFERMERÍA

✔ Ver estructura hospitalaria (solo lectura)
✔ Ver admisiones con detalle clínico
✔ Crear evaluaciones de enfermería
✔ Ver evaluaciones médicas
✔ Ver altas hospitalarias
❌ No crear ni editar pacientes
❌ No administrar usuarios
❌ No generar alta hospitalaria

🩺 MÉDICO

✔ Todo lo que ve Enfermería
✔ Crear evaluaciones médicas
✔ Dar alta hospitalaria
❌ No administra estructura
❌ No gestiona pacientes
❌ No usa el módulo de usuarios

## 🏥 Flujo Clínico Completo

1. Recepción crea al paciente (si no existe).
2. Recepción crea una admisión y asigna cama.
3. Enfermería realiza la evaluación inicial.
4. Médico realiza su evaluación médica.
5. Médico completa el Alta Hospitalaria.
6. La cama pasa a estado "sucia".
7. Enfermería la limpia y la deja "libre".
8. Todo queda trazado y sin eliminar información médica.

## 🗂️ Estructura de Carpetas

/config
/controllers
/moddleware
/models
/public
/routes
/views
app.js
README.md

## 👤 Usuarios demo

* ADMIN: adminjefe@gmail.com / temporal1234
* RECEPCION: lechuga@gmail.com/ temporal1234
* ENFERMERO: milanesa@gmail.com / temporal1234
* MEDICO: ñoquis@gmail.com / temporal1234

## Algunas validaciones que se tuvieron en cuenta

- Validar que no se pueda cambiar el tipo a individual de una habitacion si este posee 2 camas activas

- Validar que no se pueda crear una cama más en una habitacion ya completa de camas
- Validar que al actualizar una cama no elegir una habitacion ya completa de camas
- Validar que al activar una cama no sea en una habitacion ya completa de camas

- Al crear una admision y asingar un paciente a una cama, actualizar estado de cama para que este ocupada,
- Si la cama esta ocupada no puede cambiar su estado si tiene una admision relacionada activa,
- No se puede admitir un paciente que ya está admitido,
- No se puede ingresar en una habitacion a 2 pacientes de sexos diferentes,
- Al cancelar una admision devolver el libre a una cama