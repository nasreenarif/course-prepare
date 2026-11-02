import { AuthError } from './identity.js';
export class AppError extends Error {
  constructor(status, message, { code = 'REQUEST_REJECTED', fields = {} } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = 500, message = 'Something went wrong. Try again later.';
  let code = 'INTERNAL_ERROR', fields = {};
  if (error instanceof AppError || error instanceof AuthError) {
    ({ status, code, fields } = error);
    message = error.message;
  } else if (error.code === 11000) {
    status = 409; code = 'ACCOUNT_CONFLICT'; message = 'Unable to create an account with those details.';
  } else if (error.type === 'entity.parse.failed') {
    status = 400; code = 'INVALID_JSON'; message = 'The request body must be valid JSON.';
  } else if (error.type === 'entity.too.large') {
    status = 413; code = 'BODY_TOO_LARGE'; message = 'The request is too large.';
  } else if (error.name === 'ValidationError') {
    status = 400; code = 'MODEL_VALIDATION'; message = 'One or more values are invalid.';
  }
  if (status >= 500) console.error(JSON.stringify({ event: 'request_failed', requestId: req.requestId, method: req.method, status }));
  res.status(status).json({ error: message, code, fields, requestId: req.requestId });
}
