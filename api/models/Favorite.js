/**
 * Favorite.js
 */
const api = require('./Api.js');
const moment = require('moment');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        created_by: {
            type: 'string',
            required: true
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        type_id: {
            type: 'number',
            defaultsTo: 1
        },
        created_at: {
            type: 'number'
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    createFavoriteList: async function(id) {
        const fav = await Favorite.find({
            created_by: id
        }).limit(1);
        if (fav && fav.length == 0) {
            await Favorite.create({
                name: sails.config.constants.DEFAULT_FAVORITE_LIST,
                created_by: id,
                type_id: sails.config.constants.FAVORITE_DEFAULT
            });
        }
    },

    getValue: async function(providerId, userId) {
        let result = '0';
        let favValue = await Favoriteservice.find({
            provider_id: providerId,
            created_by: userId
        });
        if (favValue && favValue.length > 0) {
            result = '1';
        }
        return result;
    },

    getJson: async function(req, services = false) {
        var list = [];
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        json['created_by'] = api.checkAttribute(req.created_by);
        json['canDelete'] = true;
        if (req.type_id) {
            json['canDelete'] = false;
        }
        if (services) {
            var servs = await Favoriteservice.find({
                favorite_id: req.id
            });
            for (const serv in servs) {
                var provider = await User.find({
                    id: servs[serv].provider_id
                }).limit(1);
                var proService = await ProviderService.find({
                    id: servs[serv].service_id
                }).limit(1);
                var service = await Service.find({
                    id: proService[0].service_id
                }).limit(1);
                provider[0].service = await Service.getJson(service[0]);
                list.push(await User.getJson(provider[0]));
            }
            json['providers'] = list;
        }
        return json;
    }
};
