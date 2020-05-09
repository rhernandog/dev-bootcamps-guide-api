const advancedResults = (model, populate) => async (req, res, next) => {
  const queryCopy = { ...req.query };
  // Specific filter, sort, limit query strings
  const queryRemoveFields = ["select", "sort", "limit", "page"];
  queryRemoveFields.forEach(field => delete queryCopy[field]);

  // Create a string of the query to add the $ sign for query operators
  let parsedQuery = JSON.stringify(queryCopy);
  // Query operators
  parsedQuery = parsedQuery.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
  parsedQuery = JSON.parse(parsedQuery);

  // Create a Mongo query object
  let modelQuery = model.find(parsedQuery);

  if (populate) {
    modelQuery = modelQuery.populate(populate);
  }

  // Select query
  // Create a string with the select projection in order
  // to return only those values on each document
  if (req.query.select) {
    // Change commas for spaces to comply the mongoose projection form
    const selectFields = req.query.select.replace(/,/g, " ");
    modelQuery = modelQuery.select(selectFields);
  }

  // Sort query
  if (req.query.sort) {
    const sortField = req.query.sort.split(",")[0];
    console.log(req.query.sort, sortField);
    modelQuery.sort(sortField);
  } else {
    modelQuery.sort("-createdAt");
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  // Limit
  const limit = parseInt(req.query.limit, 10) || 20;
  // Skip, if the page number is more than one skip the first set of
  // results, that are equal to the previous page times the limit
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalDocuments = await model.countDocuments();
  modelQuery.skip(startIndex).limit(limit);

  const results = await modelQuery;

  const pagination = {
    prev: null,
    current: page,
    next: null,
  };

  if (endIndex < totalDocuments) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    data: results,
    pagination
  };

  next();
};

module.exports = advancedResults;
