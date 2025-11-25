import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Paciente = sequelize.define('Paciente', {
    idPaciente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: DataTypes.STRING,
    apellido: DataTypes.STRING,
    dni: { type: DataTypes.STRING, unique: true },
    fechaNacimiento: DataTypes.DATE,
    sexo: DataTypes.ENUM('M', 'F'),
    telefono: DataTypes.STRING,
    direccion: DataTypes.STRING,
    visible: DataTypes.TINYINT
});

export default Paciente;