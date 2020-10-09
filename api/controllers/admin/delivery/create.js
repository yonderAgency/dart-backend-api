const saltRounds = 10;
const path = require('path');
const bcrypt = require('bcrypt');
const userJson = require('../../../models/User.js');
const axios = require('axios');
var https = require('https');

module.exports = async function customerCreate(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var password = await Api.generatedCode(8);
    var existingUser;

    if (
        typeof req.param('firstname') == 'undefined' ||
        typeof req.param('lastname') == 'undefined' ||
        typeof req.param('email') == 'undefined' ||
        typeof req.param('phone') == 'undefined' ||
        typeof req.param('countrycode') == 'undefined' ||
        typeof req.param('licensenumber') == 'undefined' ||
        typeof req.param('dob') == 'undefined' ||
        typeof req.param('vat') == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    var userDetails = {
        first_name: req.param('firstname'),
        last_name: req.param('lastname'),
        email: req.param('email').toLowerCase(),
        phone_number: req.param('phone'),
        country_code: req.param('countrycode'),
        license_number: req.param('licensenumber'),
        dob: req.param('dob'),
        vat_number:req.param('vat'),
        lang:"en",
        password: password,
    };
    try {
        
                let url =
            sails.config.constants.DELIVERY_URL +
            'v1/api/parenthandler/guycreate';
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
               
               // response.data = json;
                response.status = 'NOK';
                response.message = sails.__('Error');
                return res.json(response);
            }

    
    } catch (err) {
       
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};


