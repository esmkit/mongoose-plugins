export default class BaseLogger {
	asObserver() {
		return {
			next: (...args) => this.next(...args),
			error: (...args) => this.error(...args),
			complete: (...args) => this.complete(...args),
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	next() {}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	error() {}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	complete() {}
}
