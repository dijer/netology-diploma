const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    contactPhone: {
        type: String,
    },
});

module.exports = model('User', userSchema);