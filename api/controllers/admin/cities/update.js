const api = require('../../../models/Api.js');

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    var city = await Cities.find({
        id: id
    }).limit(1);

    if (!city || city.length == 0) {
        response.message = sails.__('CMS page not found');
        return res.send(response);
    }

    try {
        if (city && city.length > 0) {
            await Cities.update({
                id: id
            }).set({
                
                city: api.checkIncomingAttribute(
                    req.param('city'),
                    city[0].city
                ),
                state: api.checkIncomingAttribute(
                    req.param('state'),
                    city[0].state
                ),
                country: api.checkIncomingAttribute(
                    req.param('country'),
                    city[0].country
                ),
                zipcode: api.checkIncomingAttribute(
                    req.param('zipcode'),
                    city[0].zipcode
                ),
                status: api.checkIncomingAttribute(
                    req.param('status'),
                    city[0].status
                )
            });
            response.status = 'OK';
            response.message = sails.__('CMS page updated successfully');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
