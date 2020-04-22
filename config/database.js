const mongoose = require("mongoose");

const connectToDb = async () => {
	const connection = await mongoose.connect(process.env.MONGO_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: true,
		serverSelectionTimeoutMS: 5000,
	});

	console.log(`Connected to MongoDB ${connection.connection.host}`.bgBlue);
};

module.exports = connectToDb;
