import { Paciente, Admision } from '../models/index.js';
import { Op } from "sequelize";

export const listar = async (req, res) => {
  const estado = req.query.estado || "activos";
  const buscar = req.query.buscar || "";
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  let where = {};

  // Filtro por estado
  if (estado === "activos") where.visible = 1;
  if (estado === "inactivos") where.visible = 0;

  // Filtro por texto (nombre, apellido o DNI)
  if (buscar.trim() !== "") {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${buscar}%` } },
      { apellido: { [Op.like]: `%${buscar}%` } },
      { dni: { [Op.like]: `%${buscar}%` } }
    ];
  }

  const { count, rows } = await Paciente.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize
  });

  const totalPages = Math.ceil(count / pageSize);

  res.render("paciente/index", {
    pacientes: rows,
    estado,
    buscar,
    page,
    totalPages
  });
};

export const crear = async (req, res) => {
    const { nombre, apellido, dni, fechaNacimiento, sexo, telefono, direccion, visible=1, pacienteNNId } = req.body;

    let paciente = null;

    try {
        paciente = await Paciente.create({
            nombre,
            apellido,
            dni,
            fechaNacimiento,
            sexo,
            telefono,
            direccion,
            visible
        });

        if (!paciente)
          return res.json({ ok: false, error: "El paciente no se pudo crear" });

        if (pacienteNNId) {
          // Marcar el paciente NN como invisible
          await Paciente.update(
              { visible: 0 },
              { where: { idPaciente: pacienteNNId } }
          );

          await Admision.update(
            { pacienteId: paciente.idPaciente },
            { where: { pacienteId: pacienteNNId } }
          );
        }

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: "Error al crear paciente" });
    }
};

export const actualizar = async (req, res) => {
    const { nombre, apellido, dni, fechaNacimiento, sexo, telefono, direccion } = req.body;

    try {
        await Paciente.update(
            { nombre, apellido, dni, fechaNacimiento, sexo, telefono, direccion },
            { where: { idPaciente: req.params.id } }
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: 'Error al actualizar paciente' });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    await Paciente.update(
      { visible: 0 },
      { where: { idPaciente: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    await Paciente.update(
      { visible: 1 },
      { where: { idPaciente: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};

export const relacionar = async (req, res) => {
    const { pacienteNNId, pacienteId } = req.body;

    try {
        const pacienteReal = await Paciente.findByPk(pacienteId);
        if (!pacienteReal)
            return res.json({ ok: false, error: "Paciente real no encontrado" });

        const pacienteNN = await Paciente.findByPk(pacienteNNId);
        if (!pacienteNN)
            return res.json({ ok: false, error: "Paciente NN no encontrado" });

        // Actualizar todas las admisiones que pertenecían al NN
        const result = await Admision.update(
            { pacienteId: pacienteId },
            { where: { pacienteId: pacienteNNId } }
        );

        // Marcar el paciente NN como invisible
        await Paciente.update(
            { visible: 0 },
            { where: { idPaciente: pacienteNNId } }
        );

        return res.json({
            ok: true,
            reasignadas: result[0],   // cuántas admisiones se reasociaron
            pacienteRealId: pacienteId,
            pacienteNNId
        });

    } catch (error) {
        console.error(error);
        return res.json({ ok: false, error: "Error al relacionar paciente" });
    }
};