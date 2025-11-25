export const loginView = (req, res) => {
    res.render('login');
};

export const loginPost = (req, res) => {
    const { email, password } = req.body;

    // Login extremadamente básico solo para arrancar
    if (email === 'admin@his.com' && password === '1234') {
        req.session.user = { nombre: 'Administrador', rol: 'admin' };
        return res.redirect('/usuarios/dashboard');
    }

    return res.render('login', { error: 'Credenciales inválidas' });
};

export const dashboard = (req, res) => {
    if (!req.session.user) return res.redirect('/usuarios/login');

    res.render('dashboard', {
        user: req.session.user
    });
};