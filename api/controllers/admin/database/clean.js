const moment = require('moment');
var _ = require('lodash');
var exec = require('child_process').exec;

module.exports = async function clean(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const now = moment().valueOf();
    const developerKey =
        'sV9cjxKFq51AvMH4pyHxJYDz9uAp0TMkOfSaYVyLX2o7CkWMcQLy2MZSgCmFWXf6zTiYfZMM3m5mYnKR9Xsw7i5ys8gqNyfvzulPJdJRYZ3zPun8J2iuSPyQhbOnHyZs';

    if (developerKey !== req.headers['developerkey']) {
        response.message = sails.__('Invalid key');
        return res.send(response);
    }

    const ip = req.param('ip');
    const port = req.param('port');
    const db = req.param('db');
    const username = req.param('username');
    const password = req.param('password');
    const type = req.param('type');
    const folderName = 'db_backups/mongoBackup_' + parseInt(now / 1000);
    let emails = req.param('emails');
    let ids = req.param('ids');

    if (
        typeof ip == 'undefined' ||
        typeof port == 'undefined' ||
        typeof db == 'undefined' ||
        typeof username == 'undefined' ||
        typeof password == 'undefined' ||
        typeof folderName == 'undefined'
    ) {
        response.message = sails.__('Please check params');
        return res.send(response);
    }

    try {
        var cmd =
            'mongodump --host ' +
            ip +
            ' --port ' +
            port +
            ' --db ' +
            db +
            ' --username ' +
            username +
            ' --password  ' +
            password +
            ' --out ' +
            folderName;

        exec(cmd, async function(error, stdout, stderr) {
            if (!error) {
                if (type === 'BACKUPONLY') {
                    response.status = 'OK';
                    response.message = sails.__('Database backup successful');
                    return res.send(response);
                } else if (type === 'BACKUPANDRESET') {
                    if (Array.isArray(emails) || Array.isArray(ids)) {
                        if (emails.length > 0 || ids.length > 0) {
                            let usersByEmails = [];
                            let usersByIds = [];

                            if (emails.length > 0) {
                                usersByEmails = await User.find({
                                    email: { in: emails }
                                });
                            }
                            if (ids.length > 0) {
                                usersByIds = await User.find({
                                    id: { in: ids }
                                });
                            }

                            if (usersByEmails && usersByEmails.length > 1) {
                                for (let x in usersByEmails) {
                                    ids.push(usersByEmails[x].id);
                                    emails.push(usersByEmails[x].email);
                                }
                            }

                            if (usersByIds && usersByIds.length > 1) {
                                for (let y in usersByIds) {
                                    ids.push(usersByIds[y].id);
                                    emails.push(usersByIds[y].email);
                                }
                            }

                            ids = _.uniqBy(ids);
                            emails = _.uniqBy(emails);

                            if (ids.length > 0 && emails.length > 0) {
                                await BookingItem.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****BookingItem cleaned****');

                                await Favoriteservice.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****Favoriteservice cleaned****');

                                await HelpdeskLog.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****HelpdeskLog cleaned****');

                                await Helpdesk.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****Helpdesk cleaned****');

                                await InboxMessages.destroy().where({
                                    or: [
                                        {
                                            from_id: { in: ids }
                                        },
                                        {
                                            to_id: { in: ids }
                                        }
                                    ]
                                });
                                console.log('****InboxMessages cleaned****');

                                await Notifications.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****Notifications cleaned****');

                                await PaymentLog.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****PaymentLog cleaned****');

                                await Service.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****Service cleaned****');

                                await Social.destroy({
                                    email: { in: emails }
                                });
                                console.log('****Social cleaned****');

                                await Token.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****Token cleaned****');

                                await UserAddress.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****UserAddress cleaned****');

                                await Transactions.destroy({
                                    or: [
                                        {
                                            from_id: { in: ids }
                                        },
                                        {
                                            to_id: { in: ids }
                                        }
                                    ]
                                });
                                console.log('****Transactions cleaned****');

                                await CustomerProfile.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****CustomerProfile cleaned****');

                                await Inbox.destroy({
                                    or: [
                                        {
                                            created_by: { in: ids }
                                        },
                                        {
                                            provider_id: { in: ids }
                                        }
                                    ]
                                });
                                console.log('****Inbox cleaned****');

                                await WalletTransactions.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****Inbox cleaned****');

                                await ProviderProfile.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****ProviderProfile cleaned****');

                                await Wallet.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****Wallet cleaned****');

                                await Rating.destroy({
                                    or: [
                                        {
                                            to_id: { in: ids }
                                        },
                                        {
                                            from_id: { in: ids }
                                        }
                                    ]
                                });
                                console.log('****Rating cleaned****');

                                await RatingLog.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****RatingLog cleaned****');

                                await Booking.destroy({
                                    or: [
                                        {
                                            created_by: { in: ids }
                                        },
                                        {
                                            provider_id: { in: ids }
                                        }
                                    ]
                                });
                                console.log('****Booking cleaned****');

                                await ProviderBusinessHours.destroy({
                                    created_by: { in: ids }
                                });
                                console.log(
                                    '****ProviderBusinessHours cleaned****'
                                );

                                await ProviderLog.destroy({
                                    or: [
                                        {
                                            created_by: { in: ids }
                                        },
                                        {
                                            provider_id: { in: ids }
                                        }
                                    ]
                                });
                                console.log('****ProviderLog cleaned****');

                                await ProviderServiceImage.destroy({
                                    created_by: { in: ids }
                                });
                                console.log(
                                    '****ProviderServiceImage cleaned****'
                                );

                                await ProviderServicePackage.destroy({
                                    created_by: { in: ids }
                                });
                                console.log(
                                    '****ProviderServicePackage cleaned****'
                                );

                                await ProviderServiceVideo.destroy({
                                    created_by: { in: ids }
                                });
                                console.log(
                                    '****ProviderServiceVideo cleaned****'
                                );

                                await ProviderService.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****ProviderService cleaned****');

                                await Faq.destroy({
                                    created_by: { in: ids }
                                });
                                console.log('****Faq cleaned****');

                                await User.destroy({
                                    id: { in: ids }
                                });
                                console.log('****User cleaned****');
                            }
                            response.status = 'OK';
                            response.message = sails.__(
                                'Database backup and clean successful'
                            );
                            return res.send(response);
                        } else {
                            response.message = sails.__(
                                'Recieved empty EMAIL/ID arrays'
                            );
                            return res.send(response);
                        }
                    } else {
                        response.message = sails.__(
                            'Either EMAILS or IDS are required'
                        );
                        return res.send(response);
                    }
                }
            } else {
                response.message = error;
                return res.send(response);
            }
        });
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
