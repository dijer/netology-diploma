require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const sessionMiddleware = require('./middlewares/sessionMiddleware');
const http = require('http');
const socketIO = require('socket.io');
const { User, Chat } = require('./models');
const { ChatModule, UserModule } = require('./modules')

const advertisementsApiRouter = require('./routes/api/advertisements');
const usersApiRouter = require('./routes/api/users');

const app = express();
const server = http.Server(app);
const io = socketIO(server, { cookie: false });

const options = {
    usernameField: 'email',
    passwordField: 'passwordHash',
    passReqToCallback: false,
    session: true,
};

/**
 * @param {String} email
 * @param {String} passwordHash
 * @param {Function} done
 */
function verify(email, passwordHash, done) {
    User.findOne({ email }, (err, user) => {
        if (err) {
            return done(err);
        }
        if (user) {
            if (passwordHash === user.passwordHash) {
                return done(null, user);
            }
        }
        return done(null, false, 'lol');
    });
}

passport.use('local', new LocalStrategy(options, verify));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err,user){
        done(null, user);
    });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

app.use(cors());

app.use('/api/advertisements', advertisementsApiRouter);
app.use('/api', usersApiRouter);

const PORT = process.env.HTTP_PORT || 3000;

async function start() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

const wrapIo = middleware => (socket, next) => middleware(socket.request, {}, next);
io
    .use(wrapIo(sessionMiddleware))
    .use(wrapIo(passport.initialize()))
    .use(wrapIo(passport.session()))
    .use((socket, next) => {
        if (socket.request.user) {
            next();
        } else {
            next(new Error('Unauthorized'));
        }
    })
    .on('connection', socket => {
        const { id } = socket;
        console.log(`Socket connected: ${id}`);

        const userId = socket.request.user.id;
        if (userId) {

            let recieverId = null;


            ChatModule.subscribe(async (chatId, message) => {
                const chat = await ChatModule.find([userId, recieverId]);
                if (chat && String(chatId) === String(chat._id)) {
                    socket.emit('newMessage', message);
                }
            });

            socket.on('getHistory', async (recieverEmail) => {
                const reciever = await UserModule.findByEmail(recieverEmail);
                if (reciever) {
                    const chat = await ChatModule.find([userId, reciever._id]);
                    let messages = [];
                    if (chat) {
                        const { id } = chat;
                        messages = await ChatModule.getHistory(id);
                    }
                    socket.emit('chatHistory', messages);
                }
            });

            socket.on('sendMessage', async (recieverEmail, text) => {
                const reciever = await UserModule.findByEmail(recieverEmail);
                recieverId = reciever._id;
                if (reciever) { 
                    await ChatModule.sendMessage({
                        author: userId,
                        reciever: reciever._id,
                        text,
                    });
                }
            });
        }

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${id}`);
        });
    });

start();