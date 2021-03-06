const saltRounds = 10;
const path = require('path');
const bcrypt = require('bcrypt');
const userJson = require('../../../models/User.js');

module.exports = async function customerCreate(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    var password = await Api.generatedCode(8);
    let savepassword = password;
    var existingUser;

    if (
        typeof req.param('name') == 'undefined' ||
        typeof req.param('email') == 'undefined'
    ) {
        response.message = sails.__('Invalid request');
        return res.json(response);
    }

    var userDetails = {
        name: req.param('name'),
        email: req.param('email').toLowerCase(),
        password: password,
        role: sails.config.constants.ROLE_SUBADMIN,
        subadminProfile: {
            address: req.param('address'),
            contact: req.param('contact'),
            city: req.param('city'),
            state: req.param('state'),
            pincode: req.param('pincode'),
            country: req.param('country')
        }
    };

    try {
        existingUser = await User.find({
            email: userDetails.email
        }).limit(1);

        if (!existingUser || existingUser.length == 0) {
            await bcrypt.hash(password, saltRounds, async function(err, hash) {
                await User.create({
                    name: await userJson.getCapital(userDetails.name),
                    email: userDetails.email,
                    phone: userDetails.subadminProfile.contact,
                    status: 1,
                    password: hash,
                    role: userDetails.role,
                    subadminProfile: userDetails.subadminProfile,
                    ipAddress: User.pushIpData(
                        Api.filterIp(req.ip),
                        [],
                        req.options.action
                    )
                });

                var newUser = await User.find({
                    email: userDetails.email
                }).limit(1);
                await Assign.create({
                    userId: newUser[0].id
                });
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
                        password: savepassword,
                        logoImage: logoImage,
                        email: newUser[0].email,
                        appname: sails.config.dynamics.APPLICATION_NAME,
                        app: 'subadmin',
                        image: websiteImages
                    },
                    {
                        to: newUser[0].email,
                        subject:
                            'Welcome to ' +
                            sails.config.dynamics.APPLICATION_NAME
                    },
                    async function(err) {
                        if (err) {
                            sails.sentry.captureException(err);
                            response.message = err;
                            return res.json(response);
                        }

                        response.status = 'OK';
                        response.message = sails.__(
                            'Sub Admin added successfully'
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
