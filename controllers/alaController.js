import { Unidad, Ala } from '../models/index.js';
import { Op } from "sequelize";

export const listar = async (req, res) => {
  const estado = req.query.estado || "activos";
  const unidadFiltro = req.query.unidadFiltro || 0;
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  let where = {};

  // Filtro por estado
  if (estado === "activos") where.visible = 1;
  if (estado === "inactivos") where.visible = 0;

  // Filtro de alas por ID de Unidad
  if (unidadFiltro != 0) {
    where[Op.or] = [
      { unidadId: unidadFiltro }
    ];
  }

  const { count, rows } = await Ala.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: [{
      model: Unidad,
      as: 'Unidad'
    }]
  });

  const unidades = await Unidad.findAll({
    where: { visible: 1 }
  });

  const totalPages = Math.ceil(count / pageSize);

  res.render("estructuraHospitalaria/ala", {
    alas: rows,
    unidades: unidades,
    estado,
    unidadFiltro,
    page,
    totalPages
  });
};

export const crear = async (req, res) => {
    const { nombre, unidadId, visible=1 } = req.body;

    try {
        await Ala.create({
            nombre,
            unidadId,
            visible
        });

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: "Error al crear ala" });
    }
};

export const actualizar = async (req, res) => {
    const { nombre, unidadId } = req.body;

    try {
        await Ala.update(
            { nombre, unidadId },
            { where: { idAla: req.params.id } }
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: 'Error al actualizar ala' });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    await Ala.update(
      { visible: 0 },
      { where: { idAla: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    await Ala.update(
      { visible: 1 },
      { where: { idAla: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
