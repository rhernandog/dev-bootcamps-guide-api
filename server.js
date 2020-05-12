const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const fileupload = require("express-fileupload");

// Get env variables
dotenv.config({
  path: "./config/config.env",
});
// Route files
const bootcampsRoutes = require("./routes/bootcamp");
const coursesRoutes = require("./routes/course");
const authRoutes = require("./routes/auth");

const connectToDb = require("./config/database");
// Custom Middleware
const errorHandler = require("./middleware/error");
// Connect to the database
connectToDb();
// Create the express instance
const app = express();
app.use(express.json());
// File upload middleware
app.use(fileupload());
// Cookie parser
app.use(cookieParser());
if (process.env.NODE_ENV === "development") {
  app.use(
    morgan("dev")
  );
}
// Set static folder
app.use(express.static(path.join(__dirname, "public")));
// Add the routers for all the different endpoints
app.use("/api/v1/bootcamps", bootcampsRoutes);
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/v1/auth", authRoutes);
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
