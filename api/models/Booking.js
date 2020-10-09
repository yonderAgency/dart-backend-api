/**
 * Booking.js
 */
const moment = require('moment');
const api = require('../models/Api');
const sails = require('sails');

module.exports = {
    attributes: {
        token: {
            unique: true,
            type: 'string',
        },
        total_amount: {
            type: 'number',
            defaultsTo: 0,
        },
        note: {
            type: 'string',
            allowNull: true,
        },
        customer_approved: {
            type: 'boolean',
            defaultsTo: false,
        },
        provider_approved: {
            type: 'boolean',
            defaultsTo: false,
        },
        delivery_approved: {
            type: 'boolean',
            defaultsTo: false,
        },
        payment_type: {
            type: 'number',
            required: true,
        },
        payment_status: {
            type: 'number',
            required: true,
        },
        promo_code: {
            type: 'string',
            allowNull: true,
        },
        status: {
            type: 'number',
            required: true,
        },
        deleted_at: {
            type: 'number',
            allowNull: true,
        },
        deleted_by: {
            type: 'string',
            allowNull: true,
        },
        created_at: {
            type: 'number',
        },
        updated_at: {
            type: 'number',
        },
        start_time: {
            type: 'number',
            allowNull: true,
        },
        end_time: {
            type: 'number',
            allowNull: true,
        },
        delivery_time: {
            type: 'number',
            defaultsTo: 0,
        },
        reject_reason: {
            type: 'string',
            required: false,
        },
        customer_address_id: {
            required: true,
            type: 'string',
        },
        provider_address_id: {
            required: true,
            type: 'string',
        },
        updated_by: {
            allowNull: true,
            type: 'string',
        },
        provider_id: {
            required: true,
            type: 'string',
        },
        created_by: {
            required: true,
            type: 'string',
        },
        customer_reviewed: {
            type: 'boolean',
            defaultsTo: false,
        },
        provider_reviewed: {
            type: 'boolean',
            defaultsTo: false,
        },
        assigned_to: {
            type: 'string',
            defaultsTo: '',
        },
        delivery_assigned: {
            type: 'string',
            defaultsTo: '',
        },
        delivery_type: {
            type: 'number',
            defaultsTo: sails.config.constants.DELIVERY_TYPE_DELIVERY,
        },
        delivery_details: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
        },
        is_due_paid: {
            type: 'boolean',
            defaultsTo: false,
        },
        ipAddress: {
            type: 'json',
            columnType: 'array',
            required: true,
        },
    },
    schema: true,

    beforeCreate: async function (valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        valuesToSet.updated_at = moment().valueOf();
        return proceed();
    },

    getJson: async function (req, more = false) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['token'] = api.checkAttribute(req.token);
        json['payment_type'] = req.payment_type;

        var bookingType = await this.getBookingType(req.status);
        json['status'] = bookingType;
        json['statusId'] = req.status;
        json['note'] = api.checkAttribute(req.note);
        json['payment_status'] = api.checkAttribute(req.payment_status);
        json['provider'] = '';

        var providerName = await User.getName(req.provider_id);
        if (providerName) {
            json['provider'] = providerName;
        } else {
            json['provider'] = '';
        }

        json['isCancellable'] = false;
        var checkingTime =
            moment().valueOf() - sails.config.dynamics.CANCELLATION_MINUTES;
        if (
            req.status === sails.config.constants.BOOKING_STATUS_INCART ||
            req.status === sails.config.constants.BOOKING_STATUS_INITIATED ||
            req.status === sails.config.constants.BOOKING_STATUS_CONFIRMED
        ) {
            if (req.created_at < checkingTime) {
                json['isCancellable'] = true;
            }
        }
        json['reschedule'] = false;
        json['reject_reason'] = req.reject_reason;
        if (
            req.status === sails.config.constants.BOOKING_STATUS_CANCELLED ||
            req.status === sails.config.constants.BOOKING_STATUS_REJECTED ||
            req.status === sails.config.constants.BOOKING_STATUS_ENDED ||
            req.status === sails.config.constants.BOOKING_STATUS_COMPLETED ||
            req.status ===
                sails.config.constants.BOOKING_STATUS_CANCELLED_PROVIDER
        ) {
            json['reschedule'] = true;
        }

        var address = await UserAddress.getAddress(
            api.checkAttribute(req.customer_address_id)
        );
        json['customerAddress'] = address;

        var addressPro = await UserAddress.getAddress(
            api.checkAttribute(req.provider_address_id)
        );
        json['providerAddress'] = addressPro;

        json['bookingImage'] = api.getBaseImages();
        var provider = await ProviderProfile.find({
            created_by: req.provider_id,
        });
        if (provider.length > 0) {
            if (typeof provider[0].logo !== 'undefined') {
                json['bookingImage'] = api.getActualImages(
                    '/uploads/profile/',
                    provider[0].logo
                );
            } else {
                json['bookingImage'] = api.getBaseImages();
            }
        }

        const user = await User.find({
            id: req.created_by,
        }).limit(1);
        if (user && user.length > 0) {
            json['customerName'] = user.name;
            const custProfileData = await CustomerProfile.getData(
                req.created_by
            );
            if (custProfileData && custProfileData.image) {
                json['image'] = api.getActualImages(
                    '/uploads/profile/',
                    custProfileData.image
                );
            } else {
                json['image'] = api.getBaseImages();
            }
        }

        json['items'] = [];
        if (more === true) {
            var items = await BookingItem.find({
                booking_id: req.id,
            }).limit(1);
            if (items && items.length > 0) {
                if (items[0].package_id && items[0].package_id.length > 0) {
                    let orderItems = await Cart.generateBookingItemPacket(
                        items[0].package_id
                    );
                    for (let x in orderItems) {
                        var tempCategory = await Category.find({
                            id: orderItems[x].category_id,
                        }).limit(1);
                        var tempService = await Service.find({
                            id: orderItems[x].service_id,
                        }).limit(1);
                        var tempProviderService = await ProviderService.find({
                            id: orderItems[x].id,
                        }).limit(1);
                        orderItems[x].name =
                            tempProviderService[0].name !== null
                                ? tempProviderService[0].name
                                : tempService[0].name;
                        orderItems[x].category = await Category.getJson(
                            tempCategory[0]
                        );
                        orderItems[x].service = await Service.getJson(
                            tempService[0]
                        );
                        orderItems[x].price = orderItems[x].price;
                    }
                    json['items'] = orderItems;
                }
            }
        }
        var subTotal = 0;
        if (json['items'].length > 0) {
            let packet = await Cart.generatePrices(json['items']);
            items = packet.items;
            subTotal = packet.totalPrice;
        }
        var delivery = 0;
        if (
            req.delivery_type === sails.config.constants.DELIVERY_TYPE_DELIVERY
        ) {
            delivery = await Cart.getDeliveryAmount(subTotal);
        }
        var promoDiscount = 0;
        console.log({ promoDiscount });
        if (req.promo_code !== '' && json['items'].length > 0) {
            promoDiscount = await Cart.getPromoAmount(
                req.id,
                subTotal,
                req.promo_code,
                req.created_by,
                true,
                true
            );
            promoDiscount = promoDiscount.amount;
            console.log({ promoDiscount });
        }
        var finalAmount =
            Number(subTotal) + Number(delivery) - Number(promoDiscount);
        json['costing'] = {
            subTotal: subTotal,
            delivery: delivery,
            promoDiscount: promoDiscount,
            totalPrice: finalAmount,
        };

        json['total_amount'] = finalAmount;

        json['start_time'] = api.checkAttribute(req.start_time);
        json['end_time'] = api.checkAttribute(req.end_time);

        json['provider_approved'] = req.provider_approved;
        json['customer_approved'] = req.customer_approved;

        json['provider_reviewed'] = req.provider_reviewed;
        json['customer_reviewed'] = req.customer_reviewed;

        json['created_at'] = api.checkAttribute(req.created_at);
        json['updated_at'] = api.checkAttribute(req.updated_at);
        json['promo_code'] = api.checkAttribute(req.promo_code);
        if (json['promo_code'] && json['promo_code'] !== '') {
            var promocode = await PromoCodes.find({
                id: json['promo_code'],
            }).limit(1);
            console.log({ promocode });
            if (promocode && promocode.length > 0) {
                json['promo_code'] = await PromoCodes.getSmallJson(
                    promocode[0]
                );
            }
        }
        json['delivery_assigned'] = api.checkAttribute(req.delivery_assigned);
        json['assigned_to'] = api.checkAttribute(req.assigned_to);
        json['delivery_type'] = api.checkAttribute(req.delivery_type);
        json['delivery_details'] = {};
        if (Object.keys(req.delivery_details).length !== 0) {
            json['delivery_details'] = req.delivery_details;
        }

        json['rating'] = '';
        let rating = await Rating.find({
            booking_id: req.id,
        }).limit(1);
        if (rating && rating.length > 0) {
            json['rating'] = {
                r1: rating[0].r1.toFixed(2),
                r2: rating[0].r2.toFixed(2),
                r3: rating[0].r3.toFixed(2),
                ar: rating[0].ar.toFixed(2),
                review: rating[0].review,
            };
        }
        console.log({ json });
        return json;
    },

    getSmallJson: async function (req, pageStatus) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['token'] = api.checkAttribute(req.token);
        var providerName = await User.getName(req.provider_id);
        if (providerName) {
            json['provider'] = providerName;
        } else {
            json['provider'] = '';
        }
        json['isCancellable'] = false;
        var checkingTime =
            moment().valueOf() - sails.config.dynamics.CANCELLATION_MINUTES;
        if (req.created_at < checkingTime) {
            json['isCancellable'] = true;
        }
        json['payment_type'] = req.payment_type;
        var bookingType = await this.getBookingType(req.status);
        json['status'] = bookingType;
        json['reject_reason'] = req.reject_reason;
        json['datetime'] = req.datetime;
        json['payment_status'] = api.checkAttribute(req.payment_status);
        json['bookingImage'] = api.getBaseImages();
        var provider = await ProviderProfile.find({
            created_by: req.provider_id,
        });
        if (provider.length > 0) {
            if (typeof provider[0].logo !== 'undefined') {
                json['bookingImage'] = api.getActualImages(
                    '/uploads/profile/',
                    provider[0].logo
                );
            }
        }
        json['customerName'] = await User.getName(req.created_by);
        let totalAmount = req.total_amount;
        json['delivery'] = 0;
        if (
            req.delivery_type === sails.config.constants.DELIVERY_TYPE_DELIVERY
        ) {
            json['delivery'] = sails.config.dynamics.DELIVERY_COST;
        }
        json['total_amount'] = totalAmount;
        json['promo_code'] = api.checkAttribute(req.promo_code);
        if (json['promo_code'] && json['promo_code'] !== '') {
            var promocode = await PromoCodes.find({
                id: json['promo_code'],
            }).limit(1);
            if (promocode && promocode.length > 0) {
                json['promo_code'] = await PromoCodes.getSmallJson(
                    promocode[0]
                );
            }
        }
        json['statusId'] = pageStatus;
        json['created_at'] = api.checkAttribute(req.created_at);
        json['updated_at'] = api.checkAttribute(req.updated_at);
        json['deleted_at'] = req.deleted_at;
        json['deleted_by'] = req.deleted_by;
        json['delivery_type'] = api.checkAttribute(req.delivery_type);
        return json;
    },

    getJsonForProvider: async function (req, pageStatus, more = false) {
        var json = {};
        var itemModel = [];
        json['key'] = api.checkAttribute(req.id);
        json['token'] = api.checkAttribute(req.token);
        var providerName = await User.getName(req.provider_id);
        if (providerName) {
            json['provider'] = providerName;
        } else {
            json['provider'] = '';
        }
        json['isCancellable'] = false;
        var checkingTime =
            moment().valueOf() - sails.config.dynamics.CANCELLATION_MINUTES;
        if (req.created_at < checkingTime) {
            json['isCancellable'] = true;
        }
        json['payment_type'] = req.payment_type;
        var bookingType = await this.getBookingType(req.status);
        json['status'] = bookingType;
        json['reject_reason'] = req.reject_reason;
        json['showFooter'] = req.status;
        json['note'] = api.checkAttribute(req.note);
        json['datetime'] = req.datetime;
        var address = await UserAddress.getAddress(
            api.checkAttribute(req.customer_address_id)
        );
        json['payment_status'] = api.checkAttribute(req.payment_status);
        json['customerAddress'] = address;
        var addressPro = await UserAddress.getAddress(
            api.checkAttribute(req.provider_address_id)
        );
        json['providerAddress'] = addressPro;
        json['bookingImage'] = api.getBaseImages();
        var provider = await ProviderProfile.find({
            created_by: req.provider_id,
        });
        if (provider.length > 0) {
            if (typeof provider[0].logo !== 'undefined') {
                json['bookingImage'] = api.getActualImages(
                    '/uploads/profile/',
                    provider[0].logo
                );
            }
        }
        json['customerName'] = await User.getName(req.created_by);
        if (more === true) {
            var items = await BookingItem.find({
                booking_id: req.id,
            });
            if (typeof items !== 'undefined') {
                for (const item of items) {
                    itemModel.push(await BookingItem.getJson(item));
                }
                json['services'] = itemModel;
            }
        }
        json['delivery_time'] = 0;
        var totalTime = api.checkAttribute(req.delivery_time);
        if (totalTime === '') {
            if (req.start_time && req.last_start_time) {
                const endTime = moment.utc().valueOf();
                json['delivery_time'] =
                    (parseInt(endTime) - parseInt(req.start_time)) / 1000;
            }
        } else {
            var goneTime = 0;
            if (
                req.status === sails.config.constants.BOOKING_STATUS_STARTED &&
                req.last_start_time
            ) {
                const endTime = moment.utc().valueOf();
                goneTime = parseInt(endTime) - parseInt(req.last_start_time);
            }
            json['delivery_time'] =
                (parseInt(totalTime) + parseInt(goneTime)) / 1000;
        }
        json['start_time'] = api.checkAttribute(req.start_time);
        json['end_time'] = api.checkAttribute(req.endTime);
        json['last_start_time'] = api.checkAttribute(req.last_start_time);
        const item = await BookingItem.count({
            booking_id: req.id,
            package_id: null,
        });
        json['item_type'] = sails.config.constants.BOOKING_ITEMTYPE_PACKAGE;
        if (item > 0) {
            json['item_type'] =
                sails.config.constants.BOOKING_ITEMTYPE_PER_HOUR;
        }
        json['total_amount'] = await this.getTotalAmount(
            req,
            json['delivery_time']
        );
        json['statusId'] = req.status;
        json['provider_approved'] = req.provider_approved;
        json['customer_approved'] = req.customer_approved;
        json['provider_reviewed'] = req.provider_reviewed;
        json['customer_reviewed'] = req.customer_reviewed;
        json['created_at'] = api.checkAttribute(req.created_at);
        json['updated_at'] = api.checkAttribute(req.updated_at);
        json['promo_code'] = api.checkAttribute(req.promo_code);
        if (json['promo_code'] && json['promo_code'] !== '') {
            var promocode = await PromoCodes.find({
                id: json['promo_code'],
            }).limit(1);
            if (promocode && promocode.length > 0) {
                json['promo_code'] = await PromoCodes.getSmallJson(
                    promocode[0]
                );
            }
        }
        json['deleted_at'] = req.deleted_at;
        json['deleted_by'] = req.deleted_by;
        json['delivery_assigned'] = api.checkAttribute(req.delivery_assigned);
        json['delivery_type'] = api.checkAttribute(req.delivery_type);
        json['assigned_to'] = api.checkAttribute(req.assigned_to);
        json['delivery_details'] = {};
        if (Object.keys(req.delivery_details).length !== 0) {
            json['delivery_details'] = req.delivery_details;
        }
        json['rating'] = '';
        let rating = await Rating.find({
            booking_id: req.id,
        }).limit(1);
        if (rating && rating.length > 0) {
            json['rating'] = {
                r1: rating[0].r1,
                r2: rating[0].r2,
                r3: rating[0].r3,
                ar: rating[0].ar,
                review: rating[0].review,
            };
        }

        return json;
    },

    getTransactionJson: async function (req) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['token'] = api.checkAttribute(req.token);
        json['provider'] = '';
        var provider = await ProviderProfile.find({
            created_by: req.provider_id,
        });
        if (provider && provider.length > 0) {
            json['provider'] = provider[0].business_name;
        }
        json['status'] = req.status;
        json['payment_status'] = req.payment_status;
        json['payment_type'] = req.payment_type;
        json['datetime'] = req.datetime;

        return json;
    },

    getPaymentType: function (id) {
        var values = {
            [sails.config.constants.BOOKING_TYPE_CASH]: sails.__('Pay by Cash'),
            [sails.config.constants.BOOKING_TYPE_CARD]: sails.__('Card'),
            [sails.config.constants.BOOKING_TYPE_WALLET]: sails.__('Wallet'),
        };
        if (id) {
            return values[id];
        } else {
            return values;
        }
    },

    getBookingType: function (id) {
        var values = {
            [sails.config.constants.BOOKING_STATUS_INCART]: sails.__('Incart'),
            [sails.config.constants.BOOKING_STATUS_INITIATED]: sails.__(
                'Initiated'
            ),
            [sails.config.constants.BOOKING_STATUS_CANCELLED]: sails.__(
                'Cancelled'
            ),
            [sails.config.constants
                .BOOKING_STATUS_CANCELLED_PROVIDER]: sails.__('Cancelled'),
            [sails.config.constants.BOOKING_STATUS_REJECTED]: sails.__(
                'Rejected'
            ),
            [sails.config.constants.BOOKING_STATUS_CONFIRMED]: sails.__(
                'Confirmed'
            ),
            [sails.config.constants.BOOKING_STATUS_STARTED]: sails.__(
                'Preparing'
            ),
            [sails.config.constants.BOOKING_STATUS_PAUSED]: sails.__('Paused'),
            [sails.config.constants.BOOKING_STATUS_ENDED]: sails.__('Ready'),
            [sails.config.constants.BOOKING_STATUS_COMPLETED]: sails.__(
                'Delivered'
            ),
        };
        if (id) {
            return values[id];
        } else {
            return values;
        }
    },

    getTotalAmount: async function (booking, totalTime = 0) {
        var amount = 0;
        var discount = 0;
        var isPackage = false;
        if (typeof booking.id !== 'undefined') {
            var bookingItems = await BookingItem.find({
                booking_id: booking.id,
            }).limit(1);
            if (bookingItems && bookingItems.length > 0) {
                for (var x in bookingItems) {
                    if (
                        typeof bookingItems[x].package_id !== 'undefined' &&
                        bookingItems[x].package_id &&
                        bookingItems[x].package_id !== ''
                    ) {
                        amount =
                            Number(bookingItems[x].present_charge) +
                            Number(amount);
                        isPackage = true;
                    } else {
                        var checkamount = bookingItems[x].present_charge;
                        amount = await BookingItem.getPresentCharges(
                            totalTime,
                            checkamount
                        );
                    }
                }
            }

            if (booking && isPackage === true) {
                if (
                    typeof booking.promo_code !== 'undefined' &&
                    booking.promo_code &&
                    booking.promo_code !== ''
                ) {
                    var promo = await PromoCodes.find({
                        id: booking.promo_code,
                    }).limit(1);
                    if (promo && promo.length > 0) {
                        discount = (promo[0].percent_amount * amount) / 100;
                        if (Number(discount) > Number(promo[0].upto_amount)) {
                            discount = Number(promo[0].upto_amount);
                        }
                    }
                }
            }
            amount = Number(amount) - Number(discount);
            return amount;
        }
        return null;
    },

    checkPaymentMethods: async function (method) {
        var checkArray = [];
        if (sails.config.dynamics.WALLET_ACTIVE) {
            checkArray.push(sails.config.constants.BOOKING_TYPE_WALLET);
        }
        if (sails.config.dynamics.CARD_ACTIVE) {
            checkArray.push(sails.config.constants.BOOKING_TYPE_CARD);
        }
        if (sails.config.dynamics.COD_ACTIVE) {
            checkArray.push(sails.config.constants.BOOKING_TYPE_CASH);
        }
        if (checkArray.indexOf(method) !== -1) {
            return true;
        }
        return false;
    },

    getListJson: async function (req) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['bookingImage'] = api.getBaseImages();
        var provider = await ProviderProfile.find({
            created_by: req.provider_id,
        });
        if (provider.length > 0) {
            if (typeof provider[0].logo !== 'undefined') {
                json['bookingImage'] = api.getActualImages(
                    '/uploads/profile/',
                    provider[0].logo
                );
            }
        }
        json['items'] = [];
        var items = await BookingItem.find({
            booking_id: req.id,
        }).limit(1);
        if (items && items.length > 0) {
            if (items[0].package_id && items[0].package_id.length > 0) {
                json['items'] = await Cart.generateBookingItemPacket(
                    items[0].package_id
                );
            }
        }
        json['provider'] = '';
        var providerName = await User.getName(req.provider_id);
        if (providerName) {
            json['provider'] = providerName;
        }
        json['customerAddress'] = await UserAddress.getAddress(
            api.checkAttribute(req.customer_address_id)
        );
        json['statusId'] = req.status;
        json['payment_status'] = req.payment_status;
        json['datetime'] = req.datetime;
        var bookingType = await this.getBookingType(req.status);
        json['status'] = bookingType;
        json['token'] = api.checkAttribute(req.token);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['updated_at'] = api.checkAttribute(req.updated_at);
        json['delivery_type'] = api.checkAttribute(req.delivery_type);
        json['assigned_to'] = api.checkAttribute(req.assigned_to);
        json['delivery_details'] = {};
        if (Object.keys(req.delivery_details).length !== 0) {
            json['delivery_details'] = req.delivery_details;
        }
        json['is_provider_accepted'] =
            req.status === sails.config.constants.BOOKING_STATUS_CONFIRMED
                ? 1
                : 0;
        return json;
    },

    getSmallDeliveryPacket: async function (req) {
        var json = {};
        json['token'] = req.token;
        json['job_status'] = Api.getDeliveryJobStatus(req.status);
        let bookingDateTime = new Date(req.created_at);
        json['updated_at'] = api.checkAttribute(req.updated_at);
        json['booking_datetime'] = bookingDateTime.toISOString();
        json['payment_status'] =
            api.checkAttribute(req.payment_status) === 1
                ? 'COD'
                : 'Already Paid';
        json['customer_request'] = req.note;
        json['delivery_start'] = 0;
        json['is_provider_accepted'] =
            req.status === sails.config.constants.BOOKING_STATUS_CONFIRMED
                ? 1
                : 0;
        return json;
    },

    getDeliveryPacket: async function (req) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['token'] = api.checkAttribute(req.token);
        json['deliveryAddress'] = {};
        let customer = await User.find({
            id: req.created_by,
        }).limit(1);
        if (customer && customer.length > 0) {
            json['deliveryAddress'] = await UserAddress.getDeliveryAddress(
                api.checkAttribute(req.customer_address_id)
            );
        }

        json['pickupAddress'] = {};
        let provider = await User.find({
            id: req.provider_id,
        }).limit(1);
        if (provider && provider.length > 0) {
            json['pickupAddress'] = await UserAddress.getDeliveryAddress(
                api.checkAttribute(req.provider_address_id)
            );
        }
        json['is_provider_accepted'] = 1;
        json['is_delivery_accepted'] = req.delivery_assigned === '' ? 0 : 1;

        return json;
    },

    getCompleteDeliveryPacket: async function (req) {
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['token'] = api.checkAttribute(req.token);
        json['note'] = api.checkAttribute(req.note);
        json['deliveryAddress'] = {};
        let customer = await User.find({
            id: req.created_by,
        }).limit(1);
        if (customer && customer.length > 0) {
            json['deliveryAddress'] = await UserAddress.getDeliveryAddress(
                api.checkAttribute(req.customer_address_id)
            );
        }
        json['customerAddress'] = json['deliveryAddress'];

        json['pickupAddress'] = {};
        let provider = await User.find({
            id: req.provider_id,
        }).limit(1);
        if (provider && provider.length > 0) {
            json['pickupAddress'] = await UserAddress.getDeliveryAddress(
                api.checkAttribute(req.provider_address_id)
            );
        }
        json['providerAddress'] = json['pickupAddress'];

        json['is_provider_accepted'] =
            req.status === sails.config.constants.BOOKING_STATUS_CONFIRMED
                ? 1
                : 0;

        json['is_delivery_accepted'] = req.delivery_assigned === '' ? 0 : 1;
        json['from_time'] = '00:00';
        json['to_time'] = '00:00';
        json['promocode'] = '';
        if (req.promo_code && req.promo_code !== '') {
            var promocode = await PromoCodes.find({
                id: req.promo_code,
            }).limit(1);
            if (promocode && promocode.length > 0) {
                json['promocode'] = promocode.code;
            }
        }
        let bookingDateTime = new Date(req.created_at);
        json['updated_at'] = api.checkAttribute(req.updated_at);
        json['booking_datetime'] = bookingDateTime.toISOString();
        json['service'] = [];
        json['payment_status'] = 'COD';
        json['payment_method_id'] = 0;
        json['job_status'] = Api.getDeliveryJobStatus(req.status);
        json['service_data'] = [];
        let items = await BookingItem.find({
            booking_id: req.id,
        }).limit(1);
        if (items && items.length > 0) {
            let orderItems = [];
            if (items[0].package_id && items[0].package_id.length > 0) {
                for (let x in items[0].package_id) {
                    let toppingsData = [];
                    if (items[0].package_id) {
                        let tempService = await Service.find({
                            id: items[0].package_id[x].service_id,
                        }).limit(1);
                        let tempProviderService = await ProviderService.find({
                            id: items[0].package_id[x].id,
                        }).limit(1);
                        for (let y in items[0].package_id[x].addOns) {
                            let addOn = await ProviderServiceAddon.find({
                                id: items[0].package_id[x].addOns[y].id,
                            }).limit(1);
                            if (addOn && addOn.length > 0) {
                                toppingsData.push({
                                    name: addOn[0].name,
                                    price: addOn[0].price,
                                });
                            }
                        }
                        orderItems.push({
                            name:
                                tempProviderService[0].name !== null
                                    ? tempProviderService[0].name
                                    : tempService[0].name,
                            quantity: items[0].package_id[x].quantity,
                            price: items[0].package_id[x].price,
                            topingsData: toppingsData,
                        });
                    }
                }
                json['serviceData'] = orderItems;
            }
        }

        let itemsPacket = [];
        let menuItems = await BookingItem.find({
            booking_id: req.id,
        }).limit(1);
        if (menuItems && menuItems.length > 0) {
            if (menuItems[0].package_id && menuItems[0].package_id.length > 0) {
                let orderItems = await Cart.generateBookingItemPacket(
                    menuItems[0].package_id
                );
                for (let x in orderItems) {
                    let tempCategory = await Category.find({
                        id: orderItems[x].category_id,
                    }).limit(1);
                    let menuTempService = await Service.find({
                        id: orderItems[x].service_id,
                    }).limit(1);
                    let menuTempProviderService = await ProviderService.find({
                        id: orderItems[x].id,
                    }).limit(1);
                    orderItems[x].name =
                        menuTempProviderService[0].name !== null
                            ? menuTempProviderService[0].name
                            : menuTempService[0].name;
                    orderItems[x].category = await Category.getJson(
                        tempCategory[0]
                    );
                    orderItems[x].service = await Service.getJson(
                        menuTempService[0]
                    );
                    orderItems[x].price = orderItems[x].price;
                }
                itemsPacket = orderItems;
            }
        }
        var subTotal = 0;
        if (itemsPacket.length > 0) {
            let packet = await Cart.generatePrices(itemsPacket);
            items = packet.items;
            subTotal = packet.totalPrice;
        }
        var delivery = 0;
        if (
            req.delivery_type === sails.config.constants.DELIVERY_TYPE_DELIVERY
        ) {
            delivery = await Cart.getDeliveryAmount(subTotal);
        }
        var promoDiscount = 0;
        if (req.promo_code !== '' && itemsPacket.length > 0) {
            promoDiscount = await Cart.getPromoAmount(
                req.id,
                subTotal,
                req.promo_code,
                req.created_by,
                true,
                true
            );
            promoDiscount = promoDiscount.amount;
        }
        json['totalAmount'] = req.total_amount;
        json['paidAmount'] = req.total_amount;
        json['discount'] = Number(promoDiscount);
        json['additional_charges'] = Number(delivery);
        json['d_amount'] = 0;
        json['p_amount'] = 0;
        json['serviceAmount'] = 0;

        return json;
    },

    updateDueAmount: async function (bookingJson) {
        let totalAmount = bookingJson.total_amount;
        let finalAmount = 0;
        let adminCut = sails.config.dynamics.DEFAULT_ADMIN_CUT;
        let profile = await ProviderProfile.find({
            created_by: bookingJson.provider_id,
        }).limit(1);
        if (profile && profile.length > 0) {
            if (profile[0].admin_cut !== '' && profile[0].admin_cut !== null) {
                if (!isNaN(profile[0].admin_cut)) {
                    adminCut = profile[0].admin_cut;
                }
            }
            let adminAmount = (Number(totalAmount) * Number(adminCut)) / 100;
            if (
                bookingJson.payment_type ===
                sails.config.constants.BOOKING_TYPE_CASH
            ) {
                if (typeof profile[0].due_amount !== 'undefined') {
                    finalAmount =
                        Number(profile[0].due_amount) - Number(adminAmount);
                } else {
                    finalAmount = -Number(adminAmount);
                }
            } else {
                if (typeof profile[0].due_amount !== 'undefined') {
                    finalAmount =
                        Number(profile[0].due_amount) +
                        Number(totalAmount) -
                        Number(adminAmount);
                } else {
                    finalAmount = Number(totalAmount) - Number(adminAmount);
                }
            }
            await ProviderProfile.update({
                created_by: bookingJson.provider_id,
            }).set({
                due_amount: finalAmount,
            });
        }
        return true;
    },

    getProviderEarning: async function (req) {
        let json = {};
        let finalAmount = 0;
        let adminAmount = 0;
        let adminCommission = 0;
        let adminCut = sails.config.dynamics.DEFAULT_ADMIN_CUT;
        var bookingAmount = 0;
        const bookings = await Booking.find({
            provider_id: req,
            status: sails.config.constants.BOOKING_STATUS_COMPLETED,
        });
        if (bookings && bookings.length > 0) {
            for (const booking of bookings) {
                let totalAmount = booking.total_amount;
                let profile = await ProviderProfile.find({
                    created_by: req,
                }).limit(1);
                if (profile && profile.length > 0) {
                    if (
                        profile[0].admin_cut !== '' &&
                        profile[0].admin_cut !== null
                    ) {
                        if (!isNaN(profile[0].admin_cut)) {
                            adminCut = profile[0].admin_cut;
                        }
                    }
                    adminAmount =
                        (Number(totalAmount) * Number(adminCut)) / 100;
                    finalAmount = Number(totalAmount) - Number(adminAmount);
                }
                adminCommission = adminCommission + adminAmount;
                bookingAmount = bookingAmount + finalAmount;
            }
        }
        json['provider_earning_amount'] = bookingAmount;
        json['admin_earning_amount'] = adminCommission;
        return json;
    },
};
