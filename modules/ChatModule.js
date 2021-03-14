const { Chat, Message } = require('../models');
const EventEmitter = require('events');

class ChatModule {
    constructor() {
        this.emitter = new EventEmitter();
    }

    async find(users) {
        const chat = await Chat.findOne({
            users: {
                $all: users,
            },
        });
        return chat;
    }

    async sendMessage(data) {
        const { author, reciever, text } = data;
        let chat = await this.find([author, reciever]);
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
        await message.save();
        chat.messages.push(message);
        await chat.save();
        this.emitter.emit('newMessage', chat._id, message);
    }

    subscribe(callback) {
        this.emitter.on('newMessage', callback);
    }

    async getHistory(id) {
        const chat = await Chat.findById(id).populate('messages');
        return chat.messages;
    }
}

module.exports = new ChatModule();