import fs from "fs";
import path from "path";
import findRoot from "find-root";

import { defaultUserGeneratorConfig, systemSeederTemplate, systemConfigTemplate, configFilename } from "./constants";

const getProjectRoot = () => {
	// eslint-disable-next-line no-undef
	const workingDir = process.cwd();
	return findRoot(workingDir);
};

const config = {
	clean() {
		delete this.workingDir;
		delete this.projectRoot;
		delete this.userConfigFilename;
		delete this.userConfigFilepath;
		delete this.userSeedersFolderName;
		delete this.userSeedersFolderPath;
		delete this.userConfigExists;
		delete this.userConfig;
		delete this.seederTemplate;
		delete this.configTemplate;
	},

	getUserGeneratorConfig(projectRoot = getProjectRoot()) {
		const packageJsonPath = path.join(projectRoot, "package.json");
		// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
		const { mongooseSeeders = {} } = require(packageJsonPath);
		const seedersFolderExists = fs.existsSync(path.join(projectRoot, mongooseSeeders.seedersFolder));

		if (!seedersFolderExists) {
			delete mongooseSeeders.seedersFolder;
		}

		return {
			...defaultUserGeneratorConfig,
			...mongooseSeeders,
		};
	},

	update(projectRoot = getProjectRoot()) {
		const { seedersFolder, customSeederTemplate } = this.getUserGeneratorConfig(projectRoot);

		const userSeedersFolderName = seedersFolder;
		const userSeedersFolderPath = path.join(projectRoot, userSeedersFolderName);

		const userConfigFilename = configFilename;
		const userConfigFilepath = path.join(userSeedersFolderPath, userConfigFilename);
		const userConfigExists = fs.existsSync(userConfigFilepath);

		const configTemplate = systemConfigTemplate;

		const seederTemplate = customSeederTemplate ? path.join(projectRoot, customSeederTemplate) : systemSeederTemplate;

		this.projectRoot = projectRoot;
		this.userConfigFilename = userConfigFilename;
		this.userConfigFilepath = userConfigFilepath;
		this.userSeedersFolderName = userSeedersFolderName;
		this.userSeedersFolderPath = userSeedersFolderPath;
		this.userConfigExists = userConfigExists;
		this.seederTemplate = seederTemplate;
		this.configTemplate = configTemplate;
	},

	loadUserConfig() {
		// eslint-disable-next-line no-undef
		return require(this.userConfigFilepath);
	},
};

config.update();

export default config;
