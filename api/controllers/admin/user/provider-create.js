const saltRounds = 10;
const path = require('path');
const bcrypt = require('bcrypt');

module.exports = async function providerCreate(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var password = await Api.generatedCode(8);
    var existingUser;
    if (
        !req.param('name') ||
        !req.param('businessName') ||
        !req.param('email')
    ) {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    var userDetails = {
        name: req.param('name'),
        email: req.param('email').toLowerCase(),
        password: password,
        businessName: req.param('businessName'),
        role: sails.config.constants.ROLE_PROVIDER
    };
    let oldPassword = password;
    try {
        existingUser = await User.find({
            email: userDetails.email
        }).limit(1);
        if (!existingUser || existingUser.length == 0) {
            await bcrypt.hash(password, saltRounds, async function(err, hash) {
                await User.create({
                    name: await User.getCapital(userDetails.name),
                    email: userDetails.email,
                    status: sails.config.constants.STATUS_ACTIVE,
                    password: hash,
                    role: userDetails.role,
                    ipAddress: User.pushIpData(
                        Api.filterIp(req.ip),
                        [],
                        req.options.action
                    )
                });

                var newUser = await User.find({
                    email: userDetails.email
                }).limit(1);
                const slug = await User.getProviderSlug(
                    userDetails.businessName
                );
                if (newUser[0]) {
                    await ProviderProfile.create({
                        created_by: newUser[0].id,
                        business_name: userDetails.businessName,
                        slug: slug,
                        company_code: await ProviderProfile.getCompanyCode()
                    });
                }
                var pathName = path.parse('/assets/images/website-logo.png');
                var logoImage =
                    sails.config.constants.BASE_URL +
                    pathName.dir +
                    '/' +
                    pathName.base;
                let websiteImages = await Api.getWebsiteImage();
                sails.hooks.email.send(
                    'generate-customer',
                    {
                        name: newUser[0].name,
                        password: oldPassword,
                        logoImage: logoImage,
                        email: newUser[0].email,
                        appname: sails.config.dynamics.APPLICATION_NAME,
                        app: 'provider',
                        image: websiteImages
                    },
                    {
                        to: newUser[0].email,
                        subject: sails.__(
                            'Welcome to %s',
                            sails.config.dynamics.APPLICATION_NAME
                        )
                    },
                    async function(err) {
                        if (err) {
                            sails.sentry.captureException(err);
                            response.message = err;
                            return res.json(response);
                        }
                        await ProviderBusinessHours.addHours(newUser[0].id);
                        response.status = 'OK';
                        response.message = sails.__(
                            'Provider added successfully'
                        );
                        return res.json(response);
                    }
                );
            });
        } else {
            response.message = sails.__(
                'User with this email or Phone already exists!'
            );
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
