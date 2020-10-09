const moment = require("moment");

const handleResponse = async promoItem => {
	var temp = { status: "NOK", message: "" };
	return new Promise(function(resolve, reject) {
		advertiseOnTimestamp = new Date(promoItem.advertise_on);
		promoItem.advertise_on = moment(promoItem.advertise_on)
			.utc()
			.valueOf();
		PromoCodes.create(promoItem, async function(err, category) {
			if (err) {
				temp.message = err.details;
				return resolve(temp);
			}
			if (promoItem.advertise) {
				if (
					promoItem.advertise_on &&
					typeof promoItem.advertise_on != "undefined"
				) {
					await sails.helpers.notificationschedule.with({
						type: "NEW_OFFER",
						scheduleDate: advertiseOnTimestamp,
						dataPacket: {
							params: {},
							type: sails.config.constants.RELOAD_OFFERS,
							route: sails.config.constants.ROUTE_OFFER_LIST
						},
						reference_type:
							sails.config.constants.NOTIFICATIONS.NEW_OFFER
					});
				}
			}
			temp.status = "OK";
			temp.message = sails.__("Promocode added successfully");
			return resolve(temp);
		});
	});
};

module.exports = async function create(req, res) {
	var response = { status: "NOK", message: "", data: [] };
	const code = req.param("code");
	const description = req.param("description");
	const advertise = req.param("advertise");
	const booking_count = req.param("bookingCount");
	const times_type = req.param("timesType");
	const start_date = req.param("startDate");
	const end_date = req.param("endDate");
	const offer_type = req.param("offerType");
	const status = req.param("status");
	const upto_amount = req.param("uptoAmount");
	const percent_amount = req.param("percentAmount");
	const advertiseOn = req.param("advertiseOn");
	const heading = req.param("heading");
	var file = req.param("image");

	if (
		typeof code == "undefined" ||
		typeof percent_amount == "undefined" ||
		typeof heading == "undefined" ||
		typeof description == "undefined" ||
		typeof upto_amount == "undefined" ||
		typeof start_date == "undefined" ||
		typeof end_date == "undefined"
	) {
		response.message = sails.__("Invalid request");
		return res.send(response);
	}

	if (percent_amount <= 0) {
		response.message = sails.__(
			"Discount percentage must be greator than 0"
		);
		return res.send(response);
	}

	if (start_date > end_date) {
		response.message = sails.__("Start date must be before end date");
		return res.send(response);
	}

	try {
		var fileName = "";
		if (file && file.length > 0) {
			var randomCode = await Api.generatedCode(32);
			const split = file.split(";")[0];
			const ext = split.match(/jpeg|png/)[0];
			const data = file.replace(/^data:image\/\w+;base64,/, "");
			var buffer = new Buffer(data, "base64");
			if (ext) {
				fileName = randomCode + "." + ext;
			}
			await Api.uploadImage(
				sails.config.appPath + "/assets/uploads/promos",
				fileName,
				buffer
			);
			var promoItem = {
				code: code,
				description: description,
				advertise: advertise,
				booking_count: booking_count,
				times_type: times_type,
				start_date: moment(start_date).valueOf(),
				end_date: moment(end_date).valueOf(),
				offer_type: offer_type,
				status: status,
				upto_amount: upto_amount,
				heading: heading,
				percent_amount: percent_amount,
				advertise_on: advertiseOn,
				image: fileName
			};
			const tempResponse = await handleResponse(promoItem);
			if (tempResponse.status == "OK") {
				response.status = "OK";
				response.message = tempResponse.message;
				return res.send(response);
			}
			response.message = tempResponse.message;
			return res.send(response);
		} else {
			var promoItem = {
				code: code,
				description: description,
				advertise: advertise,
				booking_count: booking_count,
				times_type: times_type,
				start_date: moment(start_date).valueOf(),
				end_date: moment(end_date).valueOf(),
				offer_type: offer_type,
				status: status,
				upto_amount: upto_amount,
				heading: heading,
				percent_amount: percent_amount,
				advertise_on: advertiseOn
			};
			const tempResponse = await handleResponse(promoItem);
			if (tempResponse.status == "OK") {
				response.status = "OK";
				response.message = tempResponse.message;
				return res.send(response);
			}
			response.message = tempResponse.message;
			return res.send(response);
		}
	} catch (err) {
		sails.sentry.captureException(err);
		response.message = sails.__("Internal server error");
		return res.send(response);
	}
};
