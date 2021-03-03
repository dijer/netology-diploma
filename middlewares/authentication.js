module.exports = () => {
    return (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.status(401).json({
                error: "Вы не авторизованы!",
                status: "error",
            });
        }
    }
};