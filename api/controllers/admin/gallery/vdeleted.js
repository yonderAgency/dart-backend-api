module.exports = async function vdeleted(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var ids = req.param('ids');

    if (!Array.isArray(ids)) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (ids.length > 0) {
            for (x in ids) {
                var packet = ids[x].split('-');
                var tempId = packet[0];
                var fileId = packet[1];
                var gallery = await ProviderServiceVideo.find({
                    id: tempId
                }).limit(1);

                if (gallery.length > 0) {
                    var files = gallery[0].url;
                    var newFiles = [];
                    for (y in gallery[0].url) {
                        if (gallery[0].url[y].id == fileId) {
                            newFiles = files.filter(function(obj) {
                                return obj.id !== gallery[0].url[y].id;
                            });
                        }
                    }
                    await ProviderServiceVideo.update({
                        id: tempId
                    }).set({
                        url: newFiles
                    });
                }
            }
            response.status = 'OK';
            response.message = sails.__('Gallery video deleted');
            return res.json(response);
        } else {
            response.message == sails.__('Invalid request');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
