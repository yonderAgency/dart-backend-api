const fs = require('fs');

const handleResponse = async categoryImage => {
    var temp = { status: 'NOK', message: 'File not found' };
    return new Promise(function(resolve, reject) {
        if (fs.existsSync('/assets/uploads/category/' + categoryImage)) {
            fs.unlink('/assets/uploads/category/' + categoryImage, err => {
                if (err) {
                    sails.sentry.captureException(err);
                    return resolve(err);
                }
                temp.status = 'OK';
                return resolve(temp);
            });
        }
        return resolve(temp);
    });
};

module.exports = async function deleted(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var ids = req.param('ids');

    if (!Array.isArray(ids) && ids.length <= 0) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        for (x in ids) {
            var packet = ids[x].split('-');
            var tempId = packet[0];
            var fileId = packet[1];
            var gallery = await ProviderServiceImage.find({
                id: tempId
            }).limit(1);

            if (gallery.length > 0) {
                var files = gallery[0].file;
                var newFiles = [];
                for (y in gallery[0].file) {
                    if (gallery[0].file[y].id == fileId) {
                        var resp = await handleResponse(
                            gallery[0].file[y].filename
                        );
                        resp.status = 'OK';
                        if (resp.status == 'OK') {
                            newFiles = files.filter(function(obj) {
                                return obj.id !== gallery[0].file[y].id;
                            });
                        } else {
                            response.message = sails.__(
                                'Unable to remove item'
                            );
                            if (resp.message != '') {
                                response.message = resp.message;
                            }
                            return res.json(response);
                        }
                    }
                }
                await ProviderServiceImage.update({
                    id: tempId
                }).set({
                    file: newFiles
                });
            }
        }
        response.status = 'OK';
        response.message = sails.__('Gallery item deleted');
        return res.json(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
