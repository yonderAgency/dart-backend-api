let axios = require('axios');
let moment = require('moment');

const hitDeliveryRequests = async (url, booking) => {
    try {
        let customerAddress = await UserAddress.getDeliveryAddress(
            booking.customer_address_id
        );
        let providerAddress = await UserAddress.getDeliveryAddress(
            booking.provider_address_id
        );
        let delivery_cost = await Cart.getDeliveryAmount(booking);
        if (customerAddress && providerAddress) {
            let axiosReturn = await axios({
                method: 'post',
                url: url,
                data: {
                    bookingId: booking.id,
                    token: booking.token,
                    customerAddress: customerAddress,
                    providerAddress: providerAddress,
                    datetime: moment(booking.created_at).format(),
                    delivery_cost: delivery_cost
                }
            });
            
            return {
                status: 'OK',
                message: sails.__('Success'),
                data: axiosReturn
            };
        }
        return {
            status: 'NOK',
            message: sails.__('Unable to fetch addresses')
        };
    } catch (err) {
        return {
            status: 'NOK',
            message: sails.__('Unable to send requests')
        };
    }
};

module.exports = async function sendrequest(req, res) {
    var response = {
        status: 'NOK',
        message: '',
        data: {}
    };

    const bookingToken = req.param('bookingToken');
    const userId = req.authUser.id;

    try {
        let booking = await Booking.find({
            token: bookingToken,
            provider_id: userId
        }).limit(1);
        if (booking && booking.length > 0) {
            const url =
                sails.config.constants.DELIVERY_URL +
                'v2/api/parenthandler/hitrequest';
            let axiosResponse = await hitDeliveryRequests(url, booking[0]);
           
            if (
                axiosResponse.data &&
                axiosResponse.data.data.statusCode == 200
            ) {
                await Booking.update({
                    token: bookingToken,
                    provider_id: userId
                }).set({
                    updated_at: moment().valueOf()
                });
                response.status = 'OK';
                response.message = sails.__('Request resent successfully');
                return res.json(response);
            } else {
                response.message = sails.__(
                    'Unable to send delivery request, please try again!'
                );
                return res.json(response);
            }
        } else {
            response.status = 'OK';
            response.message = sails.__('No booking found');
            response.data = [];
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
