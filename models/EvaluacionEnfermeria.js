import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const EvaluacionEnfermeria = sequelize.define('EvaluacionEnfermeria', {
    idEvaluacionEnf: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    historialMedico: DataTypes.TEXT,
    antecedentes: DataTypes.TEXT,
    alergias: DataTypes.TEXT,
    medicacionActual: DataTypes.TEXT,
    sintomas: DataTypes.TEXT,
    signosVitales: DataTypes.JSON,
    planCuidados: DataTypes.TEXT,
    fecha: DataTypes.DATE,
    visible: DataTypes.TINYINT
});

export default EvaluacionEnfermeria;
