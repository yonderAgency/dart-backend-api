const moment = require('moment');
const _ = require('lodash');

module.exports = async function detail(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const messageroom = req.param('messageroom');
    const topTime = req.param('topTime') || moment().valueOf();
    const size = req.param('size') || 10;
    const user = req.authUser;
    const type = req.param('type');

    if (typeof messageroom == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        if (user && messageroom) {
            var inbox = await Inbox.find({
                messageroom: messageroom,
                or: [
                    {
                        created_by: user.id
                    },
                    {
                        provider_id: user.id 
                    }
                ]
            }).limit(1);
            if (inbox && inbox.length > 0) {
                response.status = 'OK';
                list = await Inbox.getJson(inbox[0], 'true', size, topTime);
                if (type) {
                    list.chats = _.reverse(list.chats);
                }
                response.data = list;
                response.message = sails.__('Success');
                return res.json(response);
            }
            response.message = sails.__('Invalid request');
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
