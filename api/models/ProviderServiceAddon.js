/**
 * ProviderServiceAddon.js
 */
const api = require('./Api.js');
const moment = require('moment');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        price: {
            type: 'number',
            required: true
        },
        time: {
            type: 'string',
            allowNull: true
        },
        description: {
            type: 'string',
            allowNull: true
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
        },
        updated_at: {
            type: 'number'
        },
        is_deleted: {
            type: 'number',
            defaultsTo: 2
        },
        provider_service_group_id: {
            required: true,
            type: 'string'
        },
        created_by: {
            required: true,
            type: 'string'
        },
        cost_price: {
            type: 'number',
            required: true
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getPackageServices: async function(id) {
        let list = [];
        const values = id.split(',');
        for (var x in values) {
            var packet = await ProviderService.getName(values[x]);
            list.push(packet);
        }
        if (list.length > 0) {
            return list.join(', ');
        }
    },

    getJson: async function(req, selected) {
        var json = {};
        json['id'] = api.checkAttribute(req.id);
        json['key'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        json['costPrice'] = api.checkAttribute(req.cost_price).toString();
        json['price'] = api.checkAttribute(req.price).toString();
        json['time'] = api.checkAttribute(req.time);
        json['description'] = api.checkAttribute(req.description);
        json['provider_service_group_id'] = api.checkAttribute(
            req.provider_service_group_id
        );
        json['selected'] = selected;
        json['status'] = req.status;
        return json;
    },

    getPackages: async function(serviceId, providerId) {
        var packages = [];
        const proService = await ProviderService.find({
            created_by: providerId,
            service_id: serviceId,
            status: sails.config.constants.STATUS_ACTIVE
        });
        if (proService && proService[0]) {
            packages = await ProviderServiceAddon.find({
                provider_service_id: proService[0].id,
                created_by: providerId
            });
        }
        return packages;
    },

    getName: async function(id) {
        const providerServiceAddon = await ProviderServiceAddon.find({
            id: id
        }).limit(1);
        var returnValue = '';

        if (providerServiceAddon.length > 0) {
            if (providerServiceAddon[0].name !== '') {
                returnValue = providerServiceAddon[0].name;
            }
        }
        return returnValue;
    },

    getAmount: async function(idArray, percentage, upto_amount) {
        var amount = 0;
        var discount = 0;
        if (idArray && idArray.length > 0) {
            for (x in idArray) {
                var service = await ProviderServiceAddon.find({
                    id: idArray[x]
                }).limit(1);
                if (service && service.length > 0) {
                    amount = amount + Number(service[0].price);
                }
            }
        }
        if (amount != 0) {
            discount = (percentage * amount) / 100;
            if (Number(discount) > Number(upto_amount)) {
                discount = Number(upto_amount);
            }
        }
        amount = Number(amount) - Number(discount);
        return amount;
    }
};
