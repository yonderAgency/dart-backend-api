module.exports = async function (req, res, proceed) {
    sails.hooks.i18n.setLocale(Api.getLocalization(req.headers));
    const settings = await Settings.find({
        status: sails.config.constants.STATUS_ACTIVE,
    }).limit(1);
    if (settings.length > 0) {
        if (settings[0].MAINTAINENCE_MODE) {
            var response = {};
            response.status = 'MAINTAINENCE';
            response.message = sails.__(
                'Application is under maintainence, please try again after sometime'
            );
            return res.send(response);
        }
    } else {
        var response = {};
        response.status = 'MAINTAINENCE';
        response.message = sails.__(
            'Application is under maintainence, please try again after sometime'
        );
        return res.send(response);
    }

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
                zip: ipData.zip,
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
        locationType: locationType,
    };
    return proceed();
};
