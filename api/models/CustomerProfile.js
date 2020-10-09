/**
 * CustomerProfile.js
 */
var moment = require("moment");

module.exports = {
	attributes: {
		dob: {
			type: "string",
			allowNull: true
		},
		gender: {
			type: "number",
			allowNull: true
		},
		image: {
			type: "string",
			allowNull: true
		},
		bio: {
			type: "string",
			allowNull: true
		},
		completed: {
			type: "string",
			defaultsTo: "10"
		},
		secondary_contact: {
			type: "string",
			allowNull: true
		},
		created_at: {
			type: "number"
		},
		created_by: {
			required: true,
			type: "string"
		},
		slug: {
			type: "string"
		}
	},

	beforeCreate: async function(valuesToSet, proceed) {
		valuesToSet.created_at = moment().valueOf();
		return proceed();
	},

	getData: async function(id) {
		const userProfile = await CustomerProfile.find({
			created_by: id
		}).limit(1);

		if (userProfile.length > 0) {
			return userProfile[0];
		}
		return null;
	}
};
