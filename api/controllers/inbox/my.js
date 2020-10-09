module.exports = async function my(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var page = -1;
    var size = -1;
    var user = req.authUser;

    try {
        if (user) {
            var inbox = [];
            var chatheadArray = [];
            var isCustomer = true;
            if (user.role == sails.config.constants.ROLE_PROVIDER) {
                isCustomer = false;
            }
            if (isCustomer) {
                inbox = await Inbox.find({
                    created_by: user.id
                })
                    .sort('created_at DESC')
                    .limit(10);
            } else {
                inbox = await Inbox.find({
                    provider_id: user.id
                })
                    .sort('created_at DESC')
                    .limit(10);
            }
            if (inbox.length > 0) {
                for (x in inbox) {
                    var temp = await Inbox.getJson(
                        inbox[x],
                        'false',
                        page,
                        size
                    );
                    if (temp && temp.key) {
                        chatheadArray.push(temp);
                    }
                }
                response.status = 'OK';
                response.data = chatheadArray;
                response.message = sails.__('Success');
                return res.json(response);
            }
            response.message = sails.__('No chats found');
            return res.json(response);
        } else {
            response.message = sails.__('Invalid request');
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
