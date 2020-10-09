module.exports = async function list(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const userId = req.param('id');

    const data = req.param('data');

    try {
        var assignModel = await Assign.find({
            userId: userId
        });
        if (assignModel.length > 0) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    if (key != 'key' && key != 'userId') {
                        if (key == 'user') {
                            await Assign.update({ userId: userId }).set({
                                user: data[key]
                            });
                        } else if (key == 'category') {
                            await Assign.update({ userId: userId }).set({
                                category: data[key]
                            });
                        } else if (key == 'service') {
                            await Assign.update({ userId: userId }).set({
                                service: data[key]
                            });
                        } else if (key == 'product') {
                            await Assign.update({ userId: userId }).set({
                                product: data[key]
                            });
                        } else if (key == 'order') {
                            await Assign.update({ userId: userId }).set({
                                order: data[key]
                            });
                        } else if (key == 'transaction') {
                            await Assign.update({ userId: userId }).set({
                                transaction: data[key]
                            });
                        } else if (key == 'booking') {
                            await Assign.update({ userId: userId }).set({
                                booking: data[key]
                            });
                        } else if (key == 'promo') {
                            await Assign.update({ userId: userId }).set({
                                promo: data[key]
                            });
                        } else if (key == 'rating') {
                            await Assign.update({ userId: userId }).set({
                                rating: data[key]
                            });
                        } else if (key == 'cms') {
                            await Assign.update({ userId: userId }).set({
                                cms: data[key]
                            });
                        } else if (key == 'helpdesk') {
                            await Assign.update({ userId: userId }).set({
                                helpdesk: data[key]
                            });
                        } else if (key == 'banner') {
                            await Assign.update({ userId: userId }).set({
                                banner: data[key]
                            });
                        } else if (key == 'setting') {
                            await Assign.update({ userId: userId }).set({
                                setting: data[key]
                            });
                        } else if (key == 'godView') {
                            await Assign.update({ userId: userId }).set({
                                godView: data[key]
                            });
                        } else if (key == 'file') {
                            await Assign.update({ userId: userId }).set({
                                file: data[key]
                            });
                        }
                    }
                }
            }

            var model = await Assign.getJson(assignModel[0]);

            response.status = 'OK';
            response.message = sails.__('Permissions Updated');
            response.data = model;
            return res.send(response);
        } else {
            response.status = 'OK';
            response.message = sails.__('No assign found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
