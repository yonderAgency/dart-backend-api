module.exports = async function sociallogin(req, res) {
    const response = { status: 'NOK', message: '', data: {} };
    const name = req.param('name');
    var email = req.param('email');
    const password = '';
    const role = req.param('role');
    const type_id = req.param('type_id');
    const playerId = req.param('playerId');

    if (
        typeof name == 'undefined' ||
        typeof email == 'undefined' ||
        typeof password == 'undefined' ||
        typeof role == 'undefined' ||
        typeof type_id == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    } else {
        email = email.toLowerCase();
    }

    var userDetails = {
        name: name,
        email: email,
        password: password,
        role: role,
        type_id: type_id
    };

    try {
        if (userDetails) {
            const existingUser = await User.find({
                email: userDetails.email
            }).limit(1);
            if (!existingUser || existingUser.length == 0) {
                await User.create({
                    name: userDetails.name,
                    email: userDetails.email,
                    status: 1,
                    password: userDetails.password,
                    role: userDetails.role,
                    language: 'en',
                    is_email_verified: true,
                    ipAddress: User.pushIpData(
                        Api.filterIp(req.ip),
                        [],
                        req.options.action
                    )
                });
            }
            const newUser = await User.find({
                email: userDetails.email
            }).limit(1);
            if (newUser && newUser.length > 0) {
                await Social.create({
                    name: userDetails.name,
                    email: email,
                    type_id: userDetails.type_id,
                    ipAddress: User.pushIpData(
                        Api.filterIp(req.ip),
                        newUser[0].ipAddress,
                        req.options.action
                    )
                });

                const tokenHash = await User.addUserToken(newUser[0], playerId);

                const checkProfile = await CustomerProfile.find({
                    created_by: newUser[0].id
                }).limit(1);
                if (checkProfile && checkProfile.length == 0) {
                    await CustomerProfile.create({
                        created_by: newUser[0].id,
                        slug: await User.getCustomerSlug(newUser[0].name)
                    });
                }
                await Wallet.createWallet(newUser[0].id);
                await Favorite.createFavoriteList(newUser[0].id);

                response.status = 'OK';
                response.message = sails.__('Success');
                response.data.token = tokenHash;
                return res.json(response);
            } else {
                response.message = sails.__(
                    'We are very sorry, it is taking more than expected time. Please try again!'
                );
                return res.json(response);
            }
        } else {
            response.message = sails.__('Invalid data');
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
