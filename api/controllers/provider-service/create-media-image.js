module.exports = async function createMediaImage(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var file = req.file('file');
    const index = req.param('index');
    const serviceId = req.param('serviceId');
    const createdId = req.authUser.id;
    var values = ['0', '1', '2', '3'];
    var found = values.includes(index);
    if (!found) {
        response.message = sails.__(
            'Unable to get response from server, please check your network settings.'
        );
        return res.send(response);
    }
    if (typeof file == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        let filename = await Api.uploadFileImage(file, '/media');
        var proService = await ProviderService.find({
            service_id: serviceId,
            created_by: createdId
        }).limit(1);

        if (proService.length > 0) {
            var imageModel = await ProviderServiceImage.find({
                provider_service_id: proService[0].id,
                created_by: createdId,
                status: sails.config.constants.STATUS_ACTIVE
            }).limit(1);
            if (imageModel.length > 0 && imageModel[0].file.length > 0) {
                if (filename != '') {
                    var existing = imageModel[0].file;
                    var submitted = false;
                    for (var x in existing) {
                        if (existing[x].id == index) {
                            submitted = true;
                            existing[x].filename = filename;
                            break;
                        }
                    }

                    if (submitted == false) {
                        existing.push({
                            id: index,
                            filename: filename
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
                var existing = [];
                existing.push({
                    id: index,
                    filename: filename
                });
                await ProviderServiceImage.create({
                    provider_service_id: proService[0].id,
                    created_by: createdId,
                    file: existing
                });

                response.status = 'OK';
                response.message = sails.__('Picture Uploaded Successfully');
                return res.json(response);
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
