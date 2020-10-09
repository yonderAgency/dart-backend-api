module.exports = async function createMediaImage(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var file = req.param('file');
    const index = req.param('index');
    const serviceId = req.param('serviceId');
    const categoryId = req.param('categoryId');
    const createdId = req.authUser.id;

    if (typeof file == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var proService = await ProviderService.find({
            service_id: serviceId,
            category_id: categoryId,
            created_by: createdId
        }).limit(1);
        if (proService.length > 0) {
            let imageModel = await ProviderServiceImage.find({
                provider_service_id: proService[0].id,
                created_by: createdId,
                status: sails.config.constants.STATUS_ACTIVE
            }).limit(1);
            if (imageModel.length > 0 && imageModel[0].file.length > 0) {
                var randomCode = await Api.generatedCode(32);
                const split = file.split(';')[0];
                const ext = split.match(/jpeg|png/)[0];
                if (ext) {
                    fileName = randomCode + '.' + ext;
                }
                const data = file.replace(/^data:image\/\w+;base64,/, '');
                const buffer = new Buffer(data, 'base64');
                await Api.uploadImage(
                    sails.config.appPath + '/assets/uploads/media',
                    fileName,
                    buffer
                );
                if (fileName != '') {
                    var existing = imageModel[0].file;
                    var submitted = false;
                    for (var x in existing) {
                        if (existing[x].id == index + '') {
                            submitted = true;
                            existing[x].filename = fileName;
                            break;
                        }
                    }
                    if (submitted == false) {
                        existing.push({
                            id: index + '',
                            filename: fileName
                        });
                    }
                    await ProviderServiceImage.update({
                        id: imageModel[0].id
                    }).set({
                        file: existing
                    });
                    response.status = 'OK';
                    response.message = sails.__(
                        'Picture uploaded successfully'
                    );
                    return res.json(response);
                } else {
                    response.message = sails.__('Unable to upload file');
                    return res.json(response);
                }
            } else {
                var randomCode = await Api.generatedCode(32);
                const split = file.split(';')[0];
                const ext = split.match(/jpeg|png/)[0];
                if (ext) {
                    fileName = randomCode + '.' + ext;
                }
                const data = file.replace(/^data:image\/\w+;base64,/, '');
                const buffer = new Buffer(data, 'base64');
                await Api.uploadImage(
                    sails.config.appPath + '/assets/uploads/media',
                    fileName,
                    buffer
                );
                if (fileName != '') {
                    var existing = [];
                    existing.push({
                        id: index + '',
                        filename: fileName
                    });
                    await ProviderServiceImage.create({
                        provider_service_id: proService[0].id,
                        created_by: createdId,
                        file: existing
                    });
                    response.status = 'OK';
                    response.message = sails.__(
                        'Picture Uploaded Successfully'
                    );
                    return res.json(response);
                } else {
                    response.message = sails.__('Unable to upload file');
                    return res.json(response);
                }
            }
        } else {
            response.message = sails.__(
                'Cannot find selected service, please try again'
            );
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
