/**
 * HTTP Server Settings
 * (sails.config.http)
 */

var lusca = require('lusca');
var helmet = require('helmet');

module.exports.http = {
    middleware: {
        order: [
            'cookieParser',
            'session',
            'bodyParser',
            'compress',
            'helmetProtection',
            'strictTransportSecurity',
            'xframe',
            'csp',
            'poweredBy',
            'router',
            'www',
            'favicon'
        ],
        bodyParser: (function _configureBodyParser() {
            var skipper = require('skipper');
            var opts = {
                limit: '50mb',
                extended: true,
                maxTimeToBuffer: 100000
            };
            return skipper(opts);
        })(),

        strictTransportSecurity: require('lusca').hsts({ maxAge: 31536000 }),

        csp: require('lusca').csp({
            policy: {
                'default-src': '*'
            }
        }),

        xframe: function xframe(req, res, next) {
            return lusca.xframe('SAMEORIGIN')(req, res, next);
        },

        helmetProtection: function helmetProtection(req, res, next) {
            return helmet({
                frameguard: false
            })(req, res, next);
        }
    }
};
