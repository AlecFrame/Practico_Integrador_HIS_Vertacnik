import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Paciente = sequelize.define('Paciente', {
    idPaciente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: DataTypes.STRING(50),
    apellido: DataTypes.STRING(50),
    dni: { type: DataTypes.STRING(20), unique: true },
    fechaNacimiento: DataTypes.DATE,
    sexo: DataTypes.ENUM('M', 'F', 'NN'),
    telefono: DataTypes.STRING(15),
    direccion: DataTypes.STRING,
    obraSocial: DataTypes.STRING,
    contactoEmergenciaNombre: DataTypes.STRING(100),
    contactoEmergenciaTelefono: DataTypes.STRING(15),
    contactoEmergenciaRelacion: DataTypes.STRING(50),
    visible: DataTypes.TINYINT
});

export default Paciente;