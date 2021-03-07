const { Schema, model } = require('mongoose');

const chatSchema = new Schema({
    users: {
        type: [{
                type: Schema.Types.ObjectId,
                ref: 'User',
            }, {
                type: Schema.Types.ObjectId,
                ref: 'User',
            }],
        required: true,
    },
    messages: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Message',
        }],
    },
}, { timestamps: true });

module.exports = model('Chat', chatSchema);