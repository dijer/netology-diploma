const { Chat, Message } = require('../models');
const EventEmitter = require('events');

class ChatModule {
    constructor() {
        this.emitter = new EventEmitter();
    }

    async find(users) {
        const chat = await Chat.findOne({ users });
        if (chat) {
            return chat;
        }
        return null;
    }

    async sendMessage(data) {
        const { author, reciever, text } = data;
        let chat = await Chat.findOne({
            users: [author, reciever],
        });
        if (!chat) {
            chat = new Chat({
                users: [author, reciever],
            });
            await chat.save();
        }
        const message = new Message({
            author,
            text,
        });
        chat.messages.push(message);
        chat.save();
        this.emitter.emit('newMessage', chat._id, message);
        return message;
    }

    subscribe(callback) {
        this.emitter.on('newMessage', callback);
    }

    async getHistory(id) {
        const chat = await Chat.findById(id);
        return chat.messages;
    }
}

module.exports = new ChatModule();