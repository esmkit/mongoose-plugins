import { getOptions } from "./options";
import help from "./help";
import runInstaller from "./run-installer";

export default async (argv) => {
	const { helpWanted, ...options } = getOptions(argv);

	if (helpWanted) return help();

	return runInstaller(options);
};
