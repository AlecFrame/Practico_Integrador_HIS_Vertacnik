import { EvaluacionEnfermeria } from '../models/index.js';

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
    await EvaluacionEnfermeria.create({
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
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
