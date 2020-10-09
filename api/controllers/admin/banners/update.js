const handleResponse = async (categoryItem, id) => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        Banners.update({
            id: id
        })
            .set(categoryItem)
            .exec(async function(err, result) {
                if (err) {
                    temp.message = err.details;
                    return resolve(temp);
                }
                temp.status = 'OK';
                temp.message = sails.__('Banner updated successfully');
                return resolve(temp);
            });
    });
};

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const id = req.param('id');
    const title = req.param('title');

    const hit_title1 = req.param('hit_title1');
    const hit_description1 = req.param('hit_description1');
    const hit_title2 = req.param('hit_title2');
    const hit_description2 = req.param('hit_description2');
    const hit_title3 = req.param('hit_title3');
    const hit_description3 = req.param('hit_description3');
    const hit_title4 = req.param('hit_title4');
    const hit_description4 = req.param('hit_description4');

    const description = req.param('description');
    var file = req.param('image');

    if (typeof title == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        let oldPromoPacket = await Banners.find({
            id: id
        }).limit(1);
        if(oldPromoPacket && oldPromoPacket.length > 0) {
            var fileName = '';
            if (typeof file != 'undefined' && file && file.length > 0) {
                var randomCode = await Api.generatedCode(32);
                const split = file.split(';')[0];
                const ext = split.match(/jpeg|png/)[0];
                if (ext) {
                    fileName = randomCode + '.' + ext;
                }
                const data = file.replace(/^data:image\/\w+;base64,/, '');
                const buffer = new Buffer(data, 'base64');
                await Api.uploadBanner(
                    sails.config.appPath + '/assets/uploads/banners',
                    fileName,
                    buffer
                );
            } else {
                fileName = oldPromoPacket[0].image;
            }
            var categoryItem = {
                hit_title1: Api.checkIncomingAttribute(
                    hit_title1,
                    oldPromoPacket[0].hit_title1
                ),
                hit_description1: Api.checkIncomingAttribute(
                    hit_description1,
                    oldPromoPacket[0].hit_description1
                ),
                hit_title2: Api.checkIncomingAttribute(
                    hit_title2,
                    oldPromoPacket[0].hit_title2
                ),
                hit_description2: Api.checkIncomingAttribute(
                    hit_description2,
                    oldPromoPacket[0].hit_description2
                ),
                hit_title2: Api.checkIncomingAttribute(
                    hit_title2,
                    oldPromoPacket[0].hit_title2
                ),
                hit_description2: Api.checkIncomingAttribute(
                    hit_description2,
                    oldPromoPacket[0].hit_description2
                ),
                hit_title3: Api.checkIncomingAttribute(
                    hit_title3,
                    oldPromoPacket[0].hit_title3
                ),
                hit_description3: Api.checkIncomingAttribute(
                    hit_description3,
                    oldPromoPacket[0].hit_description3
                ),
                hit_title4: Api.checkIncomingAttribute(
                    hit_title4,
                    oldPromoPacket[0].hit_title4
                ),
                hit_description4: Api.checkIncomingAttribute(
                    hit_description4,
                    oldPromoPacket[0].hit_description4
                ),
                title: Api.checkIncomingAttribute(
                    title,
                    oldPromoPacket[0].title
                ),
                image: fileName,
                description: Api.checkIncomingAttribute(
                    description,
                    oldPromoPacket[0].description
                )
            };
            const tempResponse = await handleResponse(categoryItem, id);
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        } else {
            response.message = sails.__('Banner not found');
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
