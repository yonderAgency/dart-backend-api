module.exports = async function success(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    var payerId = req.query.PayerId;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: payerId,
        transactions: [
            {
                amount: {
                    currency: 'USD',
                    total: '1.00'
                }
            }
        ]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function(
        error,
        payment
    ) {
        if (error) {
            throw error;
        } else {
            res.render('success');
        }
    });
};
