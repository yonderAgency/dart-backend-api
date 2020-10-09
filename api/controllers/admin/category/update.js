const api = require('../../../models/Api.js');

const handleResponse = async (categoryItem, id) => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        if (id) {
            Category.update({
                id: id
            })
                .set(categoryItem)
                .exec(function(err, result) {
                    if (err) {
                        temp.message = err.details;
                        return resolve(temp);
                    }
                    temp.status = 'OK';
                    temp.message = sails.__('Category updated successfully');
                    return resolve(temp);
                });
        } else {
            temp.message = sails.__('Invalid request');
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

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    var oldCategoryPacket = await Category.find({
        id: id
    }).limit(1);

    if (
        typeof oldCategoryPacket == 'undefined' &&
        oldCategoryPacket &&
        oldCategoryPacket.length > 0
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    var file = req.param('image');
    try {
        var fileName = '';
        if (file && file.length > 0) {
            var randomCode = await Api.generatedCode(32);
            const split = file.split(';')[0];
            const ext = split.match(/jpeg|png/)[0];
            if (ext) {
                fileName = randomCode + '.' + ext;
            }
            const data = file.replace(/^data:image\/\w+;base64,/, '');
            const buffer = new Buffer(data, 'base64');
            await Api.uploadImage(
                sails.config.appPath + '/assets/uploads/category',
                fileName,
                buffer
            );
            var categoryItem = {
                name: api.checkIncomingAttribute(
                    name,
                    oldCategoryPacket[0].name
                ),
                image: fileName,
                status: api.checkIncomingAttribute(
                    status,
                    oldCategoryPacket[0].status
                ),
                description: api.checkIncomingAttribute(
                    description,
                    oldCategoryPacket[0].description
                )
            };
            const tempResponse = await handleResponse(
                categoryItem,
                oldCategoryPacket[0].id
            );
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        } else {
            var categoryItem = {
                name: api.checkIncomingAttribute(
                    name,
                    oldCategoryPacket[0].name
                ),
                status: api.checkIncomingAttribute(
                    status,
                    oldCategoryPacket[0].status
                ),
                description: api.checkIncomingAttribute(
                    description,
                    oldCategoryPacket[0].description
                )
            };
            const tempResponse = await handleResponse(
                categoryItem,
                oldCategoryPacket[0].id
            );
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
