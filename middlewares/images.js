const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        const { _id: userId } = req.user;
        const dir = path.join(path.resolve('./'), '/uploads', `/${userId}`);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename(req, file, cb) {
        cb(null, file.originalname);
    }
});

const allowedTypes = ['image/jpeg'];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype) && req.user || 1) {
        cb(null, true)
    } else {
        cb(null, false)
    }
};

module.exports = multer({
    storage, fileFilter
});