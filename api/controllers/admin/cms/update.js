const api = require('../../../models/Api.js');

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const id = req.param('id');

    if (typeof id == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    var cms = await Cms.find({
        id: id
    }).limit(1);

    if (!cms || cms.length == 0) {
        response.message = sails.__('CMS page not found');
        return res.send(response);
    }

    try {
        if (cms && cms.length > 0) {
            await Cms.update({
                id: id
            }).set({
                title: api.checkIncomingAttribute(
                    req.param('title'),
                    cms[0].title
                ),
                sub_title: api.checkIncomingAttribute(
                    req.param('subTitle'),
                    cms[0].sub_title
                ),
                description: api.checkIncomingAttribute(
                    req.param('description'),
                    cms[0].description
                ),
                meta_title: api.checkIncomingAttribute(
                    req.param('metaTitle'),
                    cms[0].meta_title
                ),
                meta_description: api.checkIncomingAttribute(
                    req.param('metaDescription'),
                    cms[0].meta_description
                ),
                meta_keywords: api.checkIncomingAttribute(
                    req.param('metaKeywords'),
                    cms[0].meta_keywords
                ),
                status: api.checkIncomingAttribute(
                    req.param('status'),
                    cms[0].status
                )
            });
            response.status = 'OK';
            response.message = sails.__('CMS page updated successfully');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
