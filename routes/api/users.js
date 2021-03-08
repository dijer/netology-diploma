const express = require('express');
const router = express.Router();
const passport = require('passport');
const passwordHashMiddleware = require('../../middlewares/passwordHash');
const { UserModule } = require('../../modules');

router.post('/signup', passwordHashMiddleware(), async (req, res) => {
    const { email, passwordHash, name, contactPhone } = req.body;
    try {
        const user = await UserModule.create({
            email,
            passwordHash,
            name,
            contactPhone,
        });
        res.json({
            data: {
                id: user._id,
                email,
                name,
                contactPhone,
            },
            status: 'ok',
        });
    } catch (e) {
        res.status(401);
        res.json({
            error: "email занят",
            status: "error",
        });
    }
});

router.post('/signin', passwordHashMiddleware(), function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
    if (err) {
        return next(err); // will generate a 500 error
    }
    if (!user) {
        return res.json({
            error: "Неверный логин или пароль",
            status: "error",
        });
    }
    req.login(user, function(err){
        if(err){
            return next(err);
        }
        const { _id: id, email, name, contactPhone } = user;
        return res.json({
            data: {
                id,
                email,
                name,
                contactPhone,
            },
            status: 'ok',
        });
    });
    })(req, res, next);
});

module.exports = router;