/**
 * RatingLog.js
 */
const api = require('./Api.js');
const moment = require('moment');

module.exports = {
    attributes: {
        r1: {
            type: 'number',
            defaultsTo: 0
        },
        r1_count: {
            type: 'number',
            defaultsTo: 0
        },
        r2: {
            type: 'number',
            defaultsTo: 0
        },
        r2_count: {
            type: 'number',
            defaultsTo: 0
        },
        r3: {
            type: 'number',
            defaultsTo: 0
        },
        r3_count: {
            type: 'number',
            defaultsTo: 0
        },
        ar: {
            type: 'number',
            defaultsTo: 0
        },
        ar_count: {
            type: 'number',
            defaultsTo: 0
        },
        review_count: {
            type: 'number',
            defaultsTo: 0
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
            type: 'number',
            allowNull: true
        },
        created_by: {
            required: true,
            type: 'string'
        }
    },

    schema: true,

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    intialCreate: async function(id) {
        var exist = await RatingLog.find({
            created_by: id
        }).limit(1);
        if (exist && exist.length > 0) {
        } else {
            await RatingLog.create({
                r1: 0,
                r1_count: 0,
                r2: 0,
                r2_count: 0,
                r3: 0,
                r3_count: 0,
                ar: 0,
                ar_count: 0,
                created_by: id
            });
        }
    },

    getJson: async function(limit = 10, req) {
        var reviews = [];
        var json = {};
        if (req) {
            json['r1'] = req.r1.toFixed(2);
            json['r1_count'] = api.checkAttribute(req.r1_count);
            json['r2'] = req.r2.toFixed(2);
            json['r2_count'] = api.checkAttribute(req.r2_count);
            json['r3'] = req.r3.toFixed(2);
            json['r3_count'] = api.checkAttribute(req.r3_count);
            json['ar'] = req.ar.toFixed(2);
            json['ar_count'] = api.checkAttribute(req.ar_count);
            json['status'] = api.checkAttribute(req.status);
            json['type_id'] = api.checkAttribute(req.type_id);
            json['created_at'] = api.checkAttribute(req.created_at);
            json['created_by'] = api.checkAttribute(req.created_by);
            json['review_count'] = req.review_count;

            var subRatings = await Rating.find({
                to_id: req.created_by,
                has_reviewed: sails.config.constants.HAS_REVIEWED_TRUE
            })
                .sort('created_at DESC')
                .limit(limit);

            if (subRatings.length > 0) {
                for (var val in subRatings) {
                    reviews.push(await Rating.getJson(subRatings[val]));
                }
            }
            json['subRatings'] = reviews;
        } else {
            json['r1'] = 0;
            json['r1_count'] = 0;
            json['r2'] = 0;
            json['r2_count'] = 0;
            json['r3'] = 0;
            json['r3_count'] = 0;
            json['ar'] = 0;
            json['ar_count'] = 0;
            json['status'] = 1;
            json['type_id'] = 1;
            json['subRatings'] = [];
            json['created_at'] = 0;
            json['created_by'] = 0;
            json['review_count'] = 0;
        }
        return json;
    }
};
