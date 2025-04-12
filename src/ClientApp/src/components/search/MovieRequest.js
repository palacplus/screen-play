export default class MovieRequest {
  constructor(status) {
    this.loading = false;
    this.error = false;
    this.success = false;
    this.status = status;
  }

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
