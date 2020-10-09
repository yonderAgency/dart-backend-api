module.exports = async function email(req, res) {
    var response = {
        status: 'NOK',
        message: ''
    };
    try {
        var user = await User.find({
            role: sails.config.constants.ROLE_ADMIN
        }).limit(1);
        response.status = 'OK';
        response.message = sails.__('No booking found');
        return res.json(response);
    } catch (err) {
        console.error(err);
        return res.json(err);
    }
};
