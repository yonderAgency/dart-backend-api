const handleResponse = async (serviceItem, id) => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        if (id) {
            Service.update({
                id: id
            })
                .set(serviceItem)
                .exec(function(err, result) {
                    if (err) {
                        temp.message = err.details;
                        return resolve(temp);
                    }
                    temp.status = 'OK';
                    temp.message = sails.__('Service updated successfully');
                    return resolve(temp);
                });
        } else {
            temp.message == sails.__('Invalid request');
            return resolve(temp);
        }
    });
};

module.exports = async function update(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const id = req.param('id');
    const name = req.param('name');
    const status = req.param('status');
    const description = req.param('description');
    const categoryId = req.param('categoryId');
    const slug = await Service.getSlug(name);
    var file = req.param('image');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    var oldServicePacket = await Service.find({
        id: id
    }).limit(1);

    if (
        typeof oldServicePacket == 'undefined' &&
        oldServicePacket &&
        oldServicePacket.length > 0
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    var file = req.param('image');

    try {
        var fileName = '';
        if (file && file.length > 0) {
            var randomCode = await Api.generatedCode(32);
            if (
                typeof oldServicePacket[0].image != 'undefined' &&
                oldServicePacket[0].image != null
            ) {
                var imageName = oldServicePacket[0].image.split('.');
                randomCode = imageName[0];
            }
            const split = file.split(';')[0];
            const ext = split.match(/jpeg|png/)[0];
            if (ext) {
                fileName = randomCode + '.' + ext;
            }
            const data = file.replace(/^data:image\/\w+;base64,/, '');
            const buffer = new Buffer(data, 'base64');
            await Api.uploadBanner(
                sails.config.appPath + '/assets/uploads/service',
                fileName,
                buffer
            );
            var serviceItem = {
                name: Api.checkIncomingAttribute(
                    name,
                    oldServicePacket[0].name
                ),
                slug: Api.checkIncomingAttribute(
                    slug,
                    oldServicePacket[0].slug
                ),
                category_id: Api.checkIncomingAttribute(
                    categoryId,
                    oldServicePacket[0].category_id
                ),
                status: Api.checkIncomingAttribute(
                    status,
                    oldServicePacket[0].status
                ),
                description: Api.checkIncomingAttribute(
                    description,
                    oldServicePacket[0].description
                ),
                image: fileName
            };
            const tempResponse = await handleResponse(serviceItem, id);
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        } else {
            var serviceItem = {
                name: Api.checkIncomingAttribute(
                    name,
                    oldServicePacket[0].name
                ),
                category_id: Api.checkIncomingAttribute(
                    categoryId,
                    oldServicePacket[0].category_id
                ),
                slug: Api.checkIncomingAttribute(
                    slug,
                    oldServicePacket[0].slug
                ),
                status: Api.checkIncomingAttribute(
                    status,
                    oldServicePacket[0].status
                ),
                description: Api.checkIncomingAttribute(
                    description,
                    oldServicePacket[0].description
                )
            };
            const tempResponse = await handleResponse(serviceItem, id);
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
