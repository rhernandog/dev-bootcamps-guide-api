class ErrorResponse extends Error {
	constructor(message, statusCode) {
		console.log("error response", statusCode);
		super(message);
		this.statusCode = statusCode;
	}
}

module.exports = ErrorResponse;
