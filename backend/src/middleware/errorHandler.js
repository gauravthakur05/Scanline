export function notFoundHandler(req, res) {
  res.status(404).json({ error: "This endpoint doesn't exist. Check the API documentation in the README." });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  console.error("[error]", err.name || "Error", "-", err.message);

  if (err.isParseError) {
    return res.status(422).json({ error: err.message });
  }

  const status = err.status || 500;
  const message =
    status === 500
      ? "Something went wrong while processing your request. Please try again in a moment."
      : err.message;

  res.status(status).json({ error: message });
}
