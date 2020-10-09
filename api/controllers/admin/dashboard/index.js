const moment = require('moment');

const getDailyTimestamps = reference => {
    var firstDay = moment(new Date(reference));
    var lastDay = moment(firstDay).subtract(86400, 'seconds');
    return {
        firstDay: moment(firstDay).valueOf(),
        lastDay: moment(lastDay).valueOf()
    };
};

const getData = async (timeStamps, offset) => {
    var arrayKeys = [];
    var count = 0;
    if (timeStamps.length > 0) {
        for (x in timeStamps) {
            count = await Booking.count({
                created_at: {
                    '>': timeStamps[x].endTime,
                    '<=': timeStamps[x].startTime
                },
            });
            arrayKeys.push({
                name: moment(timeStamps[x].startTime)
                    .utcOffset(-parseInt(offset))
                    .format('DD MMMM'),
                bookingcount: count
            });
        }
    }
    return arrayKeys.reverse();
};

module.exports = async function index(req, res) {
    var response = { status: 'NOK', message: '', data: {} };
    const datetime = req.param('datetime');

    try {
        let totalCustomers = await User.count({
            role: sails.config.constants.ROLE_CUSTOMER
        });
        let totalProviders = await User.count({
            role: sails.config.constants.ROLE_PROVIDER
        });
        let totalBookings = await Booking.count();
        let revenueBookings = await Booking.find({
            status: sails.config.constants.BOOKING_STATUS_COMPLETED
        });
        let totalRevenue = 0;
        for(x in revenueBookings) {
            totalRevenue = Number(revenueBookings[x].total_amount) + Number(totalRevenue);
        }
        let latestCustomers = await User.find({
            role: sails.config.constants.ROLE_CUSTOMER
        })
            .sort('created_at DESC')
            .limit(5);
        let latestCustomersArray = [];
        if (latestCustomers && latestCustomers.length > 0) {
            for (x in latestCustomers) {
                latestCustomersArray.push(
                    await User.getJson(latestCustomers[x])
                );
            }
        }
        let latestBookings = await Booking.find()
            .sort('created_at DESC')
            .limit(5);
        let latestBookingsArray = [];
        if (latestBookings && latestBookings.length > 0) {
            for (x in latestBookings) {
                latestBookingsArray.push(
                    await Booking.getSmallJson(latestBookings[x])
                );
            }
        }

        let dates = {};
        let bookingChartData = [];
        let timeStamps = [];
        let offset = moment().utcOffset(datetime)._offset;
        let startDay = new Date(datetime);
        startDay = startDay.setHours(23, 59, 59, 999);
        startDay = moment(datetime)
            .utc()
            .format('MMMM D YYYY, hh:mm:ss a');
        for (var i = 8; i >= 1; i--) {
            dates = getDailyTimestamps(startDay);
            timeStamps.push({
                startTime: dates.firstDay,
                endTime: dates.lastDay
            });
            startDay = moment(dates.lastDay).format(
                'MMMM D YYYY, hh:mm:ss a'
            );
        }
        bookingChartData = await getData(timeStamps, offset);

        
        response.status = 'OK';
        response.data = {
            totalCustomers: totalCustomers,
            totalProviders: totalProviders,
            totalBookings: totalBookings,
            totalRevenue: totalRevenue,
            latestCustomers: latestCustomersArray,
            latestBookings: latestBookingsArray,
            bookingChart: bookingChartData
        };
        response.message = sails.__('Success');
        return res.send(response);
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__('Internal server error');
        return res.send(response);
    }
};
