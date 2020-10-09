/**
 * BookingItem.js
 */
const moment = require('moment');
const api = require('../models/Api');

module.exports = {
    attributes: {
        booking_id: {
            required: true,
            type: 'string'
        },
        package_id: {
            type: 'json',
            columnType: 'array',
            defaultsTo: []
        },
        type_id: {
            defaultsTo: 1,
            type: 'number'
        },
        status: {
            defaultsTo: 1,
            type: 'number'
        },
        is_deleted: {
            type: 'number',
            defaultsTo: 2
        },
        deleted_at: {
            type: 'number',
            allowNull: true
        },
        created_at: {
            type: 'number'
        },
        updated_by: {
            allowNull: true,
            type: 'string'
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

    getJson: async function(req, more = false) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        const proService = await ProviderService.find({
            id: req.item_id
        });
        if (proService.length > 0) {
            json['fake_proservice_id'] = proService[0].service_id;
            if (proService[0].name) {
                json['service'] = proService[0].name;
            } else {
                const service = await Service.find({
                    id: proService[0].service_id
                });
                json['service'] = service[0].name;
            }
        }
        json['item_id'] = api.checkAttribute(req.item_id);
        json['servicePrice'] = await ProviderService.getPrice(
            api.checkAttribute(req.item_id)
        );
        json['package_id'] = req.package_id;

        return json;
    },

    getPackageCharge: async function(package) {
        var propackage = await ProviderServiceAddon.find({
            id: package
        }).limit('1');
        if (propackage && propackage.length > 0) {
            return propackage[0].price;
        }
        return 0;
    },

    getPresentCharges: async function(time, amount) {
        var hours = time / 3600;
        var multiplier = Math.ceil(hours);
        return amount * multiplier;
    }
};
