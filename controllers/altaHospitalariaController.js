import { AltaHospitalaria, Paciente, Usuario, Admision, Cama, Habitacion, Ala, Unidad } from '../models/index.js';
import { Op } from "sequelize";

export const listar = async (req, res) => {
  const estado = req.query.estado || "activos";
  const qPaciente = req.query.qPaciente || "";
  const qMedico = req.query.qMedico || "";
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  let where = {};

  // Filtro por estado
  if (estado === "activos") where.visible = 1;
  if (estado === "inactivos") where.visible = 0;

  // Filtro por texto del Paciente (nombre, apellido o DNI)
  if (qPaciente.trim() !== "") {
    where[Op.or] = [
      { ["$Admision.Paciente.nombre$"] : { [Op.like]: `%${qPaciente}%` } },
      { ["$Admision.Paciente.apellido$"] : { [Op.like]: `%${qPaciente}%` } },
      { ["$Admision.Paciente.dni$"] : { [Op.like]: `%${qPaciente}%` } }
    ];
  }

  // Filtro por texto del Medico (nombre, apellido)
  if (qMedico.trim() !== "") {
    where[Op.or] = [
      { ["$Usuario.nombre$"] : { [Op.like]: `%${qMedico}%` } },
      { ["$Usuario.apellido$"] : { [Op.like]: `%${qMedico}%` } }
    ];
  }

  const { count, rows } = await AltaHospitalaria.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: [{
        model: Usuario,
        as: 'Usuario'
      }, {
        model: Admision,
        as: 'Admision',
        include: [{ model: Paciente, as: 'Paciente' },
          {
            model: Cama,
            as: 'Cama',
            include: [{
              model: Habitacion,
              as: 'Habitacion',
              include: [{
                model: Ala,
                as: 'Ala',
                include: [{ model: Unidad, as: 'Unidad'}]
              }]
            }]
          }
        ]
      }
    ]
  });

  const totalPages = Math.ceil(count / pageSize);

  res.render("admision/alta", {
    altaHospitalarias: rows,
    estado,
    qPaciente,
    qMedico,
    page,
    totalPages
  });
};

export const crear = async (req, res) => {
  if (!req.session.user)
    return res.json({ ok: false, error: "Error usuario no encontrado" });

  const { diagnosticoFinal, indicacionesAlta, seguimientoFuturo,
    fecha= new Date(), 
    visible=1, 
    admisionId, 
    medicoId= req.session.user.id 
  } = req.body;

  try {
    const admision = await Admision.findByPk(admisionId);

    if (!admision)
      return res.json({ ok: false, error: "Error Admisión no encontrada" });

    await AltaHospitalaria.create({
        diagnosticoFinal, 
        indicacionesAlta, 
        seguimientoFuturo,
        fecha,
        visible,
        admisionId,
        medicoId
    });

    await Admision.update(
      { estado: 'finalizada' },
      { where: { idAdmision: admisionId }}
    )

    await Cama.update(
      { estado: 'sucia' },
      { where: { idCama: admision.camaId } }
    )

    return res.json({ ok: true });
  } catch (error) {
    return res.json({ ok: false, error: "Error al crear AltaHospitalaria" });
  }
};

export const darDeBaja = async (req, res) => {
  try {
    await AltaHospitalaria.update(
      { visible: 0 },
      { where: { idAltaHospitalaria: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    await AltaHospitalaria.update(
      { visible: 1 },
      { where: { idAltaHospitalaria: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
