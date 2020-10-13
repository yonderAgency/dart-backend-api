let port = process.env.PORT;

module.exports = {
    port,
    environment: process.env.NODE_ENV,
    ssl:
        process.env.IS_SSL_FILES === 'true'
            ? {
                  cert: require('fs').readFileSync(process.env.CERT_FILE),
                  key: require('fs').readFileSync(process.env.KEY_FILE),
                  ca: require('fs').readFileSync(process.env.CA_FILE)
              }
            : false,
    policies:
        process.env.IS_SSL_FILES === 'true'
            ? {
                  '*': 'isHTTPS'
              }
            : {}
};
