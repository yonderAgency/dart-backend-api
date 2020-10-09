module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const loggedInUser = req.authUser.id;

    const title = req.param('title');
    const sub_title = req.param('subTitle');
    const description = req.param('description');
    const meta_title = req.param('metaTitle');
    const meta_description = req.param('metaDescription');
    const meta_keywords = req.param('metaKeywords');
    const status = req.param('status');

    if (typeof title == 'undefined' || typeof description == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        const slug = await Cms.getSlug(title);
        await Cms.create({
            title: title,
            sub_title: sub_title,
            description: description,
            meta_title: meta_title,
            meta_description: meta_description,
            meta_keywords: meta_keywords,
            status: status,
            slug: slug,
            created_by: loggedInUser
        });
        response.status = 'OK';
        response.message = sails.__('CMS page created successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
