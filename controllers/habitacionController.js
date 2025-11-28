import { Unidad, Ala, Habitacion, Cama } from '../models/index.js';
import { Op } from "sequelize";

export const listar = async (req, res) => {
  const estado = req.query.estado || "activos";
  const alaFiltro = req.query.alaFiltro || 0;
  const tipoFiltro = req.query.tipoFiltro || '';
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  let where = {};

  // Filtro por estado
  if (estado === "activos") where.visible = 1;
  if (estado === "inactivos") where.visible = 0;

  // Filtro de alas por ID de Unidad
  if (alaFiltro != 0) {
    if (tipoFiltro.trim() !== '') {
      where[Op.and] = [
        { alaId: alaFiltro },
        { tipo: tipoFiltro }
      ];
    }else {
      where[Op.or] = [
        { alaId: alaFiltro }
      ];
    }
  }else if (tipoFiltro.trim() !== '') {
    where[Op.or] = [
      { tipo: tipoFiltro }
    ];
  }

  const { count, rows } = await Habitacion.findAndCountAll({
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize,
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
  });


  const alas = await Ala.findAll({
    where: { visible: 1 }
  });

  const totalPages = Math.ceil(count / pageSize);

  res.render("estructuraHospitalaria/habitacion", {
    habitaciones: rows,
    alas: alas,
    estado,
    alaFiltro,
    tipoFiltro,
    page,
    totalPages
  });
};

export const crear = async (req, res) => {
    const { numero, tipo, alaId, visible=1 } = req.body;

    try {
        await Habitacion.create({
            numero,
            tipo,
            alaId,
            visible
        });

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: "Error al crear habitación" });
    }
};

export const actualizar = async (req, res) => {
    const { numero, tipo, alaId } = req.body;
    const idHabitacion = req.params.id;

    try {
        const habitacion = await Habitacion.findByPk(idHabitacion, {
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
        const limiteSegunTipo = tipo === 'individual' ? 1 : 2;

        // Si cambia a individual y tiene más de 1 cama → bloquear
        if (tipo === 'individual' && cantidadCamas > 1) {
            return res.json({
                ok: false,
                error: `No puedes cambiar esta habitación a individual porque tiene ${cantidadCamas} camas`
            });
        }

        await Habitacion.update(
            { numero, tipo, alaId },
            { where: { idHabitacion } }
        );

        return res.json({ ok: true });

    } catch (error) {
        console.log(error);
        return res.json({ ok: false, error: 'Error al actualizar habitación' });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    await Habitacion.update(
      { visible: 0 },
      { where: { idHabitacion: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    await Habitacion.update(
      { visible: 1 },
      { where: { idHabitacion: req.params.id } }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
