module.exports = async function(req, res, proceed) {
    sails.hooks.i18n.setLocale(Api.getLocalization(req.headers));
    var token = req.headers['x-auth-token'];
    var response = {
        status: 'AUTH',
        type: sails.config.constants.AUTH_TYPE_INVALID,
        message: sails.__('Invalid user')
    };

    let ipAddress = req.ip;
    let addressPacket = '';
    let latitude = req.headers['latitude'];
    let longitude = req.headers['longitude'];
    let locationType = sails.config.constants.LOCATION_TYPE_GPS;
    if (
        typeof latitude == 'undefined' ||
        typeof longitude == 'undefined' ||
        latitude == '' ||
        longitude == ''
    ) {
        ipAddress = Api.filterIp(req.ip + '');
        var ipData = await Api.getLocationByIp(ipAddress);
        if (ipData && ipData.latitude != null && ipData.longitude != null) {
            addressPacket = {
                continent_name: ipData.continent_name,
                country_code: ipData.country_code,
                country_name: ipData.country_name,
                region_code: ipData.region_code,
                region_name: ipData.region_name,
                city: ipData.city,
                zip: ipData.zip
            };
            latitude = ipData.latitude;
            longitude = ipData.longitude;
            locationType = sails.config.constants.LOCATION_TYPE_GPS;
        } else {
            latitude = sails.config.constants.DEFAULT_LATITUDE;
            longitude = sails.config.constants.DEFAULT_LONGITUDE;
            locationType = sails.config.constants.LOCATION_TYPE_IP;
        }
    }
    req.ip = ipAddress;
    req.location = {
        addressPacket: addressPacket,
        latitude: latitude,
        longitude: longitude,
        locationType: locationType
    };

    if (typeof token !== 'undefined') {
        var exists = await Token.find({
            token_value: token
        }).limit(1);
        if (exists.length > 0) {
            var user = await User.find({
                where: {
                    id: exists[0].owner,
                    role: {
                        in: [
                            sails.config.constants.ROLE_PROVIDER,
                            sails.config.constants.ROLE_CUSTOMER
                        ]
                    }
                },
                limit: 1
            });
            if (user && user.length > 0) {
                sails.hooks.i18n.setLocale(
                    Api.getLocalization(req.headers, user[0])
                );
                const settings = await Settings.find({
                    status: sails.config.constants.STATUS_ACTIVE
                }).limit(1);
                if (settings.length > 0) {
                    if (settings[0].MAINTAINENCE_MODE) {
                        response.type =
                            sails.config.constants.AUTH_TYPE_MAINTAINENCE;
                        response.message = sails.__(
                            'Application is under maintainence, please try again after sometime'
                        );
                        return res.send(response);
                    }
                    if (
                        user[0].is_blocked == sails.config.constants.IS_BLOCKED
                    ) {
                        response.type =
                            sails.config.constants.AUTH_TYPE_BLOCKED;
                        response.message = sails.__(
                            'Your account is blocked by the admin'
                        );
                        return res.send(response);
                    }
                    if (
                        user[0].is_deleted == sails.config.constants.IS_DELETED
                    ) {
                        response.type =
                            sails.config.constants.AUTH_TYPE_DEACTIVATED;
                        response.message = sails.__(
                            'Your account is removed by the admin'
                        );
                        return res.send(response);
                    }
                    if (req.method == 'GET' || req.method == 'POST') {
                        req.authUser = user[0];
                        return proceed();
                    }
                } else {
                    response.type =
                        sails.config.constants.AUTH_TYPE_MAINTAINENCE;
                    response.message = sails.__(
                        'Application is under maintainence, please try again after sometime'
                    );
                    return res.send(response);
                }
            } else {
                return res.send(response);
            }
        } else {
            return res.send(response);
        }
    } else {
        return res.send(response);
    }
};
