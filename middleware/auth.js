
export function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/users/login");
    }
    next();
}

export function isLogged(req, res, next) {
    if (req.session.user) {
        return res.redirect("/users/inicio");
    }
    next();
}

export function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect("/users/login");
        }
        if (!roles.includes(req.session.user.rol)) {
            return res.status(403).render("error/403", { user: req.session.user });
        }
        next();
    };
}

export function requireSelfOrAdmin() {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect("/users/login");
        }
        // Normalizar tipos antes de comparar IDs para evitar falsos 403
        const sessionId = String(req.session.user.id);
        const paramId = String(req.params.id);

        if (req.session.user.rol !== 'admin' && sessionId !== paramId) {
            return res.status(403).render("error/403", { user: req.session.user });
        }
        next();
    };
}