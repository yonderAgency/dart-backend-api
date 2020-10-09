/**
 * Cart.js
 */
const moment = require('moment');
const api = require('./Api');
const _ = require('lodash');

module.exports = {
    attributes: {
        items: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
        },
        provider_id: {
            allowNull: true,
            type: 'string',
        },
        delivery_note: {
            defaultsTo: '',
            type: 'string',
        },
        delivery_type: {
            type: 'number',
            defaultsTo: sails.config.constants.DELIVERY_TYPE_DELIVERY,
        },
        promo_id: {
            defaultsTo: '',
            type: 'string',
        },
        customer_address_id: {
            type: 'string',
            allowNull: true,
        },
        provider_address_id: {
            type: 'string',
            allowNull: true,
        },
        status: {
            defaultsTo: 1,
            type: 'number',
        },
        type_id: {
            defaultsTo: 1,
            type: 'number',
        },
        created_at: {
            type: 'number',
        },
        created_by: {
            required: true,
            type: 'string',
        },
        updated_at: {
            allowNull: true,
            type: 'string',
        },
    },

    beforeCreate: async function (valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    rad: function (x) {
        return (x * Math.PI) / 180;
    },

    checkAddressByHavershine: function (
        radius,
        lat1,
        long1,
        lat2,
        long2,
        returnRadius = false
    ) {
        let R = 6378137;
        let dLat = this.rad(lat2 - lat1);
        let dLong = this.rad(long2 - long1);
        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.rad(lat1)) *
                Math.cos(this.rad(lat2)) *
                Math.sin(dLong / 2) *
                Math.sin(dLong / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = (R * c) / 1000;
        if (d > radius) {
            if (returnRadius) {
                return d;
            }
            return false;
        }
        if (returnRadius) {
            return d;
        }
        return true;
    },

    checkCompleteAddressByHavershine: async function (cart) {
        let providerAddress = await UserAddress.find({
            id: cart.provider_address_id,
        }).limit(1);
        let customerAddress = await UserAddress.find({
            id: cart.customer_address_id,
        }).limit(1);
        if (
            customerAddress &&
            customerAddress.length > 0 &&
            providerAddress &&
            providerAddress.length > 0
        ) {
            const check = this.checkAddressByHavershine(
                sails.config.dynamics.SEARCH_RADIUS,
                customerAddress[0].latitude,
                customerAddress[0].longitude,
                providerAddress[0].latitude,
                providerAddress[0].longitude,
                false
            );
            return check;
        }
        return false;
    },

    verifyItem: async function (cartItem, provider_id, addressId = null) {
        let validService = [];
        console.log({ addressId });
        if (addressId != null && typeof addressId != 'undefined') {
            validService = await ProviderService.count({
                where: {
                    created_by: provider_id,
                    id: cartItem.id,
                    status: sails.config.constants.STATUS_ACTIVE,
                    address_ids: {
                        contains: addressId,
                    },
                },
            });
        } else {
            validService = await ProviderService.count({
                where: {
                    created_by: provider_id,
                    id: cartItem.id,
                    status: sails.config.constants.STATUS_ACTIVE,
                },
            });
        }
        let addOns = cartItem.addOns;
        if (validService > 0) {
            var valid = true;
            var message = '';
            if (addOns && addOns.length > 0) {
                let filteredAddons = [];
                if (addOns && addOns.length > 0) {
                    for (x in addOns) {
                        if (addOns[x].id && addOns[x].id.length > 0) {
                            filteredAddons.push(addOns[x].id);
                        } else if (addOns[x].key && addOns[x].key.length > 0) {
                            filteredAddons.push(addOns[x].key);
                        }
                    }
                }
                let categories = await ProviderServiceAddon.find({
                    id: { in: filteredAddons },
                });
                categories = _.uniq(categories, 'provider_service_group_id');
                let matchPacket = [];
                for (x in categories) {
                    let singleGroup = await ProviderServiceAddonGroup.find({
                        id: categories[x].provider_service_group_id,
                    }).limit(1);
                    if (singleGroup && singleGroup.length > 0) {
                        let allowedAddOns = [];
                        const allowedAddonsModels = await ProviderServiceAddon.find(
                            {
                                provider_service_group_id: singleGroup[0].id,
                            }
                        );
                        if (
                            allowedAddonsModels &&
                            allowedAddonsModels.length > 0
                        ) {
                            for (y in allowedAddonsModels) {
                                allowedAddOns.push(allowedAddonsModels[y].id);
                            }
                        }
                        matchPacket.push({
                            category: singleGroup[0].id,
                            quantity: singleGroup[0].quantity,
                            required: singleGroup[0].required,
                            allowedAddOns: allowedAddOns,
                        });
                    }
                }
                for (x in matchPacket) {
                    if (matchPacket[x].required) {
                        const intersection = filteredAddons.filter(
                            (element) => {
                                return matchPacket[x].allowedAddOns.includes(
                                    element
                                );
                            }
                        );
                        console.log('above', matchPacket[x].quantity);
                        console.log('intersection.length', intersection.length);
                        // if (matchPacket[x].quantity !== intersection.length) {
                        //     valid = false;
                        //     message = sails.__(
                        //         'Please select required number of addons'
                        //     );
                        //     break;
                        // } else {
                        valid = true;
                        //}
                    } else {
                        const intersection = filteredAddons.filter(
                            (element) => {
                                return matchPacket[x].allowedAddOns.includes(
                                    element
                                );
                            }
                        );
                        if (matchPacket[x].quantity !== 0) {
                            if (
                                intersection.length <= matchPacket[x].quantity
                            ) {
                                valid = true;
                                message = '';
                            } else {
                                valid = false;
                                message = sails.__(
                                    'You have selected more than allowed addons'
                                );
                                break;
                            }
                        } else {
                            valid = true;
                        }
                    }
                }
            }
            if (valid) {
                return { status: valid };
            } else {
                return {
                    status: valid,
                    message:
                        message && message.length > 0
                            ? message
                            : sails.__('Invalid items selected'),
                };
            }
        }
        return {
            status: false,
            message: sails.__("Provider doesn't provide in your area"),
        };
    },

    verifyItemOnUpdate: async function (
        cartItem,
        provider_id,
        addressId = null
    ) {
        let validService = [];
        if (addressId != null || typeof addressId != 'undefined') {
            validService = await ProviderService.count({
                created_by: provider_id,
                id: cartItem.id,
                status: sails.config.constants.STATUS_ACTIVE,
                address_ids: {
                    contains: addressId,
                },
            });
        } else {
            validService = await ProviderService.count({
                created_by: provider_id,
                id: cartItem.id,
                status: sails.config.constants.STATUS_ACTIVE,
            });
        }
        let addOns = cartItem.addOns;
        if (validService > 0) {
            var valid = true;
            let filteredAddons = [];
            if (addOns && addOns.length > 0) {
                for (x in addOns) {
                    if (addOns[x].id && addOns[x].id.length > 0) {
                        filteredAddons.push(addOns[x].id);
                    } else if (addOns[x].key && addOns[x].key.length > 0) {
                        filteredAddons.push(addOns[x].key);
                    }
                }
            }
            let categories = await ProviderServiceAddon.find({
                id: { in: filteredAddons },
            });
            categories = _.uniq(categories, 'provider_service_group_id');
            let matchPacket = [];
            for (x in categories) {
                let singleGroup = await ProviderServiceAddonGroup.find({
                    id: categories[x].provider_service_group_id,
                }).limit(1);
                if (singleGroup && singleGroup.length > 0) {
                    let allowedAddOns = [];
                    const allowedAddonsModels = await ProviderServiceAddon.find(
                        {
                            provider_service_group_id: singleGroup[0].id,
                        }
                    );
                    if (allowedAddonsModels && allowedAddonsModels.length > 0) {
                        for (y in allowedAddonsModels) {
                            allowedAddOns.push(allowedAddonsModels[y].id);
                        }
                    }
                    matchPacket.push({
                        category: singleGroup[0].id,
                        quantity: singleGroup[0].quantity,
                        required: singleGroup[0].required,
                        allowedAddOns: allowedAddOns,
                    });
                }
            }
            for (x in matchPacket) {
                if (matchPacket[x].required) {
                    const intersection = filteredAddons.filter((element) => {
                        return matchPacket[x].allowedAddOns.includes(element);
                    });
                    console.log('below', matchPacket[x].quantity);
                    console.log('intersection.length', intersection.length);
                    // if (matchPacket[x].quantity !== intersection.length) {
                    //     valid = false;
                    //     message = sails.__(
                    //         'Please select required number of addons'
                    //     );
                    //     break;
                    // } else {
                    valid = true;
                    // }
                } else {
                    const intersection = filteredAddons.filter((element) => {
                        return matchPacket[x].allowedAddOns.includes(element);
                    });
                    if (matchPacket[x].quantity !== 0) {
                        if (intersection.length <= matchPacket[x].quantity) {
                            valid = true;
                            message = '';
                        } else {
                            valid = false;
                            message = sails.__(
                                'You have selected more than allowed addons'
                            );
                            break;
                        }
                    } else {
                        valid = true;
                    }
                }
            }
            if (valid) {
                return { status: valid };
            } else {
                return {
                    status: valid,
                    message:
                        message && message.length > 0
                            ? message
                            : sails.__('Invalid items selected'),
                };
            }
        }
        return { status: false };
    },

    generateCartItemPacket: async function (cartItems) {
        var finalPacket = [];
        if (cartItems && cartItems.length > 0) {
            for (x in cartItems) {
                var providerService = await ProviderService.find({
                    id: cartItems[x].itemId,
                    status: sails.config.constants.STATUS_ACTIVE,
                }).limit(1);
                if (providerService && providerService.length > 0) {
                    var json = await ProviderService.getCartJson(
                        providerService[0],
                        cartItems[x] ? cartItems[x].addOns : [],
                        cartItems[x] ? cartItems[x].quantity : []
                    );
                    finalPacket.push(json);
                }
            }
        }
        return finalPacket;
    },

    generateBookingItemPacket: async function (orderItems) {
        var finalPacket = [];
        for (x in orderItems) {
            var providerService = await ProviderService.find({
                id: orderItems[x].itemId,
            }).limit(1);
            if (providerService && providerService.length > 0) {
                var json = await ProviderService.getCartJson(
                    providerService[0],
                    orderItems[x].addOns,
                    orderItems[x].quantity
                );
                finalPacket.push(json);
            }
        }
        return finalPacket;
    },

    generatePrices: function (items) {
        var totalPrice = 0;
        for (x in items) {
            var addOnPrice = 0;
            for (y in items[x].addOns) {
                for (z in items[x].addOns[y].subAddOns) {
                    if (items[x].addOns[y].subAddOns[z].selected) {
                        addOnPrice =
                            addOnPrice +
                            parseInt(items[x].addOns[y].subAddOns[z].price);
                    }
                }
            }
            var itemPrice =
                addOnPrice * items[x].quantity +
                items[x].price * items[x].quantity;
            items[x].totalPrice = itemPrice;
            totalPrice = totalPrice + itemPrice;
        }
        return {
            items: items,
            totalPrice: totalPrice,
        };
    },

    getDeliveryAmount: function (subTotal) {
        if (
            Number(subTotal) <=
            Number(sails.config.dynamics.MINIMUM_ORDER_AMOUNT)
        ) {
            return Number(sails.config.dynamics.DELIVERY_COST);
        }
        return 0;
    },

    getPromoAmount: async function (
        id,
        subTotal,
        promoId,
        customer,
        booking = false,
        already = false
    ) {
        var promoCode = await PromoCodes.find({
            id: promoId,
        }).limit(1);

        if (promoCode && promoCode.length > 0) {
            var valid = await PromoCodes.checkEligibility(
                customer,
                promoCode[0],
                already
            );
            var amount = 0;
            var message = '';
            if (valid.status == 'OK') {
                amount = (promoCode[0].percent_amount * subTotal) / 100;
                if (Number(amount) > Number(promoCode[0].upto_amount)) {
                    amount = Number(promoCode[0].upto_amount);
                }
            } else {
                if (booking) {
                    // var booking = await Booking.find({ id: id }).limit(1);
                    // if (booking && booking.length > 0) {
                    //     await Booking.update({ id: id }).set({
                    //         promo_id: '',
                    //     });
                    //     message = sails.__(
                    //         'Promo code is not valid now, removed from the cart'
                    //     );
                    // }
                    amount = (promoCode[0].percent_amount * subTotal) / 100;
                    if (Number(amount) > Number(promoCode[0].upto_amount)) {
                        amount = Number(promoCode[0].upto_amount);
                    }
                } else {
                    var cart = await Cart.find({ id: id }).limit(1);
                    console.log({ cart });
                    if (cart && cart.length > 0) {
                        await Cart.update({ id: id }).set({
                            promo_id: '',
                        });
                        message = sails.__(
                            'Promo code is not valid now, removed from the cart'
                        );
                    }
                }
            }
            console.log({
                amount: amount,
                message: message,
            });
            return {
                amount: amount,
                message: message,
            };
        }
        return {
            amount: 0,
            message: '',
        };
    },

    fetchValidAddresses: async function (items, selected = null) {
        let mainAddressArray = [];
        let addressArray = [];
        if (items.length > 0) {
            for (x in items) {
                mainAddressArray.push(...items[x].address_ids);
            }
        }
        mainAddressArray = _.uniq(mainAddressArray, function (e) {
            return e;
        });
        if (mainAddressArray.length > 0) {
            let addresses = await UserAddress.find({
                id: mainAddressArray,
                status: sails.config.constants.STATUS_ACTIVE,
            });

            if (addresses && addresses.length > 0) {
                for (y in addresses) {
                    var temp = await UserAddress.getJson(addresses[y]);
                    temp.selected = false;
                    if (selected != null) {
                        if (temp.key == selected) {
                            temp.selected = true;
                        }
                    }
                    addressArray.push(temp);
                }
            }
        } else {
            if (selected != null) {
                let selectedAddress = await UserAddress.find({
                    id: selected,
                }).limit(1);
                var temp = await UserAddress.getJson(selectedAddress[0]);
                temp.selected = true;
                addressArray.push(temp);
            }
        }
        return addressArray;
    },

    getAmountForBooking: async function (
        items,
        id,
        created_by,
        promo_id,
        delivery_type
    ) {
        var subTotal = 0;
        if (items.length > 0) {
            let packet = this.generatePrices(items);
            items = packet.items;
            subTotal = packet.totalPrice;
        }
        var delivery = 0;
        if (delivery_type == sails.config.constants.DELIVERY_TYPE_DELIVERY) {
            delivery = items.length > 0 ? this.getDeliveryAmount(subTotal) : 0;
        }
        var promoDiscount = {
            amount: 0,
            message: '',
        };
        if (promo_id != '' && items.length > 0) {
            promoDiscount = await this.getPromoAmount(
                id,
                subTotal,
                promo_id,
                created_by
            );
        }
        if (promoDiscount.message != '') {
            return new Error(promoDiscount.message);
        }
        return (
            Number(subTotal) + Number(delivery) - Number(promoDiscount.amount)
        );
    },

    getJson: async function (req) {
        var json = {};
        var items = [];
        json['key'] = api.checkAttribute(req.id);
        if (req.items.length > 0) {
            items = await this.generateCartItemPacket(req.items);
        }
        json['items'] = items;
        json['provider'] = {};
        const providerProfileData = await ProviderProfile.getData(
            req.provider_id
        );
        if (providerProfileData) {
            json['provider']['key'] = api.checkAttribute(
                providerProfileData.created_by
            );
            json['provider']['id'] = json['provider']['key'];
            json['provider']['businessName'] = api.checkAttribute(
                providerProfileData.business_name
            );
            if (providerProfileData.logo) {
                json['provider']['proImage'] = Api.getActualImages(
                    '/uploads/profile/',
                    providerProfileData.logo
                );
            } else {
                json['provider']['proImage'] = Api.getBaseImages();
            }
        } else {
            json['provider']['proImage'] = Api.getBaseImages();
        }

        json['provider']['addresses'] = {};
        if (req.provider_address_id != null) {
            const providerAddress = await this.fetchValidAddresses(
                json['items'],
                req.provider_address_id
            );
            json['provider']['addresses'] = providerAddress;
        }

        json['customer'] = {};
        json['customer']['address'] = false;
        if (req.customer_address_id != null) {
            const customerAddress = await UserAddress.find({
                id: req.customer_address_id,
                status: sails.config.constants.STATUS_ACTIVE,
            });
            if (customerAddress && customerAddress.length > 0) {
                json['customer']['address'] = await UserAddress.getJson(
                    customerAddress[0]
                );
            }
        }

        json['status'] = api.checkAttribute(req.status);
        json['promoId'] = api.checkAttribute(req.promo_id);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['created_by'] = api.checkAttribute(req.created_by);
        json['updated_by'] = api.checkAttribute(req.updated_by);
        json['deliveryNote'] = api.checkAttribute(req.delivery_note);
        json['deliveryType'] = api.checkAttribute(req.delivery_type);

        var subTotal = 0;
        if (items.length > 0) {
            let packet = this.generatePrices(items);
            items = packet.items;
            subTotal = packet.totalPrice;
        }

        var delivery = 0;
        if (
            req.delivery_type == sails.config.constants.DELIVERY_TYPE_DELIVERY
        ) {
            delivery = Cart.getDeliveryAmount(subTotal);
        }
        var promoDiscount = {
            amount: 0,
        };
        if (req.promo_id != '' && items.length > 0) {
            promoDiscount = await this.getPromoAmount(
                req.id,
                subTotal,
                req.promo_id,
                req.created_by
            );
        }
        var finalAmount =
            Number(subTotal) + Number(delivery) - Number(promoDiscount.amount);

        json['costing'] = {
            subTotal: subTotal,
            delivery: delivery,
            promoDiscount: promoDiscount.amount,
            totalPrice: finalAmount,
        };
        return json;
    },
};
