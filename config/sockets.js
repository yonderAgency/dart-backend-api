module.exports.sockets = {
    transports: ['websocket'],
    beforeConnect: function(handshake, proceed) {
        return proceed(undefined, true);
    },
    afterDisconnect: function(session, socket, done) {
        return done();
    }
    // grant3rdPartyCookie: true,
};
