/**
 * Default model settings
 * (sails.config.models)
 */

module.exports.models = {
    migrate: 'safe',
    attributes: {
        id: { type: 'string', columnName: '_id' }
    },
    dataEncryptionKeys: {
        default: 'i8R87KP8F7fha4kt9QX+T6/OSwJQDjPZk7veQD1WgWI='
    },
    cascadeOnDestroy: true
};
