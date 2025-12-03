import { EvaluacionMedica } from '../models/index.js';
import { auditar } from '../controllers/auditoriaController.js';

export const crear = async (req, res) => {
  if (!req.session.user)
    return res.json({ ok: false, error: "Error usuario no encontrado" });

  const { diagnostico, indicaciones, medicacion, terapias, 
    fecha= new Date(), 
    visible=1, 
    admisionId, 
    medicoId= req.session.user.id 
  } = req.body;

  try {
    const evaluacion = await EvaluacionMedica.create({
        diagnostico,
        indicaciones,
        medicacion,
        terapias,
        fecha,
        visible,
        admisionId,
        medicoId
    });

    await auditar(
        req.session.user.id,
        "Evaluación Médica",
        evaluacion.idEvaluacionMed,
        "Crear",
        `Creó la Evaluación Médica#${evaluacion.idEvaluacionMed} para la admision#${evaluacion.admisionId}`,
        `/admisiones/detalle/${evaluacion.admisionId}?&estadoMed=${evaluacion.visible==1? 'activos':'inactivos'}`,
        null
    );

    return res.json({ ok: true });
  } catch (error) {
    return res.json({ ok: false, error: "Error al crear EvaluacionMedica" });
  }
};

export const darDeBaja = async (req, res) => {
  const user = req.session.user;

  if (!user)
    return res.json({ ok: false, error: "Error usuario no encontrado" });

  try {
    const evaluacion = await EvaluacionMedica.findByPk(req.params.id);

    if (!evaluacion)
      return res.json({ ok: false, error: "Error Evaluación no encontrada" });

    if (evaluacion.medicoId != user.id)
      return res.json({ ok: false, error: "No puedes editar la Evaluación Médica de otro usuario" });

    await EvaluacionMedica.update(
      { visible: 0 },
      { where: { idEvaluacionMed: req.params.id } }
    );

    await auditar(
        req.session.user.id,
        "Evaluación Médica",
        evaluacion.idEvaluacionMed,
        "Dar de Baja",
        `Dio de baja la Evaluación Médica#${evaluacion.idEvaluacionMed} de la admision#${evaluacion.admisionId}`,
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
    const evaluacion = await EvaluacionMedica.findByPk(req.params.id);

    if (!evaluacion)
      return res.json({ ok: false, error: "Error Evaluación no encontrada" });

    if (evaluacion.medicoId != user.id)
      return res.json({ ok: false, error: "No puedes editar la Evaluación Médica de otro usuario" });

    await EvaluacionMedica.update(
      { visible: 1 },
      { where: { idEvaluacionMed: req.params.id } }
    );

    await auditar(
        req.session.user.id,
        "Evaluación Médica",
        evaluacion.idEvaluacionMed,
        "Dar de Alta",
        `Dio de alta la Evaluación Médica#${evaluacion.idEvaluacionMed} de la admision#${evaluacion.admisionId}`,
        `/admisiones/detalle/${evaluacion.admisionId}?&estadoMed=${evaluacion.visible==1? 'activos':'inactivos'}`,
        null
    );

    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
