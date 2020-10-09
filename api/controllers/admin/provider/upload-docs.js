const path = require('path');
module.exports = async function uploadDocs(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    try {
        let file = req.file('docs');
        let uploadedFiles = await Api.uploadVendorDocs(file);
        if (uploadedFiles.length !== 0) {
            for (uploadedFile of uploadedFiles) {
                let docData = {
                    title: req.param('title'),
                    file: path.basename(uploadedFile.fd),
                    user_id: providerId
                };
                let vendorDoc = await ProviderDocument.create(docData);
            }
            response.status = 'OK';
            response.message = sails.__('Docs uploaded successfully');
        } else {
            response.message = sails.__('Please upload a file');
        }
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
