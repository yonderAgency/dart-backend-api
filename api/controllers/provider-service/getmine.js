module.exports = async function getmine(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const serviceList = [];
    var providerId = req.authUser.id;

    try {
        if (providerId) {
            var providerServices = await ProviderService.find({
                created_by: providerId
            }).sort('created_at DESC');
            if (providerServices.length > 0) {
                for (x in providerServices) {
                    serviceList.push(
                        await ProviderService.getJson(providerServices[x])
                    );
                }
                if (serviceList.length > 0) {
                    response.status = 'OK';
                    response.message = sails.__('Success');
                    response.data = serviceList;
                    return res.json(response);
                }
            } else {
                response.message = sails.__('No service found');
                return res.send(response);
            }
        } else {
            response.message = sails.__('No service found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
