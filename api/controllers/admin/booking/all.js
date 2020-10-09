module.exports = async function all(req, res) {
    var response = { status: "NOK", message: "", data: {} };
    let providerId = req.param("providerId");
    let customerId = req.param("customerId");
    let type = req.param("type");
    let limit = req.param("limit");
    if (typeof limit == "undefined" || limit < 0) {
        limit = 10;
    }
    let page = req.param("page");
    if (typeof page == "undefined" || page <= 0) {
        page = 1;
    }

    try {
        let status = null;
        if (type && typeof type != "undefined" && type != "") {
            if (type == sails.config.constants.PROVIDER_BOOKING_VIEW_NEW) {
                status = [sails.config.constants.BOOKING_STATUS_INITIATED];
            } else if (
                type == sails.config.constants.PROVIDER_BOOKING_VIEW_INPROGRESSS
            ) {
                status = [
                    sails.config.constants.BOOKING_STATUS_CONFIRMED,
                    sails.config.constants.BOOKING_STATUS_INPROGRESS,
                    sails.config.constants.BOOKING_STATUS_STARTED,
                    sails.config.constants.BOOKING_STATUS_PAUSED
                ];
            } else if (
                type == sails.config.constants.PROVIDER_BOOKING_VIEW_COMPLETED
            ) {
                status = [
                    sails.config.constants.BOOKING_STATUS_ENDED,
                    sails.config.constants.BOOKING_STATUS_COMPLETED
                ];
            } else if (
                type == sails.config.constants.PROVIDER_BOOKING_VIEW_CANCELLED
            ) {
                status = [
                    sails.config.constants.BOOKING_STATUS_REJECTED,
                    sails.config.constants.BOOKING_STATUS_CANCELLED
                ];
            }
        }

        let criteria = {};
        if (status && status.length > 0) {
            criteria.status = status;
        }
        if (typeof providerId != "undefined" && providerId != "") {
            criteria.provider_id = providerId;
        }
        if (typeof customerId != "undefined" && customerId != "") {
            criteria.created_by = customerId;
        }
        let bookings = await Booking.find(criteria)
            .limit(limit)
            .skip(limit * (page - 1))
            .sort("created_at DESC");

        let totalbookings = await Booking.count(criteria);
        if (bookings.length > 0) {
            let json = [];
            for (x in bookings) {
                json.push(await Booking.getSmallJson(bookings[x]));
            }
            response.status = "OK";
            response.message = sails.__("Success");
            response.data = json;
            response.totalbookings = totalbookings;
            return res.json(response);
        } else {
            response.message = sails.__("No booking found");
            return res.json(response);
        }
    } catch (err) {
        sails.sentry.captureException(err);
        response.message = sails.__("Internal server error");
        return res.send(response);
    }
};
