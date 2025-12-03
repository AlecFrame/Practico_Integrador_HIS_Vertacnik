import { EvaluacionEnfermeria } from '../models/index.js';
import { auditar } from '../controllers/auditoriaController.js';

export const crear = async (req, res) => {
  if (!req.session.user)
    return res.json({ ok: false, error: "Error usuario no encontrado" });

  const { historialMedico, antecedentes, alergias, medicacionActual, sintomas, planCuidados, 
    fecha= new Date(), 
    visible=1, 
    admisionId, 
    enfermeroId= req.session.user.id,
    presionSistolica,
    presionDiastolica,
    frecuenciaCardiaca,
    frecuenciaRespiratoria,
    temperatura
  } = req.body;

  const signosVitales = {
    presionSistolica,
    presionDiastolica,
    frecuenciaCardiaca,
    frecuenciaRespiratoria,
    temperatura
  };

  try {
    const evaluacion = await EvaluacionEnfermeria.create({
        historialMedico, 
        antecedentes, 
        alergias, 
        medicacionActual, 
        sintomas, 
        signosVitales, 
        planCuidados, 
        fecha, 
        visible,
        admisionId,
        enfermeroId
    });

    await auditar(
        req.session.user.id,
        "Evaluación de Enfermeria",
        evaluacion.idEvaluacionEnf,
        "Crear",
        `Creó la Evaluación de Enfermeria#${evaluacion.idEvaluacionEnf} para la admision#${evaluacion.admisionId}`,
        `/admisiones/detalle/${evaluacion.admisionId}?&estadoEnf=${evaluacion.visible==1? 'activos':'inactivos'}`,
        null
    );

    return res.json({ ok: true });
  } catch (error) {
    return res.json({ ok: false, error: "Error al crear evaluacionEnfermeria" });
  }
};

export const darDeBaja = async (req, res) => {
  const user = req.session.user;

  if (!user)
    return res.json({ ok: false, error: "Error usuario no encontrado" });

  try {
    const evaluacion = await EvaluacionEnfermeria.findByPk(req.params.id);

    if (!evaluacion)
      return res.json({ ok: false, error: "Error Evaluación no encontrada" });

    if (evaluacion.enfermeroId != user.id)
      return res.json({ ok: false, error: "No puedes editar la Evaluación de Enfermería de otro usuario" });

    await EvaluacionEnfermeria.update(
      { visible: 0 },
      { where: { idEvaluacionEnf: req.params.id } }
    );

    await auditar(
        req.session.user.id,
        "Evaluación de Enfermeria",
        evaluacion.idEvaluacionEnf,
        "Dar de Baja",
        `Dio de baja la Evaluación de Enfemeria#${evaluacion.idEvaluacionEnf} de la admision#${evaluacion.admisionId}`,
        `/admisiones/detalle/${evaluacion.admisionId}?&estadoMed=${evaluacion.visible==1? 'activos':'inactivos'}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de baja" });
  }
};

export const darDeAlta = async (req, res) => {
  const user = req.session.user;

  if (!user)
    return res.json({ ok: false, error: "Error usuario no encontrado" });

  try {
    const evaluacion = await EvaluacionEnfermeria.findByPk(req.params.id);

    if (!evaluacion)
      return res.json({ ok: false, error: "Error Evaluación no encontrada" });

    if (evaluacion.enfermeroId != user.id)
      return res.json({ ok: false, error: "No puedes editar la Evaluación de Enfermería de otro usuario" });

    await EvaluacionEnfermeria.update(
      { visible: 1 },
      { where: { idEvaluacionEnf: req.params.id } }
    );

    await auditar(
        req.session.user.id,
        "Evaluación de Enfermeria",
        evaluacion.idEvaluacionEnf,
        "Dar de Alta",
        `Dio de alta la Evaluación de Enfemeria#${evaluacion.idEvaluacionEnf} de la admision#${evaluacion.admisionId}`,
        `/admisiones/detalle/${evaluacion.admisionId}?&estadoMed=${evaluacion.visible==1? 'activos':'inactivos'}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
