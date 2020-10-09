module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    try {
        const db = UserAddress.getDatastore().manager;
        db.collection('useraddress').createIndex({ coordinates: '2dsphere' });

        // var addresses = await UserAddress.find();
        // if (addresses.length > 0) {
        //     for (x in addresses) {
        //         let coordinate = {
        //             latitude: addresses[x].latitude
        //                 ? parseFloat(addresses[x].latitude)
        //                 : 0.0,
        //             longitude: addresses[x].longitude
        //                 ? parseFloat(addresses[x].longitude)
        //                 : 0.0
        //         };
        //         await UserAddress.update({
        //             id: addresses[x].id
        //         }).set({
        //             coordinates: coordinate
        //         });
        //     }
        //     response.status = 'OK';
        //     response.message = sails.__('Success');
        //     return res.json(response);
        // } else {
        //     response.message = sails.__('No list found');
        //     return res.json(response);
        // }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
