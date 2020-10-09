const axios = require('axios');
var https = require('https');
module.exports = async function addBankDetails(req, res) {
    try {
        var response = { status: 'NOK', message: '', data: [] };
        var userId = req.param('deliveryId');
        var bankName = req.param('bank_name');
        var accountType = req.param('account_type');
        var accountNumber = req.param('account_number');
        var instruction = req.param('instruction');

        if (typeof userId == 'undefined') {
            response.message = sails.__('Invalid request');
            return res.send(response);
        }
        let userDetails = {
            bankName: bankName ? bankName : '',
            accountType: accountType ? accountType : '',
            accountNumber: accountNumber ? accountNumber : '',
            instruction: instruction ? instruction : '',
            userId: userId
        };
        let url =
            sails.config.constants.DELIVERY_URL +
            'v1/api/parenthandler/bankDetail';
        const httpsAgent = new https.Agent({ rejectUnauthorized: false });
        let axiosReturn = await axios({
            method: 'post',
            url: url,
            headers: {
                'x-auth-token': sails.config.constants.DELIVERY_KEY
            },
            httpsAgent: httpsAgent,
            data: userDetails
        });
        if (axiosReturn.data && axiosReturn.data.status == 'OK') {
            response.data =
                axiosReturn.data.data != null ? axiosReturn.data.data : [];
            response.status = 'OK';
            response.message = axiosReturn.data.message;
            return res.json(response);
        } else {
            response.status = 'NOK';
            response.message = sails.__('Error');
            return res.json(response);
        }
    } catch (err) {
        console.log('\n error:', err.message);
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
