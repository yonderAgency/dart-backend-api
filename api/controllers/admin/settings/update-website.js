var fs = require('fs');
const path = require('path');
const api = require('../../../models/Api.js');

const handleResponse = async set => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        Settings.update({
            status: sails.config.constants.STATUS_ACTIVE
        })
            .set(set)
            .exec(function(err, result) {
                if (err) {
                    sails.sentry.captureException(err);
                    temp.message = err.details;
                    return reject(temp);
                }
                temp.status = 'OK';
                temp.message = sails.__(
                    'Website settings saved successfully, changes will be reflected on app restart'
                );
                return resolve(temp);
            });
    });
};

module.exports = async function udpateWebsite(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var settings = await Settings.find({
        status: sails.config.constants.STATUS_ACTIVE
    }).limit(1);
    try {
        if (settings.length > 0) {
            var set = {
                PHONE_NUMBER: api.checkIncomingAttribute(
                    req.param('phone'),
                    settings[0].PHONE_NUMBER
                ),
                BOOKING_PREFIX: api.checkIncomingAttribute(
                    req.param('bookingPrefix'),
                    settings[0].BOOKING_PREFIX
                ),
                FACEBOOK: req.param('fb'),
                INSTAGRAM: req.param('insta'),
                YOUTUBE: req.param('youtube'),
                LINKEDIN: req.param('linkedin'),
                SKYPE: req.param('skype'),
                ADDRESS_LINE1: api.checkIncomingAttribute(
                    req.param('address1'),
                    settings[0].ADDRESS_LINE1
                ),
                ADDRESS_LINE2: api.checkIncomingAttribute(
                    req.param('address2'),
                    settings[0].ADDRESS_LINE2
                ),
                ABOUT_US: api.checkIncomingAttribute(
                    req.param('about'),
                    settings[0].ABOUT_US
                ),
                AR: api.checkIncomingAttribute(req.param('ar'), settings[0].AR),
                R1: api.checkIncomingAttribute(req.param('r1'), settings[0].R1),
                R2: api.checkIncomingAttribute(req.param('r2'), settings[0].R2),
                R3: api.checkIncomingAttribute(req.param('r3'), settings[0].R3),
                ANDROID_CUSTOMER_APP_LINK: api.checkIncomingAttribute(
                    req.param('androidCustomerAppLink'),
                    settings[0].ANDROID_CUSTOMER_APP_LINK
                ),
                IOS_CUSTOMER_APP_LINK: api.checkIncomingAttribute(
                    req.param('iosCustomerAppLink'),
                    settings[0].IOS_CUSTOMER_APP_LINK
                ),
                ANDROID_PROVIDER_APP_LINK: api.checkIncomingAttribute(
                    req.param('androidProviderAppLink'),
                    settings[0].ANDROID_PROVIDER_APP_LINK
                ),
                IOS_PROVIDER_APP_LINK: api.checkIncomingAttribute(
                    req.param('iosProviderAppLink'),
                    settings[0].IOS_PROVIDER_APP_LINK
                ),
                ANDROID_DELIVERY_APP_LINK: api.checkIncomingAttribute(
                    req.param('androidDeliveryAppLink'),
                    settings[0].ANDROID_DELIVERY_APP_LINK
                ),
                IOS_DELIVERY_APP_LINK: api.checkIncomingAttribute(
                    req.param('iosDeliveryAppLink'),
                    settings[0].IOS_DELIVERY_APP_LINK
                ),
                DELIVERY_COST: api.checkIncomingAttribute(
                    req.param('deliveryCost'),
                    settings[0].DELIVERY_COST
                ),
                MINIMUM_ORDER_AMOUNT: api.checkIncomingAttribute(
                    req.param('minimumOrderAmount'),
                    settings[0].MINIMUM_ORDER_AMOUNT
                )
            };
            var fileName = '';
            var file = req.param('logo');
            if (file && file.length > 0) {
                const data = file.replace(/^data:image\/\w+;base64,/, '');
                var buffer = new Buffer(data, 'base64');
                fileName = 'website-logo.png';
                fs.writeFile(
                    path.resolve(
                        sails.config.appPath,
                        'assets/uploads/website'
                    ) +
                        '/' +
                        fileName,
                    buffer,
                    async function(err) {
                        if (err) {
                            sails.sentry.captureException(err);
                            response.message = err.details;
                            return res.send(response);
                        }
                        const tempResponse = await handleResponse(set);
                        if (tempResponse.status == 'OK') {
                            response.status = 'OK';
                            response.message = tempResponse.message;
                            const loadedSettings = await Settings.find({
                                status: sails.config.constants.STATUS_ACTIVE
                            }).limit(1);
                            if (loadedSettings.length > 0) {
                                sails.config.dynamics = loadedSettings[0];
                            }
                            return res.send(response);
                        }
                        response.message = tempResponse.message;
                        return res.send(response);
                    }
                );
            } else {
                const tempResponse = await handleResponse(set);
                const loadedSettings = await Settings.find({
                    status: sails.config.constants.STATUS_ACTIVE
                }).limit(1);
                if (loadedSettings.length > 0) {
                    sails.config.dynamics = loadedSettings[0];
                }
                if (tempResponse.status == 'OK') {
                    response.status = 'OK';
                    response.message = tempResponse.message;
                    return res.send(response);
                }
            }
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
