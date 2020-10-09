const api = require('../../../models/Api');

module.exports = async function udpateThirdparty(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    try {
        var settings = await Settings.find({
            status: sails.config.constants.STATUS_ACTIVE
        }).limit(1);
        if (settings.length > 0) {
            var set = {
                WALLET_ACTIVE: api.checkIncomingAttribute(
                    req.param('walletStatus', settings[0].WALLET_ACTIVE)
                ),
                CARD_ACTIVE: api.checkIncomingAttribute(
                    req.param('cardstatus', settings[0].CARD_ACTIVE)
                ),
                COD_ACTIVE: api.checkIncomingAttribute(
                    req.param('codStatus', settings[0].COD_ACTIVE)
                ),
                AWS_BUCKET_ACTIVE: api.checkIncomingAttribute(
                    req.param('awsBucketStatus', settings[0].AWS_BUCKET_ACTIVE)
                ),
                WALLET_PREFIX: api.checkIncomingAttribute(
                    req.param('walletPrefix', settings[0].WALLET_PREFIX)
                ),
                CARD_LIMIT: api.checkIncomingAttribute(
                    req.param('cardLimit', settings[0].CARD_LIMIT)
                ),
                SERVICE_COUNT: api.checkIncomingAttribute(
                    req.param('servicesLimit', settings[0].SERVICE_COUNT)
                ),
                GOOGLE_MAP_KEY: api.checkIncomingAttribute(
                    req.param('google_map_key', settings[0].GOOGLE_MAP_KEY)
                ),
                CURRENCY: api.checkIncomingAttribute(
                    req.param('currency', settings[0].CURRENCY)
                ),
                CURRENCY_SYMBOL: api.checkIncomingAttribute(
                    req.param('currencySymbol', settings[0].CURRENCY_SYMBOL)
                ),
                DEFAULT_ADMIN_CUT: api.checkIncomingAttribute(
                    req.param('defaultAdminCut', settings[0].DEFAULT_ADMIN_CUT)
                ),
                AWS_BUCKET_URL: api.checkIncomingAttribute(
                    req.param('awsBucketUrl', settings[0].AWS_BUCKET_URL)
                ),
                AWS_BUCKET_KEY: api.checkIncomingAttribute(
                    req.param('awsBucketKey', settings[0].AWS_BUCKET_KEY)
                ),
                AWS_BUCKET_SECRET: api.checkIncomingAttribute(
                    req.param('awsBucketSecret', settings[0].AWS_BUCKET_SECRET)
                ),
                AWS_BUCKET_NAME: api.checkIncomingAttribute(
                    req.param('awsBucketName', settings[0].AWS_BUCKET_NAME)
                ),
                STRIPE_SECRET: api.checkIncomingAttribute(
                    req.param('stripeSecret', settings[0].STRIPE_SECRET)
                ),
                STRIPE_PUBLIC: api.checkIncomingAttribute(
                    req.param('stripePublic', settings[0].STRIPE_PUBLIC)
                ),
                CANCELLATION_FEE: api.checkIncomingAttribute(
                    req.param('cancellationFee', settings[0].CANCELLATION_FEE)
                ),
                CANCELLATION_MINUTES: api.checkIncomingAttribute(
                    req.param(
                        'cancellationMinutes',
                        settings[0].CANCELLATION_MINUTES
                    )
                ),
                TWILIO_PHONE: api.checkIncomingAttribute(
                    req.param('twilioPhone', settings[0].TWILIO_PHONE)
                ),
                ONESIGNAL_AUTH_KEY: api.checkIncomingAttribute(
                    req.param(
                        'onesignalAuthKey',
                        settings[0].ONESIGNAL_AUTH_KEY
                    )
                ),
                ONESIGNAL_CUSTOMER_APP_ID: api.checkIncomingAttribute(
                    req.param(
                        'onesignalCustomerAppId',
                        settings[0].ONESIGNAL_CUSTOMER_APP_ID
                    )
                ),
                ONESIGNAL_PROVIDER_APP_ID: api.checkIncomingAttribute(
                    req.param(
                        'onesignalProviderAppId',
                        settings[0].ONESIGNAL_PROVIDER_APP_ID
                    )
                ),
                ONESIGNAL_REST_CUSTOMERKEY: api.checkIncomingAttribute(
                    req.param(
                        'onesignalRestCustomerkey',
                        settings[0].ONESIGNAL_REST_CUSTOMERKEY
                    )
                ),
                ONESIGNAL_REST_PROVIDERKEY: api.checkIncomingAttribute(
                    req.param(
                        'onesignalRestProviderkey',
                        settings[0].ONESIGNAL_REST_PROVIDERKEY
                    )
                ),
                TWILIO_ACCOUNT_SID: api.checkIncomingAttribute(
                    req.param(
                        'twilioAccountSid',
                        settings[0].TWILIO_ACCOUNT_SID
                    )
                ),
                TWILIO_AUTH_TOKEN: api.checkIncomingAttribute(
                    req.param('twilioAuthToken', settings[0].TWILIO_AUTH_TOKEN)
                ),
                IP_STACK_KEY: api.checkIncomingAttribute(
                    req.param('ipStackKey', settings[0].IP_STACK_KEY)
                ),
                CANCELLATION_MINUTES: api.checkIncomingAttribute(
                    req.param(
                        'cancellationMinutes',
                        settings[0].CANCELLATION_MINUTES
                    )
                )
            };
            await Settings.update({
                status: sails.config.constants.STATUS_ACTIVE
            }).set(set);
            response.status = 'OK';
            response.message = sails.__(
                'Third-party settings updated successfully, changes will be reflected on app restart'
            );
            const loadedSettings = await Settings.find({
                status: sails.config.constants.STATUS_ACTIVE
            }).limit(1);
            if (loadedSettings.length > 0) {
                sails.config.dynamics = loadedSettings[0];
            }
            return res.json(response);
        }
        response.message = sails.__('Settings not found');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
