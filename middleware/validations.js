import Joi from "joi";
import { Paciente, Admision, Usuario, Habitacion, Ala, Cama } from "../models/index.js";

export const validarDniUnico = async (req, res, next) => {
  const { dni } = req.body;

  const existente = await Paciente.findOne({
    where: { dni }
  });

  if (existente) {
    return res.json({
      ok: false,
      field: "dni",
      error: "El DNI ya está registrado en el sistema"
    });
  }

  next();
};

export const validarDniUnicoEditar = async (req, res, next) => {
  const { dni } = req.body;
  const { id } = req.params;

  const existente = await Paciente.findOne({
    where: { dni }
  });

  if (existente && existente.idPaciente != id) {
    return res.json({
      ok: false,
      field: "dni",
      error: "El DNI ya pertenece a otro paciente"
    });
  }

  next();
};

export const validarPaciente = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "El campo Nombre está vacío",
        "string.min": "El Nombre debe tener al menos 2 caracteres",
        "string.max": "El Nombre debe tener menos de 50 caracteres",
        "any.required": "El Nombre es obligatorio"
      }),

    apellido: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "El campo Apellido está vacío",
        "string.min": "El Apellido debe tener al menos 2 caracteres",
        "string.max": "El Apellido debe tener menos de 50 caracteres",
        "any.required": "El Apellido es obligatorio"
      }),

    dni: Joi.string()
      .pattern(/^[0-9]+$/)
      .min(7)
      .max(9)
      .required()
      .messages({
        "string.empty": "El campo DNI está vacío",
        "string.pattern.base": "El DNI debe contener solo números",
        "string.min": "El DNI debe tener al menos 7 dígitos",
        "string.max": "El DNI no puede tener más de 9 dígitos",
        "any.required": "El DNI es obligatorio"
      }),

    fechaNacimiento: Joi.date()
      .max("now")
      .required()
      .messages({
        "date.max": "La fecha no puede ser posterior a hoy",
        "date.base": "La Fecha de nacimiento no es válida",
        "any.required": "La Fecha de nacimiento es obligatoria"
      }),

    sexo: Joi.string()
      .valid("M", "F", "NN")
      .required()
      .messages({
        "any.only": "Sexo no válido",
        "any.required": "El sexo es obligatorio"
      }),

    telefono: Joi.string()
      .required()
      .max(15)
      .messages({
        "string.empty": "El campo Teléfono está vacío",
        "string.max": "El Teléfono debe tener menos de 15 caracteres",
        "any.required": "El Teléfono es obligatorio"
      }),

    direccion: Joi.string()
      .required()
      .messages({
        "string.empty": "El campo Dirección está vacío",
        "any.required": "La Dirección es obligatorio"
      }),

    obraSocial: Joi.string()
      .required()
      .messages({
        "string.empty": "El campo de Obra Social está vacío",
        "any.required": "La Obra Social es obligatoria"
      }),

    contactoEmergenciaNombre: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        "string.empty": "El Nombre del Contacto de Emergencia está vacío",
        "string.min": "El Nombre del Contacto de Emergencia debe tener al menos 2 caracteres",
        "string.max": "El Nombre del Contacto de Emergencia debe tener menos de 100 caracteres",
        "any.required": "El Nombre del Contacto de Emergencia es obligatorio"
      }),

    contactoEmergenciaTelefono: Joi.string()
      .required()
      .max(15)
      .messages({
        "string.empty": "El Teléfono del Contacto de Emergencia está vacío",
        "string.max": "El Teléfono del Contacto de Emergencia debe tener menos de 15 caracteres",
        "any.required": "El Teléfono del Contacto de Emergencia es obligatorio"
      }),

    contactoEmergenciaRelacion: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "La relacion del Contacto de Emergencia está vacía",
        "string.min": "La relacion del Contacto de Emergencia debe tener al menos 2 caracteres",
        "string.max": "La relacion del Contacto de Emergencia debe tener menos de 50 caracteres",
        "any.required": "La relacion del Contacto de Emergencia es obligatoria"
      }),
    
    id: Joi.number().optional(),
    pacienteNNId: Joi.number().optional(),
    admisionId: Joi.number().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;
    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarAdmision = (req, res, next) => {
  const schema = Joi.object({
    tipoIngreso: Joi.string()
      .valid('cita', 'derivacion', 'emergencia')
      .required()
      .messages({
        "any.only": "El Tipo de Ingreso no es válido",
        "any.required": "El Tipo de Ingreso es obligatorio"
      }),
    
    motivoInternacion: Joi.string()
      .required()
      .messages({
        "string.empty": "El campo Motivo de Internación está vacío",
        "any.required": "El Motivo de la Internación es obligatorio"
      }),
    
    derivadoPor: Joi.string()
      .trim()
      .when('tipoIngreso', {
        is: 'derivacion',
        then: Joi.required().messages({
          "string.empty": "El campo Derivado por es obligatorio en una derivación",
          "any.required": "El campo Derivado por es obligatorio en una derivación"
        }),
        otherwise: Joi.optional().allow('')
      }),

    pacienteId: Joi.number().optional(),
    
    camaId: Joi.number()
      .integer()
      .min(1)
      .required()
      .messages({
        "number.base": "La Cama seleccionada no es válida",
        "number.min": "Debes seleccionar una Cama válida",
        "any.required": "La Cama es obligatoria"
      }),

    id: Joi.number().optional(),
    pacienteNN: Joi.string().optional(),
    pacienteNNId: Joi.number().optional(),
    unidadId: Joi.number().optional(),
    alaId: Joi.number().optional(),
    habitacionId: Joi.number().optional(),
    admisionId: Joi.number().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;
    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarConsistenciaDeAdmisiones = async (req, res, next) => {
  const { camaId, pacienteId, pacienteNN, derivadoPor, tipoIngreso } = req.body;

  // ---- Paciente NN vs Paciente normal ----
  const esNN = pacienteNN === "on";

  if (!esNN) {
    if (!pacienteId) {
      return res.json({
        ok: false,
        field: "pacienteId",
        error: "Debes seleccionar un Paciente"
      });
    }

    const paciente = await Paciente.findByPk(pacienteId);
    if (!paciente) {
      return res.json({
        ok: false,
        field: "pacienteId",
        error: "El Paciente no existe en el sistema"
      });
    }
  }

  // ---- Derivación requiere derivadoPor ----
  if (tipoIngreso === 'derivacion') {
    if (!derivadoPor || derivadoPor.trim() === "") {
      return res.json({
        ok: false,
        field: "derivadoPor",
        error: "El campo Derivado por es obligatorio para una derivación"
      });
    }
  }

  // ---- Validar cama existente ----
  const cama = await Cama.findByPk(camaId);
  if (!cama) {
    return res.json({
      ok: false,
      field: "camaId",
      error: "La Cama seleccionada no existe"
    });
  }

  next();
};

export const validarUnidad = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string()
      .required()
      .messages({
        "string.empty": "El campo Nombre está vacío",
        "any.required": "El Nombre es obligatorio"
      }),
    
    id: Joi.number().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;
    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarAla = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string()
      .required()
      .messages({
        "string.empty": "El campo Nombre está vacío",
        "any.required": "El Nombre es obligatorio"
      }),
    
    id: Joi.number().optional(),
    unidadId: Joi.number().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;
    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarHabitacion = (req, res, next) => {
  const schema = Joi.object({
    numero: Joi.string()
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        "string.empty": "El campo Número está vacío",
        "string.pattern.base": "El Número debe contener solo números",
        "any.required": "El Número es obligatorio"
      }),

    tipo: Joi.string()
      .valid('individual', 'doble')
      .required()
      .messages({
        "any.only": "Tipo no válido",
        "any.required": "El Tipo es obligatorio"
      }),
    
    id: Joi.number().optional(),
    unidadId: Joi.number().optional(),
    alaId: Joi.number().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;
    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarConsistenciaDeHabitaciones = async (req, res, next) => {
  const { alaId } = req.body;

  // ---- Validar cama existente ----
  const ala = await Ala.findByPk(alaId);
  if (!ala) {
    return res.json({
      ok: false,
      field: "alaId",
      error: "El Ala seleccionada no existe"
    });
  }

  next();
};

export const validarCama = (req, res, next) => {
  const schema = Joi.object({
    numero: Joi.string()
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        "string.empty": "El campo Número está vacío",
        "string.pattern.base": "El Número debe contener solo números",
        "any.required": "El Número es obligatorio"
      }),

    estado: Joi.string()
      .valid('libre', 'ocupada', 'sucia', 'mantenimiento')
      .required()
      .messages({
        "any.only": "Estado no válido",
        "any.required": "El Estado es obligatorio"
      }),
    
    id: Joi.number().optional(),
    unidadId: Joi.number().optional(),
    alaId: Joi.number().optional(),
    habitacionId: Joi.number().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;
    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarConsistenciaDeCamas = async (req, res, next) => {
  const { habitacionId, id } = req.body; // id = id de la cama si es edición

  // Buscar habitación con sus camas
  const habitacion = await Habitacion.findByPk(habitacionId, {
    include: {
      model: Cama,
      as: 'Camas',
      where: { visible: 1 }
    }
  });

  if (!habitacion) {
    return res.json({
      ok: false,
      field: "habitacionId",
      error: "La Habitación seleccionada no existe"
    });
  }

  let cantidadCamas = habitacion.Camas.length;

  // Si es edición, excluir la cama que se está editando del conteo
  if (id) {
    cantidadCamas = habitacion.Camas.filter(c => c.idCama !== Number(id)).length;
  }

  // Máximo según tipo de habitación
  const maxCamas = habitacion.tipo === "individual" ? 1 :
                   habitacion.tipo === "doble"      ? 2 : Infinity;

  // Validación
  if (cantidadCamas >= maxCamas) {
    return res.json({
      ok: false,
      field: "habitacionId",
      error: "La Habitación no admite más camas"
    });
  }

  next();
};

export const validarEnfermeria = (req, res, next) => {

  const schema = Joi.object({

    historialMedico: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "El Historial Médico está vacío",
        "any.required": "El Historial Médico es obligatorio"
      }),

    antecedentes: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "Los Antecedentes están vacíos",
        "any.required": "Los Antecedentes son obligatorios"
      }),

    alergias: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "Las Alergias están vacías",
        "any.required": "Las Alergias son obligatorias"
      }),

    medicacionActual: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "La Medicación Actual está vacía",
        "any.required": "La Medicación Actual es obligatoria"
      }),

    sintomas: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "Los Síntomas están vacíos",
        "any.required": "Los Síntomas son obligatorios"
      }),

    planCuidados: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "El Plan de Cuidados está vacío",
        "any.required": "El Plan de Cuidados es obligatorio"
      }),

    // --- Signos Vitales ---

    presionSistolica: Joi.number()
      .min(50).max(250)
      .required()
      .messages({
        "number.base": "La Presión Sistólica debe ser un número",
        "number.min": "La Presión Sistólica es demasiado baja",
        "number.max": "La Presión Sistólica es demasiado alta",
        "any.required": "La Presión Sistólica es obligatoria"
      }),

    presionDiastolica: Joi.number()
      .min(30).max(150)
      .required()
      .messages({
        "number.base": "La Presión Diastólica debe ser un número",
        "number.min": "La Presión Diastólica es demasiado baja",
        "number.max": "La Presión Diastólica es demasiado alta",
        "any.required": "La Presión Diastólica es obligatoria"
      }),

    frecuenciaCardiaca: Joi.number()
      .min(20).max(220)
      .required()
      .messages({
        "number.base": "La Frecuencia Cardíaca debe ser un número",
        "number.min": "La Frecuencia Cardíaca es demasiado baja",
        "number.max": "La Frecuencia Cardíaca es demasiado alta",
        "any.required": "La Frecuencia Cardíaca es obligatoria"
      }),

    frecuenciaRespiratoria: Joi.number()
      .min(5).max(80)
      .required()
      .messages({
        "number.base": "La Frecuencia Respiratoria debe ser un número",
        "number.min": "La Frecuencia Respiratoria es demasiado baja",
        "number.max": "La Frecuencia Respiratoria es demasiado alta",
        "any.required": "La Frecuencia Respiratoria es obligatoria"
      }),

    temperatura: Joi.number()
      .min(30).max(43)
      .required()
      .messages({
        "number.base": "La Temperatura debe ser un número",
        "number.min": "La Temperatura es demasiado baja",
        "number.max": "La Temperatura es demasiado alta",
        "any.required": "La Temperatura es obligatoria"
      }),

    // Identificadores
    id: Joi.number().optional(),
    admisionId: Joi.number()
      .required()
      .messages({
        "any.required": "El ID de admisión es obligatorio",
      })

  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;

    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarMedicina = (req, res, next) => {
  const schema = Joi.object({
    diagnostico: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "El Diagnóstico está vacío",
        "any.required": "El Diagnóstico es obligatorio"
      }),

    indicaciones: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "Las Indicaciones están vacío",
        "any.required": "Las Indicaciones son obligatorias"
      }),

    medicacion: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "La Medicación está vacío",
        "any.required": "La Medicación es obligatoria"
      }),

    terapias: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "Las Terapias están vacías",
        "any.required": "Las Terapias son obligatorias"
      }),
    
    id: Joi.number().optional(),
    admisionId: Joi.number().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;
    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarAltaHospitalaria = (req, res, next) => {
  const schema = Joi.object({
    diagnosticoFinal: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "El Diagnóstico Final está vacío",
        "any.required": "El Diagnóstico Final es obligatorio"
      }),

    indicacionesAlta: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "Las Indicaciones de Alta están vacías",
        "any.required": "Las Indicaciones de Alta son obligatorias"
      }),

    seguimientoFuturo: Joi.string()
      .min(1)
      .required()
      .messages({
        "string.empty": "El Seguimiento Futuro está vacío",
        "any.required": "El Seguimiento Futuro es obligatorio"
      }),
    
    id: Joi.number().optional(),
    admisionId: Joi.number().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;
    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarAdmisionId = async (req, res, next) => {
  const { admisionId } = req.body;

  const admision = await Admision.findByPk(admisionId);

  if (!admision) {
    return res.json({
      ok: false,
      field: "admisionId",
      error: "La Admisión seleccionada no existe"
    });
  }

  next();
};

