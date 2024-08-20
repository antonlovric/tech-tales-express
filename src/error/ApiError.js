export class ApiError {
  constructor(code, message) {
    this.code = code;
    this.message = message;
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static internal(message) {
    return new ApiError(500, message);
  }

  static authorization(message) {
    return new ApiError(403, message);
  }

  static authentication(message) {
    return new ApiError(401, message);
  }
}
