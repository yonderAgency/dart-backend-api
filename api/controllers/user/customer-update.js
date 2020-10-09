const api = require('../../models/Api');
const moment = require('moment');

module.exports = async function customerUpdate(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const user = req.authUser;
    const name = req.param('name');
    const phone = req.param('phone');
    try {
        await User.update({
            id: user.id,
        }).set({
            phone: api.checkIncomingAttribute(phone, user.phone),
            name: api.checkIncomingAttribute(name, user.name),
            ipAddress: User.pushIpData(
                Api.filterIp(req.ip),
                user.ipAddress,
                req.options.action
            ),
            dob: moment(dob).valueOf(),
        });
        response.status = 'OK';
        response.message = sails.__('Details updated');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
