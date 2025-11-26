
export function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect("/usuarios/login");
    }
    next();
}

export function isLogged(req, res, next) {
    if (req.session.user) {
        return res.redirect("/usuarios/dashboard");
    }
    next();
}

export function allowRoles(...roles) {
    return (req, res, next) => {
        if (!req.session.user) {
            return res.redirect("/usuarios/login");
        }
        if (!roles.includes(req.session.user.rol)) {
            return res.status(403).render("error/403", { user: req.session.user });
        }
        next();
    };
}