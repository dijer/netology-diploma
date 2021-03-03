const crypto = require('crypto');

module.exports = () => {
    return (req, res, next) => {
        const { password } = req.body;
        const md5sum = crypto.createHash('md5');
        const passwordHash = md5sum.update(password).digest('hex');
        req.body.passwordHash = passwordHash;
        next();
    }
};