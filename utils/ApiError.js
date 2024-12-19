/**
 * Custom Error class to handle API-related errors.
 * Extends the built-in `Error` class in JavaScript.
 *
 * @class ApiError
 * @extends {Error}
 *
 * @param {number} statusCode - HTTP status code representing the error (e.g., 404, 500).
 * @param {string} [message="Something went wrong"] - Error message to be displayed. Defaults to a generic message if not provided.
 * @param {Array} [errors=[]] - An array to capture additional error details or validation issues.
 * @param {string} [stack=""] - Optional stack trace. If not provided, the stack trace is captured automatically.
 *
 * @property {number} statusCode - The HTTP status code of the error.
 * @property {string} message - The error message.
 * @property {boolean} success - Indicates the success status of the operation (always `false` for errors).
 * @property {Array} errors - Additional error details.
 * @property {null} data - Set to `null` by default, can be used to pass any data associated with the error.
 * @property {string} stack - The stack trace of the error. If not provided, it is captured automatically.
 *
 * @method constructor - Initializes the `ApiError` instance with the provided parameters or defaults.
 */
class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message); // Call the parent `Error` constructor with the message
    this.statusCode = statusCode; // HTTP status code
    this.data = null; // Default data property, can be used to pass additional data related to the error
    this.message = message; // Error message
    this.success = false; // Indicates that the operation failed
    this.errors = errors; // Array to hold additional error details

    // If a custom stack trace is provided, use it. Otherwise, capture the current stack trace.
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
