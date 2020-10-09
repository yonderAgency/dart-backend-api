module.exports = async function updateService(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const createdBy = req.authUser.id;
    const proServiceId = req.param('proServiceId');
    var costPrice = req.param('costPrice');
    var file = req.file('file');
    var package = {
        addressIds: req.param('addressIds'),
        price: req.param('price'),
        description: req.param('description'),
        status: req.param('status'),
        costPrice: req.param('costPrice'),
    };
    if (
        typeof proServiceId == 'undefined' ||
        typeof package.addressIds == 'undefined' ||
        typeof package.price == 'undefined' ||
        typeof package.description == 'undefined' ||
        typeof package.status == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var createdService = await ProviderService.find({
            id: proServiceId,
            created_by: createdBy,
        });
        if (createdService.length > 0) {
            let fileName = createdService[0].image;
            if (typeof file != 'undefined') {
                fileName = await Api.uploadFileImage(file, '/service');
            }
            await Service.update({
                id: createdService[0].service_id,
            }).set({ image: fileName });

            await ProviderService.update({
                id: proServiceId,
                created_by: createdBy,
            }).set({
                cost_price: costPrice,
                address_ids: JSON.parse(package.addressIds),
                price: package.price,
                image: fileName,
                description: package.description,
                status: package.status,
            });

            response.status = 'OK';
            response.message = sails.__('Service updated successfully');
            return res.json(response);
        } else {
            response.status = 'NOK';
            response.message = sails.__('Unable to update service');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
