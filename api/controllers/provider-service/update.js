module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const createdBy = req.authUser.id;
    const proServiceId = req.param('proServiceId');
    var costPrice = req.param('costPrice');
    var file = req.param('image');
    var package = {
        addressIds: req.param('addressIds'),
        price: req.param('price'),
        description: req.param('description'),
        status: req.param('status'),
        costPrice: req.param('costPrice'),
        categoryId: req.param('categoryId'),
        serviceId:req.param('serviceId'),
        serviceName:req.param('serviceName')
    };
   
    if(package.price == null) {
        price = costPrice;
    }
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
            created_by: createdBy
        });
        var fileName = createdService[0].image;

        if (createdService.length > 0) {
            if (typeof file != 'undefined' && file && file.length > 0) {
                var randomCode = await Api.generatedCode(32);
                const split = file.split(';')[0];
                const ext = split.match(/jpeg|png/)[0];
                if (ext) {
                    fileName = randomCode + '.' + ext;
                }

                const data = file.replace(/^data:image\/\w+;base64,/, '');
                const buffer = new Buffer(data, 'base64');

                await Api.uploadImage(
                    sails.config.appPath + '/assets/uploads/service',
                    fileName,
                    buffer
                );

                await Service.update({
                    id: createdService[0].service_id
                }).set({ image: fileName });
            }

            await ProviderService.update({
                id: proServiceId,
                created_by: createdBy
            }).set({
                cost_price: costPrice,
                category_id:package.categoryId,
                service_id:package.serviceId,
                name:package.serviceName,
                address_ids: package.addressIds,
                price: package.price,
                image: fileName,
                description: package.description,
                status: package.status
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
      console.log({err});
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
