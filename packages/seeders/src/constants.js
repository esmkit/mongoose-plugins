import path from "path";

export const configFilename = "index.js";

export const defaultUserGeneratorConfig = {
	seedersFolder: "./seeders",
};

// eslint-disable-next-line no-undef
export const systemSeederTemplate = path.join(__dirname, "../templates/seeder.ejs");

// eslint-disable-next-line no-undef
export const systemConfigTemplate = path.join(__dirname, "../templates/index.ejs");
