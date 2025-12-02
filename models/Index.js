import sequelize from '../config/db.js';
import Usuario from './Usuario.js';
import Paciente from './Paciente.js';
import Admision from './Admision.js';
import Unidad from './Unidad.js';
import Ala from './Ala.js';
import Habitacion from './Habitacion.js';
import Cama from './Cama.js';
import EvaluacionEnfermeria from './EvaluacionEnfermeria.js';
import EvaluacionMedica from './EvaluacionMedica.js';
import AltaHospitalaria from './AltaHospitalaria.js';
import Auditoria from './Auditoria.js';

// ---------- RELACIONES ----------

// Infraestructura
Unidad.hasMany(Ala, { foreignKey: 'unidadId' });
Ala.belongsTo(Unidad, { foreignKey: 'unidadId' });

Ala.hasMany(Habitacion, { foreignKey: 'alaId' });
Habitacion.belongsTo(Ala, { foreignKey: 'alaId' });

Habitacion.hasMany(Cama, { foreignKey: 'habitacionId' });
Cama.belongsTo(Habitacion, { foreignKey: 'habitacionId' });

// Pacientes y admisiones
Paciente.hasMany(Admision, { foreignKey: 'pacienteId' });
Admision.belongsTo(Paciente, { foreignKey: 'pacienteId' });

Cama.hasMany(Admision, { foreignKey: 'camaId' });
Admision.belongsTo(Cama, { foreignKey: 'camaId' });

// Usuario que admite
Usuario.hasMany(Admision, { foreignKey: 'usuarioAdmiteId' });
Admision.belongsTo(Usuario, { foreignKey: 'usuarioAdmiteId', as: 'admitidoPor' });

// Evaluaciones
Admision.hasMany(EvaluacionEnfermeria, { foreignKey: 'admisionId' });
EvaluacionEnfermeria.belongsTo(Admision, { foreignKey: 'admisionId' });

Admision.hasMany(EvaluacionMedica, { foreignKey: 'admisionId' });
EvaluacionMedica.belongsTo(Admision, { foreignKey: 'admisionId' });

Usuario.hasMany(EvaluacionEnfermeria, { foreignKey: 'enfermeroId' });
EvaluacionEnfermeria.belongsTo(Usuario, { foreignKey: 'enfermeroId' });

Usuario.hasMany(EvaluacionMedica, { foreignKey: 'medicoId' });
EvaluacionMedica.belongsTo(Usuario, { foreignKey: 'medicoId' });

Admision.hasMany(AltaHospitalaria, { foreignKey: 'admisionId' });
AltaHospitalaria.belongsTo(Admision, { foreignKey: 'admisionId' });

Usuario.hasMany(AltaHospitalaria, { foreignKey: 'medicoId' });
AltaHospitalaria.belongsTo(Usuario, { foreignKey: 'medicoId' });

// Auditoria

Usuario.hasMany(Auditoria, { foreignKey: 'usuarioId' });
Auditoria.belongsTo(Usuario, { foreignKey: 'usuarioId' });

// Exportar
export {
    sequelize,
    Usuario,
    Paciente,
    Admision,
    Unidad,
    Ala,
    Habitacion,
    Cama,
    EvaluacionEnfermeria,
    EvaluacionMedica,
    AltaHospitalaria,
    Auditoria
};