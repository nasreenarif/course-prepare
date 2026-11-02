export function requireJson(req, res, next) {
  if (!req.is("application/json")) {
    return res.status(415).json({ message: "Use Content-Type: application/json." });
  }
  return next();
}

export function validateId(req, res, next) {
  if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
    return res.status(400).json({ message: "Invalid task ID." });
  }
  return next();
}

export function notFound(req, res) {
  return res.status(404).json({ message: "Route not found." });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Body must contain valid JSON." });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large." });
  }
  if (err.name === "ValidationError" || err.name === "CastError") {
    return res.status(400).json({ message: "One or more field values are invalid." });
  }
  console.error("Unexpected request failure:", err.name);
  return res.status(500).json({ message: "Unable to complete the request." });
}
