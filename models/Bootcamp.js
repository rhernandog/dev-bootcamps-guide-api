const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geocoder");
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
	location: {
		type: {
			type: String,
			enum: ["Point"],
		},
		coordinates: {
			type: [Number],
			index: "2dsphere"
		},
		formattedAddress: String,
		street: String,
		city: String,
		state: String,
		zipcode: String,
		country: String,
	},
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
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

// Create an operation before the document is saved in order
// to create a slug from the bootcamp name
BootcampSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// Geocode middleware
BootcampSchema.pre("save", async function (next) {
	const location = await geocoder.geocode(this.address);
	this.location = {
		type: "Point",
		coordinates: [location[0].longitude, location[0].latitude],
		formattedAddress: location[0].formattedAddress,
		street: location[0].streetName,
		city: location[0].city,
		state: location[0].stateCode,
		zipcode: location[0].zipcode,
		country: location[0].countryCode,
	};
	next();
});

// Remove all the courses associated with the bootcamp
// when the bootcamp is removed
BootcampSchema.pre("remove", async function (next) {
	await this.model("Course").deleteMany({
		bootcamp: this._id
	});
	next();
});

BootcampSchema.virtual("courses", {
	ref: "Course",
	localField: "_id",
	foreignField: "bootcamp",
	justOne: false
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
