import { Unidad } from '../models/index.js';
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

  // Filtro por texto (nombre)
  if (buscar.trim() !== "") {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${buscar}%` } }
    ];
  }

  const { count, rows } = await Unidad.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize
  });

  const totalPages = Math.ceil(count / pageSize);

  res.render("estructuraHospitalaria/unidad", {
    unidades: rows,
    estado,
    buscar,
    page,
    totalPages
  });
};

export const crear = async (req, res) => {
    const { nombre, visible=1 } = req.body;

    try {
        await Unidad.create({
            nombre,
            visible
        });

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: "Error al crear unidad" });
    }
};

export const actualizar = async (req, res) => {
    const { nombre } = req.body;

    try {
        await Unidad.update(
            { nombre },
            { where: { idUnidad: req.params.id } }
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: 'Error al actualizar unidad' });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    await Unidad.update(
      { visible: 0 },
      { where: { idUnidad: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    await Unidad.update(
      { visible: 1 },
      { where: { idUnidad: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
