module.exports = async function addBankDetails(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    var userId = req.param('providerId');
    var bankName = req.param('bank_name');
    var accountType = req.param('account_type');
    var accountNumber = req.param('account_number');
    var instruction = req.param('instruction');

    if (typeof userId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var profile = await ProviderProfile.find({
            created_by: userId
        });
        if (profile && profile.length > 0) {
            await ProviderProfile.update({ created_by: userId }).set({
                bank_name: bankName,
                account_type: accountType,
                account_number: accountNumber,
                instruction: instruction
            });
            response.status = 'OK';
            response.message = sails.__('Success');
            return res.json(response);
        } else {
            response.message = sails.__('No provider found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
