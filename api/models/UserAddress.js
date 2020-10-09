/**
 * UserAddress.js
 */
const moment = require('moment');
const api = require('../models/Api.js');
const _ = require('lodash');

module.exports = {
    attributes: {
        name: {
            type: 'string',
            required: true,
        },
        address_line1: {
            type: 'string',
            required: true,
        },
        address_line2: {
            type: 'string',
            allowNull: true,
        },
        city: {
            type: 'string',
            required: true,
        },
        state: {
            type: 'string',
            required: true,
        },
        country: {
            type: 'string',
            required: true,
        },
        zipcode: {
            type: 'string',
            required: true,
        },
        latitude: {
            type: 'string',
            allowNull: true,
        },
        longitude: {
            type: 'string',
            allowNull: true,
        },
        email: {
            type: 'string',
            required: true,
        },
        phone: {
            type: 'string',
            required: true,
        },
        is_default: {
            type: 'number',
            defaultsTo: 2,
        },
        status: {
            type: 'number',
            defaultsTo: 1,
        },
        type_id: {
            type: 'number',
        },
        created_by: {
            model: 'user',
        },
        created_at: {
            type: 'number',
        },
        is_deleted: {
            type: 'number',
            defaultsTo: 2,
        },
        updated_at: {
            type: 'number',
            allowNull: true,
        },
        deleted_at: {
            type: 'number',
            allowNull: true,
        },
        deleted_by: {
            type: 'string',
            allowNull: true,
        },
        location: {
            type: 'json',
            columnType: 'array',
            defaultsTo: {
                type: 'Point',
                coordinates: [],
            },
        },
    },

    schema: true,

    beforeCreate: async function (valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: function (req) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['address_line1'] = api.checkAttribute(req.address_line1);
        json['address_line2'] = api.checkAttribute(req.address_line2);
        json['city'] = api.checkAttribute(req.city);
        json['state'] = api.checkAttribute(req.state);
        json['country'] = api.checkAttribute(req.country);
        json['latitude'] = Number(api.checkAttribute(req.latitude));
        json['longitude'] = Number(api.checkAttribute(req.longitude));
        json['zipcode'] = api.checkAttribute(req.zipcode);
        json['type_id'] = api.checkAttribute(req.type_id);
        json['email'] = api.checkAttribute(req.email);
        json['status'] = api.checkAttribute(req.status);
        json['name'] = api.checkAttribute(req.name);
        json['phone'] = api.checkAttribute(req.phone);
        json['is_default'] = api.checkAttribute(req.is_default);
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['created_by'] = api.checkAttribute(req.created_by);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);
        return json;
    },

    getDeliveryJson: function (req) {
        var json = {};
        json['id'] = api.checkAttribute(req.id);
        json['address'] = api.checkAttribute(req.address_line1);
        json['city'] = api.checkAttribute(req.city);
        json['state'] = api.checkAttribute(req.state);
        json['country'] = api.checkAttribute(req.country);
        json['lat'] = Number(api.checkAttribute(req.latitude));
        json['lng'] = Number(api.checkAttribute(req.longitude));
        json['pincode'] = api.checkAttribute(req.zipcode);
        json['type_id'] = api.checkAttribute(req.type_id);
        json['email'] = api.checkAttribute(req.email);
        json['status'] = api.checkAttribute(req.status);
        json['name'] = api.checkAttribute(req.name);
        json['country_code'] = '+' + sails.config.dynamics.DEFAULT_COUNTRY_CODE;
        json['contact'] = api.checkAttribute(req.phone);
        json['image'] = '';
        return json;
    },

    getAddress: async function (id) {
        var address = await UserAddress.find({
            id: id,
        }).limit(1);
        if (address && address.length > 0) {
            return address[0];
        }
    },

    getDeliveryAddress: async function (id) {
        var address = await UserAddress.find({
            id: id,
        }).limit(1);
        if (address && address.length > 0) {
            let addressJson = await UserAddress.getDeliveryJson(address[0]);
            return addressJson;
        }
        return null;
    },

    getProviderAddress: async function (id) {
        var address = await UserAddress.find({
            id: id,
        }).limit(1);
        if (address && address.length > 0) {
            return address[0];
        }
        return null;
    },

    getJsonComplete: async function (req, user) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        var profileName = '';
        var image = Api.getBaseImages();
        if (user.role == sails.config.constants.ROLE_PROVIDER) {
            var profile = await ProviderProfile.find({
                created_by: user.id,
            }).limit(1);
            if (profile && profile.length > 0) {
                profileName = profile[0].business_name;
                if (profile[0].logo) {
                    image = Api.getActualImages(
                        '/uploads/profile/',
                        profile[0].logo
                    );
                }
            }
        } else if (user.role == sails.config.constants.ROLE_PROVIDER) {
            var profile = await CustomerProfile.find({
                created_by: user.id,
            }).limit(1);
            profileName = user.name;
            if (profile && profile.length > 0) {
                image = Api.getActualImages(
                    '/uploads/profile/',
                    profile[0].image
                );
            }
        }
        json['profile_name'] = profileName;
        json['image'] = image;
        json['address_line1'] = api.checkAttribute(req.address_line1);
        json['address_line2'] = api.checkAttribute(req.address_line2);
        json['city'] = api.checkAttribute(req.city);
        json['state'] = api.checkAttribute(req.state);
        json['country'] = api.checkAttribute(req.country);
        json['latitude'] = api.checkAttribute(parseFloat(req.latitude));
        json['longitude'] = api.checkAttribute(parseFloat(req.longitude));
        json['status'] = api.checkAttribute(req.status);
        json['zipcode'] = api.checkAttribute(req.zipcode);
        json['type_id'] = api.checkAttribute(req.type_id);
        json['email'] = api.checkAttribute(req.email);
        json['name'] = api.checkAttribute(req.name);
        json['phone'] = api.checkAttribute(req.phone);
        json['is_default'] = api.checkAttribute(req.is_default);
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);
        return json;
    },

    getAddressJson: async function (req) {
        var json = [];
        var packets = await UserAddress.find({
            created_by: req.id,
            status: sails.config.constants.STATUS_ACTIVE,
        });
        if (packets && packets.length > 0) {
            for (x in packets) {
                json.push(await this.getJsonComplete(packets[x], req));
            }
        }
        return json;
    },

    fetchNearestAddress: async function (
        customer,
        providerId,
        customerAddressId = null
    ) {
        let lastBooking = [];
        if (customerAddressId != null) {
            lastBooking.push({
                customer_address_id: customerAddressId,
            });
        } else {
            lastBooking = await Booking.find({
                created_by: customer.id,
            })
                .sort('created_at DESC')
                .limit(1);
        }
        let addAddress = null;
        let customerAddress;
        let addressArray = [];
        if (lastBooking && lastBooking.length > 0) {
            addAddress = await UserAddress.find({
                id: lastBooking[0].customer_address_id,
                status: sails.config.constants.STATUS_ACTIVE,
            }).limit(1);
            if (addAddress && addAddress.length > 0) {
                customerAddressId = addAddress[0].id;
                customerAddress = addAddress[0];
            } else {
                return {
                    status: 'NOK',
                    message: sails.__(
                        'Unable to get address, please check your addreeses'
                    ),
                };
            }
        } else {
            if (customerAddressId != null) {
                addAddress = await UserAddress.find({
                    id: customerAddressId,
                    created_by: customer.id,
                    status: sails.config.constants.STATUS_ACTIVE,
                }).limit(1);
                if (addAddress && addAddress.length > 0) {
                    customerAddress = addAddress[0];
                    customerAddressId = addAddress[0].id;
                } else {
                    return {
                        status: 'NOK',
                        message: sails.__(
                            'Unable to get address, please check your addreeses'
                        ),
                    };
                }
            } else {
                addAddress = await UserAddress.find({
                    created_by: customer.id,
                    status: sails.config.constants.STATUS_ACTIVE,
                }).limit(1);
                if (addAddress && addAddress.length > 0) {
                    customerAddress = addAddress[0];
                    customerAddressId = addAddress[0].id;
                } else {
                    return {
                        status: 'NOK',
                        message: sails.__(
                            'Unable to get address, please check your addreeses'
                        ),
                    };
                }
            }
        }
        let providerAddresses = await UserAddress.find({
            created_by: providerId,
            status: sails.config.constants.STATUS_ACTIVE,
        });
        if (providerAddresses && providerAddresses.length > 0) {
            for (x in providerAddresses) {
                addressArray.push({
                    id: providerAddresses[x].id,
                    latitude: providerAddresses[x].latitude,
                    longitude: providerAddresses[x].longitude,
                });
            }
        }
        if (addressArray && addressArray.length > 0) {
            addressArray = addressArray.map((address) => {
                var distance = Cart.checkAddressByHavershine(
                    sails.config.dynamics.SEARCH_RADIUS / 1000,
                    address.latitude,
                    address.longitude,
                    customerAddress.latitude,
                    customerAddress.longitude,
                    true
                );
                if (!isNaN(distance)) {
                    return {
                        id: address.id,
                        distance: distance,
                    };
                }
            });
            addressArray.sort(function (a, b) {
                return a.distance - b.distance;
            });
            if (
                addressArray[0].distance <
                sails.config.dynamics.SEARCH_RADIUS / 1000
            ) {
                return {
                    status: 'OK',
                    providerAddressId: addressArray[0].id,
                    customerAddressId: customerAddressId,
                };
            } else {
                return {
                    status: 'NOK',
                    message: sails.__(
                        "This restaurant doesn't deliver to your area"
                    ),
                };
            }
        } else {
            return {
                status: 'NOK',
                message: sails.__(
                    'Unable to get provider address, provider may not be providing at your addresses'
                ),
            };
        }
    },

    addToAllItems: async function (id, provider_id) {
        let providerServices = await ProviderService.find({
            created_by: provider_id,
        });
        if (providerServices && providerServices.length > 0) {
            for (x in providerServices) {
                let address_ids = providerServices[x].address_ids;
                if (Array.isArray(address_ids)) {
                    address_ids.push(id);
                    address_ids = _.uniqBy(address_ids, function (e) {
                        return e;
                    });
                }
                await ProviderService.update({
                    id: providerServices[x].id,
                }).set({
                    address_ids: address_ids,
                });
            }
        }
        return true;
    },
};
