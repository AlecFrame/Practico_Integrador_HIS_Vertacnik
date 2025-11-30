import { Admision, Usuario, Paciente, Unidad, Ala, Habitacion, Cama, EvaluacionEnfermeria, EvaluacionMedica, AltaHospitalaria } from '../models/index.js';
import { Op } from "sequelize";

export const listar = async (req, res) => {
  const estado = req.query.estado || "activa";
  const tIF = req.query.tIF || '';
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  let where = {};

  // Filtro por estado
  if (estado != "todos") where.estado = estado;

  // Filtro por tipo de ingreso (cita, derivacion, emergencia)
  if (tIF) where.tipoIngreso = tIF;

  const { count, rows } = await Admision.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: [
      {
        model: Paciente,
        as: 'Paciente'
      }, {
        model: Cama,
        as: 'Cama',
        include: [
          {
            model: Habitacion,
            as: 'Habitacion',
            include: [
              {
                model: Ala,
                as: 'Ala',
                include: [ { model: Unidad, as: 'Unidad' } ]
              }
            ]
          }
        ]
      }
    ]
  });

  const totalPages = Math.ceil(count / pageSize);

  // Listas base
  const unidades = await Unidad.findAll({ where: { visible: 1 } });
  const pacientes = await Paciente.findAll({ where: { visible: 1 } });

  res.render("admision/index", {
    admisiones: rows,
    estado,
    unidades,
    pacientes,
    tIF,
    page,
    totalPages
  });
};

