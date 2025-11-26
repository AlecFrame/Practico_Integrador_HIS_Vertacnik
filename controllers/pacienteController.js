import { Paciente } from '../models/index.js';
import { Op } from "sequelize";

export const listarPacientes = async (req, res) => {
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

export const crearPaciente = async (req, res) => {
    const { nombre, apellido, dni, fechaNacimiento, sexo, telefono, direccion, visible=1 } = req.body;

    try {
        await Paciente.create({
            nombre,
            apellido,
            dni,
            fechaNacimiento,
            sexo,
            telefono,
            direccion,
            visible
        });

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: "Error al crear paciente" });
    }
};

export const actualizarPaciente = async (req, res) => {
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

export const darDeBajaPaciente = async (req, res) => {
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

export const darDeAltaPaciente = async (req, res) => {
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
