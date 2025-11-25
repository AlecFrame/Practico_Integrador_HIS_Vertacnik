import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const EvaluacionMedica = sequelize.define('EvaluacionMedica', {
    idEvaluacionMed: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    diagnostico: DataTypes.TEXT,
    indicaciones: DataTypes.TEXT,
    medicacion: DataTypes.TEXT,
    terapias: DataTypes.TEXT,
    fecha: DataTypes.DATE,
    visible: DataTypes.TINYINT
});

export default EvaluacionMedica;
