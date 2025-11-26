import { Paciente } from '../models/index.js';

export const listarPacientes = async (req, res) => {
    const pacientes = await Paciente.findAll();
    res.render('paciente/listado', { pacientes });
};

export const mostrarFormularioCrear = (req, res) => {
    res.render('paciente/crear');
};

export const crearPaciente = async (req, res) => {
    const { nombre, apellido, dni, fechaNacimiento, sexo, telefono, direccion } = req.body;

    try {
        await Paciente.create({
            nombre,
            apellido,
            dni,
            fechaNacimiento,
            sexo,
            telefono,
            direccion
        });
        res.redirect('/pacientes');
    } catch (error) {
        res.render('paciente/crear', { error: 'Error al crear paciente', datos: req.body });
    }
};

export const mostrarFormularioEditar = async (req, res) => {
    const paciente = await Paciente.findByPk(req.params.id);
    res.render('paciente/editar', { paciente });
};

export const actualizarPaciente = async (req, res) => {
    const { nombre, apellido, dni, fechaNacimiento, sexo, telefono, direccion } = req.body;

    await Paciente.update(
        { nombre, apellido, dni, fechaNacimiento, sexo, telefono, direccion },
        { where: { id: req.params.id } }
    );

    res.redirect('/pacientes');
};