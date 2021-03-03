const express = require('express');
const router = express.Router();
const { AdvertisementModule, UserModule } = require('../../modules');
const imagesMiddleware = require('../../middlewares/images');
const authenticationMiddleware = require('../../middlewares/authentication');

router.get('/', async (req, res) => {
    const { shortText, description, userId, tags } = req.params;
    try {
        const advertisements = await AdvertisementModule.find({
            shortText,
            description,
            userId,
            tags,
        })
        res.json({
            data: advertisements.map(schema => {
                const { _id: id, shortText: shortTitle, images, userId, createdAt } = schema;
                return {
                    id,
                    shortTitle,
                    images,
                    user: {
                        id: userId._id,
                        name: userId.name,
                    },
                    createdAt,
                };
            }),
            status: 'ok',
        });
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json({
            error: "ошибка сервера",
            status: "error",
        });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    let isError = true;
    try {
        const advertisement = await AdvertisementModule.findById(id);
        const { shortTitle, description, images, createdAt } = advertisement;
        return res.json({
            data: {
                id,
                shortTitle,
                description,
                images,
                createdAt,
            },
            status: 'ok',
        });
        isError = true;
    } catch (e) {
        console.log(e);
        isError = true;
    } finally {
        if (isError) {
            res.status(500);
            res.json({
                error: "ошибка сервера",
                status: "error",
            });
        }
    }
});

router.post('/', authenticationMiddleware(), imagesMiddleware.array('images'), async (req, res, error) => {
    const { shortTitle, description } = req.body;
    try {
        const { _id: userId, name } = req.user;
        const advertisement = await AdvertisementModule.create({
            userId,
            shortText: shortTitle,
            description,
            images: req.files.map(file => `/uploads/${file.originalname}`),
        });
        const { _id: id, images, createdAt } = advertisement;
        const user = 
        res.json({
            data: {
                id,
                shortTitle,
                description,
                images,
                user: {
                    id: userId,
                    name,
                },
                createdAt,
            },
            status: 'ok',
        });
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json({
            error: "ошибка сервера",
            status: "error",
        });
    }
});

router.delete('/:id', authenticationMiddleware(), async (req, res, error) => {
    const { id } = req.params;
    try {
        const { _id: currentUserId, name } = req.user;
        const advertisement = await AdvertisementModule.findById(id);
        const { userId } = advertisement;
        if (`${currentUserId}` !== `${userId}`) {
            return res.status(403).json({
                error: 'Вы не являетесь создателем объявления!',
                status: 'error',
            });
        }
        await AdvertisementModule.remove(id);
        res.status(200).json({
            status: 'ok',
        });
    } catch (e) {
        console.log(e);
        res.status(500);
        res.json({
            error: "ошибка сервера",
            status: "error",
        });
    }
});

module.exports = router;