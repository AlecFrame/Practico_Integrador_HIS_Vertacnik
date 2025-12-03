import { Admision, Unidad, Ala, Habitacion, Cama } from '../models/index.js';
import { auditar } from '../controllers/auditoriaController.js';
import { agregarCambio } from '../middleware/helper.js';
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
          include: [
            {
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

        const cantidadCamas = habitacion.Camas.length;
        const limite = habitacion.tipo === 'individual' ? 1 : 2;

        // Validar límite
        if (cantidadCamas >= limite) {
            return res.json({
                ok: false,
                error: `No puedes agregar más camas. Límite para esta habitación (${habitacion.tipo}) = ${limite}`
            });
        }

        const cama = await Cama.create({ numero, estado, habitacionId, visible });

        await auditar(
            req.session.user.id,
            "Cama",
            cama.idCama,
            "Crear",
            `Creó la Cama#${cama.idCama} para la habitación ${habitacion.numero} (${habitacion.tipo}) del ${habitacion.Ala.nombre} de ${habitacion.Ala.Unidad.nombre}`,
            `/camas?estado=${cama.visible? 'activos':'inactivos'}&unidadFiltro=${habitacion.Ala.unidadId}&alaFiltro=${habitacion.alaId}&habitacionFiltro=${habitacionId}&tHF=${habitacion.tipo}&eCF=${cama.estado}`,
            null
        );

        return res.json({ ok: true });
    } catch (error) {
        console.log(error);
        return res.json({ ok: false, error: "Error al crear cama" });
    }
};

export const actualizar = async (req, res) => {
    const { numero, estado, habitacionId } = req.body;

    try {
        const cama = await Cama.findByPk(req.params.id);

        if (!cama)
          return res.json({ ok: false, error: 'No se encontro la Cama' });

        const camaAntes = {
          numero: cama.numero, 
          estado: cama.estado, 
          habitacionId: cama.habitacionId
        };
        
        const habitacion = await Habitacion.findByPk(habitacionId, {
          include: [{
            model: Cama,
            as: 'Camas',
            where: { 
              visible: 1,
              idCama: { [Op.ne]: req.params.id } // excluir contar esta misma cama
            },
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

        const cambios = [];
        agregarCambio(cambios, "numero", camaAntes.numero, numero);
        agregarCambio(cambios, "estado", camaAntes.estado, estado);
        agregarCambio(cambios, "habitacionId", camaAntes.habitacionId, habitacionId);
  
        const descripcion = cambios.length > 0
          ? `Cambios: ${cambios.join(", ")}`
          : "No hubo cambios en los datos";
        
        await auditar(
            req.session.user.id,
            "Cama",
            cama.idCama,
            "Editar",
            descripcion,
            `/camas?estado=${cama.visible? 'activos':'inactivos'}&unidadFiltro=${habitacion.Ala.unidadId}&alaFiltro=${habitacion.alaId}&habitacionFiltro=${habitacionId}&tHF=${habitacion.tipo}&eCF=${cama.estado}`,
            null
        )

        return res.json({ ok: true });
    } catch (error) {
        return res.json({ ok: false, error: 'Error al actualizar cama' });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    const cama = await Cama.findByPk(req.params.id, {
      include: [{
        model: Habitacion,
        as: 'Habitacion',
        include: [{
            model: Ala,
            as: 'Ala',
            include: [{ model: Unidad, as: 'Unidad' }]
          }
        ]
      }]
    });

    if (!cama) {
      return res.json({ ok: false, error: 'Cama no encontrada' });
    }

    await Cama.update(
      { visible: 0 },
      { where: { idCama: req.params.id } }
    );
    
    await auditar(
        req.session.user.id,
        "Cama",
        cama.idCama,
        "Dar de Baja",
        `Dio de baja la Cama#${cama.idCama} - ${cama.Habitacion.numero} (${cama.Habitacion.tipo}) - ${cama.Habitacion.Ala.nombre} - ${cama.Habitacion.Ala.Unidad.nombre}`,
        `/camas?estado=${cama.visible? 'activos':'inactivos'}&unidadFiltro=${cama.Habitacion.Ala.unidadId}&alaFiltro=${cama.Habitacion.alaId}&habitacionFiltro=${cama.habitacionId}&tHF=${cama.Habitacion.tipo}&eCF=${cama.estado}`,
        null
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
        }, {
            model: Ala,
            as: 'Ala',
            include: [{ model: Unidad, as: 'Unidad' }]
          }
        ]
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

    await auditar(
        req.session.user.id,
        "Cama",
        cama.idCama,
        "Dar de Alta",
        `Dio de alta la Cama#${cama.idCama} - ${cama.Habitacion.numero} (${cama.Habitacion.tipo}) - ${cama.Habitacion.Ala.nombre} - ${cama.Habitacion.Ala.Unidad.nombre}`,
        `/camas?estado=${cama.visible? 'activos':'inactivos'}&unidadFiltro=${cama.Habitacion.Ala.unidadId}&alaFiltro=${cama.Habitacion.alaId}&habitacionFiltro=${cama.habitacionId}&tHF=${cama.Habitacion.tipo}&eCF=${cama.estado}`,
        null
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

export const cambiarEstado = async (req, res) => {
  const nuevoEstado = req.params.estado;

  try {
    const cama = await Cama.findByPk(req.params.id, {
      include: [{
        model: Habitacion,
        as: 'Habitacion',
        include: [{
            model: Ala,
            as: 'Ala',
            include: [{ model: Unidad, as: 'Unidad' }]
          }]
        }, {
          model: Admision,
          as: 'Admisions',
          where: { estado: 'activa' }
        }
      ]
    });

    if (!cama) {
      return res.json({ ok: false, error: 'Cama no encontrada' });
    }

    if (cama.Admisions.length > 0) {
      return res.json({ ok: false, field: 'estado', error: "No se puede cambiar el estado ocupado de una cama con una admision activa" });
    }

    await Cama.update(
      { estado: nuevoEstado },
      { where: { idCama: req.params.id } }
    );
    
    await auditar(
        req.session.user.id,
        "Cama",
        cama.idCama,
        "Cambiar Estado",
        `Cambió el estado de la Cama#${cama.idCama} - ${cama.Habitacion.numero} (${cama.Habitacion.tipo}) - ${cama.Habitacion.Ala.nombre} - ${cama.Habitacion.Ala.Unidad.nombre} a ${nuevoEstado}`,
        `/camas?estado=${cama.visible? 'activos':'inactivos'}&unidadFiltro=${cama.Habitacion.Ala.unidadId}&alaFiltro=${cama.Habitacion.alaId}&habitacionFiltro=${cama.habitacionId}&tHF=${cama.Habitacion.tipo}&eCF=${cama.estado}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al cambiar el estado" });
  }
};