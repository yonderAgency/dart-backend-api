const api = require("../../models/Api.js");

module.exports = async function add(req, res) {
	var response = { status: "NOK", message: "", data: {} };
	const id = req.param("id");
	const category = req.param("category");
	const description = req.param("description");
	const user = req.authUser;

	if (description == "" || description == null) {
		response.message = sails.__("Please enter your message");
		return res.send(response);
	}

	if (typeof category == "undefined" || typeof description == "undefined") {
		response.message = sails.__("Invalid request");
		return res.send(response);
	}

	try {
		var helpdesk = [];
		if (id) {
			helpdesk = await Helpdesk.find({
				id: id
			}).limit(1);
		} else {
			await Helpdesk.create({
				description: description,
				created_by: user.id,
				category: category
			});
			helpdesk = await Helpdesk.find({
				created_by: user.id,
				category: category
			})
				.sort("created_at DESC")
				.limit(1);
		}
		await HelpdeskLog.create({
			description: description,
			helpdesk_id: helpdesk[0].id,
			created_by: user.id
		});
		let websiteImages = await Api.getWebsiteImage();
		sails.hooks.email.send(
			"helpdesk-add",
			{
				name: user.name,
				image: websiteImages
			},
			{
				to: user.email,
				subject: sails.__(
					"Help Ticket at %s",
					sails.config.dynamics.APPLICATION_NAME
				)
			},
			async function(err) {
				if (err) {
					sails.sentry.captureException(err);
				}
				var log = await HelpdeskLog.find({
					helpdesk_id: helpdesk[0].id,
					created_by: user.id
				})
					.sort("created_at DESC")
					.limit(1);
				response.data = await HelpdeskLog.getJson(log[0]);
				response.status = "OK";
				response.message = sails.__("Success");
				return res.send(response);
			}
		);
	} catch (err) {
		sails.sentry.captureException(err);
		response.message = sails.__(
			"We are very sorry, it is taking more than expected time. Please try again!"
		);
		return res.send(response);
	}
};
