const moment = require('moment');

module.exports = async function providerDetail(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.param('providerId');
    const slug = req.param('slug');
    const day = req.param('day');
    const offset = req.param('offset') ? req.param('offset') : 360;

    if (typeof day == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var userId = null;
        if (req.headers['x-auth-token']) {
            userId = await Api.getLoggedInUserId(req.headers);
        }
        var ipAddress = req.ip;
        if (ipAddress.substr(0, 7) == '::ffff:') {
            ipAddress = ipAddress.substr(7);
        }
        var provider = await ProviderProfile.find({
            created_by: providerId,
        }).limit(1);
        if (slug && slug !== 'undefined') {
            provider = await ProviderProfile.find({
                where: { slug: slug },
            }).limit(1);
        }
        if (provider && provider.length > 0) {
            var user = await User.find({ id: provider[0].created_by });
            var checkProvider = await User.checkVerifiedProvider(user[0]);
            if (checkProvider) {
                let checkBusinessHours = await Api.checkForBusinessHours(
                    user[0].id,
                    day,
                    offset
                );
                if (checkBusinessHours) {
                    const detail = await User.getProviderJson(
                        user[0],
                        null,
                        userId,
                        true,
                        req.location
                    );
                    if (detail) {
                        var referenceId = userId;
                        if (referenceId == null || referenceId == '') {
                            referenceId = req.ip;
                        }
                        var providerLog = await ProviderLog.find({
                            created_by: referenceId,
                            provider_id: user[0].id,
                            created_at: {
                                '<':
                                    moment().valueOf() +
                                    sails.config.constants
                                        .RECENT_CHECK_MILLISECONDS,
                            },
                        });
                        if (providerLog && providerLog.length > 0) {
                            await ProviderLog.update({
                                created_by: referenceId,
                                provider_id: user[0].id,
                                ip: ipAddress,
                            }).set({
                                created_at: moment().valueOf(),
                            });
                        } else {
                            await ProviderLog.create({
                                provider_id: user[0].id,
                                created_by: referenceId,
                                ip: ipAddress,
                            });
                        }
                        if (typeof day != 'undefined') {
                            const businessHours = await ProviderBusinessHours.find(
                                {
                                    created_by: user[0].id,
                                }
                            ).limit(1);
                            var temp = null;
                            if (businessHours && businessHours.length > 0) {
                                for (x in businessHours[0].timing_packet) {
                                    if (
                                        businessHours[0].timing_packet[x].key ==
                                        day
                                    ) {
                                        temp =
                                            businessHours[0].timing_packet[x];
                                    }
                                }
                                detail['businessHours'] = temp;
                            }
                        }
                        response.message = sails.__('Success');
                        response.status = 'OK';
                        response.data = detail;
                        return res.json(response);
                    }
                } else {
                    response.message = sails.__(
                        'Sorry, this provider is not entertaining any requests right now'
                    );
                    return res.json(response);
                }
            } else {
                response.message = sails.__(
                    'Sorry, this provider is not available right now'
                );
                return res.json(response);
            }
        } else {
            response.message = sails.__('No provider found');
            return res.json(response);
        }
    } catch (err) {
        console.log({ err });
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
