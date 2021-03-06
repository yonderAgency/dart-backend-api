const axios = require('axios');
var https = require('https');
module.exports = async function view(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    let id = req.param('id');

    try {
        let url =
            sails.config.constants.DELIVERY_URL +
            'v1/api/parenthandler/guyview';
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        let axiosReturn = await axios({
            method: 'post',
            url: url,
            headers: {
                'x-auth-token': sails.config.constants.DELIVERY_KEY
            },
            httpsAgent: httpsAgent,
            data: {
                id: id
            }
        });
        if (axiosReturn.data && axiosReturn.data.status == 'OK') {
            response.data = axiosReturn.data.data;
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
