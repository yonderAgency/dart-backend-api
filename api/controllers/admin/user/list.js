module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const role = req.param('role');

    if (typeof role == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var user_model = [];
        var users = await User.find({
            role: role 
        }).sort('created_at DESC');
        if (users.length > 0) {
            for (x in users) {
                user_model.push(await User.getJson(users[x]));
            }
            response.status = 'OK';
            response.message = sails.__('Success');
            response.data = user_model;
            return res.send(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('No user found');
            return res.send(response);
        }
    } catch (err) {
        
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
