module.exports = async function(req, res, proceed) {
    var token = req.headers['x-auth-token'];
    sails.hooks.i18n.setLocale(Api.getLocalization(req.headers));
    var response = {
        status: 'ADMINAUTH',
        message: sails.__('Invalid user')
    };
    if (typeof token !== 'undefined') {
        var exists = await Token.find({
            token_value: token
        });
        if (exists.length > 0) {
            var user = await User.find({
                where: {
                    id: exists[0].owner,
                    role: [
                        sails.config.constants.ROLE_ADMIN,
                        sails.config.constants.ROLE_SUBADMIN
                    ]
                },
                limit: 1
            });
            if (user && user.length > 0) {
                sails.hooks.i18n.setLocale(
                    Api.getLocalization(req.headers, user[0])
                );
                if (
                    req.method == 'GET' ||
                    req.method == 'POST' ||
                    req.method == 'DELETE'
                ) {
                    req.authUser = user[0];
                    return proceed();
                } else {
                    res.message = sails.__('Invalid request');
                    return res.send(response);
                }
            } else {
                return res.send(response);
            }
        } else {
            return res.send(response);
        }
    } else {
        return res.send(response);
    }
};
