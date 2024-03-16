 const isAdmin = (req, res, next) => {
    if (req.user && req.user.role_id === 1) { 
        return next(); 
    } else {
        return res.status(403).json({ message: 'Only Admin Have Access to this Access Denied' });
    }
};

 const isIntern = (req, res, next) => {
    if (req.user && req.user.role_id ===2) { 
        return next(); 
    } else {
        return res.status(403).json({ message: 'Access Denied' });
    }
};

 const isAdminOrIntern = (req, res, next) => {
    if (req.user && (req.user.role_id === 1 || req.user.role_id === 2)) {
        return next();
    } else {
        return res.status(403).json({ message: 'Access Denied' });
    }
};

module.exports={isAdmin,isIntern,isAdminOrIntern}