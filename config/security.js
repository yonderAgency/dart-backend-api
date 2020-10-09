/**
 * Security Settings
 * (sails.config.security)
 */

module.exports.security = {
    cors: {
        allRoutes: true,
        allowOrigins: '*',
        allowRequestHeaders: 'Content-Type, x-auth-token, latitude, longitude',
        allowRequestMethods: 'GET, POST, DELETE'
    }
};
