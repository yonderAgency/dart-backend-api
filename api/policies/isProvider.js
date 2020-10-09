module.exports = async function(req, res, proceed) {
    sails.hooks.i18n.setLocale(Api.getLocalization(req.headers));
    var token = req.headers['x-auth-token'];
    var response = { status: 'AUTH', message: sails.__('Invalid user') };

    if (typeof token !== 'undefined') {
        var exists = await Token.find({
            token_value: token
        }).limit(1);
        if (exists.length > 0) {
            var user = await User.find({
                where: {
                    id: exists[0].owner,
                    role: sails.config.constants.ROLE_PROVIDER
                },
                limit: 1
            });
            if (user && user.length > 0) {
                sails.hooks.i18n.setLocale(
                    Api.getLocalization(req.headers, user[0])
                );
                const settings = await Settings.find({
                    status: sails.config.constants.STATUS_ACTIVE
                }).limit(1);
                if (settings.length > 0) {
                    if (settings[0].MAINTAINENCE_MODE) {
                        response.type =
                            sails.config.constants.AUTH_TYPE_MAINTAINENCE;
                        response.message = sails.__(
                            'Application is under maintainence, please try again after sometime'
                        );
                        return res.send(response);
                    }
                    if (user.is_blocked == sails.config.constants.IS_BLOCKED) {
                        response.type =
                            sails.config.constants.AUTH_TYPE_BLOCKED;
                        response.message = sails.__(
                            'Your account is blocked by the admin'
                        );
                        return res.send(response);
                    }
                    if (
                        user[0].is_deleted == sails.config.constants.IS_DELETED
                    ) {
                        response.type =
                            sails.config.constants.AUTH_TYPE_DEACTIVATED;
                        response.message = sails.__(
                            'Your account is removed by the admin'
                        );
                        return res.send(response);
                    }
                    if (req.method == 'GET' || req.method == 'POST') {
                        req.authUser = user[0];
                        return proceed();
                    }
                    res.message = sails.__('Invalid type request');
                    return res.send(response);
                } else {
                    response.type =
                        sails.config.constants.AUTH_TYPE_MAINTAINENCE;
                    response.message = sails.__(
                        'Application is under maintainence, please try again after sometime'
                    );
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
