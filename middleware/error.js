const ErrorResponse = require("../utils/ErrorResponse");

const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	console.log("error middleware");
	console.log(err);
	// Mongo bad object ID
	if (err.name == "CastError") {
		const message = `Cannot find a resource with the ID: ${err.value}`;
		error = new ErrorResponse(message, 404);
	}

	// Validation Error
	if (err.name == "ValidationError") {
		// Get all the validation errors
		const message = Object.values(err.errors).map(error => error.message);
		error = new ErrorResponse(message, 400);
	}

	// Mongo Duplicate Key
	if (err.code === 11000) {
		const errKey = Object.keys(err.keyValue)[0];
		const errValue = err.keyValue[errKey];
		console.log(errKey, errValue);
		const message = `Duplicate field value entered. A bootcamp with a ${errKey}: ${errValue}, already exists.`;
		error = new ErrorResponse(message, 400);
	}
	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || "Server Error"
	});
};

module.exports = errorHandler;
