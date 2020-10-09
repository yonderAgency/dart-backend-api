module.exports = async function content(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    try {
        let data = sails.config.constants.DEFAULT_WECOME_DATA;
        let welcomeScreens = await WelcomeScreens.find({
            status: sails.config.constants.STATUS_ACTIVE
        });
        if (welcomeScreens && welcomeScreens.length > 0) {
            data = [];
            for (let x in welcomeScreens) {
                data.push(await WelcomeScreens.getJson(welcomeScreens[x]));
            }
        }
        response.status = 'OK';
        response.message = sails.__('Success');
        response.data = data;
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
