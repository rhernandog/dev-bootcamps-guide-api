const mongoose = require("mongoose");
const BootcampSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "The bootcamp must have a name "],
		unique: [true, "A bootcamp with this name already exists"],
		trim: true,
		maxlength: [60, "The bootcamp name length can't be more than 60 characters."]
	},
	slug: String,
	description: {
		type: String,
		required: [true, "Please add a description for the bootcamp "],
		maxlength: [500, "The description length can't be more than 500 characters."]
	},
	website: {
		type: String,
		match: [
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
			"Please provide a valid website URL."
		]
	},
	phone: {
		type: String,
		maxlength: [20, "The phone number cannot be more than 20 characters."]
	},
	email: {
		type: String,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please provide a valid email address."
		]
	},
	address: {
		type: String,
		required: [true, "Please provide an address for the bootcamp "]
	},
	/* location: {
		type: {
			type: String,
			enum: ["Point"],
			required: true
		},
		coordinates: {
			type: [Number],
			required: true,
			index: "2dsphere"
		},
		formattedAddress: String,
		street: String,
		city: String,
		state: String,
		zipcode: String,
		country: String,
	}, */
	careers: {
		type: [String],
		required: [true, "Provide the careers array."],
		enum: [
			"Web Development",
			"Mobile Development",
			"UI/UX",
			"Data Science",
			"Business",
			"Other"
		]
	},
	averageRating: {
		type: Number,
		min: [1, 'Rating must be at least 1'],
		max: [10, 'Rating must can not be more than 10']
	},
	averageCost: Number,
	photo: {
		type: String,
		default: 'no-photo.jpg'
	},
	housing: {
		type: Boolean,
		default: false
	},
	jobAssistance: {
		type: Boolean,
		default: false
	},
	jobGuarantee: {
		type: Boolean,
		default: false
	},
	acceptGi: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
