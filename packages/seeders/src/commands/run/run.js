import config from "../../config";
import { MdSeedRunner } from "../../core";
import { validateUserConfig } from "../../utils/helpers";

import RunLogger from "./run-logger";

const run = async ({ selectedSeeders = [], dropDatabase = false } = {}) => {
	validateUserConfig();

	const { connect, dropdb, seedersList } = config.loadUserConfig();

	const logger = new RunLogger();

	const runner = new MdSeedRunner({ connect, dropdb, seedersList });

	const observable = runner.run({ selectedSeeders, dropDatabase });

	observable.subscribe(logger.asObserver());

	await observable.toPromise();
};

export default run;
