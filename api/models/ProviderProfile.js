/**
 * ProviderProfile.js
 */
const moment = require('moment');

module.exports = {
    attributes: {
        business_name: {
            type: 'string',
            allowNull: true
        },
        established_on: {
            type: 'number',
            allowNull: true
        },
        description: {
            type: 'string',
            allowNull: true
        },
        fb_link: {
            type: 'string',
            allowNull: true
        },
        insta_link: {
            type: 'string',
            allowNull: true
        },
        twitter_link: {
            type: 'string',
            allowNull: true
        },
        youtube_link: {
            type: 'string',
            allowNull: true
        },
        vimeo_link: {
            type: 'string',
            allowNull: true
        },
        logo: {
            type: 'string',
            allowNull: true
        },
        banner: {
            type: 'string',
            allowNull: true
        },
        secondary_phone: {
            type: 'string',
            allowNull: true
        },
        complete_level: {
            type: 'string'
        },
        status: {
            type: 'number',
            defaultsTo: 1
        },
        is_featured: {
            type: 'number',
            defaultsTo: 2
        },
        admin_cut: {
            type: 'number',
            defaultsTo: sails.config.dynamics.DEFAULT_ADMIN_CUT
        },
        employee_cut: {
            type: 'number',
            defaultsTo: sails.config.dynamics.DEFAULT_DELIVERY_CUT
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
        website: {
            type: 'string',
            isURL: true,
            allowNull: true
        },
        is_deleted: {
            type: 'number',
            defaultsTo: 2
        },
        created_by: {
            type: 'string',
            required: true
        },
        inbox_message: {
            type: 'string',
            defaultsTo: sails.__(sails.config.constants.PROVIDER_INBOX_DEFAULT)
        },
        slug: {
            type: 'string'
        },
        due_amount: {
            type: 'number',
            defaultsTo: 0.0
        },
        last_paid_time: {
            type: 'string',
            required: false
        },
        company_code: {
            type: 'string',
            required: true
        },
        bank_name: {
            type: 'string',
            required: false
        },
        account_type: {
            type: 'string',
            required: false
        },
        account_number: {
            type: 'string',
            required: false
        },
        instruction: {
            type: 'string',
            required: false
        }
    },

    schema: true,

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    getProfile: async function(id) {
        var profile = await ProviderProfile.find({
            created_by: id
        });

        if (profile[0]) {
            return profile[0];
        }
    },

    getData: async function(id) {
        const userProfile = await ProviderProfile.find({
            where: { created_by: id }
        });

        if (userProfile.length > 0) {
            return userProfile[0];
        }
        return null;
    },

    getCompanyCode: async function(stringLength = 12) {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ';
        var randomstring = '';
        for (var i = 0; i < stringLength; i++) {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        var count = await ProviderProfile.count({
            company_code: randomstring
        });
        if (count > 0) {
            this.getCompanyCode();
        }
        return randomstring;
    }
};
