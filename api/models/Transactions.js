/**
 * Transactions.js
 */

const api = require('./Api.js');
const moment = require('moment');

module.exports = {
    attributes: {
        reference_id: {
            type: 'string',
            required: true
        },
        reference_type: {
            type: 'number',
            defaultsTo: 1
        },
        payment_medium: {
            type: 'number',
            defaultsTo: 0
        },
        payment_medium_id: {
            type: 'string',
            allowNull: true
        },
        amount: {
            type: 'number',
            defaultsTo: 0
        },
        ipAddress: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        split_details: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        transaction_id: {
            type: 'string',
            allowNull: true
        },
        type_id: {
            type: 'number',
            defaultsTo: 1
        },
        status: {
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
        from_id: {
            required: true,
            type: 'string'
        },
        from_role: {
            required: true,
            type: 'number'
        },
        to_id: {
            required: true,
            type: 'string'
        },
        to_role: {
            required: true,
            type: 'number'
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getRoleBasedProfile: async function(id, role) {
        let name = '';
        if (role === sails.config.constants.ROLE_ADMIN) {
            name = 'Admin';
        } else if (role === sails.config.constants.ROLE_PROVIDER) {
            const providerProfile = await ProviderProfile.find({
                created_by: id
            }).limit(1);
            if (providerProfile && providerProfile.length > 0) {
                name = providerProfile[0].business_name;
            }
        } else {
            const user = await User.find({
                id: id
            }).limit(1);
            if (user && user.length > 0) {
                name = user[0].name;
            }
        }
        return name;
    },

    getJson: async function(req) {
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['reference_id'] = api.checkAttribute(req.reference_id);
        json['reference_type'] = api.checkAttribute(req.reference_type);
        json['payment_medium'] = api.checkAttribute(req.payment_medium);
        json['payment_medium_id'] = api.checkAttribute(req.payment_medium_id);
        json['amount'] = api.checkAttribute(req.amount);
        json['split_details'] = api.checkAttribute(req.split_details);
        json['transaction_id'] = api.checkAttribute(req.transaction_id);
        json['type'] = api.checkAttribute(req.type);
        json['status'] = api.checkAttribute(req.status);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['updated_at'] = api.checkAttribute(req.updated_at);
        json['from_id'] = api.checkAttribute(req.from_id);
        json['from_role'] = api.checkAttribute(req.from_role);
        json['to_id'] = api.checkAttribute(req.to_id);
        json['to_role'] = api.checkAttribute(req.to_role);
        json['ipAddress'] =
            req.ipAddress && req.ipAddress.length > 0 ? req.ipAddress : [];

        if (
            req.reference_type ===
                sails.config.constants.TRANSACTION_REFERENCE_TYPE_BOOKING &&
            req.reference_id.length > 0
        ) {
            var booking = await Booking.find({
                id: req.reference_id
            }).limit(1);
            if (booking && booking.length > 0) {
                json['token'] = booking[0].token;
            }
            json['to_name'] = await this.getRoleBasedProfile(
                req.to_id,
                req.to_role
            );
            json['from_name'] = await this.getRoleBasedProfile(
                req.from_id,
                req.from_role
            );
        }

        return json;
    },

    splitCuts: async function(totalAmount, profile, employeeId = null) {
        let splits = [];

        let admin = await User.find({
            role: sails.config.constants.ROLE_ADMIN
        }).limit(1);

        providerId = profile.created_by;

        adminCutPerc = profile.admin_cut;
        providerCutPerc = 100 - adminCutPerc;
        employeeCutPerc = profile.employee_cut;

        employeeCutPerc = (employeeCutPerc * providerCutPerc) / 100;
        providerCutPerc = 100 - (profile.admin_cut + employeeCutPerc);

        let adminCut = (totalAmount * adminCutPerc) / 100;
        if (adminCut > 0) {
            splits.push({
                id: admin[0].id,
                user: 'Admin',
                amount: adminCut.toFixed(2)
            });
        }

        let providerCut = (totalAmount * providerCutPerc) / 100;
        if (providerCut > 0) {
            splits.push({
                id: providerId,
                user: 'Provider',
                amount: providerCut.toFixed(2)
            });
        }
        if (employeeId) {
            let employeeCut = (totalAmount * employeeCutPerc) / 100;
            if (employeeCut > 0) {
                splits.push({
                    id: employeeId,
                    user: 'Employee',
                    amount: employeeCut.toFixed(2)
                });
            }
        }

        return splits;
    }
};
