const moment = require('moment');

const getData = async (timeStamps, user_id, offset, type) => {
    var arrayKeys = [];
    if (timeStamps.length > 0) {
        for (x in timeStamps) {
            var count = 0;
            let adminAmount =0;
            let adminCut = sails.config.dynamics.DEFAULT_ADMIN_CUT;
            var bookings = await Booking.find({
                where: { provider_id: user_id, 
                        status: sails.config.constants.BOOKING_STATUS_COMPLETED,
                        'created_at': {
                            '>': timeStamps[x].endTime,
                            '<=': timeStamps[x].startTime
                        }},
                select: ['total_amount']
            });
            let profile = await ProviderProfile.find({
                created_by: user_id
            }).limit(1);
            if (profile && profile.length > 0) {
                if (profile[0].admin_cut !== '' && profile[0].admin_cut !== null) {
                    if (!isNaN(profile[0].admin_cut)) {
                        adminCut = profile[0].admin_cut;
                    }
                }
            }
            if (bookings && bookings.length > 0) {
                for (var booking of bookings) {
                    adminAmount = (Number(booking.total_amount) * Number(adminCut)) / 100;
                    count += Number(booking.total_amount) - Number(adminAmount);
                }
            }
       //for (x in timeStamps) {
            // count = await Booking.count({
            //     created_at: {
            //         '>': timeStamps[x].endTime,
            //         '<=': timeStamps[x].startTime
            //     },
            //     provider_id: user_id
            // });
            if (type == sails.config.constants.GRAPH_TYPE_DAILY) {
                if (timeStamps[x]) {
                    arrayKeys.push({
                        x: moment(timeStamps[x].startTime)
                            .utcOffset(-parseInt(offset))
                            .format('dddd'),
                        y: count
                    });
                }
            } else if (type == sails.config.constants.GRAPH_TYPE_MONTHLY) {
                if (timeStamps[x]) {
                    arrayKeys.push({
                        x: moment(timeStamps[x].startTime)
                            .utcOffset(-parseInt(offset))
                            .format('MMM'),
                        y: count
                    });
                }
            } else {
                if (timeStamps[x]) {
                    arrayKeys.push({
                        x: moment(timeStamps[x].startTime)
                            .utcOffset(-parseInt(offset))
                            .format('YYYY'),
                            y: count
                    });
                }
            }
        }
    }
    if (type == sails.config.constants.GRAPH_TYPE_YEARLY) {
        return arrayKeys;
    }
    return arrayKeys.reverse();
};

const getDailyTimestamps = reference => {
    var firstDay = moment(new Date(reference));
    var lastDay = moment(firstDay).subtract(86400, 'seconds');
    return {
        firstDay: moment(firstDay).valueOf(),
        lastDay: moment(lastDay).valueOf()
    };
};

const getMonthlyTimestamps = (reference, offset) => {
    var date = new Date(reference),
        y = date.getFullYear(),
        m = date.getMonth();
    var firstDay = new Date(y, m, 1);
    var lastDay = new Date(y, m + 1, 0);
    return {
        firstDay: moment(firstDay)
            .utcOffset(parseInt(offset))
            .valueOf(),
        lastDay: moment(lastDay)
            .utcOffset(parseInt(offset))
            .valueOf(),
        firstDate: moment(firstDay)
            .utcOffset(parseInt(offset))
            .format('MMMM D YYYY hh:mm:ss a'),
        lastDate: moment(lastDay)
            .utcOffset(parseInt(offset))
            .format('MMMM D YYYY hh:mm:ss a')
    };
};

const getYearlyTimestamps = (reference, offset) => {
    var firstDay = new Date('Jan 01 ' + reference + ' 00:00:00');
    var lastDay = new Date('Dec 31 ' + reference + ' 23:59:59');
    return {
        lastDay: moment(firstDay)
            .utcOffset(parseInt(offset))
            .valueOf(),
        firstDay: moment(lastDay)
            .utcOffset(parseInt(offset))
            .valueOf()
    };
};

module.exports = async function dashboard(req, res) {
    var response = { status: 'NOK', message: '', data: {} };

    const type = req.param('type');
    const user_id = req.authUser.id;
    const datetime = req.param('datetime');
    try {
        var data = {
            arrayKeys: []
        };
        if (type == sails.config.constants.GRAPH_TYPE_DAILY) {
            var dates = {};
            var timeStamps = [];
            var startDay = new Date(datetime);
            startDay = startDay.setHours(23, 59, 59, 999);
            startDay = moment(startDay)
                .utc()
                .add(24, 'hours')
                .format('MMMM D YYYY, hh:mm:ss a');
                
            for (var i = 7; i >= 1; i--) {
                dates = getDailyTimestamps(startDay);
                timeStamps.push({
                    startTime: dates.firstDay,
                    endTime: dates.lastDay
                });
                startDay = moment(dates.lastDay).format(
                    'MMMM D YYYY, hh:mm:ss a'
                );
            }
            
            data = await getData(timeStamps, user_id, offset, type);
        } else if (type == sails.config.constants.GRAPH_TYPE_MONTHLY) {
            var dates = {};
            var timeStamps = [];
            var offset = moment().utcOffset(datetime)._offset;
            const months = sails.config.constants.GRAPH_MONTHS;
            for (var i = 11; i >= 0; i--) {
                dates = getMonthlyTimestamps(
                    months[i] + ' 01 ' + moment().format('Y') + ' 00:00:00',
                    offset
                );
                timeStamps.push({
                    endTime: dates.firstDay,
                    startTime: dates.lastDay
                });
            }
          
            data = await getData(timeStamps, user_id, offset, type);
        } else {
            var timeStamps = [];
            var dates = {};
            for (var i = 4; i >= 0; i--) {
                dates = getYearlyTimestamps(moment().format('YYYY') - i);
                timeStamps.push({
                    startTime: dates.firstDay,
                    endTime: dates.lastDay
                });
            }
            
            data = await getData(timeStamps, user_id, offset, type);
        }
        const providerProfileData = await ProviderProfile.getData(req.id);
        var due_amount = providerProfileData.due_amount
            ? providerProfileData.due_amount
            : 0.0;
        response.status = 'OK';
        response.due_amount = due_amount;
        response.data = [
            {
                seriesName: sails.__('Booking'),
                data: data,
                color: sails.config.dynamics.COLORS.SECONDARY.HEX
            }
        ];
        response.message = sails.__('Success');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__(
            'We are very sorry, it is taking more than expected time. Please try again!'
        );
        return res.send(response);
    }
};
