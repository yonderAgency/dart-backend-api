/**
 * User.js
 */
const path = require('path');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const api = require('../models/Api.js');
const lodash = require('lodash');
const ObjectId = require('mongodb').ObjectID;
module.exports = {
    attributes: {
        name: {
            type: 'string',
            required: true,
        },
        completed: {
            type: 'number',
            defaultsTo: 0,
        },
        email: {
            type: 'string',
            unique: true,
            required: true,
            isEmail: true,
        },
        password: {
            type: 'string',
        },
        role: {
            type: 'number',
            required: true,
        },
        phone: {
            type: 'string',
            minLength: 7,
            allowNull: true,
        },
        language: {
            type: 'string',
            defaultsTo: 'en',
        },
        activation_key: {
            type: 'string',
            allowNull: true,
        },
        status: {
            type: 'number',
            defaultsTo: 1,
        },
        is_phone_verified: {
            type: 'boolean',
            defaultsTo: false,
        },
        is_email_verified: {
            type: 'boolean',
            defaultsTo: false,
        },
        latitude: {
            type: 'string',
            allowNull: true,
        },
        longitude: {
            type: 'string',
            allowNull: true,
        },
        is_deleted: {
            type: 'number',
            defaultsTo: 2,
        },
        deleted_at: {
            type: 'number',
            allowNull: true,
        },
        is_blocked: {
            type: 'number',
            defaultsTo: 2,
        },
        deleted_by: {
            type: 'string',
            allowNull: true,
        },
        blocked_at: {
            type: 'number',
            allowNull: true,
        },
        created_at: {
            type: 'number',
        },
        updated_at: {
            type: 'number',
            allowNull: true,
        },
        updated_by: {
            type: 'string',
            allowNull: true,
        },
        otp: {
            type: 'string',
            allowNull: true,
        },
        stripe_id: {
            type: 'string',
            allowNull: true,
        },
        cards: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
        },
        country: {
            type: 'string',
            defaultsTo: sails.config.dynamics.DEFAULT_COUNTRY,
        },
        deletion_message: {
            type: 'string',
            defaultsTo: '',
        },
        country_code: {
            type: 'number',
            defaultsTo: sails.config.dynamics.DEFAULT_COUNTRY_CODE,
        },
        language: {
            type: 'string',
            defaultsTo: sails.config.dynamics.LOCALE,
        },
        under_review: {
            type: 'number',
            defaultsTo: sails.config.dynamics.NOT_UNDER_REVIEW,
        },
        tokens: {
            collection: 'token',
            via: 'owner',
        },
        location: {
            type: 'json',
            columnType: 'array',
            defaultsTo: {
                type: 'Point',
                coordinates: [],
            },
        },
        subadminProfile: {
            type: 'json',
            columnType: 'object',
            defaultsTo: null,
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
        valuesToSet.otp = null;
        return proceed();
    },

    beforeUpdate: async function (valuesToSet, proceed) {
        let websiteImages = await Api.getWebsiteImage();
        if (valuesToSet.is_deleted == sails.config.constants.IS_DELETED) {
            valuesToSet.deleted_at = moment().valueOf();
            await sails.hooks.email.send(
                'deactivated',
                {
                    name: valuesToSet.name,
                    image: websiteImages,
                },
                {
                    to: valuesToSet.email,
                    subject:
                        'Account deactivated: ' +
                        sails.config.dynamics.APPLICATION_NAME,
                },
                async function (err) {
                    if (err) {
                        sails.sentry.captureException(err);
                    }
                    return proceed();
                }
            );
        } else {
            valuesToSet.deleted_at = null;
        }
        if (valuesToSet.is_blocked == sails.config.constants.IS_BLOCKED) {
            valuesToSet.blocked_at = moment().valueOf();
            valuesToSet.status = sails.config.constants.STATUS_INACTIVE;
            await sails.hooks.email.send(
                'blocked',
                {
                    name: valuesToSet.name,
                    image: websiteImages,
                },
                {
                    to: valuesToSet.email,
                    subject:
                        'Account blocked: ' +
                        sails.config.dynamics.APPLICATION_NAME,
                },
                async function (err) {
                    if (err) {
                        sails.sentry.captureException(err);
                    }
                    return proceed();
                }
            );
        } else {
            valuesToSet.blocked_at = null;
        }
        if (
            valuesToSet.is_deleted == sails.config.constants.IS_ACTIVE &&
            valuesToSet.is_blocked == sails.config.constants.IS_UNBLOCKED
        ) {
            valuesToSet.status = sails.config.constants.STATUS_ACTIVE;
        }
        const user = await User.find({
            email: valuesToSet.email,
        }).limit(1);
        if (user && user.length > 0) {
            if (
                valuesToSet.status != user[0].status &&
                valuesToSet.status == sails.config.constants.STATUS_ACTIVE
            ) {
                await sails.hooks.email.send(
                    'activated',
                    {
                        name: valuesToSet.name,
                        image: websiteImages,
                    },
                    {
                        to: valuesToSet.email,
                        subject:
                            'Congratulations, account activated: ' +
                            sails.config.dynamics.APPLICATION_NAME,
                    },
                    async function (err) {
                        if (err) {
                            sails.sentry.captureException(err);
                        }
                        return proceed();
                    }
                );
            } else if (
                valuesToSet.is_featured != user[0].is_featured &&
                valuesToSet.is_featured == sails.config.constants.IS_FEATURED
            ) {
                await sails.hooks.email.send(
                    'featured',
                    {
                        name: valuesToSet.name,
                        image: websiteImages,
                    },
                    {
                        to: valuesToSet.email,
                        subject:
                            'Congratulations, account marked as featured: ' +
                            sails.config.dynamics.APPLICATION_NAME,
                    },
                    async function (err) {
                        if (err) {
                            sails.sentry.captureException(err);
                        }
                        return proceed();
                    }
                );
            }
        }
        return proceed();
    },

    getProviderSlug: async function (string, repeat = '') {
        var slug = '';
        var text = string;
        if (repeat != '') {
            text = string + ' ' + repeat.substr(repeat.length - 3);
        }
        if (typeof text !== 'undefined') {
            slug = text
                .toString()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        }
        const profile = await ProviderProfile.find({
            slug: slug,
        }).limit(1);
        if (profile && profile.length > 0) {
            await this.getProviderSlug(string, profile[0].created_at + '');
        }
        return slug;
    },

    getCustomerSlug: async function (string, repeat = '') {
        var slug = '';
        var text = string;
        if (repeat != '') {
            text = string + ' ' + repeat.substr(repeat.length - 3);
        }
        if (typeof text !== 'undefined') {
            slug = text
                .toString()
                .toLowerCase()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        }
        const profile = await CustomerProfile.find({
            slug: slug,
        }).limit(1);
        if (profile && profile.length > 0) {
            await this.getCustomerSlug(string, profile[0].created_at + '');
        }
        return slug;
    },

    addUserToken: async function (user, playerId = null) {
        var d = new Date().getTime().toString();
        var token = await jwt.sign({ password: user.id + user.email }, d);

        if (playerId) {
            await Token.destroy({
                player_id: playerId,
            });
        }

        await Token.create({
            token_value: token,
            owner: user.id,
            player_id: playerId,
        });

        const value = await Token.find({
            where: { token_value: token },
        });
        if (value) {
            return value[0].token_value;
        }
        return null;
    },

    pushIpData: function (ip, ipAddress, action) {
        if (Array.isArray(ipAddress) && ipAddress.length > 0) {
            ipAddress.unshift({
                ip: ip,
                action: action,
                timeStamp: moment().valueOf(),
            });
            if (ipAddress.length > 5) {
                ipAddress.pop();
            }
        } else {
            ipAddress = [];
            ipAddress.push({
                ip: ip,
                action: action,
                timeStamp: moment().valueOf(),
            });
        }
        return ipAddress;
    },

    getStatusOptions: async function (id) {
        var list = new Array('Active', 'Inactive', 'Blocked');
        if (!id) {
            return list;
        } else {
            return list[id];
        }
    },

    getName: async function (id) {
        var user = await User.find({
            id: id,
        }).limit(1);
        if (user && user.length > 0) {
            return user[0].name;
        }
        return '';
    },

    getStartsFrom: async function (id) {
        var startPrice = 0;
        var minService = await ProviderService.find({
            where: { created_by: id },
            limit: 1,
        }).sort('price asc');
        if (minService.length > 0 && typeof minService != 'undefined') {
            startPrice = minService[0].price;
            return startPrice.toString();
        }
        return '0';
    },

    getReviewCount: async function (id) {
        var averageRating = 0;
        var mainRatingCounts = await RatingLog.find({
            created_by: id,
        }).limit(1);
        if (mainRatingCounts && mainRatingCounts.length > 0) {
            averageRating = mainRatingCounts[0].review_count;
            return averageRating;
        }
        return 0;
    },

    getAverageRating: async function (id) {
        var averageRating = 0;
        var averageRatings = await RatingLog.find({
            created_by: id,
        }).limit(1);

        if (averageRatings && averageRatings.length > 0) {
            averageRating = parseFloat(averageRatings[0].ar);
            return parseFloat(averageRating).toFixed(2);
        }
        return 0;
    },

    getTagline: async function (id) {
        let tagline = [];
        var services = await ProviderService.find({
            created_by: id,
            status: sails.config.constants.STATUS_ACTIVE,
            is_deleted: sails.config.constants.IS_ACTIVE,
        }).limit(4);

        if (services) {
            for (let x in services) {
                var name = await ProviderService.getName(services[x].id);
                if (name && name.length > 0) {
                    tagline.push(name);
                }
            }

            const taglineValue = tagline.join(', ');
            return taglineValue;
        }
        return '';
    },

    getCapital: function (string) {
        var splitStr = string.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] =
                splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        return splitStr.join(' ');
    },

    getRandomOtp: function (length = 6) {
        return Math.floor(
            Math.pow(10, length - 1) +
                Math.random() *
                    (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
        );
    },

    getKeyByValue: function (object, value) {
        return Object.keys(object).find((key) => object[key] === value);
    },

    getCountryCode: function (code, key = false) {
        var countries = {
            AD: '376',
            AE: '971',
            AF: '93',
            AG: '1268',
            AI: '1264',
            AL: '355',
            AM: '374',
            AN: '599',
            AO: '244',
            AQ: '672',
            AR: '54',
            AS: '1684',
            AT: '43',
            AU: '61',
            AW: '297',
            AZ: '994',
            BA: '387',
            BB: '1246',
            BD: '880',
            BE: '32',
            BF: '226',
            BG: '359',
            BH: '973',
            BI: '257',
            BJ: '229',
            BL: '590',
            BM: '1441',
            BN: '673',
            BO: '591',
            BR: '55',
            BS: '1242',
            BT: '975',
            BW: '267',
            BY: '375',
            BZ: '501',
            CA: '1',
            CC: '61',
            CD: '243',
            CF: '236',
            CG: '242',
            CH: '41',
            CI: '225',
            CK: '682',
            CL: '56',
            CM: '237',
            CN: '86',
            CO: '57',
            CR: '506',
            CU: '53',
            CV: '238',
            CX: '61',
            CY: '357',
            CZ: '420',
            DE: '49',
            DJ: '253',
            DK: '45',
            DM: '1767',
            DO: '1809',
            DZ: '213',
            EC: '593',
            EE: '372',
            EG: '20',
            ER: '291',
            ES: '34',
            ET: '251',
            FI: '358',
            FJ: '679',
            FK: '500',
            FM: '691',
            FO: '298',
            FR: '33',
            GA: '241',
            GB: '44',
            GD: '1473',
            GE: '995',
            GH: '233',
            GI: '350',
            GL: '299',
            GM: '220',
            GN: '224',
            GQ: '240',
            GR: '30',
            GT: '502',
            GU: '1671',
            GW: '245',
            GY: '592',
            HK: '852',
            HN: '504',
            HR: '385',
            HT: '509',
            HU: '36',
            ID: '62',
            IE: '353',
            IL: '972',
            IM: '44',
            IN: '91',
            IQ: '964',
            IR: '98',
            IS: '354',
            IT: '39',
            JM: '1876',
            JO: '962',
            JP: '81',
            KE: '254',
            KG: '996',
            KH: '855',
            KI: '686',
            KM: '269',
            KN: '1869',
            KP: '850',
            KR: '82',
            KW: '965',
            KY: '1345',
            KZ: '7',
            LA: '856',
            LB: '961',
            LC: '1758',
            LI: '423',
            LK: '94',
            LR: '231',
            LS: '266',
            LT: '370',
            LU: '352',
            LV: '371',
            LY: '218',
            MA: '212',
            MC: '377',
            MD: '373',
            ME: '382',
            MF: '1599',
            MG: '261',
            MH: '692',
            MK: '389',
            ML: '223',
            MM: '95',
            MN: '976',
            MO: '853',
            MP: '1670',
            MR: '222',
            MS: '1664',
            MT: '356',
            MU: '230',
            MV: '960',
            MW: '265',
            MX: '52',
            MY: '60',
            MZ: '258',
            NA: '264',
            NC: '687',
            NE: '227',
            NG: '234',
            NI: '505',
            NL: '31',
            NO: '47',
            NP: '977',
            NR: '674',
            NU: '683',
            NZ: '64',
            OM: '968',
            PA: '507',
            PE: '51',
            PF: '689',
            PG: '675',
            PH: '63',
            PK: '92',
            PL: '48',
            PM: '508',
            PN: '870',
            PR: '1',
            PT: '351',
            PW: '680',
            PY: '595',
            QA: '974',
            RO: '40',
            RS: '381',
            RU: '7',
            RW: '250',
            SA: '966',
            SB: '677',
            SC: '248',
            SD: '249',
            SE: '46',
            SG: '65',
            SH: '290',
            SI: '386',
            SK: '421',
            SL: '232',
            SM: '378',
            SN: '221',
            SO: '252',
            SR: '597',
            ST: '239',
            SV: '503',
            SY: '963',
            SZ: '268',
            TC: '1649',
            TD: '235',
            TG: '228',
            TH: '66',
            TJ: '992',
            TK: '690',
            TL: '670',
            TM: '993',
            TN: '216',
            TO: '676',
            TR: '90',
            TT: '1868',
            TV: '688',
            TW: '886',
            TZ: '255',
            UA: '380',
            UG: '256',
            US: '1',
            UY: '598',
            UZ: '998',
            VA: '39',
            VC: '1784',
            VE: '58',
            VG: '1284',
            VI: '1340',
            VN: '84',
            VU: '678',
            WF: '681',
            WS: '685',
            XK: '381',
            YE: '967',
            YT: '262',
            ZA: '27',
            ZM: '260',
            ZW: '263',
        };
        if (key === false) {
            return countries[code];
        } else {
            return this.getKeyByValue(countries, code);
        }
    },

    getProviderCompletion: async function (user) {
        let generatedOtp = this.getRandomOtp(6);
        var pathName = path.parse('/assets/images/website-logo.png');
        var logoImage =
            sails.config.constants.BASE_URL +
            pathName.dir +
            '/' +
            pathName.base;
        if (user.is_email_verified == false) {
            let websiteImages = await Api.getWebsiteImage();
            sails.hooks.email.send(
                'verification',
                {
                    name: user.name,
                    otp: generatedOtp,
                    logoImage: logoImage,
                    image: websiteImages,
                },
                {
                    to: user.email,
                    subject:
                        'Email Verification: ' +
                        sails.config.dynamics.APPLICATION_NAME,
                },
                function (err) {
                    if (err) {
                        sails.sentry.captureException(err);
                    }
                }
            );
            await User.update({
                email: user.email,
            }).set({
                completed: sails.config.constants.PROFILE_INCOMPLETE_EMAIL,
                otp: generatedOtp,
            });
            return {
                step: 1,
                showContent: 1,
            };
        }
        if (user.is_phone_verified == false) {
            let country_code = '+' + user.country_code;
            if (user.phone == null || user.phone == '') {
                await User.update({
                    email: user.email,
                }).set({
                    completed: sails.config.constants.PROFILE_INCOMPLETE_PHONE,
                });
                return {
                    step: 1,
                    showContent: 2,
                };
            } else {
                // let messageSent = await sails.helpers.sms.with({
                //     otp: generatedOtp,
                //     number: country_code + user.phone
                // });
                // if (messageSent) {
                //     await User.update({
                //         email: user.email
                //     }).set({
                //         otp: generatedOtp,
                //         completed:
                //             sails.config.constants.PROFILE_INCOMPLETE_PHONE
                //     });
                return {
                    step: 1,
                    showContent: 3,
                };
                // }
            }
        }
        const addressCount = await UserAddress.count({
            created_by: user.id,
        });
        if (addressCount == 0) {
            await User.update({
                email: user.email,
            }).set({
                completed: sails.config.constants.PROFILE_INCOMPLETE_ADDRESS,
            });
            return {
                step: 2,
                showContent: 0,
            };
        }
        const providerServices = await ProviderService.count({
            created_by: user.id,
        });
        if (providerServices == 0) {
            await User.update({
                email: user.email,
            }).set({
                completed: sails.config.constants.PROFILE_INCOMPLETE_SERVICES,
            });
            return {
                step: 3,
                showContent: 0,
            };
        }
        await User.update({
            email: user.email,
        }).set({
            completed: sails.config.constants.PROFILE_COMPLETED,
        });
        return {
            step: 4,
            showContent: 0,
        };
    },

    checkVerifiedProvider: async function (user) {
        if (user.completed != sails.config.constants.PROFILE_COMPLETED) {
            return false;
        }
        if (user.is_phone_verified == false) {
            return false;
        }
        if (user.is_email_verified == false) {
            return false;
        }
        const addressCount = await UserAddress.count({
            created_by: user.id,
        });
        if (addressCount == 0) {
            return false;
        }
        const providerServices = await ProviderService.count({
            created_by: user.id,
        });
        if (providerServices == 0) {
            return false;
        }
        return true;
    },

    getJson: async function (req, loggedInUser = null) {
        var json = {};
        var favValue = '0';
        json['key'] = api.checkAttribute(req.id);
        json['id'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        json['new_booking'] = true;
        let allLang = sails.config.dynamics.LANGUAGES;
        json['language'] = {
            name: 'English',
            language: 'en',
            rtl: false,
        };
        for (x in allLang) {
            if (allLang[x].language == req.language) {
                json['language'] = allLang[x];
            }
        }
        json['email'] = api.checkAttribute(req.email);
        json['is_deleted'] = api.checkAttribute(req.is_deleted);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);
        json['type_id'] = false;
        if (req.deleted_by) {
            json['type_id'] = true;
        }
        json['is_blocked'] = api.checkAttribute(req.is_blocked);
        json['under_review'] = api.checkAttribute(req.under_review);
        json['phone'] = api.checkAttribute(req.phone);
        json['role'] = api.checkAttribute(req.role);
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['directlyInside'] = false;
        json['social'] = false;
        if (req.password == '' || req.password == null) {
            json['social'] = true;
        }
        json['notification_count'] = await Notifications.count({
            created_by: req.id,
            status: sails.config.constants.NOTIFICATION_STATUS_FOR_INDIVIDUAL,
            is_read: sails.config.constants.READ_FALSE,
        });
        json['viewCount'] = 0;
        json['notification_count'] = Number(json['notification_count'] > 25)
            ? '25+'
            : json['notification_count'];
        if (req.role == sails.config.constants.ROLE_PROVIDER) {
            json['startFrom'] = await this.getStartsFrom(req.id);
            json['tagline'] = await this.getTagline(req.id);
            json['reviews'] = await this.getReviewCount(req.id);
            json['rating'] = await this.getAverageRating(req.id);
            viewCount = await ProviderLog.count({
                provider_id: req.id,
            });
            json['viewCount'] = viewCount;
        } else {
            json['startFrom'] = '0';
            json['reviews'] = 0;
            json['tagline'] = '';
            json['rating'] = '0.0';
        }
        json['isFavorite'] = 0;
        if (typeof loggedInUser !== null) {
            favValue = await Favorite.getValue(req.id, loggedInUser);
            json['isFavorite'] = favValue;
        }
        json['location'] = {};
        const custProfileData = await CustomerProfile.getData(req.id);
        json['image'] = Api.getBaseImages();
        if (
            custProfileData &&
            custProfileData.image != '' &&
            custProfileData.image != null
        ) {
            json['image'] = Api.getActualImages(
                '/uploads/profile/',
                custProfileData.image
            );
        }
        if (custProfileData) {
            if (
                typeof custProfileData.latitude != 'undefined' &&
                custProfileData.latitude != ''
            ) {
                json['location'] = {
                    locationType: parseFloat(custProfileData.location_type),
                    latitude: parseFloat(custProfileData.latitude),
                    longitude: parseFloat(custProfileData.longitude),
                };
            }
            json['dob'] = custProfileData.dob;
        }
        if (req.role == sails.config.constants.ROLE_PROVIDER) {
            const providerEarningAmount = await Booking.getProviderEarning(
                req.id
            );
            //{ provider_earning_amount: 0, admin_earning_amount: 0 }
            json['provider_earning_amount'] =
                providerEarningAmount.provider_earning_amount;
            json['admin_earning_amount'] =
                providerEarningAmount.admin_earning_amount;
        }
        const providerProfileData = await ProviderProfile.getData(req.id);
        json['due_amount'] = 0.0;
        json['last_paid_time'] = 0;
        if (providerProfileData) {
            json['type'] = api.checkAttribute(providerProfileData.type_id);
            json['businessName'] = api.checkAttribute(
                providerProfileData.business_name
            );
            json['website'] = providerProfileData.website;
            if (providerProfileData.established_on) {
                json['establishedOn'] = providerProfileData.established_on + '';
            } else {
                json['establishedOn'] = '';
            }
            if (providerProfileData.logo) {
                json['proImage'] = Api.getActualImages(
                    '/uploads/profile/',
                    providerProfileData.logo
                );
            } else {
                json['proImage'] = Api.getBaseImages();
            }
            json['isFeatured'] = providerProfileData.is_featured;
            var serviceCount = await ProviderService.find({
                created_by: req.id,
                status: sails.config.constants.STATUS_ACTIVE,
            });
            json['serviceId'] = 0;
            if (serviceCount.length == 1) {
                json['directlyInside'] = true;
                json['serviceId'] = serviceCount[0].service_id;
            }
            json['description'] = api.checkAttribute(
                providerProfileData.description
            );
            json['slug'] = api.checkAttribute(providerProfileData.slug);
            json['due_amount'] = providerProfileData.due_amount
                ? providerProfileData.due_amount
                : 0.0;
            json['last_paid_time'] = providerProfileData.last_paid_time
                ? providerProfileData.last_paid_time
                : 0;
            json['bank_name'] = providerProfileData.bank_name
                ? providerProfileData.bank_name
                : '';
            json['account_type'] = providerProfileData.account_type
                ? providerProfileData.account_type
                : '';
            json['account_number'] = providerProfileData.account_number
                ? providerProfileData.account_number
                : '';
            json['instruction'] = providerProfileData.instruction
                ? providerProfileData.instruction
                : '';
        } else {
            json['proImage'] = Api.getBaseImages();
        }
        json['wallet'] = 0;
        var wallet = await Wallet.find({
            created_by: req.id,
        }).limit(1);
        if (wallet.length > 0) {
            json['wallet'] = wallet[0].balance;
        }
        var addresses = await UserAddress.find({
            created_by: req.id,
            status: sails.config.constants.STATUS_ACTIVE,
        }).sort('is_default DESC');
        var addressPacket = [];
        if (addresses.length > 0) {
            for (var i = 0; i < addresses.length; i++) {
                addressPacket[i] = await UserAddress.getJson(addresses[i]);
                addressPacket[i].key = addresses[i].id;
            }
        }
        json['addresses'] = addressPacket;
        json['status'] =
            api.checkAttribute(req.status) === 1 ? 'Active' : 'Inactive';
        json['inbox_count'] = await Inbox.getUnread(req.id);
        json['inbox_count'] =
            Number(json['inbox_count']) > 25 ? '25+' : json['inbox_count'];
        if (req.service) {
            json['proService'] = req.service;
        }
        json['stripe_completed'] = false;
        if (req.stripe_id != '' && req.stripe_id != null) {
            json['stripe_completed'] = true;
        }
        json['subadmin_contact'] = req.subadminProfile
            ? req.subadminProfile.contact
            : '';
        json['subadmin_address'] = req.subadminProfile
            ? req.subadminProfile.address
            : '';
        json['subadmin_city'] = req.subadminProfile
            ? req.subadminProfile.city
            : '';
        json['subadmin_state'] = req.subadminProfile
            ? req.subadminProfile.state
            : '';
        json['subadmin_pincode'] = req.subadminProfile
            ? req.subadminProfile.pincode
            : '';
        json['subadmin_country'] = req.subadminProfile
            ? req.subadminProfile.country
            : '';
        const newJson = {
            ...json,
            ...json['image'],
        };
        return newJson;
    },

    getProviderJson: async function (
        req,
        serviceId = null,
        loggedInUser = null,
        favorite = false,
        location = null
    ) {
        const bannerData = [];
        const packageList = [];
        const favoriteList = [];
        var json = {};

        json['key'] = api.checkAttribute(req.id);
        json['id'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        let allLang = sails.config.dynamics.LANGUAGES;
        json['language'] = {
            name: 'English',
            language: 'en',
            rtl: false,
        };
        for (x in allLang) {
            if (allLang[x].language == req.language) {
                json['language'] = allLang[x];
            }
        }
        json['email'] = api.checkAttribute(req.email);
        json['description'] = api.checkAttribute(req.description);
        json['type_id'] = api.checkAttribute(req.type_id);
        json['phone'] = api.checkAttribute(req.phone);
        json['is_deleted'] = api.checkAttribute(req.is_deleted);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);
        json['is_blocked'] = api.checkAttribute(req.is_blocked);
        json['under_review'] = api.checkAttribute(req.under_review);
        json['role'] = api.checkAttribute(req.role);
        json['created_at'] = api.checkAttribute(req.created_at);
        json['deleted_at'] = api.checkAttribute(req.deleted_at);

        json['viewCount'] = 0;
        if (req.role == sails.config.constants.ROLE_PROVIDER) {
            json['startFrom'] = await this.getStartsFrom(req.id);
            json['tagline'] = await this.getTagline(req.id);
            json['reviews'] = await this.getReviewCount(req.id);
            json['rating'] = await this.getAverageRating(req.id);
            viewCount = await ProviderLog.count({
                provider_id: req.id,
            });

            json['viewCount'] = viewCount;
        } else {
            json['startFrom'] = '0';
            json['reviews'] = 0;
            json['tagline'] = '';
            json['rating'] = '0.0';
        }
        if (typeof loggedInUser !== 'undefined') {
            favValue = await Favorite.getValue(req.id, loggedInUser);
            json['isFavorite'] = favValue;
        }

        const custProfileData = await CustomerProfile.getData(req.id);
        if (custProfileData && custProfileData.image != '') {
            json['image'] = Api.getActualImages(
                '/uploads/profile/',
                custProfileData.image
            );
        } else {
            json['image'] = Api.getBaseImages();
        }

        const providerProfileData = await ProviderProfile.getData(req.id);
        if (providerProfileData) {
            json['slug'] = api.checkAttribute(providerProfileData.slug);
            json['businessName'] = api.checkAttribute(
                providerProfileData.business_name
            );
            if (providerProfileData.established_on) {
                json['establishedOn'] = providerProfileData.established_on + '';
            } else {
                json['establishedOn'] = '';
            }
            json['description'] = api.checkAttribute(
                providerProfileData.description
            );
            if (providerProfileData.logo) {
                json['proImage'] = Api.getActualImages(
                    '/uploads/profile/',
                    providerProfileData.logo
                );
            } else {
                json['proImage'] = Api.getBaseImages();
            }
            json['website'] = providerProfileData.website;
        } else {
            json['proImage'] = Api.getBaseImages();
        }

        json['banners'] = [];
        json['videos'] = [];
        const providerServiceValue = await ProviderService.getProviderService(
            serviceId,
            req.id
        );
        if (providerServiceValue) {
            json['serviceName'] = await ProviderService.getName(
                providerServiceValue.id
            );
            json['servicePrice'] = providerServiceValue.price;
            json['proServiceId'] = providerServiceValue.id;
            json['description'] = providerServiceValue.description;

            var serviceImages = await ProviderServiceAddon.find({
                created_by: req.id,
                status: sails.config.constants.STATUS_ACTIVE,
                provider_service_id: providerServiceValue.id,
            });
            var allBanners = [];
            if (serviceImages.length > 0) {
                for (let x in serviceImages[0].file) {
                    allBanners.push(
                        Api.getActualImages(
                            '/uploads/media/',
                            serviceImages[0].file[x].filename
                        )
                    );
                }
                json['banners'] = allBanners;
            }
        }

        if (json['banners'].length == 0) {
            json['banners'].push(Api.getBaseImages());
        }
        json['stripe_completed'] = false;
        if (req.stripe_id != '' && req.stripe_id != null) {
            json['stripe_completed'] = true;
        }
        const userAddressDb = UserAddress.getDatastore().manager;
        var addressPacket = [];
        var addresses = [];
        if (location && location.longitude && location.latitude) {
            let providerid = new ObjectId(req.id);
            addresses = await userAddressDb
                .collection('useraddress')
                .aggregate([
                    {
                        $geoNear: {
                            near: {
                                type: 'Point',
                                coordinates: [
                                    parseFloat(location.longitude),
                                    parseFloat(location.latitude),
                                ],
                            },
                            maxDistance:
                                sails.config.dynamics.SEARCH_RADIUS * 1000,
                            distanceField: 'dist.calculated',
                            includeLocs: 'dist.location',
                            spherical: true,
                        },
                    },
                    {
                        $match: {
                            created_by: providerid,
                            status: sails.config.constants.STATUS_ACTIVE,
                        },
                    },
                    { $limit: 1 },
                ])
                .toArray();
        } else {
            addresses = await UserAddress.find({
                created_by: req.id,
                status: sails.config.constants.STATUS_ACTIVE,
            }).sort('is_default DESC');
        }
        if (addresses.length > 0) {
            for (var i = 0; i < addresses.length; i++) {
                addressPacket[i] = UserAddress.getJson(addresses[i]);
                addressPacket[i].key = addresses[i].id;
            }
            json['displayAddress'] = addresses[0];
        } else {
            addresses = await UserAddress.find({
                created_by: req.id,
                status: sails.config.constants.STATUS_ACTIVE,
            }).sort('is_default DESC');
            if (addresses.length > 0) {
                for (var i = 0; i < addresses.length; i++) {
                    addressPacket[i] = UserAddress.getJson(addresses[i]);
                    addressPacket[i].key = addresses[i].id;
                }
                json['displayAddress'] = addresses[0];
            }
        }
        json['addresses'] = addressPacket;

        json['inbox_count'] = await Inbox.getUnread(req.id);
        json['inbox_count'] =
            Number(json['inbox_count']) > 25 ? '25+' : json['inbox_count'];

        json['status'] =
            api.checkAttribute(req.status) === 1 ? 'Active' : 'Inactive';
        if (favorite) {
            var favorites = await Favorite.find({
                where: { created_by: loggedInUser },
            });
            if (favorites.length > 0) {
                for (const favorite of favorites) {
                    favoriteList.push(await Favorite.getJson(favorite, true));
                }
            }
            json['favorites'] = favoriteList;
        }
        var businessHours = await ProviderBusinessHours.find({
            created_by: req.id,
        }).limit(1);
        if (businessHours && businessHours.length > 0) {
            json['workingHours'] = await ProviderBusinessHours.getJson(
                businessHours[0]
            );
        }
        var categoryItem = [];
        var forCategories = [];
        var allSelectedServices = await ProviderService.find({
            where: {
                created_by: req.id,
                status: sails.config.constants.STATUS_ACTIVE,
                is_deleted: sails.config.constants.IS_ACTIVE,
            },
            select: ['category_id'],
        });

        if (allSelectedServices && allSelectedServices.length > 0) {
            for (x in allSelectedServices) {
                forCategories.push(allSelectedServices[x].category_id);
            }
        }
        forCategories = lodash.uniq(forCategories);
        const db = BookingItem.getDatastore().manager;
        var items = await db
            .collection('bookingitem')
            .aggregate([
                {
                    $lookup: {
                        from: 'booking',
                        localField: 'booking_id',
                        foreignField: 'id',
                        as: 'booking',
                    },
                },
                {
                    $project: {
                        package_id: 1,
                    },
                },
                {
                    $unwind: '$package_id',
                },
                {
                    $group: {
                        _id: '$package_id.service_id',
                        count: { $sum: 1 },
                    },
                },
                {
                    $sort: {
                        count: -1,
                    },
                },
                {
                    $limit: 10,
                },
            ])
            .toArray();
        console.log({ items });
        items = lodash.map(items, '_id');
        let popularArray = [];

        if (forCategories && forCategories.length > 0) {
            for (x in forCategories) {
                var services = [];
                var category = await Category.find({
                    id: forCategories[x],
                    status: sails.config.constants.STATUS_ACTIVE,
                    is_deleted: sails.config.constants.IS_ACTIVE,
                });
                if (category && category.length > 0) {
                    var providerServices = await ProviderService.find({
                        created_by: req.id,
                        category_id: forCategories[x],
                        status: sails.config.constants.STATUS_ACTIVE,
                        is_deleted: sails.config.constants.IS_ACTIVE,
                    });
                    if (providerServices && providerServices.length > 0) {
                        for (y in providerServices) {
                            var active = await Service.find({
                                id: providerServices[y].service_id,
                                status: sails.config.constants.STATUS_ACTIVE,
                            });
                            if (active && active.length > 0) {
                                let ps = await ProviderService.getJson(
                                    providerServices[y],
                                    true
                                );
                                if (items.indexOf(ps.serviceId) !== -1) {
                                    popularArray.push(ps);
                                }
                                services.push(ps);
                            }
                        }
                        let ca = await Category.getFoodJson(
                            category[0],
                            services
                        );
                        categoryItem.push(ca);
                    }
                }
            }
        }
        json['popular'] = popularArray;
        json['menu'] = categoryItem;
        return json;
    },

    getMyDetail: async function (req, serviceId = null) {
        const bannerData = [];
        var json = {};
        json['key'] = api.checkAttribute(req.id);
        json['id'] = api.checkAttribute(req.id);
        json['name'] = api.checkAttribute(req.name);
        json['email'] = api.checkAttribute(req.email);
        json['phone'] = api.checkAttribute(req.phone);
        json['role'] = api.checkAttribute(req.role);
        json['adminCut'] = sails.config.dynamics.DEFAULT_ADMIN_CUT;
        json['is_deleted'] = api.checkAttribute(req.is_deleted);
        json['deleted_by'] = api.checkAttribute(req.deleted_by);
        json['is_blocked'] = api.checkAttribute(req.is_blocked);
        json['under_review'] = api.checkAttribute(req.under_review);
        json['deleted_at'] = api.checkAttribute(req.deleted_at);
        json['ipAddress'] =
            req.ipAddress && req.ipAddress.length > 0 ? req.ipAddress : [];
        let allLang = sails.config.dynamics.LANGUAGES;
        json['language'] = {
            name: 'English',
            language: 'en',
            rtl: false,
        };
        for (x in allLang) {
            if (allLang[x].language == req.language) {
                json['language'] = allLang[x];
            }
        }
        json['created_at'] = api.checkAttribute(req.created_at);
        json['stripe_completed'] = false;
        if (req.stripe_id != '' && req.stripe_id != null) {
            json['stripe_completed'] = true;
        }
        json['viewCount'] = 0;
        if (req.role == sails.config.constants.ROLE_PROVIDER) {
            json['startFrom'] = await this.getStartsFrom(req.id);
            json['tagline'] = await this.getTagline(req.id);
            json['reviews'] = await this.getReviewCount(req.id);
            json['rating'] = await this.getAverageRating(req.id);
            viewCount = await ProviderLog.count({
                provider_id: req.id,
            });
            json['viewCount'] = viewCount;
        } else {
            json['startFrom'] = '0';
            json['reviews'] = 0;
            json['tagline'] = '';
            json['rating'] = '0.0';
        }
        json['notification_count'] = await Notifications.count({
            created_by: req.id,
            status: sails.config.constants.NOTIFICATION_STATUS_FOR_INDIVIDUAL,
            is_read: sails.config.constants.READ_FALSE,
        });
        json['notification_count'] = Number(json['notification_count'] > 25)
            ? '25+'
            : json['notification_count'];
        json['initiated_booking_count'] = await Booking.count({
            provider_id: req.id,
            status: sails.config.constants.BOOKING_STATUS_INITIATED,
        });
        json['inprogress_booking_count'] = await Booking.count({
            provider_id: req.id,
            status: sails.config.constants.BOOKING_STATUS_CONFIRMED,
        });
        json['completed_booking_count'] = await Booking.count({
            provider_id: req.id,
            status: {
                in: [
                    sails.config.constants.BOOKING_STATUS_ENDED,
                    sails.config.constants.BOOKING_STATUS_COMPLETED,
                ],
            },
        });
        const custProfileData = await CustomerProfile.getData(req.id);
        if (custProfileData && custProfileData.image != '') {
            json['image'] = Api.getActualImages(
                '/uploads/profile/',
                custProfileData.image
            );
        } else {
            json['image'] = Api.getBaseImages();
        }
        const providerProfileData = await ProviderProfile.getData(req.id);

        json['inbox_count'] = await Inbox.getUnread(req.id);
        json['inbox_count'] =
            Number(json['inbox_count']) > 25 ? '25+' : json['inbox_count'];
        json['due_amount'] = 0.0;
        json['last_paid_time'] = 0;
        if (providerProfileData) {
            const providerEarningAmount = await Booking.getProviderEarning(
                req.id
            );
            json['provider_earning_amount'] =
                providerEarningAmount.provider_earning_amount;
            json['slug'] = api.checkAttribute(providerProfileData.slug);
            json['type'] = api.checkAttribute(providerProfileData.type_id);
            json['description'] = api.checkAttribute(
                providerProfileData.description
            );
            json['businessName'] = api.checkAttribute(
                providerProfileData.business_name
            );
            json['is_featured'] = providerProfileData.is_featured;
            if (providerProfileData.established_on) {
                json['establishedOn'] = providerProfileData.established_on + '';
            } else {
                json['establishedOn'] = '';
            }
            json['due_amount'] = providerProfileData.due_amount
                ? providerProfileData.due_amount
                : 0.0;
            json['last_paid_time'] = providerProfileData.last_paid_time
                ? providerProfileData.last_paid_time
                : 0;
            json['bank_name'] = providerProfileData.bank_name
                ? providerProfileData.bank_name
                : '';
            json['account_number'] = providerProfileData.account_number
                ? providerProfileData.account_number
                : '';
            json['account_type'] = providerProfileData.account_type
                ? providerProfileData.account_type
                : '';
            json['instruction'] = providerProfileData.instruction
                ? providerProfileData.instruction
                : '';
            json['website'] = api.checkAttribute(providerProfileData.website);
            if (providerProfileData.logo) {
                json['proImage'] = Api.getActualImages(
                    '/uploads/profile/',
                    providerProfileData.logo
                );
            } else {
                json['proImage'] = Api.getBaseImages();
            }
            json['adminCut'] = providerProfileData.admin_cut;
        } else {
            json['proImage'] = Api.getBaseImages();
        }
        const providerEarningAmount = await Booking.getProviderEarning(req.id);
        json['provider_earning_amount'] =
            providerEarningAmount.provider_earning_amount;
        const providerServiceValue = await ProviderService.getProviderService(
            serviceId,
            req.id
        );
        if (providerServiceValue) {
            json['serviceName'] = await ProviderService.getName(
                providerServiceValue.id
            );
            json['servicePrice'] = providerServiceValue.price;
            json['proServiceId'] = providerServiceValue.id;
        }
        json['wallet'] = 0;
        var wallet = await Wallet.find({
            created_by: req.id,
        }).limit(1);
        if (wallet.length > 0) {
            json['wallet'] = wallet[0].balance;
        }

        json['status'] =
            api.checkAttribute(req.status) === 1 ? 'Active' : 'Inactive';

        var addresses = await UserAddress.find({
            created_by: req.id,
            status: sails.config.constants.STATUS_ACTIVE,
        }).sort('is_default DESC');
        var addressPacket = [];
        if (addresses.length > 0) {
            for (var i = 0; i < addresses.length; i++) {
                addressPacket[i] = UserAddress.getJson(addresses[i]);
                addressPacket[i].key = addresses[i].id;
            }
        }
        json['addresses'] = addressPacket;
        var existingServiceIds = [],
            categoryModel = [];

        var existing = await ProviderService.find({
            created_by: req.id,
            status: sails.config.constants.STATUS_ACTIVE,
            is_deleted: sails.config.constants.IS_ACTIVE,
        });

        if (existing.length > 0) {
            for (var i = 0; i < existing.length; i++) {
                if (
                    typeof existingServiceIds[existing[i].category_id] !=
                    'object'
                ) {
                    existingServiceIds[existing[i].category_id] = [];
                }
                existingServiceIds[existing[i].category_id].push(
                    existing[i].service_id
                );
            }
        }

        var allCategories = await Category.find({
            status: sails.config.constants.STATUS_ACTIVE,
        });

        if (allCategories.length > 0) {
            for (x in allCategories) {
                var usedIds =
                    typeof existingServiceIds[allCategories[x].id] !=
                    'undefined'
                        ? existingServiceIds[allCategories[x].id]
                        : [];
                var data = await Category.getMyJson(
                    allCategories[x].id,
                    usedIds,
                    'false',
                    req.id
                );
                categoryModel.push(data);
            }
        }
        var businessHours = await ProviderBusinessHours.find({
            created_by: req.id,
        }).limit(1);
        if (businessHours && businessHours.length > 0) {
            json['workingHours'] = await ProviderBusinessHours.getJson(
                businessHours[0]
            );
        }
        json['categories'] = categoryModel;
        const newJson = {
            ...json,
            ...json['proImage'],
        };
        return newJson;
    },

    sendOTP: async function (user, generatedOtp) {
        try {
            let twilioBlock = await sails.helpers.sms.with({
                otp: generatedOtp,
                number: user.country_code + user.phone,
            });
            if (twilioBlock.statusCode === 200) {
                return { status: 200 };
            } else {
                if (twilioBlock.code === 20003) {
                    return {
                        status: 000,
                        message: sails.__('No Twilio'),
                        code: 000,
                    };
                } else {
                    return {
                        status: twilioBlock.statusCode,
                        message: twilioBlock.message,
                        code: twilioBlock.code,
                    };
                }
            }
        } catch (err) {
            return {
                status: 000,
                message: sails.__('No Twilio'),
                code: 000,
            };
        }
    },
};
