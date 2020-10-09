/**
 * Bootstrap
 * (sails.config.bootstrap)
 */

let http = require('http');

module.exports.bootstrap = async function(done) {
    if (sails.config.environment === 'production') {
        http.createServer(sails.hooks.http.app).listen(80);
    }
    const settings = await Settings.find({
        status: sails.config.constants.STATUS_ACTIVE
    }).limit(1);
    if (settings.length > 0) {
        sails.config.dynamics = settings[0];
    }
    let db = UserAddress.getDatastore().manager;
    await db
        .collection(UserAddress.tableName)
        .createIndex({ location: '2dsphere' });

    sails.sentry = require('@sentry/node');
    return done();
};
