const api = require('../../../models/Api');

module.exports = async function updateBasic(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    try {
        var settings = await Settings.find({
            status: sails.config.constants.STATUS_ACTIVE
        }).limit(1);

        if (settings.length > 0) {
            var fakeDomains = req.param('excludedDomains');
            if (fakeDomains.length > 0) {
                fakeDomains = fakeDomains.split(',');
            }
            let defaultCountry = req.param('country');
            if (
                typeof defaultCountry == 'undefined' ||
                defaultCountry == '' ||
                defaultCountry == null
            ) {
                defaultCountry = settings[0].DEFAULT_COUNTRY;
            }
            let defaultCountryCode = User.getCountryCode(defaultCountry);
            await Settings.update({
                status: sails.config.constants.STATUS_ACTIVE
            }).set({
                COMPANY_NAME: api.checkIncomingAttribute(
                    req.param('companyName'),
                    settings[0].COMPANY_NAME
                ),
                APPLICATION_NAME: api.checkIncomingAttribute(
                    req.param('appName'),
                    settings[0].APPLICATION_NAME
                ),
                ADMIN_EMAIL: api.checkIncomingAttribute(
                    req.param('adminEmail'),
                    settings[0].ADMIN_EMAIL
                ),
                MAINTAINENCE_MODE: api.checkIncomingAttribute(
                    req.param('maintainence'),
                    settings[0].MAINTAINENCE_MODE
                ),
                SEO_TITLE: api.checkIncomingAttribute(
                    req.param('seoTitle'),
                    settings[0].SEO_TITLE
                ),
                SEO_DESCRIPTION: api.checkIncomingAttribute(
                    req.param('seoDescription'),
                    settings[0].SEO_DESCRIPTION
                ),
                SEO_KEYWORDS: api.checkIncomingAttribute(
                    req.param('seoKeywords'),
                    settings[0].SEO_KEYWORDS
                ),
                LANGUAGES: api.checkIncomingAttribute(
                    req.param('languages'),
                    settings[0].LANGUAGES
                ),
                DEFAULT_COUNTRY: defaultCountry,
                DEFAULT_COUNTRY_CODE: defaultCountryCode,
                SEARCH_RADIUS: api.checkIncomingAttribute(
                    req.param('radius'),
                    settings[0].SEARCH_RADIUS
                ),
                FAKE_DOMAINS: api.checkIncomingAttribute(
                    fakeDomains,
                    settings[0].FAKE_DOMAINS
                )
            });
            response.status = 'OK';
            response.message = sails.__(
                'Basic settings updated successfully, changes will be reflected on app restart'
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
