import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Habitacion = sequelize.define('Habitacion', {
    idHabitacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: DataTypes.INTEGER,
    tipo: DataTypes.ENUM('individual', 'doble'),
    visible: DataTypes.TINYINT
});

export default Habitacion;
