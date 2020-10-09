/**
 * Settings.js
 */
const _ = require('lodash');
const moment = require('moment');
const api = require('../models/Api.js');

module.exports = {
    attributes: {
        COMPANY_NAME: {
            type: 'string',
            required: true
        },
        APPLICATION_NAME: {
            type: 'string',
            required: true
        },
        WEBSITE_LOGO: {
            type: 'string',
            required: true
        },
        MAINTAINENCE_MODE: {
            type: 'boolean',
            defaultsTo: false
        },
        SEO_TITLE: {
            type: 'string',
            required: true
        },
        SEO_DESCRIPTION: {
            type: 'string',
            required: true
        },
        SEO_KEYWORDS: {
            type: 'string',
            required: true
        },
        ADMIN_EMAIL: {
            type: 'string',
            required: true
        },
        ADDRESS_LINE1: {
            type: 'string',
            required: true
        },
        ADDRESS_LINE2: {
            type: 'string',
            required: true
        },
        PHONE_NUMBER: {
            type: 'string',
            required: true
        },
        SKYPE: {
            type: 'string',
            allowNull: true
        },
        FACEBOOK: {
            type: 'string',
            allowNull: true
        },
        INSTAGRAM: {
            type: 'string',
            allowNull: true
        },
        PAYMENT_GATEWAY: {
            type: 'string',
            defaultsTo: 'stripe'
        },
        YOUTUBE: {
            type: 'string',
            allowNull: true
        },
        LINKEDIN: {
            type: 'string',
            allowNull: true
        },
        ABOUT_US: {
            type: 'string',
            required: true
        },
        SERVICE_COUNT: {
            type: 'number',
            required: true
        },
        MEDIA_COUNT: {
            type: 'number',
            required: true
        },
        PACKAGE_COUNT: {
            type: 'number',
            required: true
        },
        CARD_LIMIT: {
            type: 'number',
            required: true
        },
        MEDIA_SIZE: {
            type: 'number',
            required: true
        },
        LANGUAGES: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        WALLET_PREFIX: {
            type: 'string',
            required: true
        },
        BOOKING_PREFIX: {
            type: 'string',
            required: true
        },
        ADMIN_COLOR_SCHEME: {
            type: 'string',
            required: true
        },
        DEFAULT_ADMIN_CUT: {
            type: 'number',
            defaultsTo: 5
        },
        GOOGLE_MAP_KEY: {
            type: 'string',
            required: true
        },
        WALLET_ACTIVE: {
            type: 'boolean',
            defaultsTo: true
        },
        CARD_ACTIVE: {
            type: 'boolean',
            defaultsTo: true
        },
        COD_ACTIVE: {
            type: 'boolean',
            defaultsTo: true
        },
        AWS_BUCKET_ACTIVE: {
            type: 'boolean',
            defaultsTo: false
        },
        AWS_BUCKET_URL: {
            type: 'string',
            required: true
        },
        AWS_BUCKET_KEY: {
            type: 'string',
            required: true
        },
        AWS_BUCKET_SECRET: {
            type: 'string',
            required: true
        },
        AWS_BUCKET_NAME: {
            type: 'string',
            required: true
        },
        IMAGE_QUALITY: {
            type: 'number',
            required: true
        },
        THUMB_IMAGE_WIDTH: {
            type: 'number',
            required: true
        },
        THUMB_IMAGE_HEIGHT: {
            type: 'number',
            required: true
        },
        MEDIUM_IMAGE_WIDTH: {
            type: 'number',
            required: true
        },
        MEDIUM_IMAGE_HEIGHT: {
            type: 'number',
            required: true
        },
        LARGE_IMAGE_WIDTH: {
            type: 'number',
            required: true
        },
        LARGE_IMAGE_HEIGHT: {
            type: 'number',
            required: true
        },
        CURRENCY: {
            type: 'string',
            required: true
        },
        CURRENCY_SYMBOL: {
            type: 'string',
            required: true
        },
        STRIPE_SECRET: {
            type: 'string',
            required: true
        },
        STRIPE_PUBLIC: {
            type: 'string',
            required: true
        },
        ONESIGNAL_AUTH_KEY: {
            type: 'string',
            required: true
        },
        ONESIGNAL_CUSTOMER_APP_ID: {
            type: 'string',
            required: true
        },
        ONESIGNAL_PROVIDER_APP_ID: {
            type: 'string',
            required: true
        },
        ONESIGNAL_REST_CUSTOMERKEY: {
            type: 'string',
            required: true
        },
        ONESIGNAL_REST_PROVIDERKEY: {
            type: 'string',
            required: true
        },
        TWILIO_ACCOUNT_SID: {
            type: 'string',
            required: true
        },
        TWILIO_AUTH_TOKEN: {
            type: 'string',
            required: true
        },
        AR: {
            type: 'string',
            required: true
        },
        R1: {
            type: 'string',
            required: true
        },
        R2: {
            type: 'string',
            required: true
        },
        R3: {
            type: 'string',
            required: true
        },
        NOTIFICATIONS: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        NOTIFICATIONS_HEADING: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        HELPDESK_MESSAGES: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        COLORS: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        FAKE_DOMAINS: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        EXCLUDED_ZIPCODE: {
            type: 'json',
            columnType: 'array',
            required: true
        },
        DEFAULT_COUNTRY: {
            type: 'string',
            required: true
        },
        DEFAULT_COUNTRY_CODE: {
            type: 'number',
            defaultsTo: 1
        },
        SEARCH_RADIUS: {
            type: 'number',
            defaultsTo: 20
        },
        IP_STACK_KEY: {
            type: 'string',
            required: true
        },
        status: {
            type: 'number',
            defaultsTo: 2
        },
        created_at: {
            type: 'number'
        },
        updated_at: {
            type: 'number',
            allowNull: true
        }
    },

    beforeCreate: async function(valuesToSet, proceed) {
        valuesToSet.created_at = moment().valueOf();
        return proceed();
    },

    beforeUpdate: async function(valuesToSet, proceed) {
        valuesToSet.updated_at = moment().valueOf();
        return proceed();
    },

    getJson: async function(req) {
        var json = {};
        var paymentOptions = [];
        if (req.COD_ACTIVE) {
            paymentOptions.push({ label: 'Cash', value: 1, default: false });
        }
        if (req.CARD_ACTIVE) {
            paymentOptions.push({ label: 'Card', value: 2, default: false });
        }
        if (req.WALLET_ACTIVE) {
            paymentOptions.push({ label: 'Wallet', value: 3, default: false });
        }
        if (paymentOptions.length > 0) {
            paymentOptions[0].default = true;
        }
        json['languages'] = api.checkAttribute(req.LANGUAGES);
        let helpDeskMessages = [];
        for (x in req.HELPDESK_MESSAGES) {
            helpDeskMessages.push({
                id: req.HELPDESK_MESSAGES[x].id,
                message: sails.__(req.HELPDESK_MESSAGES[x].message)
            });
        }
        let logo =
            sails.config.constants.BASE_URL +
            '/uploads/website/website-logo.png';
        json['constants'] = {
            LOGO: logo,
            CANCELLATION_MINUTES: api.checkAttribute(req.CANCELLATION_MINUTES),
            APPLICATION_NAME: api.checkAttribute(req.APPLICATION_NAME),
            MEDIA_COUNT: api.checkAttribute(req.MEDIA_COUNT),
            PACKAGE_COUNT: api.checkAttribute(req.PACKAGE_COUNT),
            CARD_LIMIT: api.checkAttribute(req.CARD_LIMIT),
            MEDIA_SIZE: api.checkAttribute(req.MEDIA_SIZE),
            THUMB_IMAGE_WIDTH: api.checkAttribute(req.THUMB_IMAGE_WIDTH),
            THUMB_IMAGE_HEIGHT: api.checkAttribute(req.THUMB_IMAGE_HEIGHT),
            CURRENCY: api.checkAttribute(req.CURRENCY),
            CURRENCY_SYMBOL: api.checkAttribute(req.CURRENCY_SYMBOL),
            GOOGLE_MAP_KEY: api.checkAttribute(req.GOOGLE_MAP_KEY),
            SEARCH_RADIUS: req.SEARCH_RADIUS,
            AR: api.checkAttribute(sails.__(req.AR)),
            R1: api.checkAttribute(sails.__(req.R1)),
            R2: api.checkAttribute(sails.__(req.R2)),
            R3: api.checkAttribute(sails.__(req.R3)),
            HELPDESK_MESSAGES: helpDeskMessages,
            
            WALLET_ACTIVE: api.checkAttribute(req.WALLET_ACTIVE),
            CARD_ACTIVE: api.checkAttribute(req.CARD_ACTIVE),
            COD_ACTIVE: api.checkAttribute(req.COD_ACTIVE),
            PAYMENT_GATEWAY: api.checkAttribute(req.PAYMENT_GATEWAY),
            paymentOptions: paymentOptions,
            androidCustomerAppLink: api.checkAttribute(
                req.ANDROID_CUSTOMER_APP_LINK
            ),
            iosCustomerAppLink: api.checkAttribute(req.IOS_CUSTOMER_APP_LINK),
            androidProviderAppLink: api.checkAttribute(
                req.ANDROID_PROVIDER_APP_LINK
            ),
            iosProviderAppLink: api.checkAttribute(req.IOS_PROVIDER_APP_LINK),
            androidDeliveryAppLink: api.checkAttribute(
                req.ANDROID_DELIVERY_APP_LINK
            ),
            iosDeliveryAppLink: api.checkAttribute(req.IOS_DELIVERY_APP_LINK),
            deliveryCost: api.checkAttribute(req.DELIVERY_COST),
            minimumOrderAmount: api.checkAttribute(req.MINIMUM_ORDER_AMOUNT),
            companyName: api.checkAttribute(req.COMPANY_NAME),
            applicationName: api.checkAttribute(req.APPLICATION_NAME),
            seo_title: api.checkAttribute(req.SEO_TITLE),
            seo_description: api.checkAttribute(req.SEO_DESCRIPTION),
            seo_keywords: api.checkAttribute(req.SEO_KEYWORDS),
            admin_email: api.checkAttribute(req.ADMIN_EMAIL),
            address_line1: api.checkAttribute(req.ADDRESS_LINE1),
            address_line2: api.checkAttribute(req.ADDRESS_LINE2),
            phone_number: api.checkAttribute(req.PHONE_NUMBER),
            skypeid: api.checkAttribute(req.SKYPE),
            facebook: api.checkAttribute(req.FACEBOOK),
            instagram: api.checkAttribute(req.INSTAGRAM),
            youtube: api.checkAttribute(req.YOUTUBE),
            linkedin: api.checkAttribute(req.LINKEDIN),
            about_us: api.checkAttribute(req.ABOUT_US)
        };
        json['colors'] = api.checkAttribute(req.COLORS);
        return json;
    },

    getAdminJson: async function(req, type) {
        var json = {};
        var basic = false;
        var colorScheme = false;
        var website = false;
        var thirdParty = false;
        var notifications = false;
        var helpDesk = false;
        if (type == sails.config.constants.SETTINGS_TYPE_BASIC) {
            basic = true;
        }
        if (type == sails.config.constants.SETTINGS_TYPE_COLOR_SCHEME) {
            colorScheme = true;
        }
        if (type == sails.config.constants.SETTINGS_TYPE_WEBSITE) {
            website = true;
        }
        if (type == sails.config.constants.SETTINGS_TYPE_THIRD_PARTY) {
            thirdParty = true;
        }
        if (type == sails.config.constants.SETTINGS_TYPE_NOTIFICATIONS) {
            notifications = true;
        }
        if (type == sails.config.constants.SETTINGS_TYPE_HELPDESK) {
            helpDesk = true;
        }
        if (typeof type == 'undefined' || type == null) {
            basic = true;
            colorScheme = true;
            website = true;
            thirdParty = true;
            notifications = true;
            helpDesk = true;
        }
        if (basic == true) {
            console.log(req.EXCLUDED_ZIPCODE);
            let excludedZipcode = req.EXCLUDED_ZIPCODE.length > 0 ? req.EXCLUDED_ZIPCODE.join(', ') : '';
            console.log(excludedZipcode);
            json['basic'] = {
                appName: api.checkAttribute(req.APPLICATION_NAME),
                companyName: api.checkAttribute(req.COMPANY_NAME),
                adminEmail: api.checkAttribute(req.ADMIN_EMAIL),
                seoTitle: api.checkAttribute(req.SEO_TITLE),
                seoDescription: api.checkAttribute(req.SEO_DESCRIPTION),
                seoKeywords: api.checkAttribute(req.SEO_KEYWORDS),
                languages: req.LANGUAGES,
                maintainence: api.checkAttribute(req.MAINTAINENCE_MODE),
                country: api.checkAttribute(req.DEFAULT_COUNTRY),
                countryCode: api.checkAttribute(req.DEFAULT_COUNTRY_CODE),
                search_radius: req.SEARCH_RADIUS,                
                excludedZipcode: api.checkAttribute(excludedZipcode)
            };
        }
        if (colorScheme == true) {
            json['colorScheme'] = {
                colors: req.COLORS,
                adminColor: api.checkAttribute(req.ADMIN_COLOR_SCHEME)
            };
        }
        if (website == true) {
            let logo =
                sails.config.constants.BASE_URL +
                '/uploads/website/website-logo.png';
            json['website'] = {
                logo: logo,
                phone: api.checkAttribute(req.PHONE_NUMBER),
                bookingPrefix: api.checkAttribute(req.BOOKING_PREFIX),
                fb: api.checkAttribute(req.FACEBOOK),
                insta: api.checkAttribute(req.INSTAGRAM),
                youtube: api.checkAttribute(req.YOUTUBE),
                linkedin: api.checkAttribute(req.LINKEDIN),
                skype: api.checkAttribute(req.SKYPE),
                address1: api.checkAttribute(req.ADDRESS_LINE1),
                address2: api.checkAttribute(req.ADDRESS_LINE2),
                about: api.checkAttribute(req.ABOUT_US),
                ar: api.checkAttribute(sails.__(req.AR)),
                r1: api.checkAttribute(sails.__(req.R1)),
                r2: api.checkAttribute(sails.__(req.R2)),
                r3: api.checkAttribute(sails.__(req.R3)),
                androidCustomerAppLink: api.checkAttribute(
                    req.ANDROID_CUSTOMER_APP_LINK
                ),
                iosCustomerAppLink: api.checkAttribute(
                    req.IOS_CUSTOMER_APP_LINK
                ),
                androidProviderAppLink: api.checkAttribute(
                    req.ANDROID_PROVIDER_APP_LINK
                ),
                iosProviderAppLink: api.checkAttribute(
                    req.IOS_PROVIDER_APP_LINK
                ),
                androidDeliveryAppLink: api.checkAttribute(
                    req.ANDROID_DELIVERY_APP_LINK
                ),
                iosDeliveryAppLink: api.checkAttribute(
                    req.IOS_DELIVERY_APP_LINK
                ),
                deliveryCost: api.checkAttribute(req.DELIVERY_COST),
                minimumOrderAmount: api.checkAttribute(req.MINIMUM_ORDER_AMOUNT)
            };
        }
        if (thirdParty == true) {
            json['thirdParty'] = {
                walletStatus: api.checkAttribute(req.WALLET_ACTIVE),
                cardstatus: api.checkAttribute(req.CARD_ACTIVE),
                codStatus: api.checkAttribute(req.COD_ACTIVE),
                awsBucketStatus: api.checkAttribute(req.AWS_BUCKET_ACTIVE),
                walletPrefix: api.checkAttribute(req.WALLET_PREFIX),
                cardLimit: api.checkAttribute(req.CARD_LIMIT),
                servicesLimit: api.checkAttribute(req.SERVICE_COUNT),
                google_map_key: api.checkAttribute(req.GOOGLE_MAP_KEY),
                currency: api.checkAttribute(req.CURRENCY),
                currencySymbol: api.checkAttribute(req.CURRENCY_SYMBOL),
                paymentGateway: api.checkAttribute(req.PAYMENT_GATEWAY),
                defaultAdminCut: api.checkAttribute(req.DEFAULT_ADMIN_CUT),
                awsBucketUrl: api.checkAttribute(req.AWS_BUCKET_URL),
                awsBucketKey: api.checkAttribute(req.AWS_BUCKET_KEY),
                awsBucketSecret: api.checkAttribute(req.AWS_BUCKET_SECRET),
                awsBucketName: api.checkAttribute(req.AWS_BUCKET_NAME),
                stripeSecret: api.checkAttribute(req.STRIPE_SECRET),
                stripePublic: api.checkAttribute(req.STRIPE_PUBLIC),
                onesignalAuthKey: api.checkAttribute(req.ONESIGNAL_AUTH_KEY),
                onesignalCustomerAppId: api.checkAttribute(
                    req.ONESIGNAL_CUSTOMER_APP_ID
                ),
                onesignalProviderAppId: api.checkAttribute(
                    req.ONESIGNAL_PROVIDER_APP_ID
                ),
                onesignalRestCustomerkey: api.checkAttribute(
                    req.ONESIGNAL_REST_CUSTOMERKEY
                ),
                onesignalRestProviderkey: api.checkAttribute(
                    req.ONESIGNAL_REST_PROVIDERKEY
                ),
                twilioAccountSid: api.checkAttribute(req.TWILIO_ACCOUNT_SID),
                twilioAuthToken: api.checkAttribute(req.TWILIO_AUTH_TOKEN),
                cancellationFee: api.checkAttribute(req.CANCELLATION_FEE),
                cancellationMinutes: api.checkAttribute(
                    req.CANCELLATION_MINUTES
                ),
                twilioPhone: api.checkAttribute(req.TWILIO_PHONE),
                ipStackKey: api.checkAttribute(req.IP_STACK_KEY)
            };
        }
        if (notifications == true) {
            if (notifications == true) {
                var finalPacket = [];
                _.map(req.NOTIFICATIONS, function(item, index) {
                    finalPacket.push({
                        id: index,
                        text: item
                    });
                });
                json['notifications'] = finalPacket;
            }
        }
        if (helpDesk == true) {
            json['helpdesk'] = {
                helpdesk: req.HELPDESK_MESSAGES
            };
        }
        json['status'] = api.checkAttribute(req.status);
        return json;
    }
};
