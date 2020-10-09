const handleResponse = async serviceItem => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        Service.create(serviceItem, function(err, service) {
            if (err) {
                temp.message = err.details;
                return resolve(temp);
            }
            temp.status = 'OK';
            temp.message = sails.__('Service created successfully');
            return resolve(temp);
        });
    });
};

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedInUser = req.authUser.id;

    const name = req.param('name');
    const status = req.param('status');
    const categoryId = req.param('categoryId');
    const description = req.param('description');
    const slug = await Service.getSlug(name);
    var file = req.param('image');

    if (typeof name == 'undefined' || typeof categoryId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var fileName = '';
        if (typeof file != 'undefined' && file != null && file != '') {
            var randomCode = await Api.generatedCode(32);
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
                name: name,
                slug: slug,
                category_id: categoryId,
                status: status,
                image: fileName,
                created_by: loggedInUser,
                description: description
            };
            const tempResponse = await handleResponse(serviceItem);
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        } else {
            var serviceItem = {
                name: name,
                slug: slug,
                category_id: categoryId,
                status: status,
                image: null,
                created_by: loggedInUser,
                description: description
            };
            const tempResponse = await handleResponse(serviceItem);
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
