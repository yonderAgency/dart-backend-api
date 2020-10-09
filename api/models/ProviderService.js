/**
 * ProviderService.js
 */
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            allowNull: true
        },
        cost_price: {
            type: 'number',
            defaultsTo: 0
        },
        price: {
            type: 'number',
            required: true
        },
        image: {
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
        address_ids: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        service_id: {
            required: true,
            type: 'string'
        },
        category_id: {
            required: true,
            type: 'string'
        },
        created_by: {
            required: true,
            type: 'string'
        },
        description: {
            required: true,
            type: 'string'
        },
        cost_price: {
            required: true,
            type: 'number'
        }
    },

    schema: true,

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req, addons = false) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['description'] = api.checkAttribute(req.description);
        json['serviceName'] = api.checkAttribute(req.name);
        json['name'] = json['serviceName'];
        json['price'] = api.checkAttribute(req.price).toString();
        json['costPrice'] = api.checkAttribute(req.cost_price).toString();
        json['categoryId'] = api.checkAttribute(req.category_id);
        var category = await Category.find({
            id: req.category_id
        });
        json['category'] = await Category.getJson(category[0]);
        json['categoryName'] = category[0].name;
        json['serviceId'] = api.checkAttribute(req.service_id);
        if (typeof json['name'] == 'undefined' || json['name'] == '') {
            var service = await Service.find({
                id: req.service_id
            });
            json['serviceName'] = service[0].name;
            json['service'] = await Service.getJson(service[0]);
            json['name'] = json['serviceName'];
        }
        if (req.image) {
            json['image'] = Api.getActualImages('/uploads/service/', req.image);
        } else {
            json['image'] = Api.getBaseImages();
        }
        json['status'] = api.checkAttribute(req.status);
        var packages = [];
        if (addons) {
            var addonPackage = await ProviderServiceAddonGroup.find({
                status: sails.config.constants.STATUS_ACTIVE,
                provider_service_id: req.id,
                created_by: req.created_by
            });
            if (addonPackage && addonPackage.length > 0) {
                for (x in addonPackage) {
                    packages.push(
                        await ProviderServiceAddonGroup.getJson(
                            addonPackage[x],
                            true
                        )
                    );
                }
            }
        }
        json['addOns'] = packages;
        json['groups'] = packages.length;
        return json;
    },

    getCompleteJson: async function(req) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        json['description'] = api.checkAttribute(req.description);
        json['price'] = api.checkAttribute(req.price).toString();
        json['costPrice'] = api.checkAttribute(req.cost_price).toString();
        json['categoryId'] = api.checkAttribute(req.category_id);
        json['category'] = {};
        var category = await Category.find({
            id: req.category_id
        }).limit(1);
        if (category && category.length > 0) {
            json['category'] = await Category.getJson(category[0]);
        }
        json['serviceId'] = api.checkAttribute(req.service_id);
        json['service'] = {};
        json['isCustom'] = false;
        var service = await Service.find({
            id: req.service_id
        }).limit(1);
        if (service && service.length > 0) {
            json['service'] = await Service.getJson(service[0]);
            if (service[0].created_by == req.created_by) {
                json['isCustom'] = true;
            }
        }
        json['createdBy'] = api.checkAttribute(req.created_by);
        json['address_ids'] = api.checkAttribute(req.address_ids);
        json['createdAt'] = api.checkAttribute(req.created_at);

        json['providerServiceAddon'] = [];
        var providerServiceAddon = await ProviderServiceAddonGroup.find({
            provider_service_id: req.id,
            created_by: req.created_by
        });
        if (providerServiceAddon.length > 0) {
            var images = [];
            for (x in providerServiceAddon) {
                var packet = await ProviderServiceAddonGroup.getJson(
                    providerServiceAddon[x],
                    true
                );
                images.push(packet);
            }
            json['providerServiceAddon'] = images;
        }

        if (req.image) {
            json['image'] = Api.getActualImages('/uploads/service/', req.image);
        } else {
            json['image'] = Api.getBaseImages();
        }

        json['status'] = api.checkAttribute(req.status);

        return json;
    },

    getAll: async function(services) {
        var serviceModel = [];
        for (const service of services) {
            const data = await this.getJson(service);
            serviceModel.push(data);
        }
        return serviceModel;
    },

    getProviders: async function(providers) {
        var providerModel = [];
        for (x in providers) {
            const data = await User.getJson(providers[x], null, null);
            providerModel.push(data);
        }
        return providerModel;
    },

    getProviderService: async function(providerId) {
        var proService = await ProviderService.find({
            where: {
                created_by: providerId
            }
        });
        // var proService = await Service.find({
        //     where: {
        //         created_by: providerId,
        //         status:sails.config.constants.STATUS_ACTIVE,
        //     }
        // });
        console.log({proService});
        if (proService[0]) {
            return proService[0];
        }
    },

    getName: async function(value) {
        var returnValue = '';
        var service;
        const proService = await ProviderService.find({
            id: value,
            status: sails.config.constants.STATUS_ACTIVE
        });
        if (proService.length > 0) {
            if (proService[0].name) {
                returnValue = proService[0].name;
            } else {
                service = await Service.find({
                    id: proService[0].service_id,
                    status: sails.config.constants.STATUS_ACTIVE,
                    deleted_at: null
                }).limit(1);
                if (service.length > 0) {
                    returnValue = service[0].name;
                }
            }
        }
        return returnValue;
    },

    getPrice: async function(id) {
        var returnValue = 0;
        const proService = await ProviderService.find({
            id: id
        });
        if (proService.length > 0) {
            if (proService[0].price !== '') {
                returnValue = proService[0].price;
            }
        }
        return returnValue;
    },

    getCartJson: async function(req, selectedAddons, quantity = 1) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['address_ids'] = api.checkAttribute(req.address_ids);
        json['serviceName'] = api.checkAttribute(req.name);
        json['totalPrice'] = 0;
        json['price'] = api.checkAttribute(req.price).toString();
        json['costPrice'] = api.checkAttribute(req.cost_price).toString();
        json['categoryId'] = api.checkAttribute(req.category_id);
        var category = await Category.find({
            id: req.category_id
        });
        json['categoryDetail'] = await Category.getFoodJson(category[0]);
        json['categoryName'] = category[0].name;
        if (typeof json['name'] == 'undefined' || json['name'] == '') {
            var service = await Service.find({
                id: req.service_id
            });
            json['serviceName'] = service[0].name;
        }
        json['status'] = api.checkAttribute(req.status);
        json['quantity'] = Number(quantity);
        var packages = [];
        var addonPackageGroup = await ProviderServiceAddonGroup.find({
            provider_service_id: req.id,
            status: sails.config.constants.STATUS_ACTIVE
        });
        if (addonPackageGroup && addonPackageGroup.length > 0) {
            for (x in addonPackageGroup) {
                packages.push(
                    await ProviderServiceAddonGroup.getCompleteJson(
                        addonPackageGroup[x],
                        selectedAddons
                    )
                );
            }
        }
        json['addOns'] = packages;
        return json;
    }
};
