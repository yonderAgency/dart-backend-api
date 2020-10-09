const moment = require('moment');

module.exports = async function weblogin(req, res) {
    const response = { status: 'NOK', message: '', data: {} };
    // var image = req.file('image');
    const name = req.param('name');
    console.log(name);
    if (typeof name == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }
    console.log('Okay');
    try {
        // checkImage

        return res.send({
            status: 'OK',
            data: {
                dob: moment().subtract('19', 'years').format('MM-DD-YYYY'),
            },
        });
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
