const path = require('path');
const fs = require('fs');
module.exports = async function deleteDoc(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    const id = req.param('id');
    try {
        let document = await ProviderDocument.findOne({
            where: {
                id: id,
                user_id: providerId
            }
        });
        if (!document) {
            return res.notFound();
        }
        let documentPath = document.file;
        let fullDocPath = path.resolve(
            sails.config.appPath,
            'assets/uploads/vendorDocs',
            documentPath
        );
        if (fs.existsSync(fullDocPath)) {
            res.setHeader(
                'Content-disposition',
                'attachment; filename=' + document.file
            );
            let filestream = fs.createReadStream(fullDocPath);
            filestream.pipe(res);
        } else {
            return res.notFound();
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
