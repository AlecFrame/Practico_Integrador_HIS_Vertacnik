import { EvaluacionMedica } from '../models/index.js';

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
    await EvaluacionMedica.create({
        diagnostico,
        indicaciones,
        medicacion,
        terapias,
        fecha,
        visible,
        admisionId,
        medicoId
    });

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
    return res.json({ ok: true });
  } catch (err) {
    return res.json({ ok: false, error: "Error al dar de alta" });
  }
};
