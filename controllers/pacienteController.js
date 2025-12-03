import { Paciente, Admision } from '../models/index.js';
import { auditar } from '../controllers/auditoriaController.js';
import { agregarCambio, normalizarFecha } from '../middleware/helper.js';
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
    const { 
        nombre, apellido, dni, fechaNacimiento, sexo, 
        telefono, direccion, obraSocial, visible = 1, pacienteNNId, admisionId
      } = req.body;

    let paciente = null;

    try {
        // Crear paciente real
        paciente = await Paciente.create({
            nombre,
            apellido,
            dni,
            fechaNacimiento,
            sexo,
            telefono,
            direccion,
            obraSocial,
            visible
        });

        if (!paciente)
            return res.json({ ok: false, error: "El paciente no se pudo crear" });

        // Si se está identificando un NN
        if (pacienteNNId) {
          const admision = await Admision.findByPk(admisionId);
          
          if (!admision)
            return res.json({ ok: false, error: "No se encontró la admisión" });

          // Reasociar admisiones
          await Admision.update(
              { pacienteId: paciente.idPaciente },
              { where: { pacienteId: pacienteNNId } }
          );

          // Ocultar paciente NN
          await Paciente.update(
              { visible: 0 },
              { where: { idPaciente: pacienteNNId } }
          );

          // Registrar auditoría
          await auditar(
              req.session.user.id,
              "Admision y Paciente",
              paciente.idPaciente,
              "Identificar",
              `Identificó al NN-${pacienteNNId} de la Admisión #${admisionId} como el nuevo Paciente#${paciente.idPaciente} ${paciente.nombre} ${paciente.apellido}`,
              `/admisiones/detalle/${admisionId}`,
              `/pacientes?estado=${paciente.visible? 'activos':'inactivos'}&buscar=${paciente.dni}`
          );
        } else {

          // Caso: creación normal
          await auditar(
              req.session.user.id,
              "Paciente",
              paciente.idPaciente,
              "Crear",
              `Creó al Paciente#${paciente.idPaciente} ${paciente.nombre} ${paciente.apellido}`,
              `/pacientes?estado=${paciente.visible? 'activos':'inactivos'}&buscar=${paciente.dni}`,
              null
          );
        }

        return res.json({ ok: true });

    } catch (error) {
        console.error(error);
        return res.json({ ok: false, error: "Error al crear paciente" });
    }
};

export const actualizar = async (req, res) => {
    const { nombre, apellido, dni, fechaNacimiento, sexo, telefono, direccion, obraSocial } = req.body;
    
    try {
      const paciente = await Paciente.findByPk(req.params.id);
      const pacienteAntes = {
        nombre: paciente.nombre, 
        apellido: paciente.apellido, 
        dni: paciente.dni, 
        fechaNacimiento: paciente.fechaNacimiento, 
        sexo: paciente.sexo, 
        telefono: paciente.telefono, 
        direccion: paciente.direccion, 
        obraSocial: paciente.obraSocial
      };

      if (!paciente)
        return res.json({ ok: false, error: 'No se encontro al Paciente' });

      await paciente.update({
        nombre, apellido, dni, fechaNacimiento, sexo, telefono, direccion, obraSocial 
      });

      const cambios = [];
      agregarCambio(cambios, "nombre", pacienteAntes.nombre, nombre);
      agregarCambio(cambios, "apellido", pacienteAntes.apellido, apellido);
      agregarCambio(cambios, "dni", pacienteAntes.dni, dni);
      agregarCambio(cambios, "fechaNacimiento", normalizarFecha(pacienteAntes.fechaNacimiento), normalizarFecha(fechaNacimiento));
      agregarCambio(cambios, "sexo", pacienteAntes.sexo, sexo);
      agregarCambio(cambios, "telefono", pacienteAntes.telefono, telefono);
      agregarCambio(cambios, "direccion", pacienteAntes.direccion, direccion);
      agregarCambio(cambios, "obraSocial", pacienteAntes.obraSocial, obraSocial);

      const descripcion = cambios.length > 0
        ? `Cambios: ${cambios.join(", ")}`
        : "No hubo cambios en los datos";
      
      await auditar(
          req.session.user.id,
          "Paciente",
          paciente.idPaciente,
          "Editar",
          descripcion,
          `/pacientes?estado=${paciente.visible==1? 'activos':'inactivos'}&buscar=${dni}`,
          null
      )

      return res.json({ ok: true });
    } catch (error) {
      console.log("error: ", error);
      return res.json({ ok: false, error: 'Error al actualizar paciente' });
    }
};

export const darDeBaja = async (req, res) => {
  try {
    await Paciente.update(
      { visible: 0 },
      { where: { idPaciente: req.params.id } }
    );

    const paciente = await Paciente.findByPk(req.params.id);

    if (!paciente)
      return res.json({ ok: false, error: 'No se encontró al paciente' });

    await auditar(
        req.session.user.id,
        "Paciente",
        paciente.idPaciente,
        "Dar de Baja",
        `Dio de baja al Paciente#${paciente.idPaciente} ${paciente.nombre} ${paciente.apellido}`,
        `/pacientes?estado=${paciente.visible? 'activos':'inactivos'}&buscar=${paciente.dni}`,
        null
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

    const paciente = await Paciente.findByPk(req.params.id);

    if (!paciente)
      return res.json({ ok: false, error: 'No se encontró al paciente' });

    await auditar(
        req.session.user.id,
        "Paciente",
        paciente.idPaciente,
        "Dar de Alta",
        `Dio de alta al Paciente#${paciente.idPaciente} ${paciente.nombre} ${paciente.apellido}`,
        `/pacientes?estado=${paciente.visible? 'activos':'inactivos'}&buscar=${paciente.dni}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};

export const relacionar = async (req, res) => {
    const { pacienteNNId, pacienteId, admisionId } = req.body;

    try {
        const pacienteReal = await Paciente.findByPk(pacienteId);
        if (!pacienteReal)
            return res.json({ ok: false, error: "Paciente real no encontrado" });

        const pacienteNN = await Paciente.findByPk(pacienteNNId);
        if (!pacienteNN)
            return res.json({ ok: false, error: "Paciente NN no encontrado" });
        
        const admision = await Admision.findByPk(admisionId);
        if (!admision)
          return res.json({ ok: false, error: "No se encontró la admisión" });
        
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

        await auditar(
            req.session.user.id,
            "Admision y Paciente",
            pacienteReal.idPaciente,
            "Identificar",
            `Identificó al NN-${pacienteNNId} de la Admisión #${admisionId} como el Paciente#${pacienteReal.idPaciente} ${pacienteReal.nombre} ${pacienteReal.apellido}`,
            `/admisiones/detalle/${admisionId}`,
            `/pacientes?estado=${pacienteReal.visible? 'activos':'inactivos'}&buscar=${pacienteReal.dni}`
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