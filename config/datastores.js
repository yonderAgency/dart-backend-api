/**
 * Datastores
 * (sails.config.datastores)
 *
 */

let hostname = process.env.DB_HOSTNAME;
let port = process.env.DB_PORT;
let dbname = process.env.DB_NAME;
let username = process.env.DB_USERNAME;
let password = process.env.DB_PASSWORD;

// let mongodburl = `mongodb://${username}:${password}@${hostname}:${port}/${dbname}`;
let mongodburl = `mongodb+srv://${username}:${password}@${hostname}/${dbname}?retryWrites=true&w=majority`;

module.exports.datastores = {
    default: {
        adapter: 'sails-mongo',
        url: mongodburl
    }
};
