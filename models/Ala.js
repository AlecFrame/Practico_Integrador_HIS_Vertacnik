import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Ala = sequelize.define('Ala', {
    idAla: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: DataTypes.STRING,
    visible: DataTypes.TINYINT
});

export default Ala;
