const { Schema, model } = require('mongoose');

const chatSchema = new Schema({
    users: {
        type: [Schema.Types.ObjectId , Schema.Types.ObjectId],
        required: true,
    },
    messages: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Message'
        }],
    },
}, { timestamps: true });

module.exports = model('Chat', chatSchema);