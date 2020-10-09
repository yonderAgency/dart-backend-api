module.exports = async function updateTimings(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const providerId = req.authUser.id;
    const timingPacket = req.param('timingPacket');

    if (typeof timingPacket == 'undefined') {
        response.message = sails.__('Invalid request');
        return res.send(response);
    }

    try {
        var hours = await ProviderBusinessHours.find({
            created_by: providerId
        }).limit(1);
        if (hours && hours.length > 0) {
            for (x in timingPacket) {
                timingPacket[x].startTime = ProviderBusinessHours.setHours(
                    timingPacket[x].startTime
                );
                timingPacket[x].endTime = ProviderBusinessHours.setHours(
                    timingPacket[x].endTime
                );
                if (timingPacket[x].startTime > timingPacket[x].endTime) {
                    response.message = sails.__(
                        'Start time cannot be more than end time'
                    );
                    return res.send(response);
                }
            }
            var hours = await ProviderBusinessHours.update({
                created_by: providerId
            }).set({
                timing_packet: timingPacket
            });
        }
        response.status = 'OK';
        response.message = sails.__('Business hours updated successfully');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
