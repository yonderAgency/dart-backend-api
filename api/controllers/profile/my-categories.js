module.exports = async function myCategories(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var user_id = req.authUser.id;

    try {
        var categoryDetail = await Category.getServices(user_id);
        response.status = 'OK';
        response.message = sails.__('Success');
        response.data = categoryDetail;
        return res.json(response);
    } catch (err) {
      
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
