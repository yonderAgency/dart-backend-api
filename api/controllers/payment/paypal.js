module.exports = async function paypal(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var paypal = require('paypal-rest-sdk');

    paypal.configure({
        mode: 'sandbox',
        client_id: sails.config.constants.PAYPAL_CLIENT_ID,
        client_secret: sails.config.constants.PAYPAL_SECRET_ID
    });

    var create_payment_json = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal'
        },
        redirect_urls: {
            return_url: sails.config.constants.BASE_URL + '/payment/success',
            cancel_url: sails.config.constants.BASE_URL + '/payment/cancel'
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: 'item',
                            sku: 'item',
                            price: '1.00',
                            currency: sails.config.dynamics.CURRENCY.toUpperCase(),
                            quantity: 1
                        }
                    ]
                },
                amount: {
                    currency: sails.config.dynamics.CURRENCY.toUpperCase(),
                    total: '1.00'
                },
                description: 'This is the payment description.'
            }
        ]
    };

    paypal.payment.create(create_payment_json, function(error, payment) {
        if (error) {
            return res.send(response);
        } else {
            response.status = 'OK';
            return res.redirect(payment.links[1].href);
        }
    });
};
