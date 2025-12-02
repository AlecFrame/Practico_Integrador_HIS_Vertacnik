import { Unidad, Ala, Habitacion, Cama } from '../models/index.js';
import { auditar } from '../controllers/auditoriaController.js';
import { agregarCambio } from '../middleware/helper.js';
import { Op } from "sequelize";

export const listar = async (req, res) => {
  const estado = req.query.estado || "activos";
  const unidadFiltro = req.query.unidadFiltro || 0;
  const alaFiltro = req.query.alaFiltro || 0;
  const tipoFiltro = req.query.tipoFiltro || '';
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;

  let where = {};

  // Filtro por estado
  if (estado === "activos") where.visible = 1;
  if (estado === "inactivos") where.visible = 0;

  if (tipoFiltro!=null && tipoFiltro!='')
    where.tipo = tipoFiltro;

  // Filtro de alas por ID de Unidad
  if (alaFiltro!=0) {
    where.alaId = alaFiltro;
  }else if (unidadFiltro!=0) {
    where["$Ala.Unidad.idUnidad$"] = unidadFiltro;
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

  const unidades = await Unidad.findAll({
    where: { visible: 1 }
  });

  const alas = await Ala.findAll({
    where: { visible: 1 }
  });

  const totalPages = Math.ceil(count / pageSize);

  res.render("estructuraHospitalaria/habitacion", {
    habitaciones: rows,
    unidades,
    alas,
    estado,
    unidadFiltro,
    alaFiltro,
    tipoFiltro,
    page,
    totalPages
  });
};

export const crear = async (req, res) => {
    const { numero, tipo, alaId, visible=1 } = req.body;

    try {
      const ala = await Ala.findByPk(alaId, {
        include: [{ model: Unidad, as: 'Unidad' }]
      });

      if (!ala)
        return res.json({ ok: false, error: "No se encontro el Ala" });
    
      const habitacion = await Habitacion.create({
          numero,
          tipo,
          alaId,
          visible
      });

      await auditar(
          req.session.user.id,
          "Habitacion",
          habitacion.idHabitacion,
          "Crear",
          `Creó la Habitacion#${habitacion.idHabitacion} ${habitacion.numero} (${habitacion.tipo}) para el ${ala.nombre} de ${ala.Unidad.nombre}`,
          `/habitaciones?estado=${habitacion.visible? 'activos':'inactivos'}&alaFiltro=${habitacion.alaId}&unidadFiltro=${habitacion.Ala.unidadId}&tipoFiltro=${habitacion.tipo}`,
          null
      );

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
        }, {
          model: Ala,
          as: 'Ala',
          include: [{ model: Unidad, as: 'Unidad' }]
        }
      ]
    });

    if (!habitacion) {
        return res.json({ ok: false, error: 'Habitación no encontrada' });
    }

    const habitacionAntes = {
      numero: habitacion.numero, 
      tipo: habitacion.tipo, 
      alaId: habitacion.alaId,
    };

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

    const cambios = [];
    agregarCambio(cambios, "numero", habitacionAntes.numero, numero);
    agregarCambio(cambios, "tipo", habitacionAntes.tipo, tipo);
    agregarCambio(cambios, "alaId", habitacionAntes.alaId, alaId);

    const descripcion = cambios.length > 0
      ? `Cambios: ${cambios.join(", ")}`
      : "No hubo cambios en los datos";
    
    await auditar(
        req.session.user.id,
        "Habitacion",
        paciente.idPaciente,
        "Editar",
        descripcion,
        `/habitaciones?estado=${habitacion.visible? 'activos':'inactivos'}&alaFiltro=${habitacion.alaId}&unidadFiltro=${habitacion.Ala.unidadId}&tipoFiltro=${habitacion.tipo}`,
        null
    );

    return res.json({ ok: true });
  } catch (error) {
      console.log(error);
      return res.json({ ok: false, error: 'Error al actualizar habitación' });
  }
};

export const darDeBaja = async (req, res) => {
  try {
    const habitacion = await Habitacion.findByPk(req.params.id, {
      include: [{
        model: Ala,
        as: 'Ala',
        include: [{ model: Unidad, as: 'Unidad' }]
      }]
    });

    if (!habitacion)
      return res.json({ ok: false, error: "No se encontro la Habitación" });

    await Habitacion.update(
      { visible: 0 },
      { where: { idHabitacion: req.params.id } }
    );
    
    await auditar(
        req.session.user.id,
        "Habitacion",
        habitacion.idHabitacion,
        "Dar de Baja",
        `Dio de baja la Habitacion#${habitacion.idHabitacion} ${habitacion.numero} (${habitacion.tipo}) - ${habitacion.Ala.nombre} - ${habitacion.Ala.Unidad.nombre}`,
        `/habitaciones?estado=${habitacion.visible? 'activos':'inactivos'}&alaFiltro=${habitacion.alaId}&unidadFiltro=${habitacion.Ala.unidadId}&tipoFiltro=${habitacion.tipo}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  try {
    const habitacion = await Habitacion.findByPk(req.params.id, {
      include: [{
        model: Ala,
        as: 'Ala',
        include: [{ model: Unidad, as: 'Unidad' }]
      }]
    });

    if (!habitacion)
      return res.json({ ok: false, error: "No se encontro la Habitación" });

    await Habitacion.update(
      { visible: 1 },
      { where: { idHabitacion: req.params.id } }
    );

    await auditar(
        req.session.user.id,
        "Habitacion",
        habitacion.idHabitacion,
        "Dar de Alta",
        `Dio de alta la Habitacion#${habitacion.idHabitacion} ${habitacion.numero} (${habitacion.tipo}) - ${habitacion.Ala.nombre} - ${habitacion.Ala.Unidad.nombre}`,
        `/habitaciones?estado=${habitacion.visible? 'activos':'inactivos'}&alaFiltro=${habitacion.alaId}&unidadFiltro=${habitacion.Ala.unidadId}&tipoFiltro=${habitacion.tipo}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