export const validarRelacionPaciente = async (req, res, next) => {
  const { pacienteId } = req.body;

  const paciente = await Admision.findByPk(pacienteId);

  if (!paciente) {
    return res.json({
      ok: false,
      field: "pacienteId",
      error: "No se ha seleccionado ningún Paciente existente"
    });
  }

  next();
};

export const validarUsuarioCrear = (req, res, next) => {
  const schema = Joi.object({
    nombre: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "El Nombre está vacío",
        "string.min": "El Nombre es demasiado corto",
        "any.required": "El Nombre es obligatorio"
      }),

    apellido: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "El Apellido está vacío",
        "string.min": "El Apellido es demasiado corto",
        "any.required": "El Apellido es obligatorio"
      }),

    email: Joi.string()
      .email({ tlds: false })
      .required()
      .messages({
        "string.empty": "El Email está vacío",
        "string.email": "Formato de Email inválido",
        "any.required": "El Email es obligatorio"
      }),

    rol: Joi.string()
      .valid("admin", "recepcion", "enfermeria", "medico")
      .required()
      .messages({
        "any.only": "Rol no válido",
        "any.required": "El Rol es obligatorio"
      }),

    clave: Joi.string()
      .min(4)
      .required()
      .messages({
        "string.empty": "La Contraseña está vacía",
        "string.min": "La Contraseña debe tener al menos 4 caracteres",
        "any.required": "La Contraseña es obligatoria"
      }),

    // estos vienen del form, aunque no los uses
    flagEliminarAvatar: Joi.string().optional(),
    id: Joi.number().optional(),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;

    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarUsuarioEditar = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().required(),

    nombre: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "El Nombre está vacío",
        "string.min": "El Nombre es demasiado corto"
      }),

    apellido: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        "string.empty": "El Apellido está vacío",
        "string.min": "El Apellido es demasiado corto"
      }),

    email: Joi.string()
      .email({ tlds: false })
      .required()
      .messages({
        "string.empty": "El Email está vacío",
        "string.email": "Formato de Email inválido"
      }),

    rol: Joi.string()
      .valid("admin", "recepcion", "enfermeria", "medico")
      .optional()
      .messages({
        "any.only": "Rol no válido"
      }),

    clave: Joi.string()
      .allow("")     // <-- permite vacía
      .min(4)
      .messages({
        "string.min": "La nueva Contraseña debe tener al menos 4 caracteres"
      }),

    flagEliminarAvatar: Joi.string().optional()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    const field = error.details[0].path[0];
    const message = error.details[0].message;

    return res.json({
      ok: false,
      field,
      error: message,
      details: error.details
    });
  }

  next();
};

export const validarConsistenciaUsuario = async (req, res, next) => {
  const { id, email, rol } = req.body;
  const usuarioDB = await Usuario.findOne({ where: { email } });

  // Email duplicado (solo si no es él mismo)
  if (usuarioDB && usuarioDB.idUsuario != id) {
    return res.json({
      ok: false,
      field: "email",
      error: "Ya existe un usuario con este email"
    });
  }

  // No permitir cambiarse rol a uno mismo
  if (req.user.id == id && req.body.rol && req.body.rol !== req.user.rol) {
    return res.json({
      ok: false,
      field: "rol",
      error: "No puedes cambiar tu propio rol"
    });
  }

  // No permitir modificar al usuario superadmin ID 1
  if (id == 1 && rol !== undefined && rol !== "admin") {
    return res.json({
      ok: false,
      field: "rol",
      error: "No puedes modificar el rol del usuario principal"
    });
  }

  next();
};
