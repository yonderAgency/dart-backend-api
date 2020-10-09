const path = require('path');
const fs = require('fs');
module.exports = async function deleteDoc(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const id = req.param('providerId');
    try {
        let document = await ProviderDocument.findOne({
            where: {
                id: id
            }
        });
        if (!document) {
            throw new Error("File not found");
        }
        let documentPath = document.file;
        let fullDocPath = path.resolve(sails.config.appPath, 'assets/uploads/vendorDocs', documentPath);
        let fileExists = fs.existsSync(fullDocPath);
        if (fileExists) {
           fs.unlink(fullDocPath,function(){});
        }
        await ProviderDocument.destroyOne({
            where: {
                id: id
            }
        });
        response.status = 'OK';
        response.message = sails.__('Document deleted successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
