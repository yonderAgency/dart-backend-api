const handleResponse = async categoryItem => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        Banners.create(categoryItem, function(err, banner) {
            if (err) {
                temp.message = err.details;
                return resolve(temp);
            }
            temp.status = 'OK';
            temp.message = sails.__('Banner created successfully');
            return resolve(temp);
        });
    });
};

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const loggedInUser = req.authUser.id;
    const title = req.param('title');
    const description = req.param('description');
    var file = req.param('image');

    if (typeof title == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var fileName = '';
        if (typeof file != 'undefined' && file && file.length > 0) {
            var randomCode = await Api.generatedCode(32);
            const split = file.split(';')[0];
            const ext = split.match(/jpeg|png/)[0];
            if (ext) {
                fileName = randomCode + '.' + ext;
            }
            const data = file.replace(/^data:image\/\w+;base64,/, '');
            const buffer = new Buffer(data, 'base64');
            await Api.uploadBanner(
                sails.config.appPath + '/assets/uploads/banners',
                fileName,
                buffer
            );
            var categoryItem = {
                title: title,
                image: fileName,
                created_by: loggedInUser,
                description: description
            };
            const tempResponse = await handleResponse(categoryItem);
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        } else {
            response.message = sails.__('You must select an image');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
