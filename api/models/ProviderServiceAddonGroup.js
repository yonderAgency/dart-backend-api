/**
 * ProviderServiceAddonGroup.js
 */
const api = require('./Api.js');
const moment = require('moment');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            required: true
        },
        quantity: {
            type: 'number',
            required: true
        },
        required: {
            type: 'boolean',
            defaultsTo: false
        },
        provider_service_id: {
            required: true,
            type: 'string'
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
        created_by: {
            required: true,
            type: 'string'
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req, addOns = false) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['id'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        json['quantity'] = api.checkAttribute(req.quantity);
        json['required'] = api.checkAttribute(req.required);
        json['provider_service_id'] = api.checkAttribute(
            req.provider_service_id
        );
        json['description'] = api.checkAttribute(req.description);
        json['status'] = api.checkAttribute(req.status);
        json['subAddOns'] = [];
        if (addOns === true) {
            let mainArray = [];
            var addOnPackets = await ProviderServiceAddon.find({
                provider_service_group_id: req.id,
                created_by: req.created_by
            });
            if (addOnPackets && addOnPackets.length > 0) {
                for (x in addOnPackets) {
                    let singlePacket = await ProviderServiceAddon.getJson(
                        addOnPackets[x]
                    );
                    mainArray.push(singlePacket);
                }
            }
            json['subAddOns'] = mainArray;
        }
        return json;
    },

    getCompleteJson: async function(req, addOns) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['id'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        json['quantity'] = api.checkAttribute(req.quantity);
        json['required'] = api.checkAttribute(req.required);
        json['provider_service_id'] = api.checkAttribute(
            req.provider_service_id
        );
        json['description'] = api.checkAttribute(req.description);
        json['status'] = api.checkAttribute(req.status);
        json['subAddOns'] = [];
        let mainArray = [];
        var addOnPackets = await ProviderServiceAddon.find({
            provider_service_group_id: req.id,
            created_by: req.created_by
        });
        if (addOnPackets && addOnPackets.length > 0) {
            for (x in addOnPackets) {
                let selected = false;
                for (y in addOns) {
                    if (addOnPackets[x].id === addOns[y].id) {
                        selected = true;
                        break;
                    }
                }
                let singlePacket = await ProviderServiceAddon.getJson(
                    addOnPackets[x],
                    selected
                );

                mainArray.push(singlePacket);
            }
        }
        json['subAddOns'] = mainArray;
        return json;
    }
};
