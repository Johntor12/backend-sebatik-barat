export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;

    // Required for custom error class to work properly
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}
