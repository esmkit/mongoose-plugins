class Seeder {
	constructor() {
		if (this.constructor === Seeder) {
			throw new TypeError("Can not construct abstract class.");
		}
		if (this.run === Seeder.prototype.run) {
			throw new TypeError("Please implement abstract method run.");
		}
	}

	async seed() {
		await this.beforeRun();

		let results = null;

		if (await this.shouldRun()) {
			results = await this.run();
		}

		return this.getStats(results);
	}

	async shouldRun() {
		return true;
	}

	async beforeRun() {}

	async run() {
		throw new TypeError(`Need to implement ${this.constructor.name} async run() function`);
	}

	getStats(results) {
		if (Array.isArray(results)) {
			return { run: true, created: results.length };
		}

		return { run: false, created: 0 };
	}

	static extend(userSeederMethods = {}) {
		class UserSeeder extends Seeder {}

		Object.keys(userSeederMethods).forEach((key) => {
			UserSeeder.prototype[key] = userSeederMethods[key];
		});

		return UserSeeder;
	}
}

export default Seeder;