export const crear = async (req, res) => {
    if (!req.session.user)
        return res.json({ ok: false, error: "Error usuario no encontrado" });
    
    const { 
      fechaIngreso = new Date(), 
      tipoIngreso, 
      estado = 'activa', 
      motivoInternacion, 
      visible = 1, 
      derivadoPor, 
      pacienteId, 
      camaId, 
      usuarioAdmiteId = req.session.user.id
    } = req.body;

    try {
        const paciente = await Paciente.findByPk(pacienteId);

        if (!paciente) {
            return res.json({ ok: false, error: 'Paciente no asignado' });
        }

        const cama = await Cama.findByPk(camaId);

        if (!cama) {
            return res.json({ ok: false, error: 'Cama no asignada' });
        }

        await Admision.create({
            fechaIngreso,
            tipoIngreso,
            estado,
            motivoInternacion,
            visible,
            derivadoPor,
            pacienteId,
            camaId,
            usuarioAdmiteId
        });

        await Cama.update(
          { estado:'ocupada' },
          { where: { idCama: camaId }}
        )

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: "Error al crear admision" });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    await Admision.update(
      { visible: 0 },
      { where: { idAdmision: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const cambiarEstado = async (req, res) => {
  const nuevoEstado = req.params.estado;

  try {
    const admision = await Admision.findByPk(req.params.id);

    if (!admision) {
        return res.json({ ok: false, error: 'Admision no encontrado' });
    }

    await Admision.update(
      { estado: nuevoEstado },
      { where: { idAdmision: req.params.id } }
    );
    
    if (nuevoEstado=='activa') {
      await Cama.update(
        { estado: 'ocupada' },
        { where: { idCama: admision.camaId } }
      )
    }
    if (nuevoEstado=='finalizada') {
      await Cama.update(
        { estado: 'sucia' },
        { where: { idCama: admision.camaId } }
      )
    }
    if (nuevoEstado=='cancelada') {
      await Cama.update(
        { estado: 'libre' },
        { where: { idCama: admision.camaId } }
      )
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al cambiar el estado" });
  }
};

export const filtrarCamas = async (req, res) => {  
  const idUnidad = Number(req.params.idUnidad);
  const idAla = Number(req.params.idAla);
  const idHabitacion = Number(req.params.idHabitacion);
  const idPaciente = Number(req.params.idPaciente);

  // Solo camas libres y visibles
  let where = {
    estado: 'libre',
    visible: 1
  };

  if (idHabitacion > 0) {
    where.habitacionId = idHabitacion;
  } else if (idAla > 0) {
    where["$Habitacion.Ala.idAla$"] = idAla;
  } else if (idUnidad > 0) {
    where["$Habitacion.Ala.Unidad.idUnidad$"] = idUnidad;
  }

  try {
    const camas = await Cama.findAll({ 
      where,
      include: [
        {
          model: Habitacion,
          as: 'Habitacion',
          include: [
            { model: Ala, as: 'Ala', include: [{ model: Unidad, as: 'Unidad' }] },
            {
              model: Cama,
              as: 'Camas',
              where: { estado: 'ocupada' },
              required: false,
              include: [
                {
                  model: Admision,
                  as: 'Admisions',
                  where: { estado: 'activa' },
                  required: false,
                  include: [{ model: Paciente }]
                }
              ]
            }
          ]
        }
      ]
    });

    const paciente = await Paciente.findByPk(idPaciente);

    const camasFiltradas = camas.filter(cama => {
      if (!paciente) return true;

      const habitacion = cama.Habitacion;

      // Individual → cualquier cama libre sirve
      if (habitacion.tipo === 'individual') return true;

      // Doble → verificar sexo de ocupantes actuales
      for (const c of habitacion.Camas) {
        if (!c.Admisions[0]) continue; // cama libre
        if (c.Admisions[0].Paciente.sexo !== paciente.sexo) return false;
      }

      return true;
    });

    return res.json({ ok: true, camas: camasFiltradas });

  } catch (error) {
    return res.json({ ok: false, camas: [], error });
  }
};

export const filtrarPacientes = async (req, res) => {
  try {
    const q = req.query.q || "";
    const pacientes = await Paciente.findAll({
      where: {
        visible: 1,
        [Op.or]: [
          { nombre: { [Op.like]: `%${q}%` } },
          { apellido: { [Op.like]: `%${q}%` } },
          { dni: { [Op.like]: `%${q}%` } }
        ]
      },
      include: [
        {
          model: Admision,
          as: 'Admisions',
          where: { estado: 'activa' },
          required: false
        }
      ],
      limit: 20
    });

    let pacientesFiltros = pacientes.filter(paciente => {
      return paciente.Admisions.length === 0;
    });

    return res.json(pacientesFiltros);
  } catch (error) {
    console.error("error: ", error);
    return res.json({ ok: false, error: error });
  }
};

export const detalles = async (req, res) => {
  const estadoEnf = req.query.estadoEnf || "activos";
  const estadoMed = req.query.estadoMed || "activos";
  const pageEnf = parseInt(req.query.pageEnf) || 1;
  const pageSizeEnf = 10;
  const pageMed = parseInt(req.query.pageMed) || 1;
  const pageSizeMed = 10;

  const admision = await Admision.findByPk(req.params.id, {
    include: [
      {
        model: Paciente,
        as: 'Paciente'
      },
      {
        model: Cama,
        as: 'Cama',
        include: [{
          model: Habitacion,
          as: 'Habitacion',
          include: [{
            model: Ala,
            as: 'Ala',
            include: [{ model: Unidad, as: 'Unidad' }]
          }]
        }]
      },
      {
        model: Usuario,
        as: 'admitidoPor'
      }
    ]
  });

  let where = {};
  where.admisionId = req.params.id;

  if (estadoEnf === "activos") where.visible = 1;
  if (estadoEnf === "inactivos") where.visible = 0;

  const { count: countEnf, rows: rowsEnf } = await EvaluacionEnfermeria.findAndCountAll({
    where,
    limit: pageSizeEnf,
    offset: (pageEnf - 1) * pageSizeEnf,
    include: [
      {
        model: Usuario,
        as: 'Usuario'
      }
    ]
  });

  const totalPagesEnf = Math.ceil(countEnf / pageSizeEnf);

  rowsEnf.forEach(e => {
    if (typeof e.signosVitales === "string") {
      e.signosVitales = JSON.parse(e.signosVitales);
    }
  });

  where = {};
  where.admisionId = req.params.id;

  if (estadoMed === "activos") where.visible = 1;
  if (estadoMed === "inactivos") where.visible = 0;

  const { count: countMed, rows: rowsMed } = await EvaluacionMedica.findAndCountAll({
    where,
    limit: pageSizeMed,
    offset: (pageMed - 1) * pageSizeMed,
    include: [
      {
        model: Usuario,
        as: 'Usuario'
      }
    ]
  });

  const totalPagesMed = Math.ceil(countMed / pageSizeMed);

  const altas = await AltaHospitalaria.findAll({
    where: { admisionId: req.params.id },
    limit: 1,
    include: [{
      model: Usuario,
      as: 'Usuario'
    }]
  })

  res.render("admision/detalle", {
    admision,
    evaluacionesEnf: rowsEnf || [],
    evaluacionesMed: rowsMed || [],
    altaHospitalaria: (altas.length!=0)? altas[0]: null,
    estadoEnf,
    estadoMed,
    pageEnf,
    pageSizeEnf,
    pageMed,
    pageSizeMed,
    totalPagesEnf,
    totalPagesMed
  });
};