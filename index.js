require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressSession = require('express-session');
const http = require('http');
const socketIO = require('socket.io');
const { User, Chat } = require('./models');
const { ChatModule } = require('./modules')

const advertisementsApiRouter = require('./routes/api/advertisements');
const usersApiRouter = require('./routes/api/users');

const app = express();
const server = http.Server(app);
const io = socketIO(server);

const options = {
    usernameField: 'email',
    passwordField: 'passwordHash',
    passReqToCallback: false,
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
        return done(null, false);
    });
}

passport.use('local', new LocalStrategy(options, verify));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err,user){
        err 
            ? done(err)
            : done(null, user);
        });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(expressSession({
    secret: 'qowiheoiqwheqwoheqw',
    resave: false,
    saveUninitialized: false,
}));

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

io.on('connection', socket => {
    const { id } = socket;
    const { _id: userId } = socket.request.user;
    var sessionId    = socket.handshake.sessionId;      

    ChatModule.subscribe(console.log);

    socket.on('getHistory', async (revieverId) => {
        const chat = await ChatModule.find({ users: [userId, recieverId] });
        let messages = [];
        if (chat) {
            const { id } = chat;
            messages = await ChatModule.getHistory(id);
        }
        socket.emit('chatHistory', messages);
    });

    socket.on('sendMessage', async (receiver, text) => {
        const message = await ChatModule.sendMessage({
            author: userId,
            reciever,
            text,
        });
        socket.emit('newMessage', message);
    });

    socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${id}`);
    });
});

start();