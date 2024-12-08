import trim from "lodash/trim";
import upperFirst from "lodash/upperFirst";
import camelCase from "lodash/camelCase";
import kebabCase from "lodash/kebabCase";
import { ExitCodes } from "./constants";
import config from "../config";

export const normalizeSeederName = (name) => upperFirst(camelCase(name));

export const normalizeSeederFileName = (name) => `${kebabCase(name)}.seeder.js`;

export const getFolderNameFromPath = (path) => path.substring(path.lastIndexOf("/") + 1);

export const getObjectWithSelectedKeys = (obj, keys) => {
	const newObj = {};

	Object.keys(obj).forEach((k) => {
		if (keys.includes(k)) {
			newObj[k] = obj[k];
		}
	});

	return newObj;
};

export const validateSeedersFolderName = (name) => typeof name === "string" && trim(name).length >= 3;

export const validateSeederTemplatePath = (name) => typeof name === "string" && trim(name).length >= 6;

export const validateUserConfig = () => {
	const { userConfigExists } = config;

	if (!userConfigExists) {
		throw new Error("Must contain seeders at the project root. run `md-seed init` to create the config file.");
	}
};

export const exit = (error) => {
	if (error && error.message && error.message !== "exit") {
		console.error(error);
		process.exit(ExitCodes.Error);
	} else {
		process.exit(ExitCodes.Success);
	}
};
