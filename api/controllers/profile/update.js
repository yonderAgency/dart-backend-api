const moment = require('moment');

module.exports = async function providerProfile(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var established = null;
    var providerPacket = {
        email: req.param('email'),
        name: req.param('name'),
        business_name: req.param('businessName'),
        established_on: req.param('establishedOn'),
        description: req.param('description'),
        type_id: req.param('typeId'),
        website: req.param('website'),
        phone: req.param('phone')
    };

    const userFound = req.authUser;
    try {
        await User.update({
            id: userFound.id
        }).set({
            name: Api.checkIncomingAttribute(req.param('name'), userFound.name),
            phone: Api.checkIncomingAttribute(
                req.param('phone'),
                userFound.phone
            ),
            ipAddress: User.pushIpData(
                Api.filterIp(req.ip),
                userFound.ipAddress,
                req.options.action
            )
        });
        if (providerPacket.established_on) {
            established = await sails.helpers.timestamp.with({
                datetime: moment(
                    new Date(providerPacket.established_on)
                ).format('YYYY-MM-DD HH:mm:ss')
            });
        }
        await ProviderProfile.update({
            created_by: userFound.id
        }).set({
            name: Api.checkIncomingAttribute(
                providerPacket.name,
                userFound.name
            ),
            business_name: Api.checkIncomingAttribute(
                providerPacket.business_name,
                userFound.business_name
            ),
            established_on: established,
            description: Api.checkIncomingAttribute(
                providerPacket.description,
                userFound.description
            ),
            website: Api.checkIncomingAttribute(
                providerPacket.website,
                userFound.website
            ),
            type_id: providerPacket.type_id
        });
        response.status = 'OK';
        response.message = sails.__('Details saved successfully');
        response.data.step = null;
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
