/**
 * PromoCodes.js
 */
const path = require('path');
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        code: {
            type: 'string',
            required: true
        },
        percent_amount: {
            type: 'number',
            required: true
        },
        heading: {
            type: 'string',
            required: true
        },
        description: {
            type: 'string',
            required: true
        },
        image: {
            type: 'string',
            allowNull: true
        },
        advertise: {
            type: 'boolean',
            defaultsTo: false
        },
        advertise_on: {
            type: 'number',
            defaultsTo: 0
        },
        booking_count: {
            type: 'number',
            defaultsTo: 1
        },
        times_type: {
            type: 'number',
            defaultsTo: 1
        },
        upto_amount: {
            type: 'string',
            required: true
        },
        start_date: {
            type: 'number',
            required: true
        },
        end_date: {
            type: 'number',
            required: true
        },
        offer_type: {
            type: 'number',
            defaultsTo: 1
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
        deleted_at: {
            type: 'number',
            allowNull: true
        },
        deleted_by: {
            type: 'string',
            allowNull: true
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['code'] = api.checkAttribute(req.code);
        json['description'] = api.checkAttribute(req.description);
        if (req.image && req.image != '') {
            json['image'] = Api.getActualImages('/uploads/promos/', req.image);
        } else {
            json['image'] = Api.getBaseImages();
        }
        json['heading'] = api.checkAttribute(req.heading);
        json['percent_amount'] = api.checkAttribute(req.percent_amount);
        json['advertise'] = api.checkAttribute(req.advertise);
        json['booking_count'] = api.checkAttribute(req.booking_count);
        json['times_type'] = api.checkAttribute(req.times_type);
        json['start_date'] = api.checkAttribute(req.start_date);
        json['end_date'] = api.checkAttribute(req.end_date);
        json['upto_amount'] = api.checkAttribute(req.upto_amount);
        json['offer_type'] = api.checkAttribute(req.offer_type);
        json['status'] = api.checkAttribute(req.status);
        json['type_id'] = api.checkAttribute(req.type_id);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['advertise_on'] = api.checkAttribute(req.advertise_on);
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);

        return json;
    },

    getSmallJson: async function(req) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['code'] = api.checkAttribute(req.code);
        json['heading'] = api.checkAttribute(req.heading);
        json['description'] = api.checkAttribute(req.description);
        if (req.image && req.image != '') {
            json['image'] = Api.getActualImages('/uploads/promos/', req.image);
        } else {
            json['image'] = Api.getBaseImages();
        }
        json['start_date'] = api.checkAttribute(req.start_date);
        json['percent_amount'] = api.checkAttribute(req.percent_amount);
        json['upto_amount'] = api.checkAttribute(req.upto_amount);
        json['end_date'] = api.checkAttribute(req.end_date);
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);

        return json;
    },

    checkEligibility: async function(customer, promoCode, already = false) {
        var resp = {
            status: 'NOK',
            message: sails.__('Not applicable')
        };
        var count = 0;
        var bookingCount = await Booking.count({
            created_by: customer.id
        });
        if (promoCode.times_type == sails.config.constants.PROMO_TYPE_SINGLE) {
            count = await Booking.count({
                promo_code: promoCode.id
            });
        } else {
            count = await Booking.count({
                promo_code: promoCode.id,
                created_by: customer.id
            });
        }
        if (already) {
            count = Number(count) - 1;
        }
        const timeRightNow = moment().valueOf();
        if (Number(promoCode.start_date) <= Number(timeRightNow)) {
            if (Number(promoCode.end_date) >= Number(timeRightNow)) {
                if (
                    promoCode.times_type ==
                    sails.config.constants.PROMO_TYPE_SINGLE
                ) {
                    if (
                        promoCode.offer_type ==
                        sails.config.constants.PROMO_OFFERTYPE_APP
                    ) {
                        if (bookingCount < Number(promoCode.booking_count)) {
                            resp.status = 'OK';
                        } else {
                            resp.message = sails.__(
                                sails.config.constants.PROMO_NOT_USED_ONTIME
                            );
                        }
                    } else {
                        if (count < 1) {
                            resp.status = 'OK';
                        } else {
                            resp.message = sails.__(
                                sails.config.constants.PROMO_LIMIT_UP
                            );
                        }
                    }
                } else if (
                    promoCode.times_type ==
                    sails.config.constants.PROMO_TYPE_UNLIMITED
                ) {
                    if (
                        promoCode.offer_type ==
                        sails.config.constants.PROMO_OFFERTYPE_APP
                    ) {
                        if (bookingCount < Number(promoCode.booking_count)) {
                            resp.status = 'OK';
                        } else {
                            resp.message = sails.__(
                                sails.config.constants.PROMO_NOT_USED_ONTIME
                            );
                        }
                    } else {
                        if (count < Number(promoCode.booking_count)) {
                            resp.status = 'OK';
                        } else {
                            resp.message = sails.__(
                                sails.config.constants.PROMO_LIMIT_USED_UP
                            );
                        }
                    }
                }
            } else {
                resp.message = sails.__(sails.config.constants.PROMO_EXPIRED);
            }
        } else {
            resp.message = sails.__(sails.config.constants.PROMO_NOT_ACTIVE);
        }
        return resp;
    },

    getBaseImages: function(single = null) {
        if (single != null) {
            var refArray = ['small.jpg', 'medium.jpg', 'large.jpg'];
            return (
                sails.config.constants.BASE_URL +
                '/images/default/' +
                refArray[single - 1]
            );
        }
        return {
            small: sails.config.constants.BASE_URL + '/images/promo.jpg',
            medium: sails.config.constants.BASE_URL + '/images/promo.jpg',
            large: sails.config.constants.BASE_URL + '/images/promo.jpg'
        };
    },

    getAdvertiseJson: async function(req) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['description'] = api.checkAttribute(req.description);
        if (req.image && req.image != '') {
            json['image'] = Api.getActualImages('/uploads/promos/', req.image);
        } else {
            json['image'] = PromoCodes.getBaseImages();
        }
        json['code'] = api.checkAttribute(req.code);
        json['heading'] = api.checkAttribute(req.heading);
        json['percent_amount'] = api.checkAttribute(req.percent_amount);
        json['times_type'] = api.checkAttribute(req.times_type);
        json['start_date'] = api.checkAttribute(req.start_date);
        json['end_date'] = api.checkAttribute(req.end_date);
        json['upto_amount'] = api.checkAttribute(req.upto_amount);
        json['offer_type'] = api.checkAttribute(req.offer_type);
        json['status'] = api.checkAttribute(req.status);
        json['created_at'] = api.checkAttribute(req.created_at);

        return json;
    }
};
