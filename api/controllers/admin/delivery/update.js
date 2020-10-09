const axios = require('axios');
var https = require('https');
module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };

    const userId = req.param('userId');
    const status = req.param('status');

    if (typeof userId == 'undefined' || typeof status == 'undefined') {
        response.status = 'NOK';
        response.message = sails.__('Invalid data');
        response.data.bookingList = [];
        return res.send(response);
    }

    try {
        let url =
            sails.config.constants.DELIVERY_URL +
            'v1/api/parenthandler/updateguy';
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        let axiosReturn = await axios({
            method: 'post',
            url: url,
            headers: {
                'x-auth-token': sails.config.constants.DELIVERY_KEY
            },
            httpsAgent: httpsAgent,
            data: {
                status: status,
                id: userId
            }
        });
        if (axiosReturn.data && axiosReturn.data.status == 'OK') {
            response.data =
                axiosReturn.data.data != null ? axiosReturn.data.data : [];
            response.status = 'OK';
            response.message = axiosReturn.data.message;
            return res.json(response);
        } else {
            response.data = json;
            response.status = 'NOK';
            response.message = sails.__('Success');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
