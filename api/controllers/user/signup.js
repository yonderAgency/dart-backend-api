const saltRounds = 10;
const path = require('path');
const bcrypt = require('bcrypt');

module.exports = async function signup(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var email = req.param('email');
    const name = req.param('name');
    const businessName = req.param('businessName');
    const password = req.param('password');
    const role = req.param('role');
    const phone = req.param('phone');
    const dob = req.param('dob');
    let country = req.param('country');
    let countryCode = req.param('countryCode');

    if (typeof phone == 'undefined') {
        response.message = sails.__("Phone can't be empty");
        return res.send(response);
    }

    if (
        typeof businessName == 'undefined' &&
        role === sails.config.constants.ROLE_PROVIDER
    ) {
        response.message = sails.__("Business Name can't be empty");
        return res.send(response);
    }

    if (
        typeof name == 'undefined' ||
        typeof email == 'undefined' ||
        typeof password == 'undefined' ||
        typeof role == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.send(response);
    } else {
        email = email.toLowerCase();
    }

    if(role === sails.config.constants.ROLE_CUSTOMER) {
        if (
            typeof dob == 'undefined'
        ) {
            response.message = sails.__('DOB is required');
            return res.send(response);
        }
    }

    var existingUser;
    let generatedOtp = User.getRandomOtp(6);

    if (typeof countryCode !== 'undefiend') {
        country = User.getCountryCode(countryCode + '', true);
    } else {
        country = sails.config.dynamics.DEFAULT_COUNTRY;
        countryCode = sails.config.dynamics.DEFAULT_COUNTRY_CODE;
    }

    var userDetails = {
        name: await User.getCapital(name),
        businessName: businessName ? await User.getCapital(businessName) : '',
        email: email,
        password: password,
        phone: phone,
        role: role,
        latitude: req.location.latitude,
        longitude: req.location.longitude,
        country: country,
        countryCode: countryCode,
        ipAddress: User.pushIpData(
            Api.filterIp(req.ip),
            [],
            req.options.action
        ),
    };
    try {
        if (userDetails) {
            var checkingFakes = Api.checkFakes(userDetails.email);
            if (sails.config.environment === 'development') {
                checkingFakes = false;
            }
            if (checkingFakes) {
                response.message = sails.__('These emails are not allowed!');
                return res.json(response);
            } else {
                existingUser = await User.find({
                    email: userDetails.email,
                }).limit(1);

                if (!existingUser || existingUser.length == 0) {
                    await bcrypt.hash(password, saltRounds, async function (
                        err,
                        hash
                    ) {
                        let underReview =
                            sails.config.constants.HAS_REVIEWED_TRUE;
                        if (role == sails.config.constants.ROLE_PROVIDER) {
                            underReview =
                                sails.config.constants.HAS_REVIEWED_FALSE;
                        }
                        await User.create({
                            name: await User.getCapital(userDetails.name),
                            email: userDetails.email,
                            status: sails.config.constants.STATUS_ACTIVE,
                            password: hash,
                            phone: userDetails.phone,
                            role: userDetails.role,
                            latitude: userDetails.latitude,
                            longitude: userDetails.longitude,
                            language: 'en',
                            ipAddress: userDetails.ipAddress,
                            country_code: userDetails.countryCode,
                        });
                        var newUser = await User.find({
                            email: userDetails.email,
                        }).limit(1);
                        if (newUser && newUser.length > 0) {
                            if (
                                newUser[0].role ==
                                sails.config.constants.ROLE_PROVIDER
                            ) {
                                await ProviderBusinessHours.addHours(
                                    newUser[0].id
                                );
                                const business_name = await User.getCapital(
                                    userDetails.businessName
                                );
                                const slug = await User.getProviderSlug(
                                    userDetails.businessName
                                );
                                await ProviderProfile.create({
                                    created_by: newUser[0].id,
                                    business_name: business_name,
                                    slug: slug,
                                    company_code: await ProviderProfile.getCompanyCode(),
                                    admin_cut:
                                        sails.config.dynamics.DEFAULT_ADMIN_CUT,
                                });
                            } else if (
                                newUser[0].role ==
                                sails.config.constants.ROLE_CUSTOMER
                            ) {
                                await CustomerProfile.create({
                                    created_by: newUser[0].id,
                                    slug: await User.getCustomerSlug(
                                        newUser[0].name
                                    ),
                                    dob: moment(dob).valueOf(),
                                    gender: req.param('gender')
                                });
                                await Wallet.createWallet(newUser[0].id);
                                await Favorite.createFavoriteList(
                                    newUser[0].id
                                );
                            }
                            var pathName = path.parse(
                                '/assets/images/website-logo.png'
                            );
                            var logoImage =
                                sails.config.constants.BASE_URL +
                                pathName.dir +
                                '/' +
                                pathName.base;

                            sails.hooks.email.send(
                                'verification',
                                {
                                    name: newUser[0].name,
                                    otp: generatedOtp,
                                    logoImage: logoImage,
                                    image: await Api.getWebsiteImage(),
                                },
                                {
                                    to: email,
                                    subject: sails.__(
                                        'Email Verification: %s',
                                        sails.config.dynamics.APPLICATION_NAME
                                    ),
                                },
                                async function (err) {
                                    if (err) {
                                        sails.sentry.captureException(err);
                                        response.message = err.message;
                                        return res.json(response);
                                    }
                                    if (
                                        newUser[0].role ==
                                        sails.config.constants.ROLE_PROVIDER
                                    ) {
                                        response.data.step = 1;
                                    }
                                    await User.update({
                                        email: newUser[0].email,
                                    }).set({
                                        otp: generatedOtp,
                                    });
                                    response.status = 'OK';
                                    response.message = sails.__('Success');
                                    return res.json(response);
                                }
                            );
                        } else {
                            response.message = sails.__('Invalid Request');
                            return res.json(response);
                        }
                    });
                } else {
                    response.message = sails.__(
                        'User with this email already exists!'
                    );
                    return res.json(response);
                }
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
