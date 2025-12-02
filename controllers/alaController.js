import { Unidad, Ala } from '../models/index.js';
import { auditar } from '../controllers/auditoriaController.js';
import { agregarCambio } from '../middleware/helper.js';
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
      const unidad = await Unidad.findByPk(unidadId);

      if (!unidad)
        return res.json({ ok: false, error: "No se encontro la unidad" });

      const ala = await Ala.create({
          nombre,
          unidadId,
          visible
      });

      await auditar(
          req.session.user.id,
          "Ala",
          ala.idAla,
          "Crear",
          `Creó el Ala#${ala.idAla}: ${ala.nombre} para ${unidad.nombre}`,
          `/alas?estado=${ala.visible? 'activos':'inactivos'}&unidadFiltro=${ala.unidadId}`,
          null
      );

      return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: "Error al crear ala" });
    }
};

export const actualizar = async (req, res) => {
    const { nombre, unidadId } = req.body;

    try {
      const ala = await Ala.findByPk(req.params.id);
      
      if (!ala)
        return res.json({ ok: false, error: "No se encontro el Ala" });
      
      const alaAntes = {
        nombre: ala.nombre, 
        unidadId: ala.unidadId,
      };

      await Ala.update(
          { nombre, unidadId },
          { where: { idAla: req.params.id } }
      );

      const cambios = [];
      agregarCambio(cambios, "nombre", alaAntes.nombre, nombre);
      agregarCambio(cambios, "unidadId", alaAntes.unidadId, unidadId);
  
      const descripcion = cambios.length > 0
        ? `Cambios: ${cambios.join(", ")}`
        : "No hubo cambios en los datos";
      
      await auditar(
          req.session.user.id,
          "Ala",
          ala.idAla,
          "Editar",
          descripcion,
          `/alas?estado=${ala.visible? 'activos':'inactivos'}&unidadFiltro=${ala.unidadId}`,
          null
      );

      return res.json({ ok: true });
    } catch (error) {
      return res.json({ ok: false, error: 'Error al actualizar ala' });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    const ala = await Ala.findByPk(req.params.id, {
      include: [{ model: Unidad, as: 'Unidad' }]
    });

    if (!ala)
      return res.json({ ok: false, error: "No se encontro el Ala" });

    await Ala.update(
      { visible: 0 },
      { where: { idAla: req.params.id } }
    );

    await auditar(
        req.session.user.id,
        "Ala",
        ala.idAla,
        "Dar de Baja",
        `Dio de baja el Ala#${ala.idAla}: ${ala.nombre} de ${ala.Unidad.nombre}`,
        `/alas?estado=${ala.visible? 'activos':'inactivos'}&unidadFiltro=${ala.unidadId}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    const ala = await Ala.findByPk(req.params.id, {
      include: [{ model: Unidad, as: 'Unidad' }]
    });

    if (!ala)
      return res.json({ ok: false, error: "No se encontro el Ala" });

    await Ala.update(
      { visible: 1 },
      { where: { idAla: req.params.id } }
    );

    await auditar(
        req.session.user.id,
        "Ala",
        ala.idAla,
        "Dar de Alta",
        `Dio de alta el Ala#${ala.idAla}: ${ala.nombre} de ${ala.Unidad.nombre}`,
        `/alas?estado=${ala.visible? 'activos':'inactivos'}&unidadFiltro=${ala.unidadId}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
