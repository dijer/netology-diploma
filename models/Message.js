const { Schema, model } = require('mongoose');

const messageSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    sentAt: {
        type: Date,
        required: true,
        default: Date.now,
    },
    text: {
        type: String,
        required: true,
    },
    readAt: {
        type: Date,
    },
});

module.exports = model('Message', messageSchema);