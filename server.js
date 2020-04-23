const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
// Route files
const bootcampsRoutes = require("./routes/bootcamp");
const connectToDb = require("./config/database");
// Custom Middleware
const errorHandler = require("./middleware/error");
// Get env variables
dotenv.config({
  path: "./config/config.env",
});
// Connect to the database
connectToDb();
// Create the express instance
const app = express();
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(
    morgan("dev")
  );
}

// Add the routers for all the different endpoints
app.use("/api/v1/bootcamps", bootcampsRoutes);
// Custom error handler
app.use(errorHandler);

// Set the listening port
const PORT = process.env.PORT || 8080;
const server = app.listen(
  PORT,
  () => console.log(`Server started on ${process.env.NODE_ENV}, listening on port ${PORT}`.bgYellow.blue)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error ${err.message}`.bgRed);
  // Close the server connection
  server.close(() => process.exit(1));
});


/**
 * NEXT LECTURE
 * SECTION 5 - LECTURE 5
*/
