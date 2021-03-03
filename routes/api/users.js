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

router.post('/signin', passwordHashMiddleware(), passport.authenticate('local'), async (req, res, next) => {
    const { email, passwordHash } = req.body;
    let isError = false;
    try {
        const user = await UserModule.findByEmail(email);
        if (user && user.passwordHash === passwordHash) {
            const { name, contactPhone } = user;
            res.json({
                data: {
                    id: user._id,
                    email,
                    name,
                    contactPhone,
                },
                status: 'ok',
            });
        } else {
            isError = true;
        }
    } catch (e) {
        isError = true;
    } finally {
        if (isError) {
            res.status(401);
            res.json({
                error: "Неверный логин или пароль",
                status: "error",
            });
        }
    }
});

module.exports = router;