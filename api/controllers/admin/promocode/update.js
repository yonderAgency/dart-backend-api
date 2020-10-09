const moment = require('moment');
const api = require('../../../models/Api.js');

const handleResponse = async (promoItem, promoId) => {
    var temp = { status: 'NOK', message: '' };
    return new Promise(function(resolve, reject) {
        if (promoId) {
            advertiseOnTimestamp = new Date(promoItem.advertise_on);
            promoItem.advertise_on = moment(promoItem.advertise_on)
                .utc()
                .valueOf();
            PromoCodes.update({
                id: promoId
            })
                .set(promoItem)
                .exec(async function(err, result) {
                    if (err) {
                        temp.message = err.details;
                        return resolve(temp);
                    }
                    if (promoItem.advertise) {
                        if (
                            promoItem.advertise_on &&
                            typeof promoItem.advertise_on != 'undefined'
                        ) {
                            await sails.helpers.notificationschedule.with({
                                type: 'NEW_OFFER',
                                scheduleDate: advertiseOnTimestamp,
                                dataPacket: {
                                    params: {},
                                    type: sails.config.constants.RELOAD_OFFERS,
                                    route:
                                        sails.config.constants.ROUTE_OFFER_LIST
                                },
                                reference_type:
                                    sails.config.constants.NOTIFICATIONS
                                        .NEW_OFFER
                            });
                        }
                    }
                    temp.status = 'OK';
                    temp.message = sails.__('Promocode updated successfully');
                    return resolve(temp);
                });
        } else {
            temp.message == sails.__('Invalid request');
            return resolve(temp);
        }
    });
};

module.exports = async function create(req, res) {
    var response = { status: 'NOK', message: '', data: [] };
    const code = req.param('code');
    const description = req.param('description');
    const advertise = req.param('advertise');
    const booking_count = req.param('bookingCount');
    const times_type = req.param('timesType');
    const start_date = req.param('startDate');
    const end_date = req.param('endDate');
    const offer_type = req.param('offerType');
    const status = req.param('status');
    const upto_amount = req.param('uptoAmount');
    const percent_amount = req.param('percentAmount');
    const advertise_on = req.param('advertiseOn');
    const heading = req.param('heading');
    const promoId = req.param('promoId');
    var file = req.param('image');

    if (typeof promoId == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var oldPromoPacket = await PromoCodes.find({
            id: promoId
        }).limit(1);
        if (
            typeof oldPromoPacket == 'undefined' &&
            oldPromoPacket &&
            oldPromoPacket.length > 0
        ) {
            response.message = sails.__('Invalid request');
            return res.send(response);
        }

        var fileName = '';
        if (file && file.length > 0) {
            var randomCode = await Api.generatedCode(32);
            const split = file.split(';')[0];
            const ext = split.match(/jpeg|png/)[0];
            const data = file.replace(/^data:image\/\w+;base64,/, '');
            var buffer = new Buffer(data, 'base64');
            if (ext) {
                fileName = randomCode + '.' + ext;
            }
            await Api.uploadImage(
                sails.config.appPath + '/assets/uploads/promos',
                fileName,
                buffer
            );
            var promoItem = {
                code: api.checkIncomingAttribute(code, oldPromoPacket[0].code),
                description: api.checkIncomingAttribute(
                    description,
                    oldPromoPacket[0].description
                ),
                advertise: api.checkIncomingAttribute(
                    advertise,
                    oldPromoPacket[0].advertise
                ),
                booking_count: api.checkIncomingAttribute(
                    booking_count,
                    oldPromoPacket[0].booking_count
                ),
                times_type: api.checkIncomingAttribute(
                    times_type,
                    oldPromoPacket[0].times_type
                ),
                start_date: api.checkIncomingAttribute(
                    moment(start_date).valueOf(),
                    oldPromoPacket[0].start_date
                ),
                end_date: api.checkIncomingAttribute(
                    moment(end_date).valueOf(),
                    oldPromoPacket[0].end_date
                ),
                offer_type: api.checkIncomingAttribute(
                    offer_type,
                    oldPromoPacket[0].offer_type
                ),
                status: api.checkIncomingAttribute(
                    status,
                    oldPromoPacket[0].status
                ),
                upto_amount: api.checkIncomingAttribute(
                    upto_amount,
                    oldPromoPacket[0].upto_amount
                ),
                heading: api.checkIncomingAttribute(
                    heading,
                    oldPromoPacket[0].heading
                ),
                percent_amount: api.checkIncomingAttribute(
                    percent_amount,
                    oldPromoPacket[0].percent_amount
                ),
                advertise_on: api.checkIncomingAttribute(
                    advertise_on,
                    oldPromoPacket[0].advertise_on
                ),
                image: api.checkIncomingAttribute(
                    fileName,
                    oldPromoPacket[0].image
                )
            };
            const tempResponse = await handleResponse(promoItem, promoId);
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        } else {
            var promoItem = {
                code: api.checkIncomingAttribute(code, oldPromoPacket[0].code),
                description: api.checkIncomingAttribute(
                    description,
                    oldPromoPacket[0].description
                ),
                advertise: api.checkIncomingAttribute(
                    advertise,
                    oldPromoPacket[0].advertise
                ),
                booking_count: api.checkIncomingAttribute(
                    booking_count,
                    oldPromoPacket[0].booking_count
                ),
                times_type: api.checkIncomingAttribute(
                    times_type,
                    oldPromoPacket[0].times_type
                ),
                start_date: api.checkIncomingAttribute(
                    moment(start_date).valueOf(),
                    oldPromoPacket[0].start_date
                ),
                end_date: api.checkIncomingAttribute(
                    moment(end_date).valueOf(),
                    oldPromoPacket[0].end_date
                ),
                offer_type: api.checkIncomingAttribute(
                    offer_type,
                    oldPromoPacket[0].offer_type
                ),
                status: api.checkIncomingAttribute(
                    status,
                    oldPromoPacket[0].status
                ),
                upto_amount: api.checkIncomingAttribute(
                    upto_amount,
                    oldPromoPacket[0].upto_amount
                ),
                heading: api.checkIncomingAttribute(
                    heading,
                    oldPromoPacket[0].heading
                ),
                percent_amount: api.checkIncomingAttribute(
                    percent_amount,
                    oldPromoPacket[0].percent_amount
                ),
                advertise_on: api.checkIncomingAttribute(
                    advertise_on,
                    oldPromoPacket[0].advertise_on
                )
            };
            const tempResponse = await handleResponse(promoItem, promoId);
            if (tempResponse.status == 'OK') {
                response.status = 'OK';
                response.message = tempResponse.message;
                return res.send(response);
            }
            response.message = tempResponse.message;
            return res.send(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
