import { Unidad, Ala, Habitacion, Cama } from '../models/index.js';
import { Op } from "sequelize";

export const listar = async (req, res) => {
  const estado = req.query.estado || "activos";
  const unidadFiltro = parseInt(req.query.unidadFiltro) || 0;
  const alaFiltro = parseInt(req.query.alaFiltro) || 0;
  const habitacionFiltro = parseInt(req.query.habitacionFiltro) || 0;
  const tHF = req.query.tHF || '';  // tipo habitación: individual | doble
  const eCF = req.query.eCF || '';  // estado cama: libre | ocupada | sucia | mantenimiento

  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  let where = {};

  // Filtro por estado
  if (estado === "activos") where.visible = 1;
  if (estado === "inactivos") where.visible = 0;

  // Filtro por estado de cama
  if (eCF) where.estado = eCF;

  // Filtro por tipo de habitación
  if (tHF) where["$Habitacion.tipo$"] = tHF;

  // Filtros por ubicación
  if (habitacionFiltro) {
    where.habitacionId = habitacionFiltro;
  } else if (alaFiltro) {
    where["$Habitacion.Ala.idAla$"] = alaFiltro;
  } else if (unidadFiltro) {
    where["$Habitacion.Ala.Unidad.idUnidad$"] = unidadFiltro;
  }

  const { count, rows } = await Cama.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    include: [
      {
        model: Habitacion,
        as: 'Habitacion',
        include: [
          {
            model: Ala,
            as: 'Ala',
            include: [
              {
                model: Unidad,
                as: 'Unidad'
              }
            ]
          }
        ]
      }
    ]
  });

  // Listas base
  const unidades = await Unidad.findAll({ where: { visible: 1 } });
  const habitaciones = await Habitacion.findAll({ where: { visible: 1 } });

  const totalPages = Math.ceil(count / pageSize);

  res.render("estructuraHospitalaria/cama", {
    camas: rows,
    unidades,
    habitaciones,
    estado,
    unidadFiltro,
    alaFiltro,
    habitacionFiltro,
    tHF,
    eCF,
    page,
    totalPages
  });
};

export const crear = async (req, res) => {
    const { numero, estado, habitacionId, visible = 1 } = req.body;

    try {
        const habitacion = await Habitacion.findByPk(habitacionId, {
          include: [{
            model: Cama,
            as: 'Camas',
            where: { visible: 1 },
            required: false
          }]
        });

        if (!habitacion) {
            return res.json({ ok: false, error: 'Habitación no encontrada' });
        }

        const cantidadCamas = habitacion.Camas.length;
        const limite = habitacion.tipo === 'individual' ? 1 : 2;

        // Validar límite
        if (cantidadCamas >= limite) {
            return res.json({
                ok: false,
                error: `No puedes agregar más camas. Límite para esta habitación (${habitacion.tipo}) = ${limite}`
            });
        }

        await Cama.create({ numero, estado, habitacionId, visible });

        return res.json({ ok: true });
    } catch (error) {
        console.log(error);
        return res.json({ ok: false, error: "Error al crear cama" });
    }
};

export const actualizar = async (req, res) => {
    const { numero, estado, habitacionId } = req.body;

    try {
        const habitacion = await Habitacion.findByPk(habitacionId, {
          include: [{
            model: Cama,
            as: 'Camas',
            where: { 
              visible: 1,
              idCama: { [Op.ne]: req.params.id } // excluir contar esta misma cama
            },
            required: false
          }]
        });

        if (!habitacion) {
            return res.json({ ok: false, error: 'Habitación no encontrada' });
        }

        const cantidadCamas = habitacion.Camas.length;
        const limite = habitacion.tipo === 'individual' ? 1 : 2;

        // Validar límite
        if (cantidadCamas >= limite) {
            return res.json({
                ok: false,
                error: `No puedes agregar más camas. Límite para esta habitación (${habitacion.tipo}) = ${limite}`
            });
        }

        await Cama.update(
            { numero, estado, habitacionId },
            { where: { idCama: req.params.id } }
        );

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: 'Error al actualizar cama' });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    await Cama.update(
      { visible: 0 },
      { where: { idCama: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    const cama = await Cama.findByPk(req.params.id, {
      include: [{
        model: Habitacion,
        as: 'Habitacion',
        include: [{
          model: Cama,
          as: 'Camas',
          where: { visible: 1 },
          required: false
        }]
      }]
    });

    if (!cama) {
      return res.json({ ok: false, error: 'Cama no encontrada' });
    }

    const cantidadCamas = cama.Habitacion.Camas.length;
    const limite = cama.Habitacion.tipo === 'individual' ? 1 : 2;

    // Validar límite
    if (cantidadCamas >= limite) {
      return res.json({
        ok: false,
        error: `No puedes activar esta cama. Límite para esta habitación (${cama.Habitacion.tipo}) = ${limite}`
      });
    }

    await Cama.update(
      { visible: 1 },
      { where: { idCama: req.params.id } }
    );

    return res.json({ ok: true });

  } catch (err) {
    console.log(err);
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};

export const filtrarAlas = async (req, res) => {
  try {
    const alas = await Ala.findAll({
      where: { unidadId: req.params.idUnidad, visible: 1 }
    });

    return res.json({ ok: true, alas: alas});
  } catch (error) {
    return res.json({ ok: false, error: error });
  }
};

export const filtrarHabitaciones = async (req, res) => {
  try {
    const habitaciones = await Habitacion.findAll({
      where: { alaId: req.params.idAla, visible: 1 }
    });

    return res.json({ ok: true, habitaciones: habitaciones });
  } catch (error) {
    return res.json({ ok: false, habitaciones: [], error: error });
  }
};

export const filtrarCamas = async (req, res) => {
  try {
    const camas = await Cama.findAll({
      where: { habitacionId: req.params.idHabitacion, visible: 1 }
    });

    return res.json({ ok: true, camas: camas });
  } catch (error) {
    return res.json({ ok: false, camas: [], error: error });
  }
};