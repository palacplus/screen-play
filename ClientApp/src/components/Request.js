export default class Request {
  // Properties (instance variables)
  constructor(status) {
    this.loading = false;
    this.error = false;
    this.success = false;
    this.status = status;
  }

  // Methods (functions attached to the class)
  startLoading() {
    this.loading = true;
    return this;
  }

  stopLoading() {
    this.loading = false;
    return this;
  }

  setCompleted(status) {
    this.status = status;
    this.success = true;
  }

  setError(errorMessage) {
    this.error = true;
    this.status = errorMessage
      ? errorMessage
      : "An Error occurred. System admin has been notified.";
  }
}
