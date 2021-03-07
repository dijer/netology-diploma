const expressSession = require('express-session');

const sessionMiddleware = expressSession({
    secret: 'qowiheoiqwheqwoheqw',
    resave: false,
    saveUninitialized: false,
});

module.exports = sessionMiddleware;